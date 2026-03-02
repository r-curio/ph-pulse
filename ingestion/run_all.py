"""PH-Pulse ETL runner — executes all ingestion sources."""

from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from ingestion.sources.psa_poverty_incidence_families import ingest as ingest_poverty
from ingestion.sources.psa_poverty_families_5yr import ingest as ingest_poverty_5yr
from ingestion.sources.hdx_municipal_poverty_estimates import (
    ingest as ingest_municipal_poverty,
)


def main() -> None:
    """Run all ingestion pipelines."""
    print("=== PH-Pulse Ingestion Pipeline ===")
    ingest_poverty()
    ingest_poverty_5yr()
    ingest_municipal_poverty()
    print("=== Ingestion complete ===")


if __name__ == "__main__":
    main()
