---
name: bigquery-ops
description: Use when querying BigQuery, designing schemas, debugging BigQuery errors, or verifying data loads in the PH-Pulse warehouse.
---

# BigQuery Operations for PH-Pulse

## Dataset: ph_pulse (US multi-region)

## Table Inventory
| Table | Layer | Source |
|-------|-------|--------|
| raw_poverty_incidence | Bronze | PSA OpenStat |
| raw_fies_income | Bronze | PSA OpenStat |
| raw_earthquakes | Bronze | USGS API |
| stg_poverty | Silver | dbt staging |
| stg_fies | Silver | dbt staging |
| int_regional_socioeconomic | Silver | dbt intermediate |
| mart_regional_summary | Gold | dbt mart |
| ml_poverty_forecasts | ML | scikit-learn output |

## Loader Pattern
All ingestion scripts use the shared loader in `ingestion/loaders/bigquery_loader.py`.
Always use WRITE_TRUNCATE (full replace on each run), never append.

## Verification Queries
After any data load or dbt run, verify with:
```sql
select 'raw_poverty' as tbl, count(*) as rows from `ph_pulse.raw_poverty_incidence`
union all
select 'raw_fies', count(*) from `ph_pulse.raw_fies_income`
union all
select 'raw_earthquakes', count(*) from `ph_pulse.raw_earthquakes`
union all
select 'mart_summary', count(*) from `ph_pulse.mart_regional_summary`;
```

## Sandbox Limitations
- Tables auto-expire after 60 days
- 10 GB storage, 1 TB queries/month
- No DML (INSERT/UPDATE/DELETE) — use WRITE_TRUNCATE loads instead
- Location must be US (multi-region) for free tier
