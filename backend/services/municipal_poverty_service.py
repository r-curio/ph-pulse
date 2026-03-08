"""BigQuery query functions for municipal poverty estimates mart data.

Loads the full table once on first access and filters in-memory,
avoiding repeated BigQuery round-trips on every filter change.
"""

from google.cloud import bigquery

from backend.models.schemas import MunicipalPovertyRecord

TABLE = "ph-pulse.ph_pulse.mart_municipal_poverty_summary"

_all_records: list[MunicipalPovertyRecord] | None = None


def _load_all() -> list[MunicipalPovertyRecord]:
    """Load all municipal poverty records from BigQuery (once)."""
    global _all_records
    if _all_records is not None:
        return _all_records

    client = bigquery.Client()
    query = f"select * from `{TABLE}` order by poverty_incidence_pct desc"
    rows = client.query(query).result()
    _all_records = [MunicipalPovertyRecord(**dict(row)) for row in rows]
    return _all_records


def get_regions() -> list[str]:
    """Fetch distinct region names from municipal poverty data.

    Returns:
        Sorted list of unique region names.
    """
    records = _load_all()
    return sorted({r.region for r in records})


def get_provinces_by_region(region: str) -> list[str]:
    """Fetch distinct provinces for a given region.

    Args:
        region: Region name to filter by.

    Returns:
        Sorted list of unique province names within the region.
    """
    records = _load_all()
    return sorted({r.province for r in records if r.region == region})


def get_municipalities(
    region: str | None = None,
    province: str | None = None,
    year: int | None = None,
) -> list[MunicipalPovertyRecord]:
    """Fetch municipal poverty records with optional filters.

    Args:
        region: Filter by region name.
        province: Filter by province name.
        year: Filter by survey year.

    Returns:
        List of municipal poverty records ordered by poverty incidence desc.
    """
    records = _load_all()
    filtered = records
    if region is not None:
        filtered = [r for r in filtered if r.region == region]
    if province is not None:
        filtered = [r for r in filtered if r.province == province]
    if year is not None:
        filtered = [r for r in filtered if r.year == year]
    return filtered


def get_municipality_trend(pcode: str) -> list[MunicipalPovertyRecord]:
    """Fetch poverty trend for a single municipality across all years.

    Args:
        pcode: Philippine Standard Geographic Code for the municipality.

    Returns:
        List of records for that municipality ordered by year.
    """
    records = _load_all()
    return sorted(
        [r for r in records if r.pcode == pcode],
        key=lambda r: r.year,
    )


def get_top_bottom_municipalities(
    year: int,
    region: str | None = None,
    province: str | None = None,
    limit: int = 10,
) -> tuple[list[MunicipalPovertyRecord], list[MunicipalPovertyRecord]]:
    """Fetch top N (highest) and bottom N (lowest) municipalities by poverty incidence.

    Args:
        year: Survey year to filter by.
        region: Optional region filter.
        province: Optional province filter.
        limit: Number of records for top and bottom (default 10).

    Returns:
        Tuple of (top_records, bottom_records).
    """
    records = _load_all()
    filtered = [r for r in records if r.year == year and r.poverty_incidence_pct is not None]
    if region is not None:
        filtered = [r for r in filtered if r.region == region]
    if province is not None:
        filtered = [r for r in filtered if r.province == province]

    by_incidence = sorted(
        filtered,
        key=lambda r: r.poverty_incidence_pct or 0,
        reverse=True,
    )
    top = by_incidence[:limit]
    bottom = by_incidence[-limit:] if len(by_incidence) >= limit else by_incidence
    bottom = sorted(bottom, key=lambda r: r.poverty_incidence_pct or 0)
    return top, bottom
