"""PH-Pulse FastAPI backend."""

from fastapi import FastAPI

app = FastAPI(title="PH-Pulse API", version="0.1.0")


@app.get("/health")
async def health() -> dict[str, str]:
    """Health-check endpoint."""
    return {"status": "ok"}
