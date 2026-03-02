"""Shared BigQuery loader for PH-Pulse ingestion pipeline."""

from google.cloud import bigquery
import pandas as pd


def load_dataframe(
    df: pd.DataFrame,
    table_id: str,
    schema: list[bigquery.SchemaField] | None = None,
) -> int:
    """Load a pandas DataFrame to a BigQuery table using WRITE_TRUNCATE.

    Args:
        df: DataFrame to load.
        table_id: Fully qualified BigQuery table ID (project.dataset.table).
        schema: Optional explicit schema. If None, BigQuery auto-detects.

    Returns:
        Number of rows loaded.
    """
    client = bigquery.Client()

    job_config = bigquery.LoadJobConfig(
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
    )
    if schema is not None:
        job_config.schema = schema

    job = client.load_table_from_dataframe(df, table_id, job_config=job_config)
    job.result()  # wait for completion

    table = client.get_table(table_id)
    print(f"Loaded {table.num_rows} rows to {table_id}")
    return table.num_rows
