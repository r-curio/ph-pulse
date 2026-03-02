"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  MunicipalPovertyRecord,
  MunicipalPovertyResponse,
  MunicipalTopBottomResponse,
} from "@/lib/types";
import {
  fetchMunicipalMunicipalities,
  fetchMunicipalProvinces,
  fetchMunicipalTopBottom,
  fetchMunicipalTrend,
} from "@/lib/api";
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
  /** Initial top/bottom data. */
  initialTopBottom: MunicipalTopBottomResponse;
}

/**
 * Client-side dashboard wrapper that manages filter state and re-fetches data.
 * Server Component provides initial data; subsequent filter changes fetch client-side.
 */
export function MunicipalDashboard({
  regions,
  initialRecords,
  initialTopBottom,
}: MunicipalDashboardProps) {
  /* All hooks declared at the top of the component body. */
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedYear, setSelectedYear] = useState(2012);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [records, setRecords] =
    useState<MunicipalPovertyRecord[]>(initialRecords);
  const [topBottom, setTopBottom] =
    useState<MunicipalTopBottomResponse>(initialTopBottom);
  const [loading, setLoading] = useState(false);
  const [trendRecords, setTrendRecords] = useState<MunicipalPovertyRecord[]>(
    []
  );

  /** Fetch filtered data whenever filters change. */
  const fetchData = useCallback(
    async (region: string, province: string, year: number) => {
      setLoading(true);
      try {
        const [municipalitiesData, topBottomData]: [
          MunicipalPovertyResponse,
          MunicipalTopBottomResponse,
        ] = await Promise.all([
          fetchMunicipalMunicipalities({
            region: region || undefined,
            province: province || undefined,
            year,
          }),
          fetchMunicipalTopBottom(year, {
            region: region || undefined,
            province: province || undefined,
          }),
        ]);
        setRecords(municipalitiesData.records);
        setTopBottom(topBottomData);
      } catch (err) {
        console.error("Failed to fetch municipal data:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Fetch provinces reactively when selectedRegion changes. */
  useEffect(() => {
    if (!selectedRegion) {
      setProvinces([]);
      return;
    }
    let ignore = false;
    fetchMunicipalProvinces(selectedRegion)
      .then((data) => {
        if (!ignore) setProvinces(data);
      })
      .catch((err) => {
        console.error("Failed to load provinces:", err);
        if (!ignore) setProvinces([]);
      });
    return () => {
      ignore = true;
    };
  }, [selectedRegion]);

  /** Handle region change — reset downstream and re-fetch data. */
  const handleRegionChange = useCallback(
    async (region: string) => {
      setSelectedRegion(region);
      setSelectedProvince("");
      await fetchData(region, "", selectedYear);
    },
    [fetchData, selectedYear]
  );

  /** Handle province change. */
  const handleProvinceChange = useCallback(
    async (province: string) => {
      setSelectedProvince(province);
      await fetchData(selectedRegion, province, selectedYear);
    },
    [fetchData, selectedRegion, selectedYear]
  );

  /** Handle year change. */
  const handleYearChange = useCallback(
    async (year: number) => {
      setSelectedYear(year);
      await fetchData(selectedRegion, selectedProvince, year);
    },
    [fetchData, selectedRegion, selectedProvince]
  );

  /** Load trend data for top municipalities across all years with race-condition cleanup. */
  useEffect(() => {
    let ignore = false;

    const loadTrend = async () => {
      try {
        const topPcodes = topBottom.top.slice(0, 5).map((r) => r.pcode);
        if (topPcodes.length === 0) {
          if (!ignore) setTrendRecords([]);
          return;
        }

        /* Fetch individual trends for top 5 municipalities (small queries). */
        const trendResults = await Promise.all(
          topPcodes.map((pcode) => fetchMunicipalTrend(pcode))
        );
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
  }, [topBottom.top]);

  /* Compute summary stats (derived values, not hooks). */
  const validRecords = records.filter(
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
          provinces={provinces}
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
          records={topBottom.top}
          title={`Top 10 Highest Poverty (${selectedYear})`}
        />
        <MunicipalBarChart
          records={[...topBottom.bottom].reverse()}
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
        <MunicipalDataTable records={records} />
      </section>
    </div>
  );
}
