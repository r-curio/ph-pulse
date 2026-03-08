"""Chat service that orchestrates Gemini LLM calls with data tool execution.

Maps Gemini function calls to existing backend data services, executes them,
and feeds results back to the model for natural language answer generation.
"""

import logging
from typing import Any

from backend.models.schemas import ChatRequest, ChatResponse, SourceInfo
from backend.services import bigquery_service as regional_svc
from backend.services import forecast_service as forecast_svc
from backend.services import historical_poverty_service as historical_svc
from backend.services import municipal_poverty_service as municipal_svc
from genai.gemini_service import (
    build_function_response_parts,
    create_chat_session,
    extract_function_calls,
    get_text_response,
    has_text_response,
)

logger = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 5 


def _execute_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    """Execute a single tool call by dispatching to the appropriate service.

    Args:
        name: The tool/function name from Gemini.
        args: The arguments dict from Gemini.

    Returns:
        Dict with serialized result data.

    Raises:
        ValueError: If the tool name is not recognized.
    """
    if name == "get_regional_poverty":
        region = args.get("region")
        year_val = args.get("year")
        year = int(year_val) if year_val is not None else None
        if region:
            records = regional_svc.get_regional_poverty_by_name(region)
            if year is not None:
                records = [r for r in records if r.year == year]
        else:
            records = regional_svc.get_all_regional_poverty(year=year)
        return {"records": [r.model_dump() for r in records]}

    if name == "get_national_poverty":
        records = regional_svc.get_national_poverty()
        return {"records": [r.model_dump() for r in records]}

    if name == "get_historical_poverty":
        region = args.get("region")
        year_val = args.get("year")
        year = int(year_val) if year_val is not None else None
        if region:
            records = historical_svc.get_historical_regional_by_name(region)
            if year is not None:
                records = [r for r in records if r.year == year]
        else:
            records = historical_svc.get_all_historical_regional(year=year)
        return {"records": [r.model_dump() for r in records]}

    if name == "get_historical_national":
        records = historical_svc.get_historical_national()
        return {"records": [r.model_dump() for r in records]}

    if name == "get_municipal_poverty":
        year_val = args.get("year")
        if year_val is None:
            raise ValueError("year is required for get_municipal_poverty")
        limit = int(args.get("limit", 50))
        records = municipal_svc.get_municipalities(
            region=args.get("region"),
            province=args.get("province"),
            year=int(year_val),
        )
        return {"records": [r.model_dump() for r in records[:limit]]}

    if name == "get_top_bottom_municipalities":
        year_val = args.get("year")
        if year_val is None:
            raise ValueError("year is required for get_top_bottom_municipalities")
        year = int(year_val)
        limit = int(args.get("limit", 10))
        top, bottom = municipal_svc.get_top_bottom_municipalities(
            year=year,
            region=args.get("region"),
            province=args.get("province"),
            limit=limit,
        )
        return {
            "top": [r.model_dump() for r in top],
            "bottom": [r.model_dump() for r in bottom],
        }

    if name == "get_forecasts":
        year_val = args.get("year")
        records = forecast_svc.get_all_forecasts(
            region=args.get("region"),
            year=int(year_val) if year_val is not None else None,
        )
        return {"records": [r.model_dump() for r in records]}

    if name == "get_forecast_summary":
        summary = forecast_svc.get_forecast_summary()
        return summary.model_dump()

    raise ValueError(f"Unknown tool: {name}")


def _tool_name_to_source(name: str) -> SourceInfo:
    """Map a tool function name to a human-readable data source citation.

    Args:
        name: The tool/function name.

    Returns:
        SourceInfo with table name and description.
    """
    source_map: dict[str, tuple[str, str]] = {
        "get_regional_poverty": (
            "mart_regional_poverty_summary",
            "Regional poverty incidence (2018, 2021, 2023)",
        ),
        "get_national_poverty": (
            "mart_regional_poverty_summary",
            "National poverty incidence (2018, 2021, 2023)",
        ),
        "get_historical_poverty": (
            "mart_poverty_families_5yr_summary",
            "Historical poverty families (1991-2015)",
        ),
        "get_historical_national": (
            "mart_poverty_families_5yr_summary",
            "National historical poverty (1991-2015)",
        ),
        "get_municipal_poverty": (
            "mart_municipal_poverty_summary",
            "Municipal poverty estimates (2006, 2009, 2012)",
        ),
        "get_top_bottom_municipalities": (
            "mart_municipal_poverty_summary",
            "Municipal poverty rankings (2006, 2009, 2012)",
        ),
        "get_forecasts": (
            "ml_poverty_forecasts",
            "ML poverty predictions (2024-2026, linear regression)",
        ),
        "get_forecast_summary": (
            "ml_poverty_forecasts",
            "2026 forecast KPI summary",
        ),
    }
    table, description = source_map.get(name, ("unknown", "Unknown data source"))
    return SourceInfo(table=table, description=description)


def answer_question(request: ChatRequest) -> ChatResponse:
    """Process a chat request through Gemini with function calling.

    Sends the user's message (with conversation history) to Gemini,
    handles any tool calls by executing them against backend services,
    and returns the final text response with source citations.

    Args:
        request: ChatRequest containing messages and conversation history.

    Returns:
        ChatResponse with the assistant's answer and data sources used.
    """
    # Build history for Gemini (exclude the latest user message)
    history = []
    for msg in request.messages[:-1]:
        role = "model" if msg.role == "assistant" else msg.role
        history.append({"role": role, "parts": msg.content})

    # Get the latest user message
    user_message = request.messages[-1].content

    # Create Gemini chat session with history
    chat = create_chat_session(history=history if history else None)

    # Send user message and handle tool calls
    sources: list[SourceInfo] = []
    response = chat.send_message(user_message)

    for _round in range(MAX_TOOL_ROUNDS):
        fn_calls = extract_function_calls(response)
        if not fn_calls:
            break

        # Execute all tool calls for this round
        call_results: list[dict[str, Any]] = []
        for fc in fn_calls:
            tool_name = fc["name"]
            tool_args = fc["args"]
            logger.info("Tool call: %s(%s)", tool_name, tool_args)

            try:
                result = _execute_tool(tool_name, tool_args)
                call_results.append({"name": tool_name, "result": result})
                sources.append(_tool_name_to_source(tool_name))
            except Exception as exc:
                logger.error("Tool execution failed: %s — %s", tool_name, exc)
                call_results.append({"name": tool_name, "result": {"error": str(exc)}})

        # Send tool results back to Gemini
        response_parts = build_function_response_parts(call_results)
        response = chat.send_message(response_parts)

    # Extract the final text answer
    answer = (
        get_text_response(response)
        if has_text_response(response)
        else (
            "I wasn't able to generate an answer. Please try rephrasing your question."
        )
    )

    # Deduplicate sources
    seen_tables: set[str] = set()
    unique_sources: list[SourceInfo] = []
    for src in sources:
        if src.table not in seen_tables:
            seen_tables.add(src.table)
            unique_sources.append(src)

    return ChatResponse(
        answer=answer,
        sources=unique_sources,
    )
