import { ForecastKpiStrip } from "@/components/forecast/forecast-kpi-strip";
import { ForecastChart } from "@/components/forecast/forecast-chart";
import { ForecastTable } from "@/components/forecast/forecast-table";
import { PageTransition } from "@/components/layout/page-transition";
import { fetchForecasts, fetchForecastRegions } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Poverty Forecast page - displays KPI summary, interactive chart,
 * and sortable table of regional poverty forecasts (2024-2026).
 */
export default async function ForecastPage() {
  const [forecastData, regions] = await Promise.all([
    fetchForecasts(),
    fetchForecastRegions(),
  ]);

  return (
    <PageTransition>
      <header className="mb-6">
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Poverty Forecast
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Projected regional poverty incidence using linear regression models
          (2024-2026)
        </p>
      </header>

      <ForecastKpiStrip />

      <div className="mt-6">
        <ForecastChart records={forecastData.records} regions={regions} />
      </div>

      <div className="mt-6">
        <ForecastTable records={forecastData.records} />
      </div>
    </PageTransition>
  );
}
