/**
 * Shared design-system constants for PH-Pulse dashboard.
 * Use these instead of inline strings so tier colours stay in sync
 * across charts, tables, and badges.
 */

/** Hex colour values for each poverty tier (compatible with Recharts). */
export const TIER_COLORS: Record<string, string> = {
  High: "#EF4444",
  Medium: "#F59E0B",
  Low: "#10B981",
  Unknown: "#6B7280",
} as const;

/**
 * Return the hex colour for a poverty tier string.
 * Falls back to grey for null / unknown values.
 */
export function tierColor(tier: string | null | undefined): string {
  if (!tier) return TIER_COLORS.Unknown;
  return TIER_COLORS[tier] ?? TIER_COLORS.Unknown;
}

/** Top-level navigation routes used by Sidebar and MobileTabBar. */
export interface NavRoute {
  path: string;
  label: string;
  /** Lucide icon name (string, looked up at runtime). */
  icon: string;
}

export const NAV_ROUTES: NavRoute[] = [
  { path: "/", label: "Overview", icon: "LayoutDashboard" },
  { path: "/regional", label: "Regional Explorer", icon: "Map" },
  { path: "/municipal", label: "Municipal Explorer", icon: "MapPin" },
  { path: "/forecast", label: "Forecast", icon: "TrendingUp" },
  { path: "/chat", label: "AI Chat", icon: "MessageSquare" },
  { path: "/pipeline", label: "Pipeline", icon: "Database" },
] as const;

/** Animation timing constants (milliseconds). */
export const ANIMATION = {
  /** Standard page fade-in duration. */
  PAGE_TRANSITION_MS: 150,
  /** Count-up animation duration for hero KPI numbers. */
  COUNT_UP_MS: 600,
  /** Detail panel slide-in duration. */
  PANEL_SLIDE_MS: 200,
} as const;

/** Chart axis / grid colours optimised for the dark navy background. */
export const CHART_THEME = {
  grid: "rgba(255,255,255,0.06)",
  axis: "#8899AA",
  tooltip: {
    background: "#1A2235",
    border: "rgba(255,255,255,0.08)",
    text: "#F0F4F8",
  },
} as const;
