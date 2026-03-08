"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchPipelineStatus } from "@/lib/api";
import type { PipelineStatusResponse } from "@/lib/types";

/** Health badge colour map. */
const HEALTH_STYLES: Record<string, string> = {
  healthy: "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30",
  stale: "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30",
  error: "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30",
};

const HEALTH_DOT: Record<string, string> = {
  healthy: "bg-[#10B981]",
  stale: "bg-[#F59E0B]",
  error: "bg-[#EF4444]",
};

/** Layer badge styles. */
const LAYER_STYLES: Record<string, string> = {
  raw: "bg-muted text-muted-foreground",
  mart: "bg-primary/20 text-primary",
};

function HealthBadge({ health }: { health: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${HEALTH_STYLES[health] ?? HEALTH_STYLES.error}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${HEALTH_DOT[health] ?? "bg-gray-400"}`}
      />
      {health}
    </span>
  );
}

/** Format a date for display. */
function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Pipeline status dashboard. Displays per-table health, row counts, and freshness.
 * Auto-refreshes every 5 minutes.
 */
export function PipelineDashboard() {
  const [data, setData] = useState<PipelineStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await fetchPipelineStatus();
      setData(status);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pipeline status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => void load(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Overall health header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Overall Pipeline Health
          </p>
          {loading && !data ? (
            <p className="mt-1 text-2xl text-muted-foreground">Checking…</p>
          ) : data ? (
            <div className="mt-1 flex items-center gap-3">
              <p
                className="text-2xl font-bold text-foreground capitalize"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {data.overall_health}
              </p>
              <HealthBadge health={data.overall_health} />
            </div>
          ) : null}
          {error && (
            <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <p className="text-xs text-muted-foreground">
              Last checked: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          <button
            onClick={() => void load()}
            disabled={loading}
            className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Table status list */}
      {data && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              Table Status ({data.tables.length} tables monitored)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Table
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Layer
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Rows
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last Modified
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Health
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.tables.map((table) => (
                  <tr key={table.table_name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">
                        {table.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {table.table_name}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${LAYER_STYLES[table.layer] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {table.layer}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-foreground">
                      {table.row_count != null
                        ? table.row_count.toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(table.last_modified)}
                    </td>
                    <td className="px-5 py-3">
                      <HealthBadge health={table.health} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="rounded-lg border border-border bg-muted/30 px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Auto-refreshes every 5 minutes. Health thresholds: tables unmodified
          for &gt;30 days are marked <span className="text-[#F59E0B]">stale</span>;
          missing or empty tables are marked{" "}
          <span className="text-[#EF4444]">error</span>.
        </p>
      </div>
    </div>
  );
}

