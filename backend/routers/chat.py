"""API routes for the GenAI chat feature."""

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException

from backend.models.schemas import ChatRequest, ChatResponse
from backend.services.chat_service import answer_question

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

_chat_executor = ThreadPoolExecutor(max_workers=4)


@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest) -> ChatResponse:
    """Handle a natural language question about Philippine socioeconomic data.

    Accepts a conversation history and returns an AI-generated answer
    grounded in real data from the PH-Pulse BigQuery warehouse, along
    with source citations indicating which tables were queried.
    """
    last_msg = request.messages[-1]
    if last_msg.role != "user":
        raise HTTPException(
            status_code=400, detail="Last message must have role 'user'."
        )

    try:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(_chat_executor, answer_question, request)
    except RuntimeError as exc:
        # Gemini API key not configured
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Chat service error")
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while processing your question.",
        ) from exc
