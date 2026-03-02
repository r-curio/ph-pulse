"""API routes for municipal poverty estimates data."""

from fastapi import APIRouter, HTTPException, Query

from backend.models.schemas import (
    MunicipalPovertyResponse,
    MunicipalTopBottomResponse,
)
from backend.services.municipal_poverty_service import (
    get_municipalities,
    get_municipality_trend,
    get_provinces_by_region,
    get_regions,
    get_top_bottom_municipalities,
)

router = APIRouter(prefix="/api/v1/poverty/municipal", tags=["municipal-poverty"])


@router.get("/regions", response_model=list[str])
def list_regions() -> list[str]:
    """List distinct region names from municipal poverty data."""
    return get_regions()


@router.get("/provinces", response_model=list[str])
def list_provinces(
    region: str = Query(description="Region name to filter provinces by"),
) -> list[str]:
    """List distinct provinces for a given region."""
    return get_provinces_by_region(region)


@router.get("/municipalities", response_model=MunicipalPovertyResponse)
def list_municipalities(
    region: str | None = Query(default=None, description="Filter by region"),
    province: str | None = Query(default=None, description="Filter by province"),
    year: int | None = Query(default=None, description="Filter by survey year"),
) -> MunicipalPovertyResponse:
    """List municipal poverty records with optional filters."""
    records = get_municipalities(region=region, province=province, year=year)
    return MunicipalPovertyResponse(count=len(records), records=records)


@router.get("/trend/{pcode}", response_model=MunicipalPovertyResponse)
def get_trend(pcode: str) -> MunicipalPovertyResponse:
    """Get poverty trend for a single municipality across all years."""
    records = get_municipality_trend(pcode)
    if not records:
        raise HTTPException(
            status_code=404, detail=f"Municipality with pcode '{pcode}' not found"
        )
    return MunicipalPovertyResponse(count=len(records), records=records)


@router.get("/top-bottom", response_model=MunicipalTopBottomResponse)
def get_top_bottom(
    year: int = Query(description="Survey year"),
    region: str | None = Query(default=None, description="Filter by region"),
    province: str | None = Query(default=None, description="Filter by province"),
    limit: int = Query(default=10, ge=1, le=50, description="Number of top/bottom records"),
) -> MunicipalTopBottomResponse:
    """Get top N (highest) and bottom N (lowest) municipalities by poverty incidence."""
    top_records, bottom_records = get_top_bottom_municipalities(
        year=year, region=region, province=province, limit=limit
    )
    return MunicipalTopBottomResponse(
        year=year,
        top=top_records,
        bottom=bottom_records,
    )
