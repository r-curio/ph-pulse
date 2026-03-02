---
name: fastapi-backend
description: Use when building FastAPI routes, services, Pydantic models, or backend logic in the backend/ directory.
---

# FastAPI Backend Conventions for PH-Pulse

## Structure
```
backend/
├── main.py                 # FastAPI app + CORS config
├── routers/
│   ├── regions.py          # Regional data endpoints
│   ├── pipeline.py         # Pipeline status endpoints
│   └── chat.py             # GenAI chat endpoint
├── services/
│   ├── bigquery_service.py # BigQuery query layer
│   └── gemini_service.py   # Gemini API wrapper
├── models/
│   └── schemas.py          # Pydantic request/response models
└── requirements.txt
```

## Endpoint Pattern
```python
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.gemini_service import answer_question

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Handle a natural language question about Philippine socioeconomic data."""
    result = await answer_question(request.question)
    return ChatResponse(**result)
```

## Rules
- Always use Pydantic models for request/response validation
- Services handle business logic, routers handle HTTP concerns only
- Use `async def` for all route handlers
- Type-hint everything — no `Any` types
- CORS must allow the dashboard origin (localhost:3000 in dev, Vercel domain in prod)
