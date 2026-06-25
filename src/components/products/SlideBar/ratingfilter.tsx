import FilterSection from "./filtersection";
import type { FilterState } from "./SlidebarFilter";

interface RatingFilterProps {
  filters: FilterState;
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

export default function RatingFilter({ filters, update }: RatingFilterProps) {
  return (
    <FilterSection title="Đánh giá">
      <div className="space-y-1.5">
        {[5, 4, 3].map((star) => (
          <button
            key={star}
            onClick={() => update("rating", filters.rating === star ? null : star)}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-all duration-200 border ${
              filters.rating === star ? "border-red-400 bg-red-50" : "border-transparent hover:border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-sm ${i < star ? "text-amber-400" : "text-gray-200"}`}>★</span>
              ))}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {star === 5 ? "5 sao" : `${star} sao trở lên`}
            </span>
          </button>
        ))}
      </div>
    </FilterSection>
  );
}