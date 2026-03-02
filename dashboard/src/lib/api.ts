import type {
  HistoricalPovertyResponse,
  MunicipalPovertyResponse,
  MunicipalTopBottomResponse,
  RegionalPovertyResponse,
} from "./types";

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

/**
 * Fetch distinct region names for municipal poverty data.
 */
export async function fetchMunicipalRegions(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/v1/poverty/municipal/regions`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch municipal regions: ${res.status}`);
  }
  return res.json() as Promise<string[]>;
}

/**
 * Fetch distinct provinces for a given region.
 */
export async function fetchMunicipalProvinces(
  region: string
): Promise<string[]> {
  const res = await fetch(
    `${API_URL}/api/v1/poverty/municipal/provinces?region=${encodeURIComponent(region)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch municipal provinces: ${res.status}`);
  }
  return res.json() as Promise<string[]>;
}

/**
 * Fetch municipal poverty records with optional filters.
 */
export async function fetchMunicipalMunicipalities(
  params: { region?: string; province?: string; year?: number } = {}
): Promise<MunicipalPovertyResponse> {
  const searchParams = new URLSearchParams();
  if (params.region) searchParams.set("region", params.region);
  if (params.province) searchParams.set("province", params.province);
  if (params.year) searchParams.set("year", String(params.year));

  const query = searchParams.toString();
  const url = query
    ? `${API_URL}/api/v1/poverty/municipal/municipalities?${query}`
    : `${API_URL}/api/v1/poverty/municipal/municipalities`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch municipalities: ${res.status}`);
  }
  return res.json() as Promise<MunicipalPovertyResponse>;
}

/**
 * Fetch top and bottom municipalities by poverty incidence.
 */
export async function fetchMunicipalTopBottom(
  year: number,
  params: { region?: string; province?: string; limit?: number } = {}
): Promise<MunicipalTopBottomResponse> {
  const searchParams = new URLSearchParams({ year: String(year) });
  if (params.region) searchParams.set("region", params.region);
  if (params.province) searchParams.set("province", params.province);
  if (params.limit) searchParams.set("limit", String(params.limit));

  const res = await fetch(
    `${API_URL}/api/v1/poverty/municipal/top-bottom?${searchParams.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch top/bottom municipalities: ${res.status}`);
  }
  return res.json() as Promise<MunicipalTopBottomResponse>;
}
