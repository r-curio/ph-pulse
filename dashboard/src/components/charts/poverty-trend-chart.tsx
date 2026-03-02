"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RegionalPovertyRecord } from "@/lib/types";

interface PovertyTrendChartProps {
  /** National poverty records ordered by year. */
  records: RegionalPovertyRecord[];
}

/**
 * Line chart showing national poverty incidence trend across survey years.
 */
export function PovertyTrendChart({ records }: PovertyTrendChartProps) {
  const data = records.map((r) => ({
    year: r.year,
    poverty_incidence_pct: r.poverty_incidence_pct,
  }));

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        National Poverty Trend
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis unit="%" domain={[0, "auto"]} />
          <Tooltip formatter={(value: number | undefined) => `${value ?? 0}%`} />
          <Line
            type="monotone"
            dataKey="poverty_incidence_pct"
            name="Poverty Incidence"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
