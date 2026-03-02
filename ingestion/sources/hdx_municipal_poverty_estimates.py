"""HDX Municipal Poverty Estimates — CSV ingestion to BigQuery raw layer."""

from pathlib import Path

import pandas as pd
from google.cloud import bigquery

from ingestion.loaders.bigquery_loader import load_dataframe

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CSV_FILE = DATA_DIR / "hdx_municipal_poverty_estimates.csv"
TABLE_ID = "ph-pulse.ph_pulse.raw_municipal_poverty_estimates"

COLUMN_RENAME = {
    "PCODE": "pcode",
    "Region": "region",
    "Province": "province",
    "Municipality_City": "municipality_city",
    "Prelim_2012": "prelim_2012",
    "Pov_2012": "poverty_incidence_pct_2012",
    "SE_2012": "standard_error_2012",
    "CoV_2012": "coefficient_of_variation_2012",
    "Con_90lower_2012": "ci_90_lower_2012",
    "Con_90upper_2012": "ci_90_upper_2012",
    "Pov_2009": "poverty_incidence_pct_2009",
    "SE_2009": "standard_error_2009",
    "CoV_2009": "coefficient_of_variation_2009",
    "Pov_2006": "poverty_incidence_pct_2006",
    "SE_2006": "standard_error_2006",
    "CoV_2006": "coefficient_of_variation_2006",
}

RAW_SCHEMA = [bigquery.SchemaField(col, "STRING") for col in COLUMN_RENAME.values()]


def ingest() -> int:
    """Read HDX municipal poverty estimates CSV and load to BigQuery raw layer.

    Returns:
        Number of rows loaded.
    """
    df = pd.read_csv(CSV_FILE, dtype=str, encoding="cp1252")
    df = df.rename(columns=COLUMN_RENAME)
    return load_dataframe(df, TABLE_ID, schema=RAW_SCHEMA)
