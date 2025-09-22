from fastapi import APIRouter, Depends, HTTPException, status
from models import ChatMessage, ChatResponse
from auth import get_current_user
from rag_system import vector_store
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["AI Chat"])

@router.post("/message", response_model=ChatResponse)
async def chat_with_ai(
    chat_data: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    """Chat with AI assistant"""
    try:
        user_id = current_user["sub"]
        
        # Generate AI response using RAG
        response_data = await vector_store.generate_response(user_id, chat_data.message)
        
        logger.info(f"AI chat response generated for user: {user_id}")
        
        return ChatResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error in AI chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/suggestions", response_model=dict)
async def get_chat_suggestions(current_user: dict = Depends(get_current_user)):
    """Get chat suggestions for user"""
    try:
        # Return default suggestions
        suggestions = [
            "What's my current financial summary?",
            "How much did I spend on food this month?",
            "Show me my investment portfolio performance",
            "Which loan should I pay off first?",
            "How can I improve my savings rate?",
            "What's my expense breakdown by category?",
            "Am I on track to meet my financial goals?",
            "Give me tax saving investment recommendations",
            "How much emergency fund do I need?",
            "Should I invest more in mutual funds or stocks?"
        ]
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        logger.error(f"Error getting chat suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
