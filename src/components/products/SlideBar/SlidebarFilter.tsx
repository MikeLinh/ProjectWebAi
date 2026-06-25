import { useState, useEffect, useRef } from "react";
import CategoryFilter from "./catagoryfilter";
import BrandFilter from "./brandfilter";
import PriceFilter from "./pricefilter";
import SizeFilter from "./sizefilter";
import RatingFilter from "./ratingfilter";

export interface FilterState {
  categories: string[];
  brands: string[];
  priceMin: number;
  priceMax: number;
  sizes: string[];
  rating: number | null;
}

interface SidebarFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  brands: [],
  priceMin: 0,
  priceMax: 5000,
  sizes: [],
  rating: null,
};

export default function SidebarFilter({ onFilterChange }: SidebarFilterProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFilterChange(filters);
  }, [filters]);

  const activeCount =
    filters.categories.length +
    filters.brands.length +
    filters.sizes.length +
    (filters.rating !== null ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 5000 ? 1 : 0);

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <span className="text-sm font-bold text-gray-800">Bộ lọc</span>
          {activeCount > 0 && (
            <span className="text-[11px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="px-5">
        <CategoryFilter filters={filters} update={update} />
        <BrandFilter filters={filters} update={update} />
        <PriceFilter filters={filters} update={update} />
        <SizeFilter filters={filters} update={update} />
        <RatingFilter filters={filters} update={update} />
      </div>

      {activeCount > 0 && (
        <div className="px-5 py-4 border-t border-gray-100 mt-2">
          <button
            onClick={handleReset}
            className="w-full py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
          >
            Xóa bộ lọc ({activeCount})
          </button>
        </div>
      )}
    </div>
  );
}