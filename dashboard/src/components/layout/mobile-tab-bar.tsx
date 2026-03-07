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

/**
 * Fixed bottom tab bar visible only on mobile (<768px).
 * Shows icon-only tabs for all 6 nav routes.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "flex md:hidden",
        "h-16 bg-[var(--sidebar)] border-t border-[var(--sidebar-border)]"
      )}
      aria-label="Mobile navigation"
    >
      {NAV_ROUTES.map((route) => {
        const Icon = ICON_MAP[route.icon];
        const isActive =
          route.path === "/"
            ? pathname === "/"
            : pathname.startsWith(route.path);

        return (
          <Link
            key={route.path}
            href={route.path}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1",
              "text-xs transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={route.label}
          >
            {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
            <span className="text-[10px] leading-none truncate max-w-[50px] text-center">
              {route.label.split(" ")[0]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
