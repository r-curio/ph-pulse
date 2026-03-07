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
import type { MunicipalPovertyRecord } from "@/lib/types";
import { CHART_THEME } from "@/lib/constants";

interface DistributionHistogramProps {
  /** Municipal poverty records to bucket into a histogram. */
  records: MunicipalPovertyRecord[];
}

interface BucketDatum {
  label: string;
  count: number;
  color: string;
}

const BUCKETS = [
  { min: 0, max: 5, label: "0\u20135%" },
  { min: 5, max: 10, label: "5\u201310%" },
  { min: 10, max: 15, label: "10\u201315%" },
  { min: 15, max: 20, label: "15\u201320%" },
  { min: 20, max: 25, label: "20\u201325%" },
  { min: 25, max: 30, label: "25\u201330%" },
  { min: 30, max: 35, label: "30\u201335%" },
  { min: 35, max: 40, label: "35\u201340%" },
  { min: 40, max: 45, label: "40\u201345%" },
  { min: 45, max: 50, label: "45\u201350%" },
  { min: 50, max: Infinity, label: "50%+" },
];

/** Return the bar color based on the bucket threshold. */
function bucketColor(min: number): string {
  if (min < 10) return "#10B981";
  if (min < 20) return "#F59E0B";
  return "#EF4444";
}

/**
 * Vertical bar chart (histogram) showing the distribution of municipal poverty rates
 * across incidence buckets. Bar colors reflect tier thresholds.
 */
export function DistributionHistogram({
  records,
}: DistributionHistogramProps) {
  const data: BucketDatum[] = BUCKETS.map((bucket) => {
    const count = records.filter((r) => {
      const pct = r.poverty_incidence_pct ?? -1;
      return pct >= bucket.min && pct < bucket.max;
    }).length;

    return {
      label: bucket.label,
      count,
      color: bucketColor(bucket.min),
    };
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3
        className="mb-4 text-lg font-semibold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Distribution of Municipal Poverty Rates
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_THEME.grid}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
            axisLine={{ stroke: CHART_THEME.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
            axisLine={{ stroke: CHART_THEME.grid }}
            tickLine={false}
            label={{
              value: "Count",
              angle: -90,
              position: "insideLeft",
              fill: CHART_THEME.axis,
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_THEME.tooltip.background,
              border: `1px solid ${CHART_THEME.tooltip.border}`,
              color: CHART_THEME.tooltip.text,
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value: number) => [value, "Municipalities"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#10B981" }} />
          Low (&lt;10%)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#F59E0B" }} />
          Medium (10\u201320%)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#EF4444" }} />
          High (&ge;20%)
        </span>
      </div>
    </div>
  );
}
