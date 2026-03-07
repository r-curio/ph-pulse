import { ForecastStub } from "@/components/forecast/forecast-stub";
import { PageTransition } from "@/components/layout/page-transition";

/**
 * Poverty Forecast page — displays mock forecast chart
 * until scikit-learn ML integration is complete.
 */
export default function ForecastPage() {
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
          Projected national poverty incidence using linear regression models
        </p>
      </header>

      <ForecastStub />
    </PageTransition>
  );
}
