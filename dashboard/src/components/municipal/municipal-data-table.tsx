"use client";

import { useMemo, useState } from "react";
import type { MunicipalPovertyRecord } from "@/lib/types";
import { tierColor } from "@/lib/constants";

interface MunicipalDataTableProps {
  /** Municipal poverty records to display. */
  records: MunicipalPovertyRecord[];
}

type SortKey =
  | "municipality_city"
  | "poverty_incidence_pct"
  | "poverty_tier";
type SortDir = "asc" | "desc";
type TierFilter = "All" | "High" | "Medium" | "Low";

const ROWS_PER_PAGE = 25;

/** Color-coded badge for poverty tier, dark-theme styled. */
function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-muted-foreground">-</span>;

  const styles: Record<string, string> = {
    High: "bg-red-500/15 text-red-400",
    Medium: "bg-amber-500/15 text-amber-400",
    Low: "bg-green-500/15 text-green-400",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[tier] ?? "bg-muted text-muted-foreground"}`}
    >
      {tier}
    </span>
  );
}

/** Resolve aria-sort value for a column header. */
function ariaSort(
  currentKey: SortKey,
  columnKey: SortKey,
  dir: SortDir
): "ascending" | "descending" | "none" {
  if (currentKey !== columnKey) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

/**
 * Sortable data table for municipal poverty records.
 * Features: text search, tier filter toggles, inline spark bars,
 * column sorting, and pagination (25 rows per page).
 */
export function MunicipalDataTable({ records }: MunicipalDataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("poverty_incidence_pct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("All");
  const [page, setPage] = useState(0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  };

  const handleKeyDown = (key: SortKey, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSort(key);
    }
  };

  /** Filtered + sorted records. */
  const processed = useMemo(() => {
    let filtered = records;

    // Text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((r) =>
        r.municipality_city.toLowerCase().includes(q)
      );
    }

    // Tier filter
    if (tierFilter !== "All") {
      filtered = filtered.filter((r) => r.poverty_tier === tierFilter);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [records, search, tierFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / ROWS_PER_PAGE));
  const safePageIndex = Math.min(page, totalPages - 1);
  const pageSlice = processed.slice(
    safePageIndex * ROWS_PER_PAGE,
    (safePageIndex + 1) * ROWS_PER_PAGE
  );

  const arrow = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  const tierButtons: TierFilter[] = ["All", "High", "Medium", "Low"];

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Toolbar: search + tier toggles */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <input
          type="text"
          placeholder="Search municipality..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="flex-1 min-w-[200px] rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-1">
          {tierButtons.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => {
                setTierFilter(tier);
                setPage(0);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tierFilter === tier
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th
                className="cursor-pointer px-3 py-2.5 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={() => handleSort("municipality_city")}
                onKeyDown={(e) => handleKeyDown("municipality_city", e)}
                tabIndex={0}
                aria-sort={ariaSort(sortKey, "municipality_city", sortDir)}
              >
                Municipality{arrow("municipality_city")}
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-right hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={() => handleSort("poverty_incidence_pct")}
                onKeyDown={(e) =>
                  handleKeyDown("poverty_incidence_pct", e)
                }
                tabIndex={0}
                aria-sort={ariaSort(
                  sortKey,
                  "poverty_incidence_pct",
                  sortDir
                )}
              >
                Incidence (%){arrow("poverty_incidence_pct")}
              </th>
              <th className="px-3 py-2.5 text-right">SE</th>
              <th className="px-3 py-2.5 text-right">CoV</th>
              <th
                className="cursor-pointer px-3 py-2.5 text-center hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={() => handleSort("poverty_tier")}
                onKeyDown={(e) => handleKeyDown("poverty_tier", e)}
                tabIndex={0}
                aria-sort={ariaSort(sortKey, "poverty_tier", sortDir)}
              >
                Tier{arrow("poverty_tier")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageSlice.map((r) => {
              const incidence = r.poverty_incidence_pct ?? 0;
              const barWidth = Math.min(incidence, 100);
              const barColor = tierColor(r.poverty_tier);

              return (
                <tr
                  key={`${r.pcode}-${r.year}`}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {r.municipality_city}
                  </td>
                  <td className="relative px-3 py-2 text-right text-foreground">
                    {/* Inline spark bar */}
                    <span
                      className="absolute inset-0 rounded-sm"
                      style={{
                        background: `linear-gradient(to right, ${barColor}, transparent)`,
                        width: `${barWidth}%`,
                        opacity: 0.2,
                      }}
                    />
                    <span className="relative">
                      {r.poverty_incidence_pct?.toFixed(2) ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {r.standard_error?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {r.coefficient_of_variation?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <TierBadge tier={r.poverty_tier} />
                  </td>
                </tr>
              );
            })}
            {processed.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No records found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {processed.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {safePageIndex * ROWS_PER_PAGE + 1}\u2013
            {Math.min(
              (safePageIndex + 1) * ROWS_PER_PAGE,
              processed.length
            )}{" "}
            of {processed.length} records
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePageIndex === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/80"
            >
              Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page {safePageIndex + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={safePageIndex >= totalPages - 1}
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/80"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
