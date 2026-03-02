import {
  fetchMunicipalMunicipalities,
  fetchMunicipalRegions,
  fetchMunicipalTopBottom,
} from "@/lib/api";
import { MunicipalDashboard } from "@/components/municipal/municipal-dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Municipal Poverty Estimates page.
 * Server Component that fetches initial data (2012, all regions)
 * and passes it to the client-side MunicipalDashboard.
 */
export default async function MunicipalPage() {
  const [regions, municipalitiesData, topBottomData] = await Promise.all([
    fetchMunicipalRegions(),
    fetchMunicipalMunicipalities({ year: 2012 }),
    fetchMunicipalTopBottom(2012),
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            PH-Pulse
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Municipal Poverty Estimates (2006–2012)
          </p>
          <Link
            href="/"
            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MunicipalDashboard
          regions={regions}
          initialRecords={municipalitiesData.records}
          initialTopBottom={topBottomData}
        />
      </main>
    </div>
  );
}
