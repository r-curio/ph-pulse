import { fetchNationalPoverty, fetchRegionalPoverty } from "@/lib/api";
import { SummaryCard } from "@/components/ui/summary-card";
import { PovertyBarChart } from "@/components/charts/poverty-bar-chart";
import { PovertyTrendChart } from "@/components/charts/poverty-trend-chart";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [nationalData, regionalData] = await Promise.all([
    fetchNationalPoverty(),
    fetchRegionalPoverty(2023),
  ]);

  const nationalByYear = nationalData.records
    .slice()
    .sort((a, b) => a.year - b.year);

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
      </main>
    </div>
  );
}
