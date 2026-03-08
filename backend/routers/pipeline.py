"""Pipeline health status API route."""

from datetime import datetime, timezone

from fastapi import APIRouter

from backend.models.schemas import PipelineStatusResponse, TableStatus
from backend.services.pipeline_service import get_pipeline_status

router = APIRouter(prefix="/api/v1/pipeline", tags=["pipeline"])


@router.get("/status", response_model=PipelineStatusResponse)
def get_pipeline_health() -> PipelineStatusResponse:
    """Get overall pipeline health and per-table status."""
    table_statuses = get_pipeline_status()

    # Determine overall health
    healths = [t.health for t in table_statuses]
    if "error" in healths:
        overall = "error"
    elif "stale" in healths:
        overall = "stale"
    else:
        overall = "healthy"

    return PipelineStatusResponse(
        overall_health=overall,
        checked_at=datetime.now(tz=timezone.utc),
        tables=[
            TableStatus(
                table_name=t.table_name,
                display_name=t.display_name,
                layer=t.layer,
                row_count=t.row_count,
                last_modified=t.last_modified,
                health=t.health,
            )
            for t in table_statuses
        ],
    )
