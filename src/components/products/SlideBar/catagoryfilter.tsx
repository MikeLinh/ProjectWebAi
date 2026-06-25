import FilterSection from "./filtersection";
import type { FilterState } from "./SlidebarFilter";

interface CategoryFilterProps {
  filters: FilterState;
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "Mountain Bike", label: "Xe đạp địa hình" },
  { value: "Road Bike", label: "Xe đạp đường trường" },
  { value: "Electric Bike", label: "Xe đạp điện" },
  { value: "Hybrid", label: "Xe đạp Hybrid" },
  { value: "City", label: "Xe đạp thành phố" },
];

export default function CategoryFilter({ filters, update }: CategoryFilterProps) {
  const toggleCategory = (value: string) => {
    const current = filters.categories;
    update("categories", 
      current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value]
    );
  };

  return (
    <FilterSection title="Danh mục">
      <ul className="space-y-0.5">
        {CATEGORIES.map((cat) => {
          const active = filters.categories.includes(cat.value);
          return (
            <li key={cat.value}>
              <label className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 transition-colors ${active ? "bg-red-50" : "hover:bg-gray-50"}`}>
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${active ? "bg-red-500 border-red-500" : "border-gray-300"}`}>
                  {active && (
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active}
                  onChange={() => toggleCategory(cat.value)}
                />
                <span className={`text-[15px] transition-colors ${active ? "text-red-600 font-medium" : "text-gray-600"}`}>
                  {cat.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </FilterSection>
  );
}