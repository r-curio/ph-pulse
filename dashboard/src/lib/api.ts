import type {
  ChatMessage,
  ChatSSEEvent,
  ForecastResponse,
  ForecastSummaryResponse,
  HistoricalPovertyResponse,
  HistoricalRegionDetailResponse,
  MunicipalPovertyResponse,
  MunicipalTopBottomResponse,
  PipelineStatusResponse,
  RegionDetailResponse,
  RegionalPovertyResponse,
} from "./types";

/** Server-side calls hit the backend directly; client-side calls use the
 *  Next.js rewrite proxy (relative URL) so the browser never reaches port 8000. */
const API_URL =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL ?? "http://127.0.0.1:8000")
    : "";

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
 * Fetch poverty data for a specific region across all years.
 */
export async function fetchRegionDetail(
  regionName: string
): Promise<RegionDetailResponse> {
  const res = await fetch(
    `${API_URL}/api/v1/poverty/regions/${encodeURIComponent(regionName)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch region detail: ${res.status}`);
  }
  return res.json() as Promise<RegionDetailResponse>;
}

/**
 * Fetch historical poverty data for a specific region across all years.
 */
export async function fetchHistoricalRegionDetail(
  regionName: string
): Promise<HistoricalRegionDetailResponse> {
  const res = await fetch(
    `${API_URL}/api/v1/poverty/historical/regions/${encodeURIComponent(regionName)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch historical region detail: ${res.status}`);
  }
  return res.json() as Promise<HistoricalRegionDetailResponse>;
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
    { cache: "no-store" }
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

/**
 * Fetch poverty trend for a single municipality across all years.
 */
export async function fetchMunicipalTrend(
  pcode: string
): Promise<MunicipalPovertyResponse> {
  const res = await fetch(
    `${API_URL}/api/v1/poverty/municipal/trend/${encodeURIComponent(pcode)}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch municipal trend: ${res.status}`);
  }
  return res.json() as Promise<MunicipalPovertyResponse>;
}

/**
 * Fetch overall pipeline health and per-table BigQuery metadata.
 */
export async function fetchPipelineStatus(): Promise<PipelineStatusResponse> {
  const res = await fetch(`${API_URL}/api/v1/pipeline/status`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch pipeline status: ${res.status}`);
  }
  return res.json() as Promise<PipelineStatusResponse>;
}

/**
 * Fetch all forecast records, optionally filtered by region and/or year.
 */
export async function fetchForecasts(
  region?: string,
  year?: number
): Promise<ForecastResponse> {
  const searchParams = new URLSearchParams();
  if (region) searchParams.set("region", region);
  if (year) searchParams.set("year", String(year));

  const query = searchParams.toString();
  const url = query
    ? `${API_URL}/api/v1/poverty/forecasts?${query}`
    : `${API_URL}/api/v1/poverty/forecasts`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch forecasts: ${res.status}`);
  }
  return res.json() as Promise<ForecastResponse>;
}

/**
 * Fetch KPI summary of 2026 forecast predictions.
 */
export async function fetchForecastSummary(): Promise<ForecastSummaryResponse> {
  const res = await fetch(`${API_URL}/api/v1/poverty/forecasts/summary`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch forecast summary: ${res.status}`);
  }
  return res.json() as Promise<ForecastSummaryResponse>;
}

/**
 * Fetch distinct region names available in forecast data.
 */
export async function fetchForecastRegions(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/v1/poverty/forecasts/regions`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch forecast regions: ${res.status}`);
  }
  return res.json() as Promise<string[]>;
}
/**
 * Stream a chat response from the backend SSE endpoint.
 * Parses Server-Sent Events and invokes the callback for each parsed event.
 *
 * @param messages - Full conversation history to send.
 * @param onEvent - Callback invoked for each SSE event.
 * @param signal - Optional AbortSignal for cancellation.
 */
export async function streamChat(
  messages: ChatMessage[],
  onEvent: (event: ChatSSEEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "Unknown error");
    throw new Error(`Chat request failed (${res.status}): ${detail}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse complete SSE events (delimited by double newline)
      const parts = buffer.split("\n\n");
      // Keep the last (potentially incomplete) part in the buffer
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        if (!part.trim()) continue;

        let eventType = "message";
        let data = "";

        for (const line of part.split("\n")) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            data += (data ? "\n" : "") + line.slice(6);
          }
        }

        if (!data) continue;

        try {
          const parsed: Record<string, unknown> = JSON.parse(data);

          switch (eventType) {
            case "tool_call":
              if (typeof parsed.name === "string") {
                onEvent({ type: "tool_call", name: parsed.name });
              }
              break;
            case "token":
              if (typeof parsed.text === "string") {
                onEvent({ type: "token", text: parsed.text });
              }
              break;
            case "source":
              if (
                typeof parsed.table === "string" &&
                typeof parsed.description === "string"
              ) {
                onEvent({
                  type: "source",
                  table: parsed.table,
                  description: parsed.description,
                });
              }
              break;
            case "error":
              if (typeof parsed.message === "string") {
                onEvent({ type: "error", message: parsed.message });
              }
              break;
            case "done":
              onEvent({ type: "done" });
              break;
          }
        } catch {
          // Skip malformed JSON events
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
