import {
  fetchMunicipalMunicipalities,
  fetchMunicipalRegions,
} from "@/lib/api";
import { MunicipalDashboard } from "@/components/municipal/municipal-dashboard";
import { PageTransition } from "@/components/layout/page-transition";

export const dynamic = "force-dynamic";

/**
 * Municipal Poverty Estimates page.
 * Server Component that fetches initial data (2012, all regions)
 * and passes it to the client-side MunicipalDashboard.
 */
export default async function MunicipalPage() {
  const [regions, municipalitiesData] = await Promise.all([
    fetchMunicipalRegions(),
    fetchMunicipalMunicipalities({ year: 2012 }),
  ]);

  return (
    <PageTransition className="px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Municipal Explorer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Municipal Poverty Estimates (2006–2012)
        </p>
      </header>

      <MunicipalDashboard
        regions={regions}
        initialRecords={municipalitiesData.records}
      />
    </PageTransition>
  );
}
