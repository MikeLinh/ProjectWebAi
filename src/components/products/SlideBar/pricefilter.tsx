import FilterSection from "./filtersection";
import type { FilterState } from "./SlidebarFilter";
import { formatVND } from "../../utils/formatCurrency";

interface PriceFilterProps {
  filters: FilterState;
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

export default function PriceFilter({ filters, update }: PriceFilterProps) {
  return (
    <FilterSection title="Khoảng giá">
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            {formatVND(filters.priceMin)}
          </span>
          <span className="text-gray-300 text-xs">—</span>
          <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
            {formatVND(filters.priceMax)}
          </span>
        </div>

        <div>
          <p className="text-[14px] text-gray-400 font-medium uppercase tracking-wider mb-1">Giá tối thiểu</p>
          <input
            type="range" min="0" max="5000" step="100"
            value={filters.priceMin}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val <= filters.priceMax) update("priceMin", val);
            }}
            className="w-full accent-red-500 h-1 cursor-pointer"
          />
        </div>

        <div>
          <p className="text-[14px] text-gray-400 font-medium uppercase tracking-wider mb-1">Giá tối đa</p>
          <input
            type="range" min="0" max="5000" step="100"
            value={filters.priceMax}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= filters.priceMin) update("priceMax", val);
            }}
            className="w-full accent-red-500 h-1 cursor-pointer"
          />
        </div>
      </div>
    </FilterSection>
  );
}