import type { HistoricalPovertyResponse, RegionalPovertyResponse } from "./types";

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

/**
 * Fetch all historical regional poverty records, optionally filtered by year.
 */
export async function fetchHistoricalRegionalPoverty(
  year?: number
): Promise<HistoricalPovertyResponse> {
  const url = year
    ? `${API_URL}/api/v1/poverty/historical/regions?year=${year}`
    : `${API_URL}/api/v1/poverty/historical/regions`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch historical regional poverty: ${res.status}`);
  }
  return res.json() as Promise<HistoricalPovertyResponse>;
}

/**
 * Fetch national-level historical poverty data across all years.
 */
export async function fetchHistoricalNationalPoverty(): Promise<HistoricalPovertyResponse> {
  const res = await fetch(`${API_URL}/api/v1/poverty/historical/national`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch historical national poverty: ${res.status}`);
  }
  return res.json() as Promise<HistoricalPovertyResponse>;
}
