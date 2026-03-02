---
name: nextjs-dashboard
description: Use when building Next.js pages, creating React components, adding Recharts visualizations, writing TypeScript interfaces, or working with the App Router in the dashboard/ directory.
---

# Next.js Dashboard Conventions for PH-Pulse

## File Structure
```
dashboard/
├── app/
│   ├── layout.tsx          # Root layout with Tailwind
│   ├── page.tsx            # Regional overview table
│   ├── region/[code]/
│   │   └── page.tsx        # Regional detail with charts
│   ├── pipeline/
│   │   └── page.tsx        # Data freshness status
│   ├── chat/
│   │   └── page.tsx        # GenAI interface
│   └── api/
│       └── chat/route.ts   # Gemini API route
├── components/
│   ├── charts/             # Recharts wrappers
│   ├── tables/             # Data tables
│   └── ui/                 # Shared UI components
└── lib/
    ├── bigquery.ts         # Client singleton
    ├── types.ts            # TypeScript interfaces
    └── utils.ts            # Shared helpers
```

## Component Pattern
```tsx
// Server Component by default — only add "use client" for interactivity
import { getBigQueryClient } from "@/lib/bigquery";
import type { RegionalSummary } from "@/lib/types";

export default async function Page() {
  const bq = getBigQueryClient();
  const [rows] = await bq.query<RegionalSummary>(`
    SELECT * FROM \`ph_pulse.mart_regional_summary\`
    ORDER BY year DESC
  `);
  return <RegionalTable data={rows} />;
}
```

## Chart Pattern (Recharts)
```tsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function PovertyTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="poverty_incidence_pct" stroke="#ef4444" />
        <Line type="monotone" dataKey="predicted_poverty_pct" stroke="#ef4444" strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## Poverty Tier Color Map
- High → `text-red-500 bg-red-50`
- Medium → `text-amber-500 bg-amber-50`
- Low → `text-green-500 bg-green-50`

## Rules
- Server Components by default; "use client" only when needed (charts, forms, state)
- BigQuery client singleton in lib/bigquery.ts — never instantiate elsewhere
- Define interfaces for all BigQuery row shapes in lib/types.ts
- Use zod for API request validation
- No `any` — use `unknown` and narrow with type guards
