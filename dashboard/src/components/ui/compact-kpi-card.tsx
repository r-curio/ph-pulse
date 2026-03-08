import { cn } from "@/lib/utils";

interface CompactKpiCardProps {
  /** Short label displayed above the value. */
  label: string;
  /** Primary display value. */
  value: string;
  /** Optional trend text (e.g. "-2.8pp"). */
  trend?: string;
  /** Trend direction: "up" = poverty rose (bad), "down" = poverty fell (good). */
  trendDirection?: "up" | "down" | "neutral";
  /** Additional class names for the outer wrapper. */
  className?: string;
}

/**
 * Compact KPI card for the dashboard strip.
 * Vertically stacked: label (xs muted), value (lg bold heading), trend (xs colored).
 */
export function CompactKpiCard({
  label,
  value,
  trend,
  trendDirection,
  className,
}: CompactKpiCardProps) {
  let trendColor = "text-muted-foreground";
  let trendArrow = "";
  if (trendDirection === "up") {
    trendColor = "text-[#EF4444]";
    trendArrow = "\u2191 ";
  } else if (trendDirection === "down") {
    trendColor = "text-[#10B981]";
    trendArrow = "\u2193 ";
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-card border border-border px-4 py-3",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p
        className="truncate text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {value}
      </p>
      {trend && (
        <p className={cn("text-xs font-medium mt-0.5", trendColor)}>
          <span aria-hidden="true">{trendArrow}</span>
          {trend}
        </p>
      )}
    </div>
  );
}
