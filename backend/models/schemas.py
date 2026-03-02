"""Pydantic response models for the poverty API."""

from pydantic import BaseModel


class RegionalPovertyRecord(BaseModel):
    """Single row from mart_regional_poverty_summary."""

    geo_level: str
    geo_name: str
    year: int
    poverty_threshold_php: float | None = None
    poverty_incidence_pct: float | None = None
    coefficient_of_variation: float | None = None
    standard_error: float | None = None
    ci_lower: float | None = None
    ci_upper: float | None = None
    poverty_incidence_change: float | None = None
    poverty_tier: str | None = None


class RegionalPovertyResponse(BaseModel):
    """List response for regional poverty data."""

    count: int
    records: list[RegionalPovertyRecord]


class RegionDetailResponse(BaseModel):
    """Detail response for a single region across all years."""

    region: str
    records: list[RegionalPovertyRecord]
    latest_poverty_incidence_pct: float | None = None
    latest_poverty_tier: str | None = None
