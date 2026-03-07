import { fetchRegionalPoverty, fetchNationalPoverty } from "@/lib/api";
import { PageTransition } from "@/components/layout/page-transition";
import { RegionalExplorerShell } from "@/components/regional/regional-explorer-shell";

export const dynamic = "force-dynamic";

/**
 * Regional Explorer page. Server component that fetches regional and national
 * poverty data, passing it to the client-side shell for interactive exploration.
 */
export default async function RegionalPage(props: {
  searchParams: Promise<{ region?: string }>;
}) {
  const searchParams = await props.searchParams;
  const [regionalData, nationalData] = await Promise.all([
    fetchRegionalPoverty(2023),
    fetchNationalPoverty(),
  ]);

  return (
    <PageTransition className="px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Regional Explorer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare poverty incidence across Philippine regions
        </p>
      </header>

      <RegionalExplorerShell
        records={regionalData.records}
        nationalRecords={nationalData.records}
        initialRegion={searchParams.region}
      />
    </PageTransition>
  );
}
