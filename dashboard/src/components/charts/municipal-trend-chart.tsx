"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { MunicipalPovertyRecord } from "@/lib/types";
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

interface MunicipalTrendChartProps {
  /** Records for top municipalities across all years (pre-grouped). */
  records: MunicipalPovertyRecord[];
  /** Maximum number of municipalities to show trend lines for. */
  maxLines?: number;
}

const LINE_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6"];

/**
 * Line chart showing poverty incidence trends for top municipalities (2006-2012).
 * Each municipality gets a unique colored line.
 */
export function MunicipalTrendChart({
  records,
  maxLines = 5,
}: MunicipalTrendChartProps) {
  /* Group records by municipality, take top N by highest 2012 incidence. */
  const byMunicipality = new Map<string, MunicipalPovertyRecord[]>();
  for (const r of records) {
    const key = r.municipality_city;
    if (!byMunicipality.has(key)) {
      byMunicipality.set(key, []);
    }
    byMunicipality.get(key)!.push(r);
  }

  /* Rank by latest year (2012) poverty incidence. */
  const ranked = [...byMunicipality.entries()]
    .map(([name, recs]) => {
      const latest = recs.find((r) => r.year === 2012);
      return { name, recs, incidence: latest?.poverty_incidence_pct ?? 0 };
    })
    .sort((a, b) => b.incidence - a.incidence)
    .slice(0, maxLines);

  const municipalityNames = ranked.map((r) => r.name);

  /* Build chart data: one object per year with a key for each municipality. */
  const years = [2006, 2009, 2012];
  const chartData = years.map((year) => {
    const point: Record<string, number | string> = { year };
    for (const { name, recs } of ranked) {
      const rec = recs.find((r) => r.year === year);
      point[name] = rec?.poverty_incidence_pct ?? 0;
    }
    return point;
  });

  const chartConfig = Object.fromEntries(
    municipalityNames.map((name, i) => [
      name,
      { label: name, color: LINE_COLORS[i % LINE_COLORS.length] },
    ])
  ) satisfies ChartConfig;

  return (
    <Card className="border-none bg-white text-gray-900 shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Poverty Trends — Top {maxLines} Municipalities (2006–2012)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-[300px] w-full"
        >
          <LineChart data={chartData} margin={{ left: 10, right: 20 }}>
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
            {municipalityNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                name={name}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
          {municipalityNames.map((name, i) => (
            <span key={name} className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 rounded"
                style={{
                  backgroundColor: LINE_COLORS[i % LINE_COLORS.length],
                }}
              />
              {name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
