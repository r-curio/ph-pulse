"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MunicipalPovertyRecord } from "@/lib/types";
import {
  getMunicipalRecords,
  getMunicipalTrends,
} from "@/app/municipal/actions";
import { HistoricalSummaryCard } from "@/components/ui/historical-summary-card";
import { MunicipalFilters } from "@/components/municipal/municipal-filters";
import { MunicipalDataTable } from "@/components/municipal/municipal-data-table";
import { MunicipalBarChart } from "@/components/charts/municipal-bar-chart";
import { MunicipalTrendChart } from "@/components/charts/municipal-trend-chart";

interface MunicipalDashboardProps {
  /** Available region names. */
  regions: string[];
  /** Initial municipal records (2012, all regions). */
  initialRecords: MunicipalPovertyRecord[];
}

/**
 * Client-side dashboard wrapper that manages filter state and re-fetches data.
 * Server Component provides initial data; subsequent filter changes fetch client-side.
 */
export function MunicipalDashboard({
  regions,
  initialRecords,
}: MunicipalDashboardProps) {
  /* All hooks declared at the top of the component body. */
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedYear, setSelectedYear] = useState(2012);
  const [records, setRecords] =
    useState<MunicipalPovertyRecord[]>(initialRecords);
  const [loading, setLoading] = useState(false);
  const [trendRecords, setTrendRecords] = useState<MunicipalPovertyRecord[]>(
    []
  );

  /** Fetch records whenever region/year change via server action. */
  const fetchData = useCallback(
    async (region: string, year: number) => {
      setLoading(true);
      try {
        const result = await getMunicipalRecords(region, year);
        setRecords(result);
      } catch (err) {
        console.error("Failed to fetch municipal data:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Handle region change and re-fetch data. */
  const handleRegionChange = useCallback(
    async (region: string) => {
      setSelectedRegion(region);
      setSelectedProvince("");
      await fetchData(region, selectedYear);
    },
    [fetchData, selectedYear]
  );

  /** Handle province change (client-side filter only). */
  const handleProvinceChange = useCallback(
    (province: string) => {
      setSelectedProvince(province);
    },
    []
  );

  /** Handle year change. */
  const handleYearChange = useCallback(
    async (year: number) => {
      setSelectedYear(year);
      setSelectedProvince("");
      await fetchData(selectedRegion, year);
    },
    [fetchData, selectedRegion]
  );

  /** Derive province names from current records. */
  const provinceNames = useMemo(
    () => [...new Set(records.map((r) => r.province))].sort(),
    [records]
  );

  /** Filter records by province first, then derive municipalities from that. */
  const recordsAfterProvince = useMemo(
    () =>
      selectedProvince
        ? records.filter((r) => r.province === selectedProvince)
        : records,
    [records, selectedProvince]
  );

  /** Province-filtered records are the final filtered set. */
  const filteredRecords = recordsAfterProvince;

  /** Derive top/bottom 10 from the currently filtered records. */
  const filteredTop = useMemo(() => {
    const sorted = filteredRecords
      .filter((r) => r.poverty_incidence_pct != null)
      .sort((a, b) => (b.poverty_incidence_pct ?? 0) - (a.poverty_incidence_pct ?? 0));
    return sorted.slice(0, 10);
  }, [filteredRecords]);

  const filteredBottom = useMemo(() => {
    const sorted = filteredRecords
      .filter((r) => r.poverty_incidence_pct != null)
      .sort((a, b) => (a.poverty_incidence_pct ?? 0) - (b.poverty_incidence_pct ?? 0));
    return sorted.slice(0, 10);
  }, [filteredRecords]);

  /** Load trend data for top filtered municipalities across all years. */
  useEffect(() => {
    let ignore = false;

    const loadTrend = async () => {
      try {
        const topPcodes = filteredTop.slice(0, 5).map((r) => r.pcode);
        if (topPcodes.length === 0) {
          if (!ignore) setTrendRecords([]);
          return;
        }

        const trendResults = await getMunicipalTrends(topPcodes);
        if (ignore) return;

        setTrendRecords(trendResults.flatMap((r) => r.records));
      } catch {
        if (!ignore) setTrendRecords([]);
      }
    };

    loadTrend();
    return () => {
      ignore = true;
    };
  }, [filteredTop]);

  /* Compute summary stats (derived values, not hooks). */
  const validRecords = filteredRecords.filter(
    (r) => r.poverty_incidence_pct != null
  );
  const totalMunicipalities = validRecords.length;
  const highest = validRecords.reduce<MunicipalPovertyRecord | null>(
    (max, r) =>
      max === null ||
      (r.poverty_incidence_pct ?? 0) > (max.poverty_incidence_pct ?? 0)
        ? r
        : max,
    null
  );
  const lowest = validRecords.reduce<MunicipalPovertyRecord | null>(
    (min, r) =>
      min === null ||
      (r.poverty_incidence_pct ?? 0) < (min.poverty_incidence_pct ?? 0)
        ? r
        : min,
    null
  );

  return (
    <div
      className={loading ? "opacity-60 transition-opacity" : ""}
      aria-busy={loading}
    >
      {/* Filters */}
      <section className="mb-8">
        <MunicipalFilters
          regions={regions}
          provinces={provinceNames}
          selectedRegion={selectedRegion}
          selectedProvince={selectedProvince}
          selectedYear={selectedYear}
          onRegionChange={handleRegionChange}
          onProvinceChange={handleProvinceChange}
          onYearChange={handleYearChange}
        />
      </section>

      {/* Summary Cards */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <HistoricalSummaryCard
          label={`Municipalities (${selectedYear})`}
          value={String(totalMunicipalities)}
          description="Total municipalities with poverty data"
        />
        <HistoricalSummaryCard
          label="Highest Poverty"
          value={
            highest?.poverty_incidence_pct != null
              ? `${highest.poverty_incidence_pct.toFixed(1)}%`
              : "N/A"
          }
          description={highest?.municipality_city ?? ""}
        />
        <HistoricalSummaryCard
          label="Lowest Poverty"
          value={
            lowest?.poverty_incidence_pct != null
              ? `${lowest.poverty_incidence_pct.toFixed(1)}%`
              : "N/A"
          }
          description={lowest?.municipality_city ?? ""}
        />
      </section>

      {/* Top/Bottom Bar Charts */}
      <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <MunicipalBarChart
          records={filteredTop}
          title={`Top 10 Highest Poverty (${selectedYear})`}
        />
        <MunicipalBarChart
          records={[...filteredBottom].reverse()}
          title={`Top 10 Lowest Poverty (${selectedYear})`}
        />
      </section>

      {/* Trend Chart */}
      {trendRecords.length > 0 && (
        <section className="mb-8">
          <MunicipalTrendChart records={trendRecords} />
        </section>
      )}

      {/* Data Table */}
      <section>
        <MunicipalDataTable records={filteredRecords} />
      </section>
    </div>
  );
}
