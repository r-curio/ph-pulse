"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_THEME, tierColor } from "@/lib/constants";
import type { RegionalPovertyRecord } from "@/lib/types";

interface RegionalSnapshotChartProps {
  records: RegionalPovertyRecord[];
  onRegionClick?: (region: string) => void;
}

const chartConfig: ChartConfig = {
  poverty_incidence_pct: {
    label: "Poverty Incidence",
  },
};

/**
 * Horizontal bar chart showing regional poverty incidence for 2023,
 * sorted descending by incidence, bars colored by poverty tier.
 */
export function RegionalSnapshotChart({
  records,
  onRegionClick,
}: RegionalSnapshotChartProps) {
  const sorted = records
    .filter((r) => r.poverty_incidence_pct != null)
    .slice()
    .sort(
      (a, b) =>
        (a.poverty_incidence_pct ?? 0) - (b.poverty_incidence_pct ?? 0)
    );

  const chartData = sorted.map((r) => ({
    name: r.geo_name.replace(/ *\(.*\)/, ""),
    fullName: r.geo_name,
    poverty_incidence_pct: r.poverty_incidence_pct,
    tier: r.poverty_tier,
  }));

  const barHeight = 28;
  const chartHeight = Math.max(chartData.length * barHeight + 40, 200);

  return (
    <div className="rounded-lg bg-card border border-border p-4">
      <h3
        className="mb-4 text-base font-semibold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Regional Poverty Snapshot (2023)
      </h3>
      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height: chartHeight }}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_THEME.grid}
            horizontal={false}
          />
          <XAxis
            type="number"
            unit="%"
            tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [`${Number(value).toFixed(1)}%`, "Incidence"]}
              />
            }
          />
          <Bar
            dataKey="poverty_incidence_pct"
            radius={[0, 4, 4, 0]}
            cursor={onRegionClick ? "pointer" : undefined}
            onClick={(entry: { fullName?: string }) => {
              if (onRegionClick && entry.fullName) {
                onRegionClick(entry.fullName);
              }
            }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={tierColor(entry.tier)}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
