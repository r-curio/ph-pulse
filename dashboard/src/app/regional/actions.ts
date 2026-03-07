"use server";

import { fetchRegionDetail, fetchHistoricalRegionDetail } from "@/lib/api";
import type {
  RegionalPovertyRecord,
  HistoricalPovertyRecord,
} from "@/lib/types";

/**
 * Map from current region names to historical region names.
 * The two datasets use different naming conventions.
 */
const HISTORICAL_NAME_MAP: Record<string, string> = {
  "Region I (Ilocos Region)": "Region I",
  "Region II (Cagayan Valley)": "Region II",
  "Region III (Central Luzon)": "Region III",
  "Region IV-A (CALABARZON)": "Region IV-A",
  "MIMAROPA Region": "Region IV-B",
  "Region V (Bicol Region)": "Region V",
  "Region VI (Western Visayas)": "Region VI",
  "Region VII (Central Visayas)": "Region VII",
  "Region VIII (Eastern Visayas)": "Region VIII",
  "Region IX (Zamboanga Peninsula)": "Region IX",
  "Region X (Northern Mindanao)": "Region X",
  "Region XI (Davao Region)": "Region XI",
  "Region XII (SOCCSKSARGEN)": "Region XII",
  "Region XIII (Caraga)": "Caraga",
  "Cordillera Administrative Region (CAR)": "CAR",
  "National Capital Region (NCR)": "NCR d/",
  "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)": "ARMM",
};

/**
 * Server action to fetch region detail and historical data.
 * Runs on the Next.js server so it can always reach the backend.
 */
export async function getRegionDetails(
  regionName: string
): Promise<{
  detail: RegionalPovertyRecord[];
  historical: HistoricalPovertyRecord[];
}> {
  const historicalName = HISTORICAL_NAME_MAP[regionName] ?? regionName;

  const [detailRes, historicalRecords] = await Promise.all([
    fetchRegionDetail(regionName),
    fetchHistoricalRegionDetail(historicalName)
      .then((res) => res.records)
      .catch(() => [] as HistoricalPovertyRecord[]),
  ]);

  return {
    detail: detailRes.records,
    historical: historicalRecords,
  };
}
