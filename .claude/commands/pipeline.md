Run the full PH-Pulse data pipeline in order:

1. Run `cd ingestion && python run_all.py` — ingest all sources to BigQuery
2. Run `cd transforms && dbt run` — build all dbt models
3. Run `cd transforms && dbt test` — validate all tests pass
4. Run `cd ml && python write_forecasts.py` — generate poverty forecasts

After each step, report the status (success/failure + row counts where applicable). If any step fails, stop and report the error with full traceback — do not continue to the next step.
