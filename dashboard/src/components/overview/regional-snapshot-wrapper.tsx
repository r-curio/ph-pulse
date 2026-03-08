"use client";

import { useRouter } from "next/navigation";
import { RegionalSnapshotChart } from "@/components/charts/regional-snapshot-chart";
import type { RegionalPovertyRecord } from "@/lib/types";

interface RegionalSnapshotWrapperProps {
  records: RegionalPovertyRecord[];
}

/**
 * Client wrapper around RegionalSnapshotChart that handles
 * navigation to /regional?region={name} on bar click.
 */
export function RegionalSnapshotWrapper({ records }: RegionalSnapshotWrapperProps) {
  const router = useRouter();

  return (
    <RegionalSnapshotChart
      records={records}
      onRegionClick={(region) => {
        router.push(`/regional?region=${encodeURIComponent(region)}`);
      }}
    />
  );
}
