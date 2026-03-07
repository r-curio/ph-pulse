"""Pipeline health service -- queries BigQuery table metadata."""

from datetime import datetime, timezone
from typing import NamedTuple

from google.cloud import bigquery

# Tables to monitor: (dataset_id, table_id, layer, display_name)
MONITORED_TABLES = [
    ("ph_pulse_raw", "raw_poverty_incidence", "raw", "Regional Poverty (raw)"),
    ("ph_pulse_raw", "raw_poverty_families_5yr", "raw", "Historical Poverty (raw)"),
    ("ph_pulse_raw", "raw_municipal_poverty", "raw", "Municipal Poverty (raw)"),
    ("ph_pulse_marts", "mart_regional_poverty_summary", "mart", "Regional Poverty (mart)"),
    ("ph_pulse_marts", "mart_poverty_families_5yr_summary", "mart", "Historical Poverty (mart)"),
    ("ph_pulse_marts", "mart_municipal_poverty_summary", "mart", "Municipal Poverty (mart)"),
]

STALE_THRESHOLD_DAYS = 30

_client: bigquery.Client | None = None


class TableStatusData(NamedTuple):
    """Health status data for a single BigQuery table."""

    table_name: str
    layer: str
    display_name: str
    row_count: int | None
    last_modified: datetime | None
    health: str  # "healthy" | "stale" | "error"


def _get_client() -> bigquery.Client:
    """Return a cached BigQuery client instance."""
    global _client
    if _client is None:
        _client = bigquery.Client()
    return _client


def _fetch_dataset_metadata(
    client: bigquery.Client, dataset_id: str
) -> dict[str, dict[str, int]]:
    """Query __TABLES__ metadata for a given dataset.

    Args:
        client: BigQuery client instance.
        dataset_id: The dataset to inspect.

    Returns:
        Mapping of table_id to {"row_count": int, "last_modified_time": int}.
    """
    query = f"SELECT table_id, row_count, last_modified_time FROM `{dataset_id}.__TABLES__`"
    try:
        rows = client.query(query).result()
    except Exception:
        return {}

    result: dict[str, dict[str, int]] = {}
    for row in rows:
        result[row["table_id"]] = {
            "row_count": row["row_count"],
            "last_modified_time": row["last_modified_time"],
        }
    return result


def _determine_health(
    row_count: int | None, last_modified: datetime | None
) -> str:
    """Determine table health based on row count and freshness.

    Args:
        row_count: Number of rows in the table, or None if unknown.
        last_modified: Last modification timestamp, or None if unknown.

    Returns:
        Health status string: "healthy", "stale", or "error".
    """
    if row_count is None or row_count == 0:
        return "error"
    if last_modified is None:
        return "error"

    age_days = (datetime.now(tz=timezone.utc) - last_modified).days
    if age_days > STALE_THRESHOLD_DAYS:
        return "stale"

    return "healthy"


def get_pipeline_status() -> list[TableStatusData]:
    """Check health of all monitored BigQuery tables.

    Queries BigQuery __TABLES__ metadata for each dataset, then evaluates
    each monitored table for existence, row count, and freshness.

    Returns:
        List of TableStatusData with health status per table.
    """
    client = _get_client()

    # Collect metadata per dataset (deduplicate dataset queries)
    dataset_ids = {t[0] for t in MONITORED_TABLES}
    metadata_by_dataset: dict[str, dict[str, dict[str, int]]] = {}
    for dataset_id in dataset_ids:
        metadata_by_dataset[dataset_id] = _fetch_dataset_metadata(client, dataset_id)

    statuses: list[TableStatusData] = []
    for dataset_id, table_id, layer, display_name in MONITORED_TABLES:
        dataset_meta = metadata_by_dataset.get(dataset_id, {})
        table_meta = dataset_meta.get(table_id)

        if table_meta is None:
            statuses.append(
                TableStatusData(
                    table_name=f"{dataset_id}.{table_id}",
                    layer=layer,
                    display_name=display_name,
                    row_count=None,
                    last_modified=None,
                    health="error",
                )
            )
            continue

        row_count = table_meta["row_count"]
        # last_modified_time is in milliseconds since epoch
        last_modified = datetime.fromtimestamp(
            table_meta["last_modified_time"] / 1000, tz=timezone.utc
        )
        health = _determine_health(row_count, last_modified)

        statuses.append(
            TableStatusData(
                table_name=f"{dataset_id}.{table_id}",
                layer=layer,
                display_name=display_name,
                row_count=row_count,
                last_modified=last_modified,
                health=health,
            )
        )

    return statuses
