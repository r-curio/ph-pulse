"""BigQuery query functions for historical poverty families 5-year mart data.

Loads the full table once on first access and filters in-memory.
"""

from google.cloud import bigquery

from backend.models.schemas import HistoricalPovertyRecord

TABLE = "ph-pulse.ph_pulse.mart_poverty_families_5yr_summary"

_all_records: list[HistoricalPovertyRecord] | None = None


def _load_all() -> list[HistoricalPovertyRecord]:
    """Load all historical poverty records from BigQuery (once)."""
    global _all_records
    if _all_records is not None:
        return _all_records

    client = bigquery.Client()
    query = f"select * from `{TABLE}` order by year, poverty_incidence_pct desc"
    rows = client.query(query).result()
    _all_records = [HistoricalPovertyRecord(**dict(row)) for row in rows]
    return _all_records


def get_all_historical_regional(
    year: int | None = None,
) -> list[HistoricalPovertyRecord]:
    """Fetch all historical regional poverty records, optionally filtered by year.

    Args:
        year: If provided, filter to this survey year only.

    Returns:
        List of historical regional poverty records.
    """
    records = [r for r in _load_all() if r.geo_level == "region"]
    if year is not None:
        records = [r for r in records if r.year == year]
    return sorted(records, key=lambda r: r.poverty_incidence_pct or 0, reverse=True)


def get_historical_regional_by_name(name: str) -> list[HistoricalPovertyRecord]:
    """Fetch historical poverty records for a specific region by name.

    Args:
        name: Region name (case-insensitive partial match).

    Returns:
        List of records for that region across all historical years.
    """
    lower_name = name.lower()
    records = [
        r for r in _load_all()
        if r.geo_level == "region" and lower_name in r.geo_name.lower()
    ]
    return sorted(records, key=lambda r: r.year)


def get_historical_national() -> list[HistoricalPovertyRecord]:
    """Fetch national-level historical poverty records across all years.

    Returns:
        List of national historical poverty records ordered by year.
    """
    records = [r for r in _load_all() if r.geo_level == "national"]
    return sorted(records, key=lambda r: r.year)
