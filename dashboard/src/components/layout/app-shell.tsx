import { Sidebar } from "./sidebar";
import { MobileTabBar } from "./mobile-tab-bar";

type PipelineHealth = "healthy" | "stale" | "error" | "unknown";

interface AppShellProps {
  children: React.ReactNode;
  pipelineHealth?: PipelineHealth;
}

/**
 * Root layout shell: persistent sidebar + scrollable main area + mobile tab bar.
 * Sidebar is 56px (icon-only) at 768–1280px and 240px at ≥1280px.
 */
export function AppShell({ children, pipelineHealth }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar pipelineHealth={pipelineHealth} />

      {/* Offset main content for sidebar width */}
      <main
        className={[
          "flex-1 overflow-y-auto",
          "md:pl-14 xl:pl-60",
          /* bottom padding on mobile for tab bar */
          "pb-16 md:pb-0",
        ].join(" ")}
      >
        {children}
      </main>

      <MobileTabBar />
    </div>
  );
}
