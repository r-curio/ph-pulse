"""API routes for poverty incidence data."""

from fastapi import APIRouter, HTTPException, Query

from backend.models.schemas import (
    RegionalPovertyResponse,
    RegionDetailResponse,
)
from backend.services.bigquery_service import (
    get_all_regional_poverty,
    get_national_poverty,
    get_regional_poverty_by_name,
)

router = APIRouter(prefix="/api/v1/poverty", tags=["poverty"])


@router.get("/regions", response_model=RegionalPovertyResponse)
async def list_regions(
    year: int | None = Query(default=None, description="Filter by survey year"),
) -> RegionalPovertyResponse:
    """List poverty data for all regions, optionally filtered by year."""
    records = get_all_regional_poverty(year=year)
    return RegionalPovertyResponse(count=len(records), records=records)


@router.get("/regions/{region_name}", response_model=RegionDetailResponse)
async def get_region(region_name: str) -> RegionDetailResponse:
    """Get poverty data for a specific region across all years."""
    records = get_regional_poverty_by_name(region_name)
    if not records:
        raise HTTPException(status_code=404, detail=f"Region '{region_name}' not found")

    latest = max(records, key=lambda r: r.year)
    return RegionDetailResponse(
        region=latest.geo_name,
        records=records,
        latest_poverty_incidence_pct=latest.poverty_incidence_pct,
        latest_poverty_tier=latest.poverty_tier,
    )


@router.get("/national", response_model=RegionalPovertyResponse)
async def get_national() -> RegionalPovertyResponse:
    """Get national-level poverty data across all years."""
    records = get_national_poverty()
    return RegionalPovertyResponse(count=len(records), records=records)
