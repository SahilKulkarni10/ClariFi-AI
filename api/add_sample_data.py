# #!/usr/bin/env python3
# """
# Script to add comprehensive sample financial data for testing the AI chat functionality
# Creates a rich portfolio with diverse income sources, expenses, investments, loans, insurance, budgets, and goals
# """
# import asyncio
# import sys
# import os

# # Add the api directory to the path
# sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# from database import get_database
# from utils import prepare_document_for_mongo
# from rag_system import vector_store
# from datetime import datetime, date, timedelta
# import logging
# import random

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# async def add_comprehensive_financial_data():
#     """Add comprehensive financial data for testing - creates a rich portfolio"""
#     try:
#         # Initialize database connection
#         from database import connect_to_mongo
#         await connect_to_mongo()
        
#         db = get_database()
#         user_id = "3811ee32-7787-4b2b-8030-324b81fa7633"  # Sample user ID from logs
        
#         # Clear existing data first
#         await clear_existing_data(db, user_id)
        
#         # Add diversified income sources
#         await add_income_data(db, user_id)
        
#         # Add detailed monthly expenses
#         await add_expense_data(db, user_id)
        
#         # Add diversified investment portfolio
#         await add_investment_data(db, user_id)
        
#         # Add various types of loans
#         await add_loan_data(db, user_id)
        
#         # Add insurance policies
#         await add_insurance_data(db, user_id)
        
#         # Add monthly budgets
#         await add_budget_data(db, user_id)
        
#         # Add financial goals
#         await add_goal_data(db, user_id)
        
#         logger.info("✅ Comprehensive financial portfolio created successfully!")
        
#     except Exception as e:
#         logger.error(f"Error adding comprehensive data: {e}")

# async def clear_existing_data(db, user_id):
#     """Clear existing sample data for clean start"""
#     collections = ['income', 'expenses', 'investments', 'loans', 'insurance', 'budgets', 'goals']
#     for collection_name in collections:
#         collection = getattr(db, collection_name)
#         result = await collection.delete_many({"user_id": user_id})
#         logger.info(f"Cleared {result.deleted_count} records from {collection_name}")

# async def add_income_data(db, user_id):
#     """Add diversified income sources over multiple months"""
#     logger.info("📈 Adding diversified income data...")
    
#     # Current and past 6 months
#     base_date = date(2025, 9, 1)  # September 2025
    
#     income_data = []
    
#     for month_offset in range(6):  # 6 months of data
#         month_date = base_date.replace(month=base_date.month - month_offset)
#         if month_date.month <= 0:
#             month_date = month_date.replace(year=month_date.year - 1, month=12 + month_date.month)
        
#         # Primary salary (varies slightly each month)
#         salary_variance = random.randint(-5000, 10000)
#         income_data.append({
#             "user_id": user_id,
#             "source": "Primary Salary",
#             "amount": 120000 + salary_variance,
#             "date": month_date,
#             "description": f"Monthly salary from TechCorp India - {month_date.strftime('%B %Y')}",
#             "created_at": datetime.now()
#         })
        
#         # Freelancing income (not every month)
#         if month_offset % 2 == 0:  # Every other month
#             freelance_amount = random.randint(15000, 45000)
#             income_data.append({
#                 "user_id": user_id,
#                 "source": "Freelancing",
#                 "amount": freelance_amount,
#                 "date": month_date.replace(day=15),
#                 "description": f"Web development project - {month_date.strftime('%B %Y')}",
#                 "created_at": datetime.now()
#             })
        
#         # Investment dividends (quarterly)
#         if month_offset % 3 == 0:
#             dividend_amount = random.randint(2000, 8000)
#             income_data.append({
#                 "user_id": user_id,
#                 "source": "Dividends",
#                 "amount": dividend_amount,
#                 "date": month_date.replace(day=20),
#                 "description": f"Mutual fund dividends - {month_date.strftime('%B %Y')}",
#                 "created_at": datetime.now()
#             })
    
#     # Additional income sources
#     additional_income = [
#         {
#             "user_id": user_id,
#             "source": "Rental Income",
#             "amount": 25000,
#             "date": date(2025, 9, 1),
#             "description": "Monthly rent from 2BHK apartment in Pune",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "source": "Bonus",
#             "amount": 75000,
#             "date": date(2025, 8, 15),
#             "description": "Annual performance bonus",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "source": "Side Business",
#             "amount": 18000,
#             "date": date(2025, 9, 10),
#             "description": "Online course sales revenue",
#             "created_at": datetime.now()
#         }
#     ]
    
