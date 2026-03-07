import { PageTransition } from "@/components/layout/page-transition";
import { PipelineDashboard } from "@/components/pipeline/pipeline-dashboard";

/**
 * Pipeline health status page.
 * Shows per-table BigQuery metadata: row counts, freshness, health.
 */
export default function PipelinePage() {
  return (
    <PageTransition className="px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Pipeline Status
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          BigQuery table health — row counts and data freshness across all
          pipeline layers.
        </p>
      </header>

      <PipelineDashboard />
    </PageTransition>
  );
}
