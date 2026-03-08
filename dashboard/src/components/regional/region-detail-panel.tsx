"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_THEME, tierColor } from "@/lib/constants";
import { formatTier } from "@/lib/data-utils";
import { cn } from "@/lib/utils";
import type { RegionalPovertyRecord, HistoricalPovertyRecord } from "@/lib/types";

interface RegionDetailPanelProps {
  regionName: string | null;
  records: RegionalPovertyRecord[];
  historicalRecords: HistoricalPovertyRecord[];
}

const chartConfig: ChartConfig = {
  region: {
    label: "Region",
    color: "#3B82F6",
  },
  national: {
    label: "National Avg",
    color: "#6B7280",
  },
};

/**
 * Detail panel showing KPI stats and a comparison trend chart for the selected region.
 * Displays a placeholder when no region is selected.
 */
export function RegionDetailPanel({
  regionName,
  records,
  historicalRecords,
}: RegionDetailPanelProps) {
  const regionRecords = useMemo(
    () =>
      records
        .filter((r) => r.geo_name === regionName)
        .sort((a, b) => a.year - b.year),
    [records, regionName]
  );

  const latest = regionRecords[regionRecords.length - 1] ?? null;

  const chartData = useMemo(() => {
    if (!regionName) return [];
    return regionRecords.map((r) => ({
      year: r.year,
      region: r.poverty_incidence_pct,
    }));
  }, [regionRecords, regionName]);

  if (!regionName) {
    return (
      <div className="rounded-lg bg-card border border-border p-8 flex items-center justify-center min-h-[300px] transition-all duration-200">
        <p className="text-muted-foreground text-sm">
          Select a region to view details
        </p>
      </div>
    );
  }

  const displayName = regionName.replace(/ *\(.*\)/, "");

  return (
    <div className="rounded-lg bg-card border border-border p-4 transition-all duration-200 space-y-4">
      <div>
        <h3
          className="text-lg font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {displayName}
        </h3>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Incidence: </span>
            <span className="font-semibold text-foreground">
              {latest?.poverty_incidence_pct != null
                ? `${latest.poverty_incidence_pct.toFixed(1)}%`
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Change: </span>
            <span className="font-semibold text-foreground">
              {latest?.poverty_incidence_change != null
                ? `${latest.poverty_incidence_change > 0 ? "+" : ""}${latest.poverty_incidence_change.toFixed(1)}pp`
                : "-"}
            </span>
          </div>
          {latest?.poverty_tier && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                formatTier(latest.poverty_tier)
              )}
            >
              {latest.poverty_tier}
            </span>
          )}
        </div>
      </div>

      {chartData.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Poverty Incidence Trend
          </h4>
          <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_THEME.grid}
                vertical={false}
              />
              <XAxis
                dataKey="year"
                type="number"
                domain={["dataMin", "dataMax"]}
                tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                unit="%"
                domain={[0, "auto"]}
                tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      `${Number(value).toFixed(1)}%`,
                      "Incidence",
                    ]}
                  />
                }
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: CHART_THEME.axis }}
              />
              <Line
                name="Region"
                type="monotone"
                dataKey="region"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3B82F6" }}
                connectNulls={true}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}

      {historicalRecords.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Historical data: {historicalRecords.length} records available (1991-2015)
        </div>
      )}
    </div>
  );
}
