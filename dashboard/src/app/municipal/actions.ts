"use server";

import {
  fetchMunicipalMunicipalities,
  fetchMunicipalTopBottom,
  fetchMunicipalTrend,
} from "@/lib/api";
import type {
  MunicipalPovertyResponse,
  MunicipalTopBottomResponse,
} from "@/lib/types";

/**
 * Server action to fetch filtered municipal data.
 * Runs on the Next.js server so it can always reach the backend.
 */
export async function getMunicipalData(
  region: string,
  year: number
): Promise<{
  municipalities: MunicipalPovertyResponse;
  topBottom: MunicipalTopBottomResponse;
}> {
  const [municipalities, topBottom] = await Promise.all([
    fetchMunicipalMunicipalities({ region: region || undefined, year }),
    fetchMunicipalTopBottom(year, { region: region || undefined }),
  ]);
  return { municipalities, topBottom };
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
