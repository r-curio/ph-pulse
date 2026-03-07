import type {
  HistoricalPovertyRecord,
  RegionalPovertyRecord,
} from "./types";

/**
 * Merge national trend data from historical (1991-2015) + current (2021-2023) sources.
 * Returns records sorted ascending by year.
 */
export function mergeNationalTrendData(
  historical: HistoricalPovertyRecord[],
  current: RegionalPovertyRecord[]
): { year: number; poverty_incidence_pct: number | null }[] {
  const byYear = new Map<number, number | null>();

  for (const r of historical) {
    byYear.set(r.year, r.poverty_incidence_pct);
  }

  for (const r of current) {
    byYear.set(r.year, r.poverty_incidence_pct);
  }

  return Array.from(byYear.entries())
    .map(([year, poverty_incidence_pct]) => ({ year, poverty_incidence_pct }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Return Tailwind CSS classes for a poverty tier string.
 */
export function formatTier(tier: string | null): string {
  switch (tier) {
    case "High":
      return "text-red-500 bg-red-950/40";
    case "Medium":
      return "text-amber-500 bg-amber-950/40";
    case "Low":
      return "text-green-500 bg-green-950/40";
    default:
      return "text-muted-foreground bg-muted";
  }
}
