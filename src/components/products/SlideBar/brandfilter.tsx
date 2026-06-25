import FilterSection from "./filtersection";
import FilterChip from "./filterchip";
import type { FilterState } from "./SlidebarFilter";

const BRANDS = ["Trek", "Giant", "Specialized", "Cannondale", "Bianchi"];

interface BrandFilterProps {
  filters: FilterState;
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

export default function BrandFilter({ filters, update }: BrandFilterProps) {
  const toggleBrand = (value: string) => {
    const current = filters.brands;
    update("brands", 
      current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value]
    );
  };

  return (
    <FilterSection title="Thương hiệu">
      <div className="flex flex-wrap gap-1.5">
        {BRANDS.map((b) => (
          <FilterChip 
            key={b} 
            label={b} 
            active={filters.brands.includes(b)} 
            onClick={() => toggleBrand(b)} 
            
          />
        ))}
      </div>
    </FilterSection>
  );
}