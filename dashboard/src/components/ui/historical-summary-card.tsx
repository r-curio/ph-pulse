import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface HistoricalSummaryCardProps {
  /** Short label displayed above the value. */
  label: string;
  /** Primary display value. */
  value: string;
  /** Description text below the value. */
  description: string;
  /** Optional trend text (e.g. "-5.2pp since 1991"). */
  trend?: string;
  /** Trend direction: "up" = poverty rose (bad), "down" = poverty fell (good). */
  trendDirection?: "up" | "down" | "neutral";
}

/**
 * Generic summary card for historical poverty metrics.
 * Displays a label, large value, description, and optional trend indicator.
 */
export function HistoricalSummaryCard({
  label,
  value,
  description,
  trend,
  trendDirection,
}: HistoricalSummaryCardProps) {
  let trendColor = "text-gray-500";
  let trendArrow = "";
  if (trendDirection === "up") {
    trendColor = "text-red-600";
    trendArrow = "\u2191";
  } else if (trendDirection === "down") {
    trendColor = "text-green-600";
    trendArrow = "\u2193";
  }

  return (
    <Card className="border-none bg-white text-gray-900 shadow">
      <CardHeader>
        <CardDescription className="text-sm font-medium text-gray-500">
          {label}
        </CardDescription>
        <CardTitle className="text-3xl font-bold text-gray-900">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trend && (
          <p className={`text-sm font-medium ${trendColor}`}>
            {trendArrow} {trend}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}