#     income_data.extend(additional_income)
    
#     for income in income_data:
#         income_doc = prepare_document_for_mongo(income)
#         await db.income.insert_one(income_doc)
#         logger.info(f"Added income: {income['source']} - ₹{income['amount']:,}")

# async def add_expense_data(db, user_id):
#     """Add detailed monthly expenses across all categories"""
#     logger.info("💸 Adding comprehensive expense data...")
    
#     base_date = date(2025, 9, 1)
#     expense_data = []
    
#     # Monthly recurring expenses for current month
#     monthly_expenses = [
#         # Housing
#         {"amount": 28000, "category": "rent", "description": "Monthly apartment rent", "merchant": "Prestige Properties"},
#         {"amount": 3500, "category": "utilities", "description": "Electricity bill", "merchant": "MSEB"},
#         {"amount": 1200, "category": "utilities", "description": "Gas bill", "merchant": "Bharat Gas"},
#         {"amount": 800, "category": "utilities", "description": "Water bill", "merchant": "PMC"},
#         {"amount": 2500, "category": "utilities", "description": "Internet and cable", "merchant": "Airtel"},
        
#         # Food & Dining
#         {"amount": 12000, "category": "food", "description": "Monthly groceries", "merchant": "D-Mart"},
#         {"amount": 4500, "category": "food", "description": "Restaurants and takeout", "merchant": "Various"},
#         {"amount": 1500, "category": "food", "description": "Office lunch", "merchant": "Office Cafeteria"},
        
#         # Transportation
#         {"amount": 6000, "category": "transportation", "description": "Petrol", "merchant": "Shell Petrol Pump"},
#         {"amount": 2000, "category": "transportation", "description": "Car maintenance", "merchant": "Service Center"},
#         {"amount": 800, "category": "transportation", "description": "Uber rides", "merchant": "Uber"},
#         {"amount": 3000, "category": "transportation", "description": "Car EMI", "merchant": "HDFC Bank"},
        
#         # Health & Fitness
#         {"amount": 3500, "category": "healthcare", "description": "Gym membership", "merchant": "Gold's Gym"},
#         {"amount": 2000, "category": "healthcare", "description": "Health checkup", "merchant": "Apollo Hospital"},
#         {"amount": 800, "category": "healthcare", "description": "Medicines", "merchant": "Apollo Pharmacy"},
        
#         # Entertainment & Lifestyle
#         {"amount": 3000, "category": "entertainment", "description": "Movies and events", "merchant": "BookMyShow"},
#         {"amount": 1200, "category": "entertainment", "description": "Streaming subscriptions", "merchant": "Netflix, Prime"},
#         {"amount": 2500, "category": "shopping", "description": "Clothing", "merchant": "Myntra"},
#         {"amount": 1800, "category": "shopping", "description": "Electronics", "merchant": "Amazon"},
        
#         # Education & Professional
#         {"amount": 5000, "category": "education", "description": "Online courses", "merchant": "Udemy"},
#         {"amount": 1500, "category": "professional", "description": "Professional software", "merchant": "Adobe"},
        
#         # Insurance & Financial
#         {"amount": 8500, "category": "insurance", "description": "Life insurance premium", "merchant": "LIC"},
#         {"amount": 15000, "category": "investment", "description": "SIP investments", "merchant": "Zerodha"},
#         {"amount": 5000, "category": "savings", "description": "Emergency fund", "merchant": "SBI Bank"},
        
#         # Miscellaneous
#         {"amount": 2000, "category": "personal_care", "description": "Salon and grooming", "merchant": "Lakme Salon"},
#         {"amount": 1000, "category": "gifts", "description": "Birthday gift", "merchant": "Gift Shop"},
#         {"amount": 3000, "category": "travel", "description": "Weekend trip", "merchant": "MakeMyTrip"}
#     ]
    
#     # Add current month expenses
#     for i, expense in enumerate(monthly_expenses):
#         expense.update({
#             "user_id": user_id,
#             "date": base_date.replace(day=random.randint(1, 28)),
#             "created_at": datetime.now()
#         })
#         expense_data.append(expense)
    
