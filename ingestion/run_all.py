"""PH-Pulse ETL runner — executes all ingestion sources."""

from ingestion.sources.psa_poverty_incidence_families import ingest as ingest_poverty


def main() -> None:
    """Run all ingestion pipelines."""
    print("=== PH-Pulse Ingestion Pipeline ===")
    ingest_poverty()
    print("=== Ingestion complete ===")


if __name__ == "__main__":
    main()
