"use client";

import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content with a 150ms fade-in animation on mount.
 * Uses tw-animate-css `animate-fade-in`.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("animate-fade-in", className)}>{children}</div>
  );
}