#     # Add previous months' expenses (with variations)
#     for month_offset in range(1, 4):  # 3 previous months
#         prev_month = base_date.replace(month=base_date.month - month_offset)
#         if prev_month.month <= 0:
#             prev_month = prev_month.replace(year=prev_month.year - 1, month=12 + prev_month.month)
        
#         for expense_template in monthly_expenses[:15]:  # Subset for previous months
#             variance = random.uniform(0.8, 1.2)  # 20% variance
#             expense_data.append({
#                 "user_id": user_id,
#                 "amount": int(expense_template["amount"] * variance),
#                 "category": expense_template["category"],
#                 "description": f"{expense_template['description']} - {prev_month.strftime('%B')}",
#                 "merchant": expense_template["merchant"],
#                 "date": prev_month.replace(day=random.randint(1, 28)),
#                 "created_at": datetime.now()
#             })
    
#     for expense in expense_data:
#         expense_doc = prepare_document_for_mongo(expense)
#         await db.expenses.insert_one(expense_doc)
#         logger.info(f"Added expense: {expense['category']} - ₹{expense['amount']:,}")

# async def add_investment_data(db, user_id):
#     """Add diversified investment portfolio"""
#     logger.info("📊 Adding diversified investment portfolio...")
    
#     investment_data = [
#         # Mutual Funds
#         {
#             "user_id": user_id,
#             "name": "SBI Small Cap Fund",
#             "type": "mutual_fund",
#             "amount": 75000,
#             "current_value": 92000,
#             "date": date(2024, 1, 15),
#             "goal": "Long term wealth creation",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "HDFC Top 100 Fund",
#             "type": "mutual_fund",
#             "amount": 50000,
#             "current_value": 58000,
#             "date": date(2024, 3, 10),
#             "goal": "Retirement planning",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Axis Bluechip Fund",
#             "type": "mutual_fund",
#             "amount": 40000,
#             "current_value": 43500,
#             "date": date(2024, 5, 20),
#             "goal": "Child education",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Mirae Asset Emerging Bluechip",
#             "type": "mutual_fund",
#             "amount": 60000,
#             "current_value": 68000,
#             "date": date(2024, 2, 5),
#             "goal": "Wealth accumulation",
#             "created_at": datetime.now()
#         },
        
#         # Stocks
#         {
#             "user_id": user_id,
#             "name": "Reliance Industries",
#             "type": "stocks",
#             "amount": 45000,
#             "current_value": 52000,
#             "date": date(2024, 6, 12),
#             "goal": "Portfolio diversification",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "TCS",
#             "type": "stocks",
#             "amount": 38000,
#             "current_value": 41000,
#             "date": date(2024, 4, 8),
#             "goal": "Blue chip investment",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "HDFC Bank",
#             "type": "stocks",
#             "amount": 30000,
#             "current_value": 33000,
#             "date": date(2024, 7, 15),
#             "goal": "Banking sector exposure",
#             "created_at": datetime.now()
#         },
        
#         # Fixed Deposits & Bonds
#         {
#             "user_id": user_id,
#             "name": "SBI Fixed Deposit",
#             "type": "fixed_deposit",
#             "amount": 200000,
#             "current_value": 215000,
#             "date": date(2023, 12, 1),
#             "goal": "Safe investment",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Government Bonds",
#             "type": "bonds",
#             "amount": 100000,
#             "current_value": 108000,
#             "date": date(2024, 1, 20),
#             "goal": "Stable returns",
#             "created_at": datetime.now()
#         },
        
#         # Tax Saving Investments
#         {
#             "user_id": user_id,
#             "name": "ELSS Tax Saver Fund",
#             "type": "mutual_fund",
#             "amount": 150000,
#             "current_value": 165000,
#             "date": date(2024, 3, 31),
#             "goal": "Tax saving under 80C",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "PPF Account",
#             "type": "ppf",
#             "amount": 150000,
#             "current_value": 162000,
#             "date": date(2024, 4, 5),
#             "goal": "Retirement and tax planning",
#             "created_at": datetime.now()
#         },
        
