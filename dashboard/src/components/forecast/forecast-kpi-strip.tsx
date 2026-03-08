import { CompactKpiCard } from "@/components/ui/compact-kpi-card";
import { fetchForecastSummary } from "@/lib/api";

/**
 * Server component that fetches the 2026 forecast summary
 * and displays four KPI cards in a responsive grid.
 */
export async function ForecastKpiStrip() {
  const summary = await fetchForecastSummary();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CompactKpiCard
        label="Nat'l Avg 2026"
        value={`${summary.national_avg_2026.toFixed(1)}%`}
      />
      <CompactKpiCard
        label="Lowest Forecast"
        value={`${summary.best_region_pct.toFixed(1)}%`}
        trend={summary.best_region}
        trendDirection="down"
      />
      <CompactKpiCard
        label="Highest Forecast"
        value={`${summary.worst_region_pct.toFixed(1)}%`}
        trend={summary.worst_region}
        trendDirection="up"
      />
      <CompactKpiCard
        label="Model Fit (R\u00B2)"
        value={summary.avg_r_squared.toFixed(3)}
      />
    </div>
  );
}
