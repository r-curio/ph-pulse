"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MunicipalPovertyRecord,
  MunicipalTopBottomResponse,
} from "@/lib/types";
import { getMunicipalRecords } from "@/app/municipal/actions";
import { CompactKpiCard } from "@/components/ui/compact-kpi-card";
import { MunicipalFilters } from "@/components/municipal/municipal-filters";
import { DistributionHistogram } from "@/components/charts/distribution-histogram";
import { MunicipalDataTable } from "@/components/municipal/municipal-data-table";

interface MunicipalExplorerShellProps {
  /** Available region names for filtering. */
  regions: string[];
  /** Initial municipal records loaded server-side. */
  initialRecords: MunicipalPovertyRecord[];
  /** Initial top/bottom response loaded server-side. */
  initialTopBottom: MunicipalTopBottomResponse;
}

/**
 * Client-side orchestrator for the Municipal Explorer page.
 * Manages filter state, fetches data on filter changes, and renders
 * KPI cards, distribution histogram, and data table.
 */
export function MunicipalExplorerShell({
  regions,
  initialRecords,
  initialTopBottom: _initialTopBottom,
}: MunicipalExplorerShellProps) {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedYear, setSelectedYear] = useState(2012);
  const [records, setRecords] = useState(initialRecords);
  const [loading, setLoading] = useState(false);

  /** Fetch municipalities when region/year change via server action. */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMunicipalRecords(
        selectedRegion,
        selectedYear
      );
      setRecords(result);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Derive municipality names from current records for the dropdown. */
  const municipalityNames = useMemo(
    () =>
      [...new Set(records.map((r) => r.municipality_city))].sort(),
    [records]
  );

  /** Filter records by selected municipality (client-side). */
  const filteredRecords = useMemo(
    () =>
      selectedMunicipality
        ? records.filter((r) => r.municipality_city === selectedMunicipality)
        : records,
    [records, selectedMunicipality]
  );

  /** Compute KPI values from filtered records. */
  const totalMunicipalities = filteredRecords.length;
  const avgIncidence =
    filteredRecords.length > 0
      ? filteredRecords.reduce(
          (sum, r) => sum + (r.poverty_incidence_pct ?? 0),
          0
        ) / filteredRecords.length
      : 0;
  const highTierCount = filteredRecords.filter(
    (r) => r.poverty_tier === "High"
  ).length;

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedMunicipality("");
  };

  const handleMunicipalityChange = (municipality: string) => {
    setSelectedMunicipality(municipality);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedMunicipality("");
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CompactKpiCard
          label="Total Municipalities"
          value={totalMunicipalities.toLocaleString()}
        />
        <CompactKpiCard
          label="Avg. Poverty Incidence"
          value={`${avgIncidence.toFixed(1)}%`}
        />
        <CompactKpiCard
          label="High-Tier Count"
          value={highTierCount.toLocaleString()}
          trend={
            totalMunicipalities > 0
              ? `${((highTierCount / totalMunicipalities) * 100).toFixed(1)}% of total`
              : undefined
          }
        />
      </div>

      {/* Filters */}
      <MunicipalFilters
        regions={regions}
        municipalities={municipalityNames}
        selectedRegion={selectedRegion}
        selectedMunicipality={selectedMunicipality}
        selectedYear={selectedYear}
        onRegionChange={handleRegionChange}
        onMunicipalityChange={handleMunicipalityChange}
        onYearChange={handleYearChange}
      />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-muted-foreground">
            Loading data...
          </span>
        </div>
      )}

      {/* Distribution histogram */}
      {!loading && filteredRecords.length > 0 && (
        <DistributionHistogram records={filteredRecords} />
      )}

      {/* Data table */}
      {!loading && <MunicipalDataTable records={filteredRecords} />}
    </div>
  );
}
