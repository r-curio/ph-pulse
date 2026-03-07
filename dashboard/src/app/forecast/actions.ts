"use server";

import { fetchRegionDetail } from "@/lib/api";

/** Actual poverty data point for a single year. */
interface ActualDataPoint {
  year: number;
  poverty_incidence_pct: number | null;
}

/**
 * Server action to fetch historical actual poverty data for a region.
 * Returns year + poverty_incidence_pct pairs sorted by year.
 */
export async function getRegionActuals(
  regionName: string
): Promise<ActualDataPoint[]> {
  try {
    const detail = await fetchRegionDetail(regionName);
    return detail.records
      .map((r) => ({
        year: r.year,
        poverty_incidence_pct: r.poverty_incidence_pct,
      }))
      .sort((a, b) => a.year - b.year);
  } catch {
    return [];
  }
}
