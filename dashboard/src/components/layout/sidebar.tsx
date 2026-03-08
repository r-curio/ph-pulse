"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  MapPin,
  TrendingUp,
  MessageSquare,
  Database,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ROUTES } from "@/lib/constants";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Map,
  MapPin,
  TrendingUp,
  MessageSquare,
  Database,
};

type PipelineHealth = "healthy" | "stale" | "error" | "unknown";

interface SidebarProps {
  /** Overall pipeline health for the status dot at the bottom. */
  pipelineHealth?: PipelineHealth;
}

const healthDot: Record<PipelineHealth, string> = {
  healthy: "bg-[#10B981]",
  stale: "bg-[#F59E0B]",
  error: "bg-[#EF4444]",
  unknown: "bg-[#6B7280]",
};

/**
 * Persistent left sidebar navigation for the PH-Pulse dashboard.
 * 240px fixed on desktop (≥1280px), icon-only at 768–1280px, hidden <768px.
 */
export function Sidebar({ pipelineHealth = "unknown" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex-shrink-0",
        "hidden md:flex flex-col",
        "bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]",
        "w-14 xl:w-60 transition-[width] duration-200"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[var(--sidebar-border)] px-3 xl:px-5">
        <span
          className="hidden xl:block text-lg font-bold text-foreground tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          PH-Pulse
        </span>
        {/* Icon-only logo for collapsed state */}
        <span className="xl:hidden flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
          PH
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 xl:px-3">
        <ul className="space-y-1">
          {NAV_ROUTES.map((route) => {
            const Icon = ICON_MAP[route.icon];
            const isActive =
              route.path === "/"
                ? pathname === "/"
                : pathname.startsWith(route.path);

            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    "xl:border-l-2",
                    isActive
                      ? "bg-[var(--sidebar-accent)] text-foreground xl:border-primary"
                      : "text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-foreground xl:border-transparent"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {Icon && (
                    <Icon
                      className="h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className="hidden xl:block truncate">{route.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pipeline health dot */}
      <div className="border-t border-[var(--sidebar-border)] p-3 xl:p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 flex-shrink-0 rounded-full",
              healthDot[pipelineHealth]
            )}
            aria-label={`Pipeline: ${pipelineHealth}`}
          />
          <span className="hidden xl:block text-xs text-muted-foreground truncate">
            Pipeline:{" "}
            <span className="capitalize text-foreground">{pipelineHealth}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
