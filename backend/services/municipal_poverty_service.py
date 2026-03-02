"""BigQuery query functions for municipal poverty estimates mart data."""

from google.cloud import bigquery

from backend.models.schemas import MunicipalPovertyRecord

_client: bigquery.Client | None = None

TABLE = "ph-pulse.ph_pulse.mart_municipal_poverty_summary"


def _get_client() -> bigquery.Client:
    """Return a cached BigQuery client instance."""
    global _client
    if _client is None:
        _client = bigquery.Client()
    return _client


def _rows_to_records(
    rows: bigquery.table.RowIterator,
) -> list[MunicipalPovertyRecord]:
    """Convert BigQuery row iterator to list of Pydantic models."""
    return [MunicipalPovertyRecord(**dict(row)) for row in rows]


def get_regions() -> list[str]:
    """Fetch distinct region names from municipal poverty data.

    Returns:
        Sorted list of unique region names.
    """
    client = _get_client()
    query = f"""
        select distinct region
        from `{TABLE}`
        order by region
    """
    rows = client.query(query).result()
    return [row.region for row in rows]


def get_provinces_by_region(region: str) -> list[str]:
    """Fetch distinct provinces for a given region.

    Args:
        region: Region name to filter by.

    Returns:
        Sorted list of unique province names within the region.
    """
    client = _get_client()
    query = f"""
        select distinct province
        from `{TABLE}`
        where region = @region
        order by province
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("region", "STRING", region),
        ]
    )
    rows = client.query(query, job_config=job_config).result()
    return [row.province for row in rows]


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
    client = _get_client()
    conditions: list[str] = []
    params: list[bigquery.ScalarQueryParameter] = []

    if region is not None:
        conditions.append("region = @region")
        params.append(bigquery.ScalarQueryParameter("region", "STRING", region))
    if province is not None:
        conditions.append("province = @province")
        params.append(bigquery.ScalarQueryParameter("province", "STRING", province))
    if year is not None:
        conditions.append("year = @year")
        params.append(bigquery.ScalarQueryParameter("year", "INT64", year))

    where_clause = f"where {' and '.join(conditions)}" if conditions else ""
    query = f"""
        select * from `{TABLE}`
        {where_clause}
        order by poverty_incidence_pct desc
    """
    job_config = bigquery.QueryJobConfig(query_parameters=params)
    rows = client.query(query, job_config=job_config).result()
    return _rows_to_records(rows)


def get_municipality_trend(pcode: str) -> list[MunicipalPovertyRecord]:
    """Fetch poverty trend for a single municipality across all years.

    Args:
        pcode: Philippine Standard Geographic Code for the municipality.

    Returns:
        List of records for that municipality ordered by year.
    """
    client = _get_client()
    query = f"""
        select * from `{TABLE}`
        where pcode = @pcode
        order by year
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("pcode", "STRING", pcode),
        ]
    )
    rows = client.query(query, job_config=job_config).result()
    return _rows_to_records(rows)


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
    client = _get_client()
    conditions = ["year = @year", "poverty_incidence_pct is not null"]
    params: list[bigquery.ScalarQueryParameter] = [
        bigquery.ScalarQueryParameter("year", "INT64", year),
        bigquery.ScalarQueryParameter("limit", "INT64", limit),
    ]

    if region is not None:
        conditions.append("region = @region")
        params.append(bigquery.ScalarQueryParameter("region", "STRING", region))
    if province is not None:
        conditions.append("province = @province")
        params.append(bigquery.ScalarQueryParameter("province", "STRING", province))

    where_clause = " and ".join(conditions)

    top_query = f"""
        select * from `{TABLE}`
        where {where_clause}
        order by poverty_incidence_pct desc
        limit @limit
    """
    bottom_query = f"""
        select * from `{TABLE}`
        where {where_clause}
        order by poverty_incidence_pct asc
        limit @limit
    """

    job_config = bigquery.QueryJobConfig(query_parameters=params)
    top_rows = client.query(top_query, job_config=job_config).result()
    top_records = _rows_to_records(top_rows)

    bottom_rows = client.query(bottom_query, job_config=job_config).result()
    bottom_records = _rows_to_records(bottom_rows)

    return top_records, bottom_records
