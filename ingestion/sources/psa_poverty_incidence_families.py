"""PSA Poverty Incidence Among Families — CSV ingestion to BigQuery raw layer."""

from pathlib import Path

import pandas as pd
from google.cloud import bigquery

from ingestion.loaders.bigquery_loader import load_dataframe

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CSV_FILE = DATA_DIR / "psa_poverty_incidence_families.csv"
TABLE_ID = "ph-pulse.ph_pulse.raw_poverty_incidence_families"

COLUMN_RENAME = {
    "Geolocation": "geolocation",
    "Annual Per Capita Poverty Threshold (in PhP) 2018": "poverty_threshold_php_2018",
    "Annual Per Capita Poverty Threshold (in PhP) 2021": "poverty_threshold_php_2021",
    "Annual Per Capita Poverty Threshold (in PhP) 2023": "poverty_threshold_php_2023",
    "Poverty Incidence Among Families (%) 2018": "poverty_incidence_pct_2018",
    "Poverty Incidence Among Families (%) 2021": "poverty_incidence_pct_2021",
    "Poverty Incidence Among Families (%) 2023": "poverty_incidence_pct_2023",
    "Coefficient of Variation 2018": "coefficient_of_variation_2018",
    "Coefficient of Variation 2021": "coefficient_of_variation_2021",
    "Coefficient of Variation 2023": "coefficient_of_variation_2023",
    "Standard Error 2018": "standard_error_2018",
    "Standard Error 2021": "standard_error_2021",
    "Standard Error 2023": "standard_error_2023",
    "95% Confidence Interval (Lower Limits) 2018": "ci_lower_2018",
    "95% Confidence Interval (Lower Limits) 2021": "ci_lower_2021",
    "95% Confidence Interval (Lower Limits) 2023": "ci_lower_2023",
    "95% Confidence Interval (Upper Limits) 2018": "ci_upper_2018",
    "95% Confidence Interval (Upper Limits) 2021": "ci_upper_2021",
    "95% Confidence Interval (Upper Limits) 2023": "ci_upper_2023",
}

RAW_SCHEMA = [bigquery.SchemaField(col, "STRING") for col in COLUMN_RENAME.values()]


def ingest() -> int:
    """Read PSA poverty incidence CSV and load to BigQuery raw layer.

    Returns:
        Number of rows loaded.
    """
    df = pd.read_csv(CSV_FILE, dtype=str)
    df = df.rename(columns=COLUMN_RENAME)
    return load_dataframe(df, TABLE_ID, schema=RAW_SCHEMA)
