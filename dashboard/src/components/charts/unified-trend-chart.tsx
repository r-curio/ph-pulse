"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
  Label,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_THEME } from "@/lib/constants";

interface UnifiedTrendChartProps {
  data: { year: number; poverty_incidence_pct: number | null }[];
}

const chartConfig: ChartConfig = {
  poverty_incidence_pct: {
    label: "Poverty Incidence",
    color: "#3B82F6",
  },
};

/**
 * Single line chart showing the merged national poverty trend from 1991-2023.
 * Includes a subtle reference area marking the 2015-2021 data gap.
 */
export function UnifiedTrendChart({ data }: UnifiedTrendChartProps) {
  return (
    <div className="rounded-lg bg-card border border-border p-4">
      <h3
        className="mb-4 text-base font-semibold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Poverty Incidence Trend (1991–2023)
      </h3>
      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
                formatter={(value) => [`${Number(value).toFixed(1)}%`, "Incidence"]}
              />
            }
          />
          <ReferenceArea
            x1={2015}
            x2={2021}
            fill="rgba(255,255,255,0.03)"
            strokeOpacity={0}
          >
            <Label
              value="Data gap"
              position="center"
              fill={CHART_THEME.axis}
              fontSize={11}
              opacity={0.6}
            />
          </ReferenceArea>
          <Line
            type="monotone"
            dataKey="poverty_incidence_pct"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3B82F6" }}
            activeDot={{ r: 5 }}
            connectNulls={true}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
