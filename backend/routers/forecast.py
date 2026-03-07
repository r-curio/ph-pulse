"""API routes for ML poverty forecast data."""

from fastapi import APIRouter, Query

from backend.models.schemas import ForecastResponse, ForecastSummaryResponse
from backend.services.forecast_service import (
    get_all_forecasts,
    get_forecast_regions,
    get_forecast_summary,
)

router = APIRouter(prefix="/api/v1/poverty/forecasts", tags=["forecasts"])


@router.get("/", response_model=ForecastResponse)
def list_forecasts(
    region: str | None = Query(
        default=None, description="Filter by region name (partial match)"
    ),
    year: int | None = Query(default=None, description="Filter by forecast year"),
) -> ForecastResponse:
    """List all poverty forecast records, optionally filtered by region and/or year."""
    records = get_all_forecasts(region=region, year=year)
    return ForecastResponse(count=len(records), records=records)


@router.get("/summary", response_model=ForecastSummaryResponse)
def forecast_summary() -> ForecastSummaryResponse:
    """Get KPI summary computed from 2026 forecast predictions."""
    return get_forecast_summary()


@router.get("/regions", response_model=list[str])
def forecast_regions() -> list[str]:
    """Get sorted list of distinct region names in forecast data."""
    return get_forecast_regions()
