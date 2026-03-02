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
 * Selecting a region fetches provinces; selecting "All" resets downstream.
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
          className="text-xs font-medium text-gray-500"
        >
          Region
        </label>
        <select
          id="region-filter"
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="text-xs font-medium text-gray-500"
        >
          Province
        </label>
        <select
          id="province-filter"
          value={selectedProvince}
          onChange={(e) => onProvinceChange(e.target.value)}
          disabled={!selectedRegion}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="text-xs font-medium text-gray-500"
        >
          Year
        </label>
        <select
          id="year-filter"
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
