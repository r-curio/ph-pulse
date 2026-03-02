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

/** Single row from mart_poverty_families_5yr_summary. */
export interface HistoricalPovertyRecord {
  geo_level: string;
  geo_name: string;
  year: number;
  poverty_threshold_php: number | null;
  poverty_incidence_pct: number | null;
  coefficient_of_variation: number | null;
  magnitude_poor_families: number | null;
  poverty_incidence_change: number | null;
  magnitude_change: number | null;
  poverty_tier: string | null;
}

/** List response for historical poverty data. */
export interface HistoricalPovertyResponse {
  count: number;
  records: HistoricalPovertyRecord[];
}

/** Single row from mart_municipal_poverty_summary. */
export interface MunicipalPovertyRecord {
  pcode: string;
  region: string;
  province: string;
  municipality_city: string;
  year: number;
  is_preliminary: boolean | null;
  poverty_incidence_pct: number | null;
  standard_error: number | null;
  coefficient_of_variation: number | null;
  ci_90_lower: number | null;
  ci_90_upper: number | null;
  poverty_incidence_change: number | null;
  poverty_tier: string | null;
}

/** List response for municipal poverty data. */
export interface MunicipalPovertyResponse {
  count: number;
  records: MunicipalPovertyRecord[];
}

/** Response for top/bottom municipalities by poverty incidence. */
export interface MunicipalTopBottomResponse {
  year: number;
  top: MunicipalPovertyRecord[];
  bottom: MunicipalPovertyRecord[];
}
