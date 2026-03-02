---
name: etl-pipeline
description: Use when writing or modifying Python ETL ingestion scripts, adding new data sources, or debugging data loading issues in the ingestion/ directory.
---

# ETL Pipeline Conventions for PH-Pulse

## Adding a New Data Source
1. Create `ingestion/sources/{source_name}.py`
2. Implement an `ingest_{source}()` function following this pattern:

```python
import pandas as pd
from google.cloud import bigquery
from loaders.bigquery_loader import load_dataframe

def ingest_source_name() -> None:
    """Ingest [description] into BigQuery raw layer."""
    # 1. Read/fetch data
    df = pd.read_csv("path/to/data.csv")

    # 2. Clean columns
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # 3. Cast types explicitly
    df["year"] = df["year"].astype(int)

    # 4. Define schema
    schema = [
        bigquery.SchemaField("region_code", "STRING"),
        bigquery.SchemaField("year", "INTEGER"),
    ]

    # 5. Load
    load_dataframe(df, "ph_pulse.raw_source_name", schema)
```

3. Add the import and call to `run_all.py`
4. Verify with a `COUNT(*)` query in BigQuery

## Rules
- One function per source, one file per source
- Always WRITE_TRUNCATE (full replace, not append)
- Always print confirmation with row count after loading
- Column names must be snake_case
- Explicit type casting — never rely on pandas inference for BigQuery loads

## Data Sources
| Source | Target Table | Method |
|--------|-------------|--------|
| PSA Poverty Incidence | raw_poverty_incidence | CSV download |
| PSA FIES Income | raw_fies_income | CSV download |
| USGS Earthquakes | raw_earthquakes | REST API (GeoJSON) |
| data.gov.ph CMCI | raw_cmci | CSV download |
