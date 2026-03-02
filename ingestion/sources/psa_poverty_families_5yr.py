"""PSA Poverty Among Families 5-Year Historical — CSV ingestion to BigQuery raw layer."""

from pathlib import Path

import pandas as pd
from google.cloud import bigquery

from ingestion.loaders.bigquery_loader import load_dataframe

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CSV_FILE = DATA_DIR / "psa_poverty_families_5yr.csv"
TABLE_ID = "ph-pulse.ph_pulse.raw_poverty_families_5yr"

COLUMN_RENAME = {
    "Region/Province": "geolocation",
    "Annual Per Capita Poverty Threshold  (in Pesos) 1991 a/": "poverty_threshold_php_1991",
    "Annual Per Capita Poverty Threshold  (in Pesos) 2006": "poverty_threshold_php_2006",
    "Annual Per Capita Poverty Threshold  (in Pesos) 2009": "poverty_threshold_php_2009",
    "Annual Per Capita Poverty Threshold  (in Pesos) 2012": "poverty_threshold_php_2012",
    "Annual Per Capita Poverty Threshold  (in Pesos) 2015": "poverty_threshold_php_2015",
    "Poverty Incidence among Families Estimate (%) 1991 a/": "poverty_incidence_pct_1991",
    "Poverty Incidence among Families Estimate (%) 2006": "poverty_incidence_pct_2006",
    "Poverty Incidence among Families Estimate (%) 2009": "poverty_incidence_pct_2009",
    "Poverty Incidence among Families Estimate (%) 2012": "poverty_incidence_pct_2012",
    "Poverty Incidence among Families Estimate (%) 2015": "poverty_incidence_pct_2015",
    "Coefficient of Variation 1991 a/": "coefficient_of_variation_1991",
    "Coefficient of Variation 2006": "coefficient_of_variation_2006",
    "Coefficient of Variation 2009": "coefficient_of_variation_2009",
    "Coefficient of Variation 2012": "coefficient_of_variation_2012",
    "Coefficient of Variation 2015": "coefficient_of_variation_2015",
    "Magnitude of Poor Families Estimates 1991 a/": "magnitude_poor_families_1991",
    "Magnitude of Poor Families Estimates 2006": "magnitude_poor_families_2006",
    "Magnitude of Poor Families Estimates 2009": "magnitude_poor_families_2009",
    "Magnitude of Poor Families Estimates 2012": "magnitude_poor_families_2012",
    "Magnitude of Poor Families Estimates 2015": "magnitude_poor_families_2015",
}

RAW_SCHEMA = [bigquery.SchemaField(col, "STRING") for col in COLUMN_RENAME.values()]


def ingest() -> int:
    """Read PSA poverty families 5-year historical CSV and load to BigQuery raw layer.

    Returns:
        Number of rows loaded.
    """
    df = pd.read_csv(CSV_FILE, dtype=str)
    df = df.rename(columns=COLUMN_RENAME)
    return load_dataframe(df, TABLE_ID, schema=RAW_SCHEMA)
