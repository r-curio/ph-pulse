# PH-Pulse — Philippine Socioeconomic Data Platform

## About
End-to-end data platform that ingests fragmented Philippine government data (PSA poverty surveys, household income data, USGS seismic data), transforms it through a structured BigQuery pipeline, and surfaces insights via a Next.js dashboard with a GenAI chat layer for natural language querying.

## Architecture
```
[PSA CSVs] [data.gov.ph CSVs] [USGS API]
                    │
          [Python ETL — ingestion/]
                    │
          [BigQuery — raw layer]
                    │
              [dbt Core — transforms/]
            staging → intermediate → marts
                    │
          [BigQuery — gold layer]
               /          \
      [scikit-learn]    [FastAPI Backend]
       ml/                backend/
          \              /
           [Next.js Dashboard + Gemini Chat]
                  dashboard/
                   Vercel
```

## Tech Stack
- **Warehouse:** Google BigQuery Sandbox (free tier)
- **Transformation:** dbt Core (local, dbt-bigquery adapter)
- **ETL:** Python 3.11+, pandas, google-cloud-bigquery
- **ML:** scikit-learn (linear regression forecasting)
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend API:** Python, FastAPI
- **GenAI:** Gemini API (gemini-1.5-flash via @google/generative-ai)
- **Deployment:** Vercel (frontend), GitHub (source)

## Project Structure
- `ingestion/` — Python ETL scripts, one per data source
- `transforms/` — dbt project (models in staging → intermediate → marts)
- `ml/` — scikit-learn forecasting scripts
- `genai/` — Gemini API chat agent prototype
- `dashboard/` — Next.js 14 TypeScript app
- `backend/` — FastAPI backend API

## Data Layer Convention (Bronze → Silver → Gold)
- `raw_*` tables — exact copies of source data, never queried by dashboard
- `stg_*` models — cleaned, typed, standardized (dbt staging)
- `int_*` models — business logic joins (dbt intermediate)
- `mart_*` models — final aggregated tables for dashboard (dbt marts)
- `ml_*` tables — prediction outputs written back by ML scripts

## Common Commands
```bash
# ETL — ingest all sources to BigQuery raw layer
cd ingestion && python run_all.py

# dbt — transform raw → staging → marts
cd transforms && dbt run && dbt test

# ML — generate poverty forecasts
cd ml && python write_forecasts.py

# Dashboard — local dev server
cd dashboard && npm run dev

# Backend — local FastAPI server
cd backend && uvicorn main:app --reload

# Full pipeline
python ingestion/run_all.py && cd transforms && dbt run && dbt test && cd ../ml && python write_forecasts.py
```

## Code Standards
- Python: type hints on all functions, snake_case, Black formatter, ruff linter
- TypeScript: strict mode, no `any` types, named exports preferred
- SQL (dbt): lowercase keywords, CTEs over subqueries, one model per file
- All functions must have docstrings (Python) or JSDoc (TypeScript)
- Never commit credentials.json or .env.local

## Git Conventions
- Branch naming: `feat/`, `fix/`, `refactor/`, `docs/`
- Commit messages: imperative tense, e.g. "Add regional summary mart model"
- **STRICT RULE: Before starting any new feature, bug fix, or refactor, you MUST checkout a new branch first (`git checkout -b <prefix>/<name>`). NEVER commit new work directly to `main`. If you are on `main`, stop and create a branch before writing any code.**

## Secrets & Security
- `credentials.json` — GCP service account key, NEVER commit
- `.env.local` — all environment variables, NEVER commit
- BigQuery credentials passed via GOOGLE_APPLICATION_CREDENTIALS_JSON env var on Vercel
- Gemini API key stored in GEMINI_API_KEY env var
- Always verify .gitignore before pushing
