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

/** Detail response for a single region's historical data across all years. */
export interface HistoricalRegionDetailResponse {
  region: string;
  records: HistoricalPovertyRecord[];
  earliest_poverty_incidence_pct: number | null;
  latest_poverty_incidence_pct: number | null;
  latest_poverty_tier: string | null;
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

/** Health status for a single BigQuery table in the pipeline. */
export interface TableStatus {
  table_name: string;
  display_name: string;
  layer: string;
  row_count: number | null;
  last_modified: string | null;
  health: "healthy" | "stale" | "error";
}

/** Overall pipeline health response from /api/v1/pipeline/status. */
export interface PipelineStatusResponse {
  overall_health: "healthy" | "stale" | "error";
  checked_at: string;
  tables: TableStatus[];
}

/** Single row from ml_poverty_forecasts. */
export interface ForecastRecord {
  region_name: string;
  year: number;
  predicted_poverty_pct: number;
  model_type: string;
  trained_on_years: string;
  r_squared: number;
}

/** List response for forecast data. */
export interface ForecastResponse {
  count: number;
  records: ForecastRecord[];
}

/** KPI summary from 2026 forecast predictions. */
export interface ForecastSummaryResponse {
  national_avg_2026: number;
  best_region: string;
  best_region_pct: number;
  worst_region: string;
  worst_region_pct: number;
  avg_r_squared: number;
  regions_count: number;
}

/** Single message in a chat conversation. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Data source citation returned alongside a chat answer. */
export interface SourceInfo {
  table: string;
  description: string;
}

/** SSE event types emitted by the /api/v1/chat/stream endpoint. */
export type ChatSSEEvent =
  | { type: "tool_call"; name: string }
  | { type: "token"; text: string }
  | { type: "source"; table: string; description: string }
  | { type: "error"; message: string }
  | { type: "done" };
