"use server";

import {
  fetchMunicipalMunicipalities,
  fetchMunicipalTrend,
} from "@/lib/api";
import type {
  MunicipalPovertyRecord,
  MunicipalPovertyResponse,
} from "@/lib/types";

/**
 * Server action to fetch municipal records filtered by region and year.
 * Runs on the Next.js server so it can always reach the backend.
 */
export async function getMunicipalRecords(
  region: string,
  year: number
): Promise<MunicipalPovertyRecord[]> {
  const result = await fetchMunicipalMunicipalities({
    region: region || undefined,
    year,
  });
  return result.records;
}

/**
 * Server action to fetch trend data for a list of municipality pcodes.
 * Runs on the Next.js server so it can always reach the backend.
 */
export async function getMunicipalTrends(
  pcodes: string[]
): Promise<MunicipalPovertyResponse[]> {
  return Promise.all(pcodes.map((pcode) => fetchMunicipalTrend(pcode)));
}
