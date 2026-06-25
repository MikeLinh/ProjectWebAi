import FilterSection from "./filtersection";
import FilterChip from "./filterchip";
import type { FilterState } from "./SlidebarFilter";

const SIZES = ["S", "M", "L", "XL"];

interface SizeFilterProps {
  filters: FilterState;
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

export default function SizeFilter({ filters, update }: SizeFilterProps) {
  const toggleSize = (value: string) => {
    const current = filters.sizes;
    update("sizes", 
      current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value]
    );
  };

  return (
    <FilterSection title="Kích thước">
      <div className="flex flex-wrap gap-1.5">
        {SIZES.map((s) => (
          <FilterChip 
            key={s} 
            label={s} 
            active={filters.sizes.includes(s)} 
            onClick={() => toggleSize(s)} 
          />
        ))}
      </div>
    </FilterSection>
  );
}