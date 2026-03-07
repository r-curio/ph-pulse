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
  let trendColor = "text-muted-foreground";
  let trendArrow = "";
  if (trendDirection === "up") {
    trendColor = "text-red-400";
    trendArrow = "\u2191";
  } else if (trendDirection === "down") {
    trendColor = "text-green-400";
    trendArrow = "\u2193";
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardDescription className="text-sm font-medium text-muted-foreground">
          {label}
        </CardDescription>
        <CardTitle className="text-3xl font-bold text-foreground">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trend && (
          <p className={`text-sm font-medium ${trendColor}`}>
            {trendArrow} {trend}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
