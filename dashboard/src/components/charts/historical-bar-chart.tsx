"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import type { HistoricalPovertyRecord } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface HistoricalBarChartProps {
  /** Regional poverty records for a single year, sorted by incidence desc. */
  records: HistoricalPovertyRecord[];
}

/** Color mapping for poverty tiers. */
function tierColor(tier: string | null): string {
  switch (tier) {
    case "High":
      return "#dc2626";
    case "Medium":
      return "#f59e0b";
    case "Low":
      return "#16a34a";
    default:
      return "#9ca3af";
  }
}

const chartConfig = {
  poverty_incidence_pct: {
    label: "Poverty Incidence",
  },
} satisfies ChartConfig;

/**
 * Horizontal bar chart showing regional poverty incidence for 2015,
 * color-coded by poverty tier (High=red, Medium=amber, Low=green).
 */
export function HistoricalBarChart({ records }: HistoricalBarChartProps) {
  const data = records.map((r) => ({
    name: r.geo_name.replace(/ *\(.*\)/, "").replace(/ *[a-z]\//, ""),
    poverty_incidence_pct: r.poverty_incidence_pct,
    tier: r.poverty_tier,
  }));

  return (
    <Card className="border-none bg-white text-gray-900 shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Poverty Incidence by Region (2015)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[600px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 140, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%" />
            <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `${value}%`}
                />
              }
            />
            <Bar dataKey="poverty_incidence_pct" name="Poverty Incidence">
              {data.map((entry, index) => (
                <Cell key={index} fill={tierColor(entry.tier)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-red-600" /> High
            (&ge;20%)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-amber-500" /> Medium
            (&ge;10%)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-green-600" /> Low
            (&lt;10%)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
