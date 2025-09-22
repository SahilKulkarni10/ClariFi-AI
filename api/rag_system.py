import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from typing import List, Dict, Any
import uuid
from config import settings
import json
import httpx
import asyncio
from bs4 import BeautifulSoup
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIRECTORY,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
        # Initialize collections
        self.user_data_collection = self.client.get_or_create_collection(
            name="user_financial_data",
            metadata={"description": "User personal financial data"}
        )
        
        self.knowledge_collection = self.client.get_or_create_collection(
            name="financial_knowledge",
            metadata={"description": "Financial knowledge base"}
        )
        
        # Initialize sentence transformer
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def add_user_data(self, user_id: str, data_type: str, data: Dict[str, Any]):
        """Add user financial data to vector store"""
        try:
            # Create text representation of the data
            text_content = self._format_user_data(data_type, data)
            
            # Generate embedding
            embedding = self.encoder.encode([text_content])[0].tolist()
            
            # Create unique ID
            doc_id = f"{user_id}_{data_type}_{uuid.uuid4()}"
            
            # Prepare metadata (only str, int, float, bool allowed)
            metadata = {
                "user_id": user_id,
                "data_type": data_type,
                "timestamp": str(data.get("created_at", "")),
                "amount": float(data.get("amount", 0)) if data.get("amount") else 0.0,
                "category": str(data.get("category", "")) if data.get("category") else "",
                "description": str(data.get("description", "")) if data.get("description") else ""
            }
            
            # Add to collection
            self.user_data_collection.add(
                embeddings=[embedding],
                documents=[text_content],
                metadatas=[metadata],
                ids=[doc_id]
            )
            
            logger.info(f"Added user data: {data_type} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding user data: {e}")
            return False
    
    def _format_user_data(self, data_type: str, data: Dict[str, Any]) -> str:
        """Format user data into searchable text"""
        if data_type == "income":
            return f"Income from {data.get('source', 'unknown')} of ₹{data.get('amount', 0)} on {data.get('date', '')}. {data.get('description', '')}"
        
        elif data_type == "expense":
            return f"Expense for {data.get('category', 'unknown')} of ₹{data.get('amount', 0)} on {data.get('date', '')} at {data.get('merchant', 'unknown')}. {data.get('description', '')}"
        
        elif data_type == "investment":
            return f"Investment in {data.get('name', 'unknown')} ({data.get('type', 'unknown')}) of ₹{data.get('amount', 0)} on {data.get('date', '')}. Current value: ₹{data.get('current_value', 0)}. Goal: {data.get('goal', 'Not specified')}"
        
        elif data_type == "loan":
            return f"{data.get('type', 'unknown')} loan of ₹{data.get('principal', 0)} at {data.get('interest_rate', 0)}% interest. EMI: ₹{data.get('emi', 0)}, Outstanding: ₹{data.get('outstanding', 0)}"
        
        elif data_type == "insurance":
            return f"{data.get('type', 'unknown')} insurance {data.get('policy_name', 'unknown')} with coverage ₹{data.get('coverage_amount', 0)} and premium ₹{data.get('premium', 0)}"
        
        elif data_type == "budget":
            return f"Budget for {data.get('month', 'unknown')} with total budget ₹{data.get('total_budget', 0)} and savings target ₹{data.get('savings_target', 0)}"
        
        return json.dumps(data)
    
    async def search_user_data(self, user_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search user's financial data"""
        try:
            # Generate query embedding
            query_embedding = self.encoder.encode([query])[0].tolist()
            
            # Search in user data
            results = self.user_data_collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where={"user_id": user_id}
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "content": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                        "distance": results['distances'][0][i] if results['distances'] else 0
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching user data: {e}")
            return []
    
    async def search_knowledge_base(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Search financial knowledge base"""
        try:
            # Generate query embedding
            query_embedding = self.encoder.encode([query])[0].tolist()
            
            # Search in knowledge base
            results = self.knowledge_collection.query(
                query_embeddings=[query_embedding],
                n_results=limit
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "content": doc,
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                        "distance": results['distances'][0][i] if results['distances'] else 0
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {e}")
            return []
    
    async def generate_response(self, user_id: str, query: str) -> Dict[str, Any]:
        """Generate AI response using RAG"""
        try:
            # Import database here to avoid circular imports
            from database import get_database
            
            # Search user data and knowledge base
            user_context = await self.search_user_data(user_id, query, limit=5)
            knowledge_context = await self.search_knowledge_base(query, limit=3)
            
            # Get current financial data from database
            db = get_database()
            current_data = await self._get_current_financial_data(db, user_id)
            
            # Prepare context for AI
            context_text = "Current Financial Summary:\n"
            context_text += current_data
            
            context_text += "\nUser Financial Data from History:\n"
            for item in user_context:
                context_text += f"- {item['content']}\n"
            
            context_text += "\nFinancial Knowledge:\n"
            for item in knowledge_context:
                context_text += f"- {item['content']}\n"
            
            # Create prompt
            prompt = f"""
            You are a personal finance assistant AI. Use the following context to answer the user's question.
            
            Context:
            {context_text}
            
            User Question: {query}
            
            Instructions:
            1. Provide personalized advice based on the user's financial data
            2. Use specific numbers and dates from their data when relevant
            3. Reference financial regulations and best practices from the knowledge base
            4. Be conversational but professional
            5. If you don't have enough context, ask for more information
            6. Always provide actionable insights
            7. Format amounts in Indian Rupees (₹)
            8. If the user asks about their financial data and you have access to it, provide specific details
            
            Response:
            """
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            # Generate suggestions
            suggestions = await self._generate_suggestions(user_context, query)
            
            return {
                "response": response.text,
                "context_used": len(user_context) > 0 or len(knowledge_context) > 0,
                "suggestions": suggestions
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "response": "I'm sorry, I encountered an error processing your request. Please try again.",
                "context_used": False,
                "suggestions": []
            }
    
    async def _generate_suggestions(self, user_context: List[Dict], query: str) -> List[str]:
        """Generate follow-up suggestions based on user data"""
        suggestions = []
        
        # Analyze user context to generate relevant suggestions
        data_types = set()
        for item in user_context:
            if 'data_type' in item.get('metadata', {}):
                data_types.add(item['metadata']['data_type'])
        
        if 'expense' in data_types:
            suggestions.append("Show me my top spending categories this month")
            suggestions.append("How can I reduce my monthly expenses?")
        
        if 'investment' in data_types:
            suggestions.append("What's my investment portfolio performance?")
            suggestions.append("Should I diversify my investments?")
        
        if 'loan' in data_types:
            suggestions.append("Which loan should I pay off first?")
            suggestions.append("How can I reduce my EMI burden?")
        
        # Default suggestions
        if not suggestions:
            suggestions = [
                "What's my current financial summary?",
                "How much did I save last month?",
                "Give me investment advice based on my profile"
            ]
        
        return suggestions[:3]  # Return top 3 suggestions

    async def _get_current_financial_data(self, db, user_id: str) -> str:
        """Get current financial data from database"""
        try:
            from datetime import datetime, date
            from utils import prepare_date_range_for_mongo
            
            current_month = date.today().replace(day=1)
            end_of_month = date.today()
            date_range = prepare_date_range_for_mongo(current_month, end_of_month)
            
            # Get current month income
            income_pipeline = [
                {"$match": {"user_id": user_id, "date": date_range}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]
            income_result = await db.income.aggregate(income_pipeline).to_list(1)
            total_income = income_result[0]["total"] if income_result else 0
            
            # Get current month expenses
            expense_pipeline = [
                {"$match": {"user_id": user_id, "date": date_range}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]
            expense_result = await db.expenses.aggregate(expense_pipeline).to_list(1)
            total_expenses = expense_result[0]["total"] if expense_result else 0
            
            # Get total investments
            investment_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]
            investment_result = await db.investments.aggregate(investment_pipeline).to_list(1)
            total_investments = investment_result[0]["total"] if investment_result else 0
            
            # Get total loans
            loan_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {"_id": None, "total": {"$sum": "$outstanding"}}}
            ]
            loan_result = await db.loans.aggregate(loan_pipeline).to_list(1)
            total_loans = loan_result[0]["total"] if loan_result else 0
            
            # Get recent income sources
            recent_income = await db.income.find(
                {"user_id": user_id},
                {"source": 1, "amount": 1, "date": 1}
            ).sort("date", -1).limit(5).to_list(5)
            
            # Get recent expenses by category
            expense_categories = await db.expenses.aggregate([
                {"$match": {"user_id": user_id, "date": date_range}},
                {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
                {"$sort": {"total": -1}},
                {"$limit": 5}
            ]).to_list(5)
            
            # Format the summary
            summary = f"""
Monthly Income (Current Month): ₹{total_income:,.2f}
Monthly Expenses (Current Month): ₹{total_expenses:,.2f}
Total Investments: ₹{total_investments:,.2f}
Total Loan Outstanding: ₹{total_loans:,.2f}
Net Worth: ₹{(total_investments - total_loans):,.2f}
Monthly Cash Flow: ₹{(total_income - total_expenses):,.2f}
Savings Rate: {((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0:.1f}%

Recent Income Sources:
"""
            for income in recent_income:
                summary += f"- {income.get('source', 'Unknown')}: ₹{income.get('amount', 0):,.2f} on {income.get('date', 'Unknown date')}\n"
            
            summary += "\nTop Expense Categories (Current Month):\n"
            for category in expense_categories:
                summary += f"- {category['_id']}: ₹{category['total']:,.2f}\n"
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting current financial data: {e}")
            return "No current financial data available. Please add your income, expenses, and investments to get personalized advice."

# Finance Data Scraper
class FinanceDataScraper:
    def __init__(self):
        self.vector_store = None
    
    def set_vector_store(self, vector_store: VectorStore):
        self.vector_store = vector_store
    
    async def scrape_and_store_knowledge(self):
        """Scrape financial knowledge and store in vector database"""
        try:
            logger.info("Starting financial knowledge scraping...")
            
            # Scrape RBI data
            await self._scrape_rbi_data()
            
            # Scrape SEBI data
            await self._scrape_sebi_data()
            
            # Add static financial knowledge
            await self._add_static_knowledge()
            
            logger.info("Completed financial knowledge scraping")
            
        except Exception as e:
            logger.error(f"Error scraping financial data: {e}")
    
    async def _scrape_rbi_data(self):
        """Scrape RBI financial information"""
        try:
            rbi_content = [
                {
                    "title": "RBI Repo Rate",
                    "content": "The Reserve Bank of India (RBI) repo rate is the rate at which the RBI lends money to commercial banks. Current repo rate affects home loan, personal loan, and fixed deposit rates.",
                    "source": "RBI",
                    "category": "monetary_policy"
                },
                {
                    "title": "Bank Interest Rates",
                    "content": "Fixed deposit rates in India typically range from 3% to 7% depending on tenure and bank. Senior citizens get additional 0.25% to 0.5% interest.",
                    "source": "RBI",
                    "category": "banking"
                },
                {
                    "title": "KYC Guidelines",
                    "content": "Know Your Customer (KYC) is mandatory for all financial transactions. Required documents include Aadhaar, PAN card, and address proof for bank accounts and investments.",
                    "source": "RBI",
                    "category": "compliance"
                }
            ]
            
            await self._store_knowledge_items(rbi_content)
            
        except Exception as e:
            logger.error(f"Error scraping RBI data: {e}")
    
    async def _scrape_sebi_data(self):
        """Scrape SEBI investment information"""
        try:
            sebi_content = [
                {
                    "title": "Mutual Fund Investment Guidelines",
                    "content": "SEBI recommends SIP investments for retail investors. Diversify across equity, debt, and hybrid funds. Review portfolio annually and rebalance as needed.",
                    "source": "SEBI",
                    "category": "investments"
                },
                {
                    "title": "Stock Market Investment",
                    "content": "Equity investments should be made with long-term perspective. Avoid putting all money in one stock. Consider bluechip stocks for stability and growth stocks for returns.",
                    "source": "SEBI",
                    "category": "investments"
                },
                {
                    "title": "Tax Saving Investments",
                    "content": "ELSS mutual funds qualify for 80C tax deduction up to ₹1.5 lakh. They have 3-year lock-in period and potential for good returns.",
                    "source": "SEBI",
                    "category": "tax_planning"
                }
            ]
            
            await self._store_knowledge_items(sebi_content)
            
        except Exception as e:
            logger.error(f"Error scraping SEBI data: {e}")
    
    async def _add_static_knowledge(self):
        """Add static financial knowledge"""
        try:
            static_content = [
                {
                    "title": "Emergency Fund",
                    "content": "Maintain emergency fund of 6-12 months expenses in liquid instruments like savings account or liquid funds. This provides financial security during job loss or medical emergencies.",
                    "source": "Financial Planning",
                    "category": "financial_planning"
                },
                {
                    "title": "Debt Management",
                    "content": "Pay high-interest debt first (credit cards, personal loans). Consider debt consolidation if multiple loans. Maintain debt-to-income ratio below 40%.",
                    "source": "Financial Planning",
                    "category": "debt_management"
                },
                {
                    "title": "Insurance Planning",
                    "content": "Life insurance should be 10-15 times annual income. Health insurance minimum ₹5 lakh for family. Term insurance is most cost-effective for life cover.",
                    "source": "Insurance Planning",
                    "category": "insurance"
                },
                {
                    "title": "Retirement Planning",
                    "content": "Start retirement planning early. EPF, PPF, NPS are good tax-saving retirement options. Target retirement corpus of 25-30 times annual expenses.",
                    "source": "Retirement Planning",
                    "category": "retirement"
                },
                {
                    "title": "Tax Planning",
                    "content": "Use 80C deductions (EPF, PPF, ELSS, insurance premium). Consider 80D for health insurance premiums. Plan taxes at year beginning for better optimization.",
                    "source": "Tax Planning",
                    "category": "tax_planning"
                }
            ]
            
            await self._store_knowledge_items(static_content)
            
        except Exception as e:
            logger.error(f"Error adding static knowledge: {e}")
    
    async def _store_knowledge_items(self, items: List[Dict[str, str]]):
        """Store knowledge items in vector database"""
        for item in items:
            try:
                # Generate embedding
                embedding = self.vector_store.encoder.encode([item['content']])[0].tolist()
                
                # Create unique ID
                doc_id = str(uuid.uuid4())
                
                # Add to collection
                self.vector_store.knowledge_collection.add(
                    embeddings=[embedding],
                    documents=[item['content']],
                    metadatas=[{
                        "title": item['title'],
                        "source": item['source'],
                        "category": item['category']
                    }],
                    ids=[doc_id]
                )
                
            except Exception as e:
                logger.error(f"Error storing knowledge item: {e}")

# Initialize global instances
vector_store = VectorStore()
finance_scraper = FinanceDataScraper()
finance_scraper.set_vector_store(vector_store)

