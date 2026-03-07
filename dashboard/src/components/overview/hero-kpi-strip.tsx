"use client";

import { CompactKpiCard } from "@/components/ui/compact-kpi-card";
import { useCountUp } from "@/hooks/use-count-up";

interface HeroKpiStripProps {
  /** Latest national poverty incidence (2023). */
  latestIncidence: number | null;
  /** Previous national poverty incidence (2021). */
  prevIncidence: number | null;
  /** Lowest poverty incidence value from the 1991-2023 merged data. */
  historicalLow: number | null;
  /** Data coverage span string, e.g. "1991-2023". */
  dataSpan: string;
}

/**
 * Hero KPI strip displaying 4 compact cards:
 * latest incidence, change vs previous, historical low, data coverage.
 */
export function HeroKpiStrip({
  latestIncidence,
  prevIncidence,
  historicalLow,
  dataSpan,
}: HeroKpiStripProps) {
  const animatedLatest = useCountUp(latestIncidence ?? 0);
  const animatedLow = useCountUp(historicalLow ?? 0);

  const diff =
    latestIncidence != null && prevIncidence != null
      ? latestIncidence - prevIncidence
      : null;

  const trendDirection: "up" | "down" | "neutral" | undefined =
    diff != null
      ? diff > 0
        ? "up"
        : diff < 0
          ? "down"
          : "neutral"
      : undefined;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CompactKpiCard
        label="Latest Incidence (2023)"
        value={
          latestIncidence != null
            ? `${animatedLatest.toFixed(1)}%`
            : "N/A"
        }
      />
      <CompactKpiCard
        label="Change vs 2021"
        value={
          diff != null
            ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)}pp`
            : "N/A"
        }
        trendDirection={trendDirection}
      />
      <CompactKpiCard
        label="Historical Low"
        value={
          historicalLow != null
            ? `${animatedLow.toFixed(1)}%`
            : "N/A"
        }
      />
      <CompactKpiCard
        label="Data Coverage"
        value={dataSpan}
      />
    </div>
  );
}
