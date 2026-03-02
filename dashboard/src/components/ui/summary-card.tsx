import type { RegionalPovertyRecord } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SummaryCardProps {
  /** National poverty record for a single year. */
  record: RegionalPovertyRecord;
  /** Previous year's record to compute trend direction. */
  previousRecord?: RegionalPovertyRecord;
}

/**
 * Metric card showing national poverty rate for a single year
 * with a trend arrow comparing to the previous period.
 */
export function SummaryCard({ record, previousRecord }: SummaryCardProps) {
  const rate = record.poverty_incidence_pct;
  const prevRate = previousRecord?.poverty_incidence_pct;

  let trendArrow = "";
  let trendColor = "text-muted-foreground";
  let trendLabel = "";

  if (rate !== null && prevRate !== null && prevRate !== undefined) {
    const diff = rate - prevRate;
    if (diff > 0) {
      trendArrow = "\u2191";
      trendColor = "text-red-600";
      trendLabel = `+${diff.toFixed(1)}pp`;
    } else if (diff < 0) {
      trendArrow = "\u2193";
      trendColor = "text-green-600";
      trendLabel = `${diff.toFixed(1)}pp`;
    } else {
      trendArrow = "\u2192";
      trendLabel = "0.0pp";
    }
  }

  return (
    <Card className="border-none bg-white text-gray-900 shadow">
      <CardHeader>
        <CardDescription className="text-sm font-medium text-gray-500">
          {record.year}
        </CardDescription>
        <CardTitle className="text-3xl font-bold text-gray-900">
          {rate !== null ? `${rate}%` : "N/A"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trendLabel && (
          <p className={`text-sm font-medium ${trendColor}`}>
            {trendArrow} {trendLabel} vs {previousRecord?.year}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          National Poverty Incidence (Families)
        </p>
      </CardContent>
    </Card>
  );
}
