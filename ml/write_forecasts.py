"""Train per-region linear regression models on poverty data and write forecasts to BigQuery.

Usage:
    python -m ml.write_forecasts
"""

import logging
from typing import Any

import numpy as np
import pandas as pd
from google.cloud import bigquery
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ID = "ph-pulse"
DATASET_ID = "ph_pulse"
SOURCE_TABLE = f"{PROJECT_ID}.{DATASET_ID}.mart_regional_poverty_summary"
FORECAST_TABLE = f"{PROJECT_ID}.{DATASET_ID}.ml_poverty_forecasts"
TRAINING_YEARS = [2018, 2021, 2023]
FORECAST_YEARS = [2024, 2025, 2026]
TRAINED_ON_YEARS_LABEL = "2018-2023"

FORECAST_SCHEMA = [
    bigquery.SchemaField("region_name", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("year", "INTEGER", mode="REQUIRED"),
    bigquery.SchemaField("predicted_poverty_pct", "FLOAT", mode="REQUIRED"),
    bigquery.SchemaField("model_type", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("trained_on_years", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("r_squared", "FLOAT", mode="REQUIRED"),
]


def load_training_data(client: bigquery.Client) -> pd.DataFrame:
    """Load regional poverty data from BigQuery mart table.

    Filters to region-level rows for the configured training years.

    Args:
        client: Authenticated BigQuery client.

    Returns:
        DataFrame with columns: geo_name, year, poverty_incidence_pct.
    """
    years_csv = ", ".join(str(y) for y in TRAINING_YEARS)
    query = f"""
        SELECT
            geo_name,
            year,
            poverty_incidence_pct
        FROM `{SOURCE_TABLE}`
        WHERE geo_level = 'region'
          AND year IN ({years_csv})
        ORDER BY geo_name, year
    """
    logger.info("Loading training data from %s ...", SOURCE_TABLE)
    df = client.query(query).to_dataframe()
    logger.info("Loaded %d rows across %d regions.", len(df), df["geo_name"].nunique())
    return df


def train_region_model(
    region_name: str, years: np.ndarray, poverty_pct: np.ndarray
) -> dict[str, Any] | None:
    """Train a linear regression model for a single region.

    Args:
        region_name: Display name of the region.
        years: Array of training years.
        poverty_pct: Array of poverty incidence percentages.

    Returns:
        Dictionary with model artifacts and forecast rows, or None if
        the region has fewer than 2 data points.
    """
    if len(years) < 2:
        logger.warning(
            "Skipping %s: only %d data point(s) (need >= 2).",
            region_name,
            len(years),
        )
        return None

    x_train = years.reshape(-1, 1)
    y_train = poverty_pct

    # LinearRegression uses closed-form OLS — deterministic, no random_state needed.
    model = LinearRegression()
    model.fit(x_train, y_train)

    r_squared = model.score(x_train, y_train)
    y_pred_train = model.predict(x_train)
    rmse = float(np.sqrt(mean_squared_error(y_train, y_pred_train)))

    if r_squared < 0:
        logger.warning(
            "QUALITY CONCERN: %s has negative R^2 = %.4f. "
            "The model fits worse than a horizontal line.",
            region_name,
            r_squared,
        )

    x_forecast = np.array(FORECAST_YEARS).reshape(-1, 1)
    predictions = model.predict(x_forecast)
    predictions = np.clip(predictions, 0.0, 100.0)

    forecast_rows: list[dict[str, Any]] = []
    for yr, pred in zip(FORECAST_YEARS, predictions):
        forecast_rows.append(
            {
                "region_name": region_name,
                "year": yr,
                "predicted_poverty_pct": round(float(pred), 2),
                "model_type": "linear_regression",
                "trained_on_years": TRAINED_ON_YEARS_LABEL,
                "r_squared": round(float(r_squared), 4),
            }
        )

    return {
        "region_name": region_name,
        "r_squared": r_squared,
        "rmse": rmse,
        "n_points": len(years),
        "forecast_rows": forecast_rows,
    }


def train_all_regions(df: pd.DataFrame) -> pd.DataFrame:
    """Train per-region models and assemble the forecast DataFrame.

    Args:
        df: Training data with columns geo_name, year, poverty_incidence_pct.

    Returns:
        DataFrame matching the ml_poverty_forecasts schema.
    """
    all_rows: list[dict[str, Any]] = []
    skipped_regions: list[str] = []
    negative_r2_regions: list[str] = []
    r2_scores: list[float] = []
    rmse_scores: list[float] = []

    for region_name, group in df.groupby("geo_name"):
        years = group["year"].values.astype(float)
        poverty_pct = group["poverty_incidence_pct"].values.astype(float)

        result = train_region_model(str(region_name), years, poverty_pct)

        if result is None:
            skipped_regions.append(str(region_name))
            continue

        all_rows.extend(result["forecast_rows"])
        r2_scores.append(result["r_squared"])
        rmse_scores.append(result["rmse"])

        if result["r_squared"] < 0:
            negative_r2_regions.append(str(region_name))

        logger.info(
            "  %s: R^2=%.4f  RMSE=%.4f  (%d points)",
            region_name,
            result["r_squared"],
            result["rmse"],
            result["n_points"],
        )

    # Print summary
    print("\n" + "=" * 60)
    print("TRAINING SUMMARY")
    print("=" * 60)
    print(f"Regions trained:  {len(r2_scores)}")
    print(f"Regions skipped:  {len(skipped_regions)}")
    if skipped_regions:
        print(f"  Skipped list:   {', '.join(skipped_regions)}")
    if negative_r2_regions:
        print(f"  Negative R^2:   {', '.join(negative_r2_regions)}")
    print(
        f"Avg R^2:          {np.mean(r2_scores):.4f}" if r2_scores else "Avg R^2: N/A"
    )
    print(
        f"Avg RMSE:         {np.mean(rmse_scores):.4f}"
        if rmse_scores
        else "Avg RMSE: N/A"
    )
    print(f"Forecast rows:    {len(all_rows)}")
    print("=" * 60 + "\n")

    forecast_df = pd.DataFrame(all_rows)
    return forecast_df


def write_forecasts_to_bigquery(
    client: bigquery.Client, forecast_df: pd.DataFrame
) -> None:
    """Write forecast DataFrame to BigQuery with WRITE_TRUNCATE.

    Args:
        client: Authenticated BigQuery client.
        forecast_df: DataFrame matching the ml_poverty_forecasts schema.
    """
    if forecast_df.empty:
        logger.error("No forecast rows to write. Aborting BigQuery upload.")
        return

    job_config = bigquery.LoadJobConfig(
        schema=FORECAST_SCHEMA,
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
    )

    logger.info(
        "Writing %d rows to %s (WRITE_TRUNCATE) ...",
        len(forecast_df),
        FORECAST_TABLE,
    )
    load_job = client.load_table_from_dataframe(
        forecast_df, FORECAST_TABLE, job_config=job_config
    )
    load_job.result()  # Wait for completion

    destination_table = client.get_table(FORECAST_TABLE)
    logger.info(
        "Write complete. Table %s now has %d rows.",
        FORECAST_TABLE,
        destination_table.num_rows,
    )


def main() -> None:
    """Entry point: load data, train models, write forecasts."""
    client = bigquery.Client(project=PROJECT_ID)

    training_df = load_training_data(client)
    if training_df.empty:
        logger.error("No training data found. Check source table and filters.")
        return

    forecast_df = train_all_regions(training_df)
    write_forecasts_to_bigquery(client, forecast_df)


if __name__ == "__main__":
    main()
