"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_THEME } from "@/lib/constants";
import type { ForecastRecord } from "@/lib/types";
import { getRegionActuals } from "@/app/forecast/actions";

interface ForecastChartProps {
  /** All forecast records across regions and years. */
  records: ForecastRecord[];
  /** Distinct region names available in forecast data. */
  regions: string[];
}

interface ChartDatum {
  year: number;
  actual: number | null;
  forecast: number | null;
}

/**
 * Client component that renders an actual vs. forecast poverty chart.
 * Users can switch between regions via a dropdown selector.
 * Actuals are fetched on region change via a server action.
 */
export function ForecastChart({ records, regions }: ForecastChartProps) {
  const [selectedRegion, setSelectedRegion] = useState(regions[0] ?? "");
  const [actuals, setActuals] = useState<
    { year: number; poverty_incidence_pct: number | null }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const regionForecasts = useMemo(
    () =>
      records
        .filter((r) => r.region_name === selectedRegion)
        .sort((a, b) => a.year - b.year),
    [records, selectedRegion]
  );

  const regionMeta = regionForecasts[0];

  const loadActuals = useCallback(async (region: string) => {
    setLoading(true);
    const data = await getRegionActuals(region);
    setActuals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      loadActuals(selectedRegion);
    }
  }, [selectedRegion, loadActuals]);

  const chartData: ChartDatum[] = useMemo(() => {
    const yearMap = new Map<number, ChartDatum>();

    for (const a of actuals) {
      if (a.poverty_incidence_pct !== null) {
        yearMap.set(a.year, {
          year: a.year,
          actual: a.poverty_incidence_pct,
          forecast: null,
        });
      }
    }

    for (const f of regionForecasts) {
      const existing = yearMap.get(f.year);
      if (existing) {
        existing.forecast = f.predicted_poverty_pct;
      } else {
        yearMap.set(f.year, {
          year: f.year,
          actual: null,
          forecast: f.predicted_poverty_pct,
        });
      }
    }

    // Bridge: set forecast = actual on the last actual year so lines connect
    const actualYears = actuals
      .filter((a) => a.poverty_incidence_pct !== null)
      .map((a) => a.year);
    const maxActualYear = Math.max(...actualYears, 0);
    if (maxActualYear > 0) {
      const entry = yearMap.get(maxActualYear);
      if (entry && entry.forecast === null) {
        entry.forecast = entry.actual;
      }
    }

    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }, [actuals, regionForecasts]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3
          className="text-lg font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Poverty Incidence: Actual vs. Forecast
        </h3>
        <label htmlFor="forecast-region-select" className="sr-only">
          Select region
        </label>
        <select
          id="forecast-region-select"
          aria-label="Select region"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
          Loading chart data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 24, bottom: 4, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_THEME.grid}
            />
            <XAxis
              dataKey="year"
              tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
              axisLine={{ stroke: CHART_THEME.grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
              axisLine={{ stroke: CHART_THEME.grid }}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: CHART_THEME.tooltip.background,
                border: `1px solid ${CHART_THEME.tooltip.border}`,
                color: CHART_THEME.tooltip.text,
                borderRadius: 8,
                fontSize: 13,
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  actual: "Actual",
                  forecast: "Forecast",
                };
                return [`${value.toFixed(1)}%`, labels[name] ?? name];
              }}
            />

            {/* Historical (solid line) */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 5, fill: "#3B82F6", stroke: "#0B1120", strokeWidth: 2 }}
              connectNulls={false}
            />

            {/* Forecast (dashed line) */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#3B82F6", stroke: "#0B1120", strokeWidth: 2 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-6 rounded bg-[#3B82F6]" />
          Historical
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-6 rounded"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, #3B82F6 0, #3B82F6 5px, transparent 5px, transparent 10px)",
            }}
          />
          Forecast
        </span>
      </div>

      {/* Metadata row */}
      {regionMeta && (
        <p className="mt-2 text-xs text-muted-foreground">
          Model R&sup2;: {regionMeta.r_squared.toFixed(2)} | Training:{" "}
          {regionMeta.trained_on_years} | Method: Linear Regression
        </p>
      )}
    </div>
  );
}
