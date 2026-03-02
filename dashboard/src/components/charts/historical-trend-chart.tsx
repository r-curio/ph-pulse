"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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

interface HistoricalTrendChartProps {
  /** National historical poverty records ordered by year. */
  records: HistoricalPovertyRecord[];
}

const chartConfig = {
  poverty_incidence_pct: {
    label: "Poverty Incidence",
    color: "#2563eb",
  },
  poverty_threshold_php: {
    label: "Poverty Threshold",
    color: "#d97706",
  },
} satisfies ChartConfig;

/**
 * Dual-axis line chart showing national poverty incidence (%) and
 * poverty threshold (PHP) trends from 1991 to 2015.
 */
export function HistoricalTrendChart({ records }: HistoricalTrendChartProps) {
  const data = records.map((r) => ({
    year: r.year,
    poverty_incidence_pct: r.poverty_incidence_pct,
    poverty_threshold_php: r.poverty_threshold_php,
  }));

  return (
    <Card className="border-none bg-white text-gray-900 shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          National Poverty Trend (1991–2015)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart data={data} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis yAxisId="left" unit="%" domain={[0, "auto"]} />
            <YAxis yAxisId="right" orientation="right" unit=" PHP" domain={[0, "auto"]} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) =>
                    name === "poverty_threshold_php"
                      ? `${Number(value).toLocaleString()} PHP`
                      : `${value}%`
                  }
                />
              }
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="poverty_incidence_pct"
              name="Poverty Incidence"
              stroke="var(--color-poverty_incidence_pct)"
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="poverty_threshold_php"
              name="Poverty Threshold"
              stroke="var(--color-poverty_threshold_php)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-blue-600" /> Poverty
            Incidence (%)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-amber-600" />{" "}
            Poverty Threshold (PHP)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
