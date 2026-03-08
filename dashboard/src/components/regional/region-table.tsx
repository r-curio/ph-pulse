"use client";

import { useState, useMemo } from "react";
import type { RegionalPovertyRecord } from "@/lib/types";
import { tierColor } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RegionTableProps {
  records: RegionalPovertyRecord[];
  selectedRegion: string | null;
  onSelect: (geo_name: string) => void;
}

type SortKey = "geo_name" | "poverty_incidence_pct" | "poverty_incidence_change" | "poverty_tier";
type SortDir = "asc" | "desc";

/**
 * Sortable table of regional poverty data. Clicking a row selects the region.
 * Column headers toggle sort direction on click.
 */
export function RegionTable({ records, selectedRegion, onSelect }: RegionTableProps) {
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

  const sorted = useMemo(() => {
    const list = records.slice();
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "geo_name":
          cmp = a.geo_name.localeCompare(b.geo_name);
          break;
        case "poverty_incidence_pct":
          cmp = (a.poverty_incidence_pct ?? 0) - (b.poverty_incidence_pct ?? 0);
          break;
        case "poverty_incidence_change":
          cmp = (a.poverty_incidence_change ?? 0) - (b.poverty_incidence_change ?? 0);
          break;
        case "poverty_tier": {
          const tierOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          cmp = (tierOrder[a.poverty_tier ?? ""] ?? 0) - (tierOrder[b.poverty_tier ?? ""] ?? 0);
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [records, sortKey, sortDir]);

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground sticky top-0">
            <tr>
              <th
                className="px-3 py-2 text-left font-medium cursor-pointer select-none"
                onClick={() => handleSort("geo_name")}
              >
                Region{sortArrow("geo_name")}
              </th>
              <th
                className="px-3 py-2 text-right font-medium cursor-pointer select-none"
                onClick={() => handleSort("poverty_incidence_pct")}
              >
                Incidence %{sortArrow("poverty_incidence_pct")}
              </th>
              <th
                className="px-3 py-2 text-right font-medium cursor-pointer select-none"
                onClick={() => handleSort("poverty_incidence_change")}
              >
                Change{sortArrow("poverty_incidence_change")}
              </th>
              <th
                className="px-3 py-2 text-center font-medium cursor-pointer select-none"
                onClick={() => handleSort("poverty_tier")}
              >
                Tier{sortArrow("poverty_tier")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.geo_name}
                className={cn(
                  "border-t border-border cursor-pointer transition-colors hover:bg-muted/50",
                  selectedRegion === r.geo_name && "bg-muted"
                )}
                onClick={() => onSelect(r.geo_name)}
              >
                <td className="px-3 py-2 text-foreground">
                  {r.geo_name.replace(/ *\(.*\)/, "")}
                </td>
                <td className="px-3 py-2 text-right text-foreground tabular-nums">
                  {r.poverty_incidence_pct != null
                    ? `${r.poverty_incidence_pct.toFixed(1)}%`
                    : "N/A"}
                </td>
                <td className="px-3 py-2 text-right text-foreground tabular-nums">
                  {r.poverty_incidence_change != null
                    ? `${r.poverty_incidence_change > 0 ? "+" : ""}${r.poverty_incidence_change.toFixed(1)}pp`
                    : "-"}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.poverty_tier && (
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        color: tierColor(r.poverty_tier),
                        backgroundColor: `${tierColor(r.poverty_tier)}1A`,
                      }}
                    >
                      {r.poverty_tier}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
