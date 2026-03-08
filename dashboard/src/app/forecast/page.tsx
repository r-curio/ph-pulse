import { ForecastKpiStrip } from "@/components/forecast/forecast-kpi-strip";
import { ForecastChart } from "@/components/forecast/forecast-chart";
import { ForecastTable } from "@/components/forecast/forecast-table";
import { PageTransition } from "@/components/layout/page-transition";
import { fetchForecasts, fetchForecastRegions } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ForecastPage() {
  const [forecastData, regions] = await Promise.all([
    fetchForecasts(),
    fetchForecastRegions(),
  ]);

  return (
    <PageTransition className="px-4 sm:px-6 lg:px-8 py-8">
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