#         # Gold and Alternative Investments
#         {
#             "user_id": user_id,
#             "name": "Gold ETF",
#             "type": "etf",
#             "amount": 25000,
#             "current_value": 27500,
#             "date": date(2024, 8, 10),
#             "goal": "Hedge against inflation",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Real Estate Investment",
#             "type": "real_estate",
#             "amount": 500000,
#             "current_value": 575000,
#             "date": date(2023, 6, 15),
#             "goal": "Property investment",
#             "created_at": datetime.now()
#         }
#     ]
    
#     for investment in investment_data:
#         investment_doc = prepare_document_for_mongo(investment)
#         await db.investments.insert_one(investment_doc)
#         logger.info(f"Added investment: {investment['name']} - ₹{investment['current_value']:,}")

# async def add_loan_data(db, user_id):
#     """Add various types of loans"""
#     logger.info("💳 Adding loan portfolio...")
    
#     loan_data = [
#         {
#             "user_id": user_id,
#             "type": "home_loan",
#             "principal": 3500000,
#             "outstanding": 2850000,
#             "interest_rate": 8.75,
#             "emi": 32000,
#             "start_date": date(2022, 6, 15),
#             "end_date": date(2042, 6, 15),
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "type": "car_loan",
#             "principal": 800000,
#             "outstanding": 420000,
#             "interest_rate": 9.25,
#             "emi": 18500,
#             "start_date": date(2023, 3, 10),
#             "end_date": date(2028, 3, 10),
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "type": "personal_loan",
#             "principal": 300000,
#             "outstanding": 125000,
#             "interest_rate": 12.5,
#             "emi": 8500,
#             "start_date": date(2024, 1, 5),
#             "end_date": date(2027, 1, 5),
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "type": "education_loan",
#             "principal": 1200000,
#             "outstanding": 950000,
#             "interest_rate": 7.5,
#             "emi": 15000,
#             "start_date": date(2020, 8, 1),
#             "end_date": date(2035, 8, 1),
#             "created_at": datetime.now()
#         }
#     ]
    
#     for loan in loan_data:
#         loan_doc = prepare_document_for_mongo(loan)
#         await db.loans.insert_one(loan_doc)
#         logger.info(f"Added loan: {loan['type']} - Outstanding: ₹{loan['outstanding']:,}")

# async def add_insurance_data(db, user_id):
#     """Add insurance policies"""
#     logger.info("🛡️ Adding insurance portfolio...")
    
#     insurance_data = [
#         {
#             "user_id": user_id,
#             "type": "life_insurance",
#             "policy_name": "LIC Jeevan Anand",
#             "coverage_amount": 2500000,
#             "premium": 45000,
#             "policy_start": date(2020, 4, 15),
#             "policy_end": date(2045, 4, 15),
#             "premium_frequency": "annual",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "type": "term_insurance",
#             "policy_name": "HDFC Click 2 Protect Plus",
#             "coverage_amount": 5000000,
#             "premium": 18000,
#             "policy_start": date(2021, 7, 20),
#             "policy_end": date(2061, 7, 20),
#             "premium_frequency": "annual",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "type": "health_insurance",
#             "policy_name": "Star Health Family Floater",
#             "coverage_amount": 1000000,
#             "premium": 25000,
#             "policy_start": date(2024, 1, 1),
#             "policy_end": date(2025, 1, 1),
#             "premium_frequency": "annual",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "type": "vehicle_insurance",
#             "policy_name": "Bajaj Allianz Car Insurance",
#             "coverage_amount": 800000,
#             "premium": 15000,
#             "policy_start": date(2024, 3, 10),
#             "policy_end": date(2025, 3, 10),
#             "premium_frequency": "annual",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "type": "travel_insurance",
#             "policy_name": "ICICI Lombard Travel Guard",
#             "coverage_amount": 500000,
#             "premium": 3500,
#             "policy_start": date(2025, 8, 1),
#             "policy_end": date(2025, 12, 31),
#             "premium_frequency": "annual",
#             "created_at": datetime.now()
#         }
#     ]
    
#     for insurance in insurance_data:
#         insurance_doc = prepare_document_for_mongo(insurance)
#         await db.insurance.insert_one(insurance_doc)
#         logger.info(f"Added insurance: {insurance['policy_name']} - Coverage: ₹{insurance['coverage_amount']:,}")

# async def add_budget_data(db, user_id):
#     """Add monthly budgets"""
#     logger.info("📝 Adding budget planning...")
    
#     # Current month and next few months budgets
#     base_date = date(2025, 9, 1)
    
