"""Pydantic response models for the poverty API."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


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


class TableStatus(BaseModel):
    """Health status for a single BigQuery table."""

    table_name: str
    display_name: str
    layer: str  # "raw" or "mart"
    row_count: int | None = None
    last_modified: datetime | None = None
    health: str  # "healthy" | "stale" | "error"


class PipelineStatusResponse(BaseModel):
    """Overall pipeline health response."""

    overall_health: str  # "healthy" | "stale" | "error"
    checked_at: datetime
    tables: list[TableStatus]


class ForecastRecord(BaseModel):
    """Single row from ml_poverty_forecasts."""

    region_name: str
    year: int
    predicted_poverty_pct: float
    model_type: str
    trained_on_years: str
    r_squared: float


class ForecastResponse(BaseModel):
    """List response for forecast data."""

    count: int
    records: list[ForecastRecord]


class ForecastSummaryResponse(BaseModel):
    """KPI summary computed from 2026 forecast predictions."""

    national_avg_2026: float
    best_region: str
    best_region_pct: float
    worst_region: str
    worst_region_pct: float
    avg_r_squared: float
    regions_count: int


# -- Chat models ---------------------------------------------------------------


class ChatMessage(BaseModel):
    """Single message in a chat conversation."""

    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    """Request body for the chat endpoint."""

    messages: list[ChatMessage] = Field(..., min_length=1, max_length=50)


class SourceInfo(BaseModel):
    """Data source citation for a chat response."""

    table: str
    description: str


class ChatResponse(BaseModel):
    """Response from the chat endpoint."""

    answer: str
    sources: list[SourceInfo]
