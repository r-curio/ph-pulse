import {
  fetchHistoricalNationalPoverty,
  fetchHistoricalRegionalPoverty,
  fetchNationalPoverty,
  fetchRegionalPoverty,
} from "@/lib/api";
import { SummaryCard } from "@/components/ui/summary-card";
import { HistoricalSummaryCard } from "@/components/ui/historical-summary-card";
import { PovertyBarChart } from "@/components/charts/poverty-bar-chart";
import { PovertyTrendChart } from "@/components/charts/poverty-trend-chart";
import { HistoricalTrendChart } from "@/components/charts/historical-trend-chart";
import { HistoricalBarChart } from "@/components/charts/historical-bar-chart";
import { MagnitudeChart } from "@/components/charts/magnitude-chart";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [nationalData, regionalData, historicalNational, historicalRegional] =
    await Promise.all([
      fetchNationalPoverty(),
      fetchRegionalPoverty(2023),
      fetchHistoricalNationalPoverty(),
      fetchHistoricalRegionalPoverty(2015),
    ]);

  const nationalByYear = nationalData.records
    .slice()
    .sort((a, b) => a.year - b.year);

  const historicalNationalByYear = historicalNational.records
    .slice()
    .sort((a, b) => a.year - b.year);

  const earliest = historicalNationalByYear[0];
  const latest = historicalNationalByYear[historicalNationalByYear.length - 1];

  const incidenceDiff =
    latest?.poverty_incidence_pct != null &&
    earliest?.poverty_incidence_pct != null
      ? latest.poverty_incidence_pct - earliest.poverty_incidence_pct
      : null;

  const latestMagnitude = latest?.magnitude_poor_families;
  const latestThreshold = latest?.poverty_threshold_php;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            PH-Pulse
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Philippine Poverty Incidence Dashboard
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {nationalByYear.map((record, i) => (
            <SummaryCard
              key={record.year}
              record={record}
              previousRecord={i > 0 ? nationalByYear[i - 1] : undefined}
            />
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <PovertyTrendChart records={nationalByYear} />
          <PovertyBarChart records={regionalData.records} />
        </section>

        {/* Historical Section Divider */}
        <div className="my-12 border-t border-gray-300" />
        <h2 className="mb-6 text-xl font-bold tracking-tight text-gray-900">
          Historical Poverty Trends (1991–2015)
        </h2>

        {/* Historical Summary Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HistoricalSummaryCard
            label="Poverty Incidence (2015)"
            value={
              latest?.poverty_incidence_pct != null
                ? `${latest.poverty_incidence_pct}%`
                : "N/A"
            }
            description="National Poverty Incidence (Families)"
            trend={
              incidenceDiff !== null
                ? `${incidenceDiff > 0 ? "+" : ""}${incidenceDiff.toFixed(1)}pp since ${earliest?.year}`
                : undefined
            }
            trendDirection={
              incidenceDiff !== null
                ? incidenceDiff > 0
                  ? "up"
                  : incidenceDiff < 0
                    ? "down"
                    : "neutral"
                : undefined
            }
          />
          <HistoricalSummaryCard
            label="Poor Families (2015)"
            value={
              latestMagnitude != null
                ? Number(latestMagnitude).toLocaleString()
                : "N/A"
            }
            description="Magnitude of Poor Families"
          />
          <HistoricalSummaryCard
            label="Poverty Threshold (2015)"
            value={
              latestThreshold != null
                ? `${Number(latestThreshold).toLocaleString()} PHP`
                : "N/A"
            }
            description="Annual Per Capita Poverty Threshold"
          />
        </section>

        {/* Historical Charts */}
        <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <HistoricalTrendChart records={historicalNationalByYear} />
          <HistoricalBarChart records={historicalRegional.records} />
        </section>

        {/* Magnitude Chart — Full Width */}
        <section>
          <MagnitudeChart records={historicalRegional.records} />
        </section>
      </main>
    </div>
  );
}
