"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface MagnitudeChartProps {
  /** Regional poverty records for a single year, sorted by magnitude desc. */
  records: HistoricalPovertyRecord[];
}

const chartConfig = {
  magnitude_poor_families: {
    label: "Poor Families",
    color: "#7c3aed",
  },
} satisfies ChartConfig;

/** Format large numbers with K/M suffixes for axis labels. */
function formatMagnitude(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return String(value);
}

/**
 * Horizontal bar chart showing magnitude of poor families per region
 * for the latest historical year. Purple bars with K/M formatted axis.
 */
export function MagnitudeChart({ records }: MagnitudeChartProps) {
  const sorted = records
    .filter((r) => r.magnitude_poor_families !== null)
    .slice()
    .sort((a, b) => (b.magnitude_poor_families ?? 0) - (a.magnitude_poor_families ?? 0));

  const data = sorted.map((r) => ({
    name: r.geo_name.replace(/ *\(.*\)/, "").replace(/ *[a-z]\//, ""),
    magnitude_poor_families: r.magnitude_poor_families,
  }));

  return (
    <Card className="border-none bg-white text-gray-900 shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Magnitude of Poor Families by Region (2015)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[600px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 140, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatMagnitude} />
            <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => Number(value).toLocaleString()}
                />
              }
            />
            <Bar
              dataKey="magnitude_poor_families"
              name="Poor Families"
              fill="var(--color-magnitude_poor_families)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
