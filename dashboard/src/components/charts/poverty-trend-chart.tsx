"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { RegionalPovertyRecord } from "@/lib/types";
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

interface PovertyTrendChartProps {
  /** National poverty records ordered by year. */
  records: RegionalPovertyRecord[];
}

const chartConfig = {
  poverty_incidence_pct: {
    label: "Poverty Incidence",
    color: "#2563eb",
  },
} satisfies ChartConfig;

/**
 * Line chart showing national poverty incidence trend across survey years.
 */
export function PovertyTrendChart({ records }: PovertyTrendChartProps) {
  const data = records.map((r) => ({
    year: r.year,
    poverty_incidence_pct: r.poverty_incidence_pct,
  }));

  return (
    <Card className="border-none bg-white text-gray-900 shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          National Poverty Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart data={data} margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis unit="%" domain={[0, "auto"]} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `${value}%`}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="poverty_incidence_pct"
              name="Poverty Incidence"
              stroke="var(--color-poverty_incidence_pct)"
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
