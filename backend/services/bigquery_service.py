"""BigQuery query functions for poverty mart data."""

from google.cloud import bigquery

from backend.models.schemas import RegionalPovertyRecord

_client: bigquery.Client | None = None

TABLE = "ph-pulse.ph_pulse.mart_regional_poverty_summary"


def _get_client() -> bigquery.Client:
    """Return a cached BigQuery client instance."""
    global _client
    if _client is None:
        _client = bigquery.Client()
    return _client


def _rows_to_records(rows: bigquery.table.RowIterator) -> list[RegionalPovertyRecord]:
    """Convert BigQuery row iterator to list of Pydantic models."""
    return [RegionalPovertyRecord(**dict(row)) for row in rows]


def get_all_regional_poverty(year: int | None = None) -> list[RegionalPovertyRecord]:
    """Fetch all regional poverty records, optionally filtered by year.

    Args:
        year: If provided, filter to this survey year only.

    Returns:
        List of regional poverty records.
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


def get_regional_poverty_by_name(name: str) -> list[RegionalPovertyRecord]:
    """Fetch poverty records for a specific region by name.

    Args:
        name: Region name (case-insensitive partial match).

    Returns:
        List of records for that region across all years.
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


def get_national_poverty() -> list[RegionalPovertyRecord]:
    """Fetch national-level poverty records across all years.

    Returns:
        List of national poverty records ordered by year.
    """
    client = _get_client()
    query = f"""
        SELECT * FROM `{TABLE}`
        WHERE geo_level = 'national'
        ORDER BY year
    """
    rows = client.query(query).result()
    return _rows_to_records(rows)
