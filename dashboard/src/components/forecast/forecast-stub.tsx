"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_THEME } from "@/lib/constants";

interface ForecastDatum {
  year: number;
  actual: number | null;
  forecast: number | null;
  low: number | null;
  high: number | null;
}

const CHART_DATA: ForecastDatum[] = [
  { year: 2021, actual: 18.1, forecast: null, low: null, high: null },
  { year: 2023, actual: 15.5, forecast: 15.5, low: 14.0, high: 17.0 },
  { year: 2024, actual: null, forecast: 14.2, low: 12.5, high: 16.2 },
  { year: 2025, actual: null, forecast: 13.1, low: 11.0, high: 15.5 },
  { year: 2026, actual: null, forecast: 12.3, low: 9.8, high: 15.0 },
  { year: 2027, actual: null, forecast: 11.8, low: 8.8, high: 14.9 },
];

/**
 * Mock forecast chart showing historical national poverty trend
 * extending into predicted future values with a confidence band.
 * Uses hardcoded data until scikit-learn ML integration is ready.
 */
export function ForecastStub() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Coming Soon banner */}
      <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-accent/20 px-3 py-2">
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          Coming Soon
        </span>
        <span className="text-sm text-muted-foreground">
          scikit-learn ML forecasting integration is planned. Data shown below
          is illustrative.
        </span>
      </div>

      <h3
        className="mb-4 text-lg font-semibold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        National Poverty Incidence Forecast (2021\u20132027)
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={CHART_DATA}
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
            domain={[5, 22]}
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
                high: "CI Upper",
                low: "CI Lower",
              };
              return [`${value}%`, labels[name] ?? name];
            }}
          />

          {/* Confidence band */}
          <Area
            dataKey="high"
            stroke="none"
            fill="#3B82F6"
            fillOpacity={0.08}
            connectNulls={false}
          />
          <Area
            dataKey="low"
            stroke="none"
            fill="#0B1120"
            fillOpacity={0.9}
            connectNulls={false}
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
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded bg-[#3B82F6] opacity-15" />
          90% Confidence
        </span>
      </div>
    </div>
  );
}
