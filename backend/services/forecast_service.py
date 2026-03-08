"""BigQuery query functions for ML poverty forecast data.

Loads the full table once on first access and filters in-memory.
Auto-trains models if the forecast table is empty or missing.
"""

import logging

from google.cloud import bigquery

from backend.models.schemas import ForecastRecord, ForecastSummaryResponse

logger = logging.getLogger(__name__)

TABLE = "ph-pulse.ph_pulse.ml_poverty_forecasts"

_all_records: list[ForecastRecord] | None = None


def _train_and_write() -> None:
    """Run the ML training pipeline to populate the forecast table."""
    logger.info("Forecast table empty or missing — training models now...")
    from ml.write_forecasts import main as train_forecasts

    train_forecasts()
    logger.info("Training complete. Forecast table populated.")


def _load_all() -> list[ForecastRecord]:
    """Load all forecast records from BigQuery.

    If the table is empty or missing, triggers model training first,
    then loads the freshly written predictions. Caches on success.
    """
    global _all_records
    if _all_records is not None:
        return _all_records

    records = _query_table()

    if not records:
        try:
            _train_and_write()
            records = _query_table()
        except Exception as exc:
            logger.error("Auto-training failed: %s", exc)
            return []

    _all_records = records
    return _all_records


def _query_table() -> list[ForecastRecord]:
    """Query the forecast table and return parsed records."""
    try:
        client = bigquery.Client()
        query = f"select * from `{TABLE}` order by region_name, year"
        rows = client.query(query).result()
        return [ForecastRecord(**dict(row)) for row in rows]
    except Exception as exc:
        logger.warning("Could not query %s: %s", TABLE, exc)
        return []


def get_all_forecasts(
    region: str | None = None,
    year: int | None = None,
) -> list[ForecastRecord]:
    """Fetch all forecast records, optionally filtered by region and/or year.

    Args:
        region: If provided, case-insensitive partial match on region_name.
        year: If provided, filter to this forecast year only.

    Returns:
        List of forecast records matching the filters.
    """
    records = _load_all()
    if region is not None:
        lower_region = region.lower()
        records = [r for r in records if lower_region in r.region_name.lower()]
    if year is not None:
        records = [r for r in records if r.year == year]
    return records


def get_forecast_summary() -> ForecastSummaryResponse:
    """Compute KPI summary values from 2026 forecast predictions.

    Returns:
        ForecastSummaryResponse with national average, best/worst regions,
        average R-squared, and region count for 2026.
    """
    records_2026 = [r for r in _load_all() if r.year == 2026]
    if not records_2026:
        return ForecastSummaryResponse(
            national_avg_2026=0.0,
            best_region="N/A",
            best_region_pct=0.0,
            worst_region="N/A",
            worst_region_pct=0.0,
            avg_r_squared=0.0,
            regions_count=0,
        )

    predictions = [r.predicted_poverty_pct for r in records_2026]
    national_avg = sum(predictions) / len(predictions)
    avg_r_sq = sum(r.r_squared for r in records_2026) / len(records_2026)

    best = min(records_2026, key=lambda r: r.predicted_poverty_pct)
    worst = max(records_2026, key=lambda r: r.predicted_poverty_pct)

    return ForecastSummaryResponse(
        national_avg_2026=round(national_avg, 2),
        best_region=best.region_name,
        best_region_pct=best.predicted_poverty_pct,
        worst_region=worst.region_name,
        worst_region_pct=worst.predicted_poverty_pct,
        avg_r_squared=round(avg_r_sq, 4),
        regions_count=len(records_2026),
    )


def get_forecast_regions() -> list[str]:
    """Return sorted distinct region names from forecast data.

    Returns:
        Alphabetically sorted list of unique region names.
    """
    names = {r.region_name for r in _load_all()}
    return sorted(names)
