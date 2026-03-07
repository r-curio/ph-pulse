"""PH-Pulse FastAPI backend."""

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from backend.routers import historical_poverty, municipal_poverty, pipeline, poverty

app = FastAPI(title="PH-Pulse API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(poverty.router)
app.include_router(historical_poverty.router)
app.include_router(municipal_poverty.router)
app.include_router(pipeline.router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Health-check endpoint."""
    return {"status": "ok"}
