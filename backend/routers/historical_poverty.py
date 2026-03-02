"""API routes for historical poverty families 5-year data."""

from fastapi import APIRouter, HTTPException, Query

from backend.models.schemas import (
    HistoricalPovertyResponse,
    HistoricalRegionDetailResponse,
)
from backend.services.historical_poverty_service import (
    get_all_historical_regional,
    get_historical_national,
    get_historical_regional_by_name,
)

router = APIRouter(prefix="/api/v1/poverty/historical", tags=["historical-poverty"])


@router.get("/regions", response_model=HistoricalPovertyResponse)
def list_historical_regions(
    year: int | None = Query(default=None, description="Filter by survey year"),
) -> HistoricalPovertyResponse:
    """List historical poverty data for all regions, optionally filtered by year."""
    records = get_all_historical_regional(year=year)
    return HistoricalPovertyResponse(count=len(records), records=records)


@router.get("/regions/{region_name}", response_model=HistoricalRegionDetailResponse)
def get_historical_region(region_name: str) -> HistoricalRegionDetailResponse:
    """Get historical poverty data for a specific region across all years."""
    records = get_historical_regional_by_name(region_name)
    if not records:
        raise HTTPException(status_code=404, detail=f"Region '{region_name}' not found")

    sorted_records = sorted(records, key=lambda r: r.year)
    earliest = sorted_records[0]
    latest = sorted_records[-1]
    return HistoricalRegionDetailResponse(
        region=latest.geo_name,
        records=records,
        earliest_poverty_incidence_pct=earliest.poverty_incidence_pct,
        latest_poverty_incidence_pct=latest.poverty_incidence_pct,
        latest_poverty_tier=latest.poverty_tier,
    )


@router.get("/national", response_model=HistoricalPovertyResponse)
def get_historical_national_data() -> HistoricalPovertyResponse:
    """Get national-level historical poverty data across all years."""
    records = get_historical_national()
    return HistoricalPovertyResponse(count=len(records), records=records)