#     budget_months = [
#         "2025-09", "2025-10", "2025-11", "2025-12",
#         "2026-01", "2026-02"
#     ]
    
#     for month_str in budget_months:
#         budget_data = {
#             "user_id": user_id,
#             "month": month_str,
#             "total_budget": 180000,
#             "category_budgets": {
#                 "rent": 30000,
#                 "food": 20000,
#                 "transportation": 15000,
#                 "utilities": 8000,
#                 "entertainment": 10000,
#                 "healthcare": 8000,
#                 "shopping": 12000,
#                 "education": 7000,
#                 "insurance": 15000,
#                 "investment": 25000,
#                 "savings": 15000,
#                 "miscellaneous": 15000
#             },
#             "savings_target": 40000,
#             "created_at": datetime.now()
#         }
        
#         budget_doc = prepare_document_for_mongo(budget_data)
#         await db.budgets.insert_one(budget_doc)
#         logger.info(f"Added budget for {budget_data['month']} - Total: ₹{budget_data['total_budget']:,}")

# async def add_goal_data(db, user_id):
#     """Add financial goals"""
#     logger.info("🎯 Adding financial goals...")
    
#     goal_data = [
#         {
#             "user_id": user_id,
#             "name": "Emergency Fund",
#             "target_amount": 600000,
#             "current_amount": 450000,
#             "target_date": date(2026, 12, 31),
#             "category": "emergency",
#             "priority": "high",
#             "description": "6 months of expenses as emergency fund",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "House Down Payment",
#             "target_amount": 1500000,
#             "current_amount": 800000,
#             "target_date": date(2027, 6, 30),
#             "category": "real_estate",
#             "priority": "high",
#             "description": "Down payment for bigger house upgrade",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Child Education Fund",
#             "target_amount": 2500000,
#             "current_amount": 350000,
#             "target_date": date(2035, 4, 1),
#             "category": "education",
#             "priority": "medium",
#             "description": "Higher education fund for future children",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Retirement Corpus",
#             "target_amount": 10000000,
#             "current_amount": 1200000,
#             "target_date": date(2055, 12, 31),
#             "category": "retirement",
#             "priority": "high",
#             "description": "Retirement fund to maintain lifestyle",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Vacation Fund",
#             "target_amount": 300000,
#             "current_amount": 85000,
#             "target_date": date(2026, 3, 31),
#             "category": "travel",
#             "priority": "low",
#             "description": "European vacation with family",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Car Upgrade",
#             "target_amount": 800000,
#             "current_amount": 200000,
#             "target_date": date(2026, 8, 15),
#             "category": "vehicle",
#             "priority": "medium",
#             "description": "Upgrade to premium SUV",
#             "created_at": datetime.now()
#         },
#         {
#             "user_id": user_id,
#             "name": "Business Investment",
#             "target_amount": 1000000,
#             "current_amount": 150000,
#             "target_date": date(2028, 1, 1),
#             "category": "business",
#             "priority": "medium",
#             "description": "Start tech consulting business",
#             "created_at": datetime.now()
#         }
#     ]
    
#     for goal in goal_data:
#         goal_doc = prepare_document_for_mongo(goal)
#         await db.goals.insert_one(goal_doc)
#         progress = (goal['current_amount'] / goal['target_amount']) * 100
#         logger.info(f"Added goal: {goal['name']} - Progress: {progress:.1f}%")

# if __name__ == "__main__":
#     asyncio.run(add_comprehensive_financial_data())


#!/usr/bin/env python3
"""
Script to add high-net-worth financial data for testing AI chat functionality
Creates a wealthy portfolio with very high income, luxury expenses, large investments, minimal loans, and strong financial goals
"""
import asyncio
import sys
import os

# Add the api directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from database import get_database
from utils import prepare_document_for_mongo
from rag_system import vector_store
from datetime import datetime, date
import logging
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def add_high_networth_financial_data():
    try:
        from database import connect_to_mongo
        await connect_to_mongo()
        
        db = get_database()
        user_id = "68d2dd83-510a-426a-84ef-7b90be8a8e19"  # Sample HNI user ID
        
        # Clear old data
        await clear_existing_data(db, user_id)
        
        # Add rich profile
        await add_income_data(db, user_id)
        await add_expense_data(db, user_id)
        await add_investment_data(db, user_id)
        await add_loan_data(db, user_id)
        await add_insurance_data(db, user_id)
        await add_budget_data(db, user_id)
        await add_goal_data(db, user_id)
        
        logger.info("✅ High Net-Worth portfolio created successfully!")
    except Exception as e:
        logger.error(f"Error adding data: {e}")

