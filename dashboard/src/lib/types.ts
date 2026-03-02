/** Single row from mart_regional_poverty_summary. */
export interface RegionalPovertyRecord {
  geo_level: string;
  geo_name: string;
  year: number;
  poverty_threshold_php: number | null;
  poverty_incidence_pct: number | null;
  coefficient_of_variation: number | null;
  standard_error: number | null;
  ci_lower: number | null;
  ci_upper: number | null;
  poverty_incidence_change: number | null;
  poverty_tier: string | null;
}

/** List response for regional poverty data. */
export interface RegionalPovertyResponse {
  count: number;
  records: RegionalPovertyRecord[];
}

/** Detail response for a single region across all years. */
export interface RegionDetailResponse {
  region: string;
  records: RegionalPovertyRecord[];
  latest_poverty_incidence_pct: number | null;
  latest_poverty_tier: string | null;
}
