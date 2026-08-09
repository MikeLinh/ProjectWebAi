import React, { useState, useEffect } from "react";
import FilterSection from "./filtersection";
import FilterChip from "./filterchip";
import type { FilterState } from "./SlidebarFilter";

interface BrandFilterProps {
  filters: FilterState;
  // Hàm generic dùng để cập nhật một trường bất kỳ trong FilterState
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

export default function BrandFilter({ filters, update }: BrandFilterProps) {
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => res.json())
      .then((products: any[]) => {
        const uniqueBrands = [...new Set(products.map((p: any) => p.manufacturer?.manufacturerName).filter(Boolean))];
        setBrands(uniqueBrands);
      })
      .catch(err => {
        console.error("Lỗi lấy brand:", err);
        // Fallback
        setBrands(["Trek", "Giant", "Specialized", "Cannondale", "Bianchi"]);
      });
  }, []);
  // Hàm xử lý khi người dùng nhấn chọn/bỏ chọn một thương hiệu
  const toggleBrand = (value: string) => {
    const current = filters.brands || [];
    update("brands", 
      current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value]
    );
  };

  return (
    <FilterSection title="Thương hiệu">
      <div className="flex flex-wrap gap-1.5">
        {brands.map((b) => (
          <FilterChip 
            key={b} 
            label={b} 
            active={filters.brands?.includes(b) || false} 
            onClick={() => toggleBrand(b)} 
          />
        ))}
      </div>
    </FilterSection>
  );
}