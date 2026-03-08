import {
  fetchHistoricalNationalPoverty,
  fetchNationalPoverty,
  fetchRegionalPoverty,
} from "@/lib/api";
import { mergeNationalTrendData } from "@/lib/data-utils";
import { PageTransition } from "@/components/layout/page-transition";
import { HeroKpiStrip } from "@/components/overview/hero-kpi-strip";
import { UnifiedTrendChart } from "@/components/charts/unified-trend-chart";
import { RegionalSnapshotWrapper } from "@/components/overview/regional-snapshot-wrapper";

export const dynamic = "force-dynamic";

/**
 * Overview page. Server component that fetches all poverty data
 * and passes it to client components for display.
 */
export default async function Home() {
  const [nationalData, regionalData, historicalNational] = await Promise.all([
    fetchNationalPoverty(),
    fetchRegionalPoverty(2023),
    fetchHistoricalNationalPoverty(),
  ]);

  const mergedTrend = mergeNationalTrendData(
    historicalNational.records,
    nationalData.records
  );

  const latest2023 = nationalData.records.find((r) => r.year === 2023);
  const latest2021 = nationalData.records.find((r) => r.year === 2021);

  const validValues = mergedTrend
    .map((d) => d.poverty_incidence_pct)
    .filter((v): v is number => v != null);
  const historicalLow = validValues.length > 0 ? Math.min(...validValues) : null;

  const years = mergedTrend.map((d) => d.year);
  const dataSpan =
    years.length > 0
      ? `${Math.min(...years)}\u2013${Math.max(...years)}`
      : "N/A";

  return (
    <PageTransition className="px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          PH-Pulse
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Philippine Poverty Incidence Dashboard
        </p>
      </header>

      <section className="mb-8">
        <HeroKpiStrip
          latestIncidence={latest2023?.poverty_incidence_pct ?? null}
          prevIncidence={latest2021?.poverty_incidence_pct ?? null}
          historicalLow={historicalLow}
          dataSpan={dataSpan}
        />
      </section>

      <section className="mb-8">
        <UnifiedTrendChart data={mergedTrend} />
      </section>

      <section>
        <RegionalSnapshotWrapper records={regionalData.records} />
      </section>
    </PageTransition>
  );
}
