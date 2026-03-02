"use client";

import { useMemo, useState } from "react";
import type { MunicipalPovertyRecord } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MunicipalDataTableProps {
  /** Municipal poverty records to display. */
  records: MunicipalPovertyRecord[];
}

type SortKey = "municipality_city" | "province" | "poverty_incidence_pct" | "poverty_tier";
type SortDir = "asc" | "desc";

/** Color-coded badge for poverty tier. */
function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-gray-400">-</span>;

  const styles: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[tier] ?? "bg-gray-100 text-gray-600"}`}
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
 * Sortable data table displaying municipal poverty records.
 * Supports column sorting with arrow indicators and keyboard navigation.
 */
export function MunicipalDataTable({ records }: MunicipalDataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("poverty_incidence_pct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleKeyDown = (key: SortKey, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSort(key);
    }
  };

  const sorted = useMemo(
    () =>
      [...records].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      }),
    [records, sortKey, sortDir]
  );

  const arrow = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  return (
    <Card className="border-none bg-white text-gray-900 shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Municipal Poverty Data ({records.length} records)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th
                  className="cursor-pointer px-3 py-2 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => handleSort("municipality_city")}
                  onKeyDown={(e) => handleKeyDown("municipality_city", e)}
                  tabIndex={0}
                  aria-sort={ariaSort(sortKey, "municipality_city", sortDir)}
                >
                  Municipality{arrow("municipality_city")}
                </th>
                <th
                  className="cursor-pointer px-3 py-2 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => handleSort("province")}
                  onKeyDown={(e) => handleKeyDown("province", e)}
                  tabIndex={0}
                  aria-sort={ariaSort(sortKey, "province", sortDir)}
                >
                  Province{arrow("province")}
                </th>
                <th
                  className="cursor-pointer px-3 py-2 text-right hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => handleSort("poverty_incidence_pct")}
                  onKeyDown={(e) => handleKeyDown("poverty_incidence_pct", e)}
                  tabIndex={0}
                  aria-sort={ariaSort(sortKey, "poverty_incidence_pct", sortDir)}
                >
                  Incidence (%){arrow("poverty_incidence_pct")}
                </th>
                <th className="px-3 py-2 text-right">SE</th>
                <th className="px-3 py-2 text-right">CoV</th>
                <th
                  className="cursor-pointer px-3 py-2 text-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => handleSort("poverty_tier")}
                  onKeyDown={(e) => handleKeyDown("poverty_tier", e)}
                  tabIndex={0}
                  aria-sort={ariaSort(sortKey, "poverty_tier", sortDir)}
                >
                  Tier{arrow("poverty_tier")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((r) => (
                <tr key={`${r.pcode}-${r.year}`} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">
                    {r.municipality_city}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{r.province}</td>
                  <td className="px-3 py-2 text-right">
                    {r.poverty_incidence_pct?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    {r.standard_error?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    {r.coefficient_of_variation?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <TierBadge tier={r.poverty_tier} />
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-gray-400"
                  >
                    No records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
