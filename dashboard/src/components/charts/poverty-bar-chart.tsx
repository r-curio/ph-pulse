"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RegionalPovertyRecord } from "@/lib/types";

interface PovertyBarChartProps {
  /** Regional poverty records for a single year, sorted by incidence desc. */
  records: RegionalPovertyRecord[];
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

/**
 * Horizontal bar chart showing poverty incidence by region for a single year.
 * Color-coded by poverty tier (High=red, Medium=amber, Low=green).
 */
export function PovertyBarChart({ records }: PovertyBarChartProps) {
  const data = records.map((r) => ({
    name: r.geo_name.replace(/ *\(.*\)/, ""),
    poverty_incidence_pct: r.poverty_incidence_pct,
    tier: r.poverty_tier,
  }));

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Poverty Incidence by Region (2023)
      </h2>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={data} layout="vertical" margin={{ left: 140, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" unit="%" />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number | undefined) => `${value ?? 0}%`} />
          <Bar dataKey="poverty_incidence_pct" name="Poverty Incidence">
            {data.map((entry, index) => (
              <Cell key={index} fill={tierColor(entry.tier)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
    </div>
  );
}
