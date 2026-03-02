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


class HistoricalPovertyRecord(BaseModel):
    """Single row from mart_poverty_families_5yr_summary."""

    geo_level: str
    geo_name: str
    year: int
    poverty_threshold_php: float | None = None
    poverty_incidence_pct: float | None = None
    coefficient_of_variation: float | None = None
    magnitude_poor_families: float | None = None
    poverty_incidence_change: float | None = None
    magnitude_change: float | None = None
    poverty_tier: str | None = None


class HistoricalPovertyResponse(BaseModel):
    """List response for historical poverty data."""

    count: int
    records: list[HistoricalPovertyRecord]


class HistoricalRegionDetailResponse(BaseModel):
    """Detail response for a single region across all historical years."""

    region: str
    records: list[HistoricalPovertyRecord]
    earliest_poverty_incidence_pct: float | None = None
    latest_poverty_incidence_pct: float | None = None
    latest_poverty_tier: str | None = None


class MunicipalPovertyRecord(BaseModel):
    """Single row from mart_municipal_poverty_summary."""

    pcode: str
    region: str
    province: str
    municipality_city: str
    year: int
    is_preliminary: bool | None = None
    poverty_incidence_pct: float | None = None
    standard_error: float | None = None
    coefficient_of_variation: float | None = None
    ci_90_lower: float | None = None
    ci_90_upper: float | None = None
    poverty_incidence_change: float | None = None
    poverty_tier: str | None = None


class MunicipalPovertyResponse(BaseModel):
    """List response for municipal poverty data."""

    count: int
    records: list[MunicipalPovertyRecord]


class MunicipalTopBottomResponse(BaseModel):
    """Response for top/bottom municipalities by poverty incidence."""

    year: int
    top: list[MunicipalPovertyRecord]
    bottom: list[MunicipalPovertyRecord]
