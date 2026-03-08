"""API routes for the GenAI chat feature."""

import asyncio
import logging
from collections.abc import AsyncIterator
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.models.schemas import ChatRequest, ChatResponse
from backend.services.chat_service import answer_question, stream_answer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

_chat_executor = ThreadPoolExecutor(max_workers=4)


def _validate_request(request: ChatRequest) -> None:
    """Validate that the last message in the request is from the user.

    Args:
        request: The chat request to validate.

    Raises:
        HTTPException: If the last message role is not 'user'.
    """
    last_msg = request.messages[-1]
    if last_msg.role != "user":
        raise HTTPException(
            status_code=400, detail="Last message must have role 'user'."
        )


@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest) -> ChatResponse:
    """Handle a natural language question about Philippine socioeconomic data.

    Accepts a conversation history and returns an AI-generated answer
    grounded in real data from the PH-Pulse BigQuery warehouse, along
    with source citations indicating which tables were queried.
    """
    _validate_request(request)

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


async def _stream_in_thread(request: ChatRequest) -> AsyncIterator[str]:
    """Run the synchronous stream_answer generator in a thread pool.

    Uses an asyncio.Queue to bridge events from the sync generator
    on a background thread to the async iterator consumed by
    StreamingResponse, enabling true incremental delivery.

    Args:
        request: The chat request to process.

    Yields:
        Formatted SSE event strings.
    """
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[str | None] = asyncio.Queue()

    def _produce() -> None:
        """Run the sync generator and push events onto the queue."""
        try:
            for event in stream_answer(request):
                loop.call_soon_threadsafe(queue.put_nowait, event)
        except Exception:
            logger.exception("stream_answer producer failed")
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, None)

    loop.run_in_executor(_chat_executor, _produce)

    while True:
        event = await queue.get()
        if event is None:
            break
        yield event


@router.post("/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """Stream an AI-generated answer as Server-Sent Events.

    Same functionality as /query but returns a streaming response with
    incremental SSE events for real-time UI updates.

    SSE event types:
        - ``tool_call``: A data tool is being queried.
        - ``token``: A chunk of the answer text.
        - ``source``: A data source citation.
        - ``error``: An error occurred during processing.
        - ``done``: Stream is complete.
    """
    _validate_request(request)

    return StreamingResponse(
        _stream_in_thread(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
