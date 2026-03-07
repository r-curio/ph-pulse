"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { RegionalPovertyRecord, HistoricalPovertyRecord } from "@/lib/types";
import { fetchRegionDetail, fetchHistoricalRegionDetail } from "@/lib/api";
import { RegionTable } from "./region-table";
import { RegionDetailPanel } from "./region-detail-panel";

interface RegionalExplorerShellProps {
  records: RegionalPovertyRecord[];
  nationalRecords: RegionalPovertyRecord[];
  initialRegion?: string;
}

/**
 * Client-side orchestrator for the Regional Explorer page.
 * Manages selected region state, fetches detail data client-side.
 */
export function RegionalExplorerShell({
  records,
  nationalRecords,
  initialRegion,
}: RegionalExplorerShellProps) {
  const searchParams = useSearchParams();

  const defaultRegion = useMemo(() => {
    const fromUrl = searchParams.get("region");
    if (fromUrl) return fromUrl;
    if (initialRegion) return initialRegion;
    const highest = records.reduce<RegionalPovertyRecord | null>(
      (max, r) =>
        max === null ||
        (r.poverty_incidence_pct ?? 0) > (max.poverty_incidence_pct ?? 0)
          ? r
          : max,
      null
    );
    return highest?.geo_name ?? null;
  }, [searchParams, initialRegion, records]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(
    defaultRegion
  );

  const [detailRecords, setDetailRecords] = useState<RegionalPovertyRecord[]>(
    []
  );
  const [historicalRecords, setHistoricalRecords] = useState<
    HistoricalPovertyRecord[]
  >([]);

  const fetchDetails = useCallback(async (regionName: string) => {
    try {
      const [detail, historical] = await Promise.all([
        fetchRegionDetail(regionName),
        fetchHistoricalRegionDetail(regionName),
      ]);
      setDetailRecords(detail.records);
      setHistoricalRecords(historical.records);
    } catch (err) {
      console.error("Failed to fetch region details:", err);
      setDetailRecords([]);
      setHistoricalRecords([]);
    }
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      fetchDetails(selectedRegion);
    }
  }, [selectedRegion, fetchDetails]);

  const handleSelect = useCallback((geo_name: string) => {
    setSelectedRegion(geo_name);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
      <RegionTable
        records={records}
        selectedRegion={selectedRegion}
        onSelect={handleSelect}
      />
      <RegionDetailPanel
        regionName={selectedRegion}
        records={detailRecords}
        historicalRecords={historicalRecords}
      />
    </div>
  );
}
