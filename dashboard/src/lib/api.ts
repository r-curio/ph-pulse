import type { RegionalPovertyResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Fetch all regional poverty records, optionally filtered by year.
 */
export async function fetchRegionalPoverty(
  year?: number
): Promise<RegionalPovertyResponse> {
  const url = year
    ? `${API_URL}/api/v1/poverty/regions?year=${year}`
    : `${API_URL}/api/v1/poverty/regions`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch regional poverty: ${res.status}`);
  }
  return res.json() as Promise<RegionalPovertyResponse>;
}

/**
 * Fetch national-level poverty data across all years.
 */
export async function fetchNationalPoverty(): Promise<RegionalPovertyResponse> {
  const res = await fetch(`${API_URL}/api/v1/poverty/national`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch national poverty: ${res.status}`);
  }
  return res.json() as Promise<RegionalPovertyResponse>;
}