async def clear_existing_data(db, user_id):
    collections = ['income', 'expenses', 'investments', 'loans', 'insurance', 'budgets', 'goals']
    for c in collections:
        result = await getattr(db, c).delete_many({"user_id": user_id})
        logger.info(f"Cleared {result.deleted_count} records from {c}")

async def add_income_data(db, user_id):
    logger.info("📈 Adding very high income sources...")
    
    base_date = date(2025, 9, 1)
    income_data = []

    for month_offset in range(6):
        month_date = base_date.replace(month=max(1, base_date.month - month_offset))
        salary_variance = random.randint(-25000, 50000)
        income_data.append({
            "user_id": user_id,
            "source": "Executive Salary",
            "amount": 800000 + salary_variance,
            "date": month_date,
            "description": f"C-level salary - {month_date.strftime('%B %Y')}",
            "created_at": datetime.now()
        })
        
        if month_offset % 2 == 0:
            business_income = random.randint(150000, 350000)
            income_data.append({
                "user_id": user_id,
                "source": "Business Income",
                "amount": business_income,
                "date": month_date.replace(day=15),
                "description": f"Equity partnership profit - {month_date.strftime('%B %Y')}",
                "created_at": datetime.now()
            })
        
        if month_offset % 3 == 0:
            dividends = random.randint(50000, 150000)
            income_data.append({
                "user_id": user_id,
                "source": "Dividends",
                "amount": dividends,
                "date": month_date.replace(day=20),
                "description": f"Portfolio dividends - {month_date.strftime('%B %Y')}",
                "created_at": datetime.now()
            })

    additional_income = [
        {"user_id": user_id, "source": "Rental Income", "amount": 120000, "date": base_date, "description": "Luxury apartments rent", "created_at": datetime.now()},
        {"user_id": user_id, "source": "Annual Bonus", "amount": 2500000, "date": date(2025, 8, 15), "description": "Performance & stock options", "created_at": datetime.now()},
        {"user_id": user_id, "source": "Consulting", "amount": 200000, "date": date(2025, 9, 5), "description": "Advisory board honorarium", "created_at": datetime.now()}
    ]
    income_data.extend(additional_income)

    for inc in income_data:
        await db.income.insert_one(prepare_document_for_mongo(inc))
        logger.info(f"Added income: {inc['source']} - ₹{inc['amount']:,}")

async def add_expense_data(db, user_id):
    logger.info("💸 Adding luxury expense data...")
    base_date = date(2025, 9, 1)
    expenses = [
        {"amount": 150000, "category": "housing", "description": "Luxury penthouse rent", "merchant": "Prestige Realty"},
        {"amount": 40000, "category": "utilities", "description": "High-end utilities", "merchant": "Multiple"},
        {"amount": 100000, "category": "food", "description": "Fine dining & gourmet groceries", "merchant": "5-star restaurants"},
        {"amount": 60000, "category": "travel", "description": "Business class flights & luxury hotels", "merchant": "Expedia"},
        {"amount": 80000, "category": "shopping", "description": "Luxury fashion & accessories", "merchant": "Gucci, Louis Vuitton"},
        {"amount": 50000, "category": "healthcare", "description": "Premium health care & wellness", "merchant": "Apollo Premium"},
        {"amount": 35000, "category": "entertainment", "description": "Exclusive clubs & events", "merchant": "Private Clubs"}
    ]

    for e in expenses:
        e.update({"user_id": user_id, "date": base_date, "created_at": datetime.now()})
        await db.expenses.insert_one(prepare_document_for_mongo(e))
        logger.info(f"Added expense: {e['category']} - ₹{e['amount']:,}")

