"use client";

interface MunicipalFiltersProps {
  /** Available region names for the dropdown. */
  regions: string[];
  /** Available province names for the selected region. */
  provinces: string[];
  /** Currently selected region. */
  selectedRegion: string;
  /** Currently selected province. */
  selectedProvince: string;
  /** Currently selected year. */
  selectedYear: number;
  /** Callback when region changes. */
  onRegionChange: (region: string) => void;
  /** Callback when province changes. */
  onProvinceChange: (province: string) => void;
  /** Callback when year changes. */
  onYearChange: (year: number) => void;
}

const YEARS = [2012, 2009, 2006];

/**
 * Filter bar with cascading Region > Province > Year dropdowns.
 * Dark-themed with native selects for the municipal explorer.
 */
export function MunicipalFilters({
  regions,
  provinces,
  selectedRegion,
  selectedProvince,
  selectedYear,
  onRegionChange,
  onProvinceChange,
  onYearChange,
}: MunicipalFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="region-filter"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          Region
        </label>
        <select
          id="region-filter"
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="cursor-pointer rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="province-filter"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          Province
        </label>
        <select
          id="province-filter"
          value={selectedProvince}
          onChange={(e) => onProvinceChange(e.target.value)}
          disabled={!selectedRegion}
          className="cursor-pointer rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">All Provinces</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="year-filter"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          Year
        </label>
        <select
          id="year-filter"
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="cursor-pointer rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
