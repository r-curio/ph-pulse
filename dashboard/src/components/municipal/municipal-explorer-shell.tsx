"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  MunicipalPovertyRecord,
  MunicipalTopBottomResponse,
} from "@/lib/types";
import { getMunicipalData } from "@/app/municipal/actions";
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
  const [selectedYear, setSelectedYear] = useState(2012);
  const [records, setRecords] = useState(initialRecords);
  const [loading, setLoading] = useState(false);

  /** Fetch municipalities when filters change via server action. */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { municipalities } = await getMunicipalData(
        selectedRegion,
        selectedYear
      );
      setRecords(municipalities.records);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Compute KPI values from current records. */
  const totalMunicipalities = records.length;
  const avgIncidence =
    records.length > 0
      ? records.reduce(
          (sum, r) => sum + (r.poverty_incidence_pct ?? 0),
          0
        ) / records.length
      : 0;
  const highTierCount = records.filter(
    (r) => r.poverty_tier === "High"
  ).length;

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
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
        selectedRegion={selectedRegion}
        selectedYear={selectedYear}
        onRegionChange={handleRegionChange}
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
      {!loading && records.length > 0 && (
        <DistributionHistogram records={records} />
      )}

      {/* Data table */}
      {!loading && <MunicipalDataTable records={records} />}
    </div>
  );
}
