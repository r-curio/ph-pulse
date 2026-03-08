"use client";

import { useMemo, useState } from "react";
import type { ForecastRecord } from "@/lib/types";

interface ForecastTableProps {
  /** All forecast records (17 regions x 3 years = 51 rows). */
  records: ForecastRecord[];
}

interface PivotRow {
  region_name: string;
  y2024: number | null;
  y2025: number | null;
  y2026: number | null;
  r_squared: number;
}

type SortKey = "region_name" | "y2024" | "y2025" | "y2026" | "r_squared";
type SortDir = "asc" | "desc";

/**
 * Returns the appropriate text color class for an R-squared value.
 */
function rSquaredColor(value: number): string {
  if (value >= 0.7) return "text-[#10B981]";
  if (value >= 0.4) return "text-[#F59E0B]";
  return "text-[#EF4444]";
}

/**
 * Client component that pivots forecast records into a sortable table.
 * Displays 17 region rows with columns for 2024, 2025, 2026 predictions and R-squared.
 */
export function ForecastTable({ records }: ForecastTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("region_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const pivotRows: PivotRow[] = useMemo(() => {
    const regionMap = new Map<string, PivotRow>();

    for (const r of records) {
      if (!regionMap.has(r.region_name)) {
        regionMap.set(r.region_name, {
          region_name: r.region_name,
          y2024: null,
          y2025: null,
          y2026: null,
          r_squared: r.r_squared,
        });
      }
      const row = regionMap.get(r.region_name)!;
      if (r.year === 2024) row.y2024 = r.predicted_poverty_pct;
      else if (r.year === 2025) row.y2025 = r.predicted_poverty_pct;
      else if (r.year === 2026) row.y2026 = r.predicted_poverty_pct;
    }

    return Array.from(regionMap.values());
  }, [records]);

  const sortedRows = useMemo(() => {
    const sorted = [...pivotRows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const numA = aVal as number;
      const numB = bVal as number;
      return sortDir === "asc" ? numA - numB : numB - numA;
    });

    return sorted;
  }, [pivotRows, sortKey, sortDir]);

  /** Toggle sort on a column header click. */
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  /** Render sort indicator arrow. */
  function sortArrow(key: SortKey): string {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  }

  /** Return aria-sort value for a column. */
  function ariaSort(key: SortKey): "ascending" | "descending" | "none" {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  }

  /** Handle keyboard activation of sort headers. */
  function handleKeyDown(e: React.KeyboardEvent, key: SortKey) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSort(key);
    }
  }

  const headerClass =
    "cursor-pointer select-none px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Regional poverty forecast predictions (2024-2026)">
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                aria-sort={ariaSort("region_name")}
                tabIndex={0}
                className={headerClass}
                onClick={() => handleSort("region_name")}
                onKeyDown={(e) => handleKeyDown(e, "region_name")}
              >
                Region{sortArrow("region_name")}
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("y2024")}
                tabIndex={0}
                className={`${headerClass} text-right`}
                onClick={() => handleSort("y2024")}
                onKeyDown={(e) => handleKeyDown(e, "y2024")}
              >
                2024{sortArrow("y2024")}
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("y2025")}
                tabIndex={0}
                className={`${headerClass} text-right`}
                onClick={() => handleSort("y2025")}
                onKeyDown={(e) => handleKeyDown(e, "y2025")}
              >
                2025{sortArrow("y2025")}
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("y2026")}
                tabIndex={0}
                className={`${headerClass} text-right`}
                onClick={() => handleSort("y2026")}
                onKeyDown={(e) => handleKeyDown(e, "y2026")}
              >
                2026{sortArrow("y2026")}
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("r_squared")}
                tabIndex={0}
                className={`${headerClass} text-right`}
                onClick={() => handleSort("r_squared")}
                onKeyDown={(e) => handleKeyDown(e, "r_squared")}
              >
                R&sup2;{sortArrow("r_squared")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.region_name}
                className="border-b border-border last:border-b-0 hover:bg-accent/10 transition-colors"
              >
                <td className="px-4 py-2 text-foreground font-medium">
                  {row.region_name}
                </td>
                <td className="px-4 py-2 text-right text-foreground tabular-nums">
                  {row.y2024 !== null ? `${row.y2024.toFixed(1)}%` : "-"}
                </td>
                <td className="px-4 py-2 text-right text-foreground tabular-nums">
                  {row.y2025 !== null ? `${row.y2025.toFixed(1)}%` : "-"}
                </td>
                <td className="px-4 py-2 text-right text-foreground tabular-nums">
                  {row.y2026 !== null ? `${row.y2026.toFixed(1)}%` : "-"}
                </td>
                <td
                  className={`px-4 py-2 text-right font-semibold tabular-nums ${rSquaredColor(row.r_squared)}`}
                >
                  {row.r_squared.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
