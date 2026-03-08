"""BigQuery query functions for poverty mart data.

Loads the full table once on first access and filters in-memory.
"""

from google.cloud import bigquery

from backend.models.schemas import RegionalPovertyRecord

TABLE = "ph-pulse.ph_pulse.mart_regional_poverty_summary"

_all_records: list[RegionalPovertyRecord] | None = None


def _load_all() -> list[RegionalPovertyRecord]:
    """Load all regional poverty records from BigQuery (once)."""
    global _all_records
    if _all_records is not None:
        return _all_records

    client = bigquery.Client()
    query = f"select * from `{TABLE}` order by year, poverty_incidence_pct desc"
    rows = client.query(query).result()
    _all_records = [RegionalPovertyRecord(**dict(row)) for row in rows]
    return _all_records


def get_all_regional_poverty(year: int | None = None) -> list[RegionalPovertyRecord]:
    """Fetch all regional poverty records, optionally filtered by year.

    Args:
        year: If provided, filter to this survey year only.

    Returns:
        List of regional poverty records.
    """
    records = [r for r in _load_all() if r.geo_level == "region"]
    if year is not None:
        records = [r for r in records if r.year == year]
    return sorted(records, key=lambda r: r.poverty_incidence_pct or 0, reverse=True)


def get_regional_poverty_by_name(name: str) -> list[RegionalPovertyRecord]:
    """Fetch poverty records for a specific region by name.

    Args:
        name: Region name (case-insensitive partial match).

    Returns:
        List of records for that region across all years.
    """
    lower_name = name.lower()
    records = [
        r for r in _load_all()
        if r.geo_level == "region" and lower_name in r.geo_name.lower()
    ]
    return sorted(records, key=lambda r: r.year)


def get_national_poverty() -> list[RegionalPovertyRecord]:
    """Fetch national-level poverty records across all years.

    Returns:
        List of national poverty records ordered by year.
    """
    records = [r for r in _load_all() if r.geo_level == "national"]
    return sorted(records, key=lambda r: r.year)
