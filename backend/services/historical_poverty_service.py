"""BigQuery query functions for historical poverty families 5-year mart data."""

from google.cloud import bigquery

from backend.models.schemas import HistoricalPovertyRecord

_client: bigquery.Client | None = None

TABLE = "ph-pulse.ph_pulse.mart_poverty_families_5yr_summary"


def _get_client() -> bigquery.Client:
    """Return a cached BigQuery client instance."""
    global _client
    if _client is None:
        _client = bigquery.Client()
    return _client


def _rows_to_records(
    rows: bigquery.table.RowIterator,
) -> list[HistoricalPovertyRecord]:
    """Convert BigQuery row iterator to list of Pydantic models."""
    return [HistoricalPovertyRecord(**dict(row)) for row in rows]


def get_all_historical_regional(
    year: int | None = None,
) -> list[HistoricalPovertyRecord]:
    """Fetch all historical regional poverty records, optionally filtered by year.

    Args:
        year: If provided, filter to this survey year only.

    Returns:
        List of historical regional poverty records.
    """
    client = _get_client()

    if year is not None:
        query = f"""
            SELECT * FROM `{TABLE}`
            WHERE geo_level = 'region'
              AND year = @year
            ORDER BY poverty_incidence_pct DESC
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("year", "INT64", year),
            ]
        )
        rows = client.query(query, job_config=job_config).result()
    else:
        query = f"""
            SELECT * FROM `{TABLE}`
            WHERE geo_level = 'region'
            ORDER BY year, poverty_incidence_pct DESC
        """
        rows = client.query(query).result()

    return _rows_to_records(rows)


def get_historical_regional_by_name(name: str) -> list[HistoricalPovertyRecord]:
    """Fetch historical poverty records for a specific region by name.

    Args:
        name: Region name (case-insensitive partial match).

    Returns:
        List of records for that region across all historical years.
    """
    client = _get_client()
    query = f"""
        SELECT * FROM `{TABLE}`
        WHERE geo_level = 'region'
          AND LOWER(geo_name) LIKE CONCAT('%', LOWER(@name), '%')
        ORDER BY year
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("name", "STRING", name),
        ]
    )
    rows = client.query(query, job_config=job_config).result()
    return _rows_to_records(rows)


def get_historical_national() -> list[HistoricalPovertyRecord]:
    """Fetch national-level historical poverty records across all years.

    Returns:
        List of national historical poverty records ordered by year.
    """
    client = _get_client()
    query = f"""
        SELECT * FROM `{TABLE}`
        WHERE geo_level = 'national'
        ORDER BY year
    """
    rows = client.query(query).result()
    return _rows_to_records(rows)