async def add_investment_data(db, user_id):
    logger.info("📊 Adding large investment portfolio...")
    investments = [
        {"name": "Bluechip Equity Portfolio", "type": "stocks", "amount": 5000000, "current_value": 6200000, "goal": "Capital growth"},
        {"name": "Global Index Fund", "type": "mutual_fund", "amount": 3000000, "current_value": 3400000, "goal": "Diversification"},
        {"name": "Luxury Real Estate", "type": "real_estate", "amount": 25000000, "current_value": 30000000, "goal": "Long-term wealth"},
        {"name": "Government Bonds", "type": "bonds", "amount": 2000000, "current_value": 2100000, "goal": "Stable returns"},
        {"name": "Private Equity Fund", "type": "alternative", "amount": 5000000, "current_value": 5500000, "goal": "High growth"},
        {"name": "Gold & Precious Metals", "type": "etf", "amount": 1500000, "current_value": 1650000, "goal": "Hedge against inflation"}
    ]

    for inv in investments:
        inv.update({"user_id": user_id, "date": date(2024, 1, 1), "created_at": datetime.now()})
        await db.investments.insert_one(prepare_document_for_mongo(inv))
        logger.info(f"Added investment: {inv['name']} - ₹{inv['current_value']:,}")

async def add_loan_data(db, user_id):
    logger.info("💳 Adding minimal loan portfolio...")
    # Only one small loan (for credit score mix)
    loan = {
        "user_id": user_id,
        "type": "car_loan",
        "principal": 1500000,
        "outstanding": 300000,
        "interest_rate": 7.0,
        "emi": 40000,
        "start_date": date(2023, 1, 1),
        "end_date": date(2026, 1, 1),
        "created_at": datetime.now()
    }
    await db.loans.insert_one(prepare_document_for_mongo(loan))
    logger.info(f"Added loan: {loan['type']} - Outstanding: ₹{loan['outstanding']:,}")

async def add_insurance_data(db, user_id):
    logger.info("🛡️ Adding comprehensive insurance portfolio...")
    insurance = [
        {"type": "term_insurance", "policy_name": "HNI Life Cover", "coverage_amount": 100000000, "premium": 200000, "policy_start": date(2020,1,1), "policy_end": date(2070,1,1)},
        {"type": "health_insurance", "policy_name": "Global Health Cover", "coverage_amount": 50000000, "premium": 150000, "policy_start": date(2024,1,1), "policy_end": date(2025,1,1)},
        {"type": "vehicle_insurance", "policy_name": "Luxury Car Insurance", "coverage_amount": 10000000, "premium": 50000, "policy_start": date(2024,3,1), "policy_end": date(2025,3,1)}
    ]
    for ins in insurance:
        ins.update({"user_id": user_id, "premium_frequency": "annual", "created_at": datetime.now()})
        await db.insurance.insert_one(prepare_document_for_mongo(ins))
        logger.info(f"Added insurance: {ins['policy_name']} - Coverage: ₹{ins['coverage_amount']:,}")

async def add_budget_data(db, user_id):
    logger.info("📝 Adding large monthly budgets...")
    months = ["2025-09", "2025-10", "2025-11"]
    for m in months:
        budget = {
            "user_id": user_id,
            "month": m,
            "total_budget": 1000000,
            "category_budgets": {"housing": 200000, "food": 150000, "travel": 200000, "shopping": 200000, "investment": 250000},
            "savings_target": 500000,
            "created_at": datetime.now()
        }
        await db.budgets.insert_one(prepare_document_for_mongo(budget))
        logger.info(f"Added budget for {m} - ₹{budget['total_budget']:,}")

async def add_goal_data(db, user_id):
    logger.info("🎯 Adding HNI financial goals...")
    goals = [
        {"name": "Retirement Corpus", "target_amount": 500000000, "current_amount": 150000000, "target_date": date(2050,12,31), "category": "retirement", "priority": "high"},
        {"name": "Private Jet Purchase", "target_amount": 300000000, "current_amount": 100000000, "target_date": date(2035,6,30), "category": "luxury", "priority": "medium"},
        {"name": "Global Real Estate", "target_amount": 200000000, "current_amount": 80000000, "target_date": date(2030,12,31), "category": "real_estate", "priority": "high"}
    ]
    for g in goals:
        g.update({"user_id": user_id, "description": f"Goal: {g['name']}", "created_at": datetime.now()})
        await db.goals.insert_one(prepare_document_for_mongo(g))
        logger.info(f"Added goal: {g['name']} - Progress: {(g['current_amount']/g['target_amount'])*100:.1f}%")

if __name__ == "__main__":
    asyncio.run(add_high_networth_financial_data())
