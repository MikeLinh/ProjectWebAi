import { useState, type ReactNode } from "react";
 
// ─── Types ────────────────────────────────────────────────────────────────────
interface SidebarFilterProps {
  onFilterChange?: (filters: FilterState) => void;
}
interface FilterState {
  categories: string[];
  highlight: string;
  priceMax: number;
  priceRange: string;
  colors: number[];
  materials: string[];
  sizes: string[];
  brands: string[];
  rating: number | null;
}
 
// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-500 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between mb-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 uppercase tracking-wide">
          <span className="w-[3px] h-4 bg-red-500 rounded-full" />
          {title}
        </span>
        <span className="text-gray-400 text-lg leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
 
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs border rounded-md transition-colors ${
        active
          ? "border-red-500 text-red-500"
          : "border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-400"
      }`}
    >
      {label}
    </button>
  );
}
 
function StarRow({ count, selected, onClick }: { count: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 py-1 group"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-base transition-colors ${
            i < count
              ? "text-amber-400"
              : selected
              ? "text-gray-200"
              : "text-gray-200 group-hover:text-amber-300"
          }`}
        >
          ★
        </span>
      ))}
      <span className="text-xs text-gray-400 ml-1">({count >= 4 ? 10 : 0})</span>
    </button>
  );
}
 
// ─── Main Component ───────────────────────────────────────────────────────────
const COLORS = [
  "#1E40AF", "#F5F5DC", "#06B6D4", "#6B7280",
  "#15803D", "#93C5FD", "#7C3AED", "#DC2626", "#FACC15",
];
const CATEGORIES = [
  ["Tất cả sản phẩm", 20], ["Phụ kiện xe đạp", 13], ["Xe đạp", 7],
  ["Phụ kiện", 4], ["Bảo dưỡng & Dụng cụ", 6], ["Xe đạp địa hình", 8], ["Quần áo", 10],
] as const;
const BRANDS = ["Cartify", "EcomZone", "EcoShop", "MegaMart", "QuickCart", "SmartShop", "StyleHub"];
const BRAND_COUNT: Record<string, number> = {
  Cartify: 2, EcomZone: 2, EcoShop: 2, MegaMart: 2, QuickCart: 3, SmartShop: 1, StyleHub: 1,
};
const MATERIALS = ["Nhôm (4)", "Carbon (4)", "Thép (3)", "Titanium (3)"];
const SIZES = ["S (6)", "M (9)", "L (10)", "XL (3)"];
const PRICE_RANGES = ["Tất cả", "$220–$330", "$330–$440", "$440–$550", "$550+"];
const HIGHLIGHTS = ["Tất cả sản phẩm", "Best Seller", "Hàng mới", "Giảm giá", "Hot Items"];
 
export default function SidebarFilter({ onFilterChange }: SidebarFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [], highlight: "Tất cả sản phẩm", priceMax: 600,
    priceRange: "Tất cả", colors: [], materials: [], sizes: [], brands: [], rating: null,
  });
 
  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange?.(next);
  }
 
  function toggleArray(key: "materials" | "sizes" | "brands", val: string) {
    const arr = filters[key];
    update(key, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }
 
  function toggleColor(i: number) {
    const arr = filters.colors;
    update("colors", arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]);
  }
 
  return (
    <aside className="w-60 flex-shrink-0 bg-gray-200 border-r border-gray-100 px-4 py-2 min-h-screen">
 
      {/* Danh mục */}
      <Section title="Danh mục">
        <ul className="space-y-0.5">
          {CATEGORIES.map(([name, count]) => (
            <li key={name}>
              <button
                onClick={() => update("categories", [])}
                className={`w-full text-left text-sm px-1 py-1 rounded transition-colors ${
                  name === "Tất cả sản phẩm" && filters.categories.length === 0
                    ? "text-red-500 font-semibold"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                {name}{" "}
                <span className="text-gray-400 text-xs">({count})</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>
 
      {/* Nổi bật */}
      <Section title="Nổi bật">
        <ul className="space-y-0.5">
          {HIGHLIGHTS.map((h) => (
            <li key={h}>
              <button
                onClick={() => update("highlight", h)}
                className={`w-full text-left text-sm px-1 py-1 rounded transition-colors ${
                  filters.highlight === h
                    ? "text-red-500 font-semibold"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                {h}
              </button>
            </li>
          ))}
        </ul>
      </Section>
 
      {/* Khoảng giá */}
      <Section title="Khoảng giá">
        <input
          type="range" min={0} max={1000} step={10}
          value={filters.priceMax}
          onChange={(e) => update("priceMax", Number(e.target.value))}
          className="w-full accent-red-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 mb-3">
          <span>$0</span>
          <span className="text-red-500 font-medium">${filters.priceMax}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((r) => (
            <Chip key={r} label={r} active={filters.priceRange === r}
              onClick={() => update("priceRange", r)} />
          ))}
        </div>
      </Section>
 
      {/* Màu sắc */}
      <Section title="Màu sắc">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color, i) => (
            <button
              key={i} onClick={() => toggleColor(i)}
              style={{ backgroundColor: color }}
              className={`w-6 h-6 rounded-full transition-all border-2 ${
                filters.colors.includes(i)
                  ? "border-red-500 scale-110 shadow"
                  : "border-white shadow-sm hover:scale-105"
              } ${color === "#F5F5DC" ? "border-gray-200" : ""}`}
            />
          ))}
        </div>
      </Section>
 
      {/* Chất liệu */}
      <Section title="Chất liệu">
        <div className="flex flex-wrap gap-1.5">
          {MATERIALS.map((m) => (
            <Chip key={m} label={m} active={filters.materials.includes(m)}
              onClick={() => toggleArray("materials", m)} />
          ))}
        </div>
      </Section>
 
      {/* Kích thước */}
      <Section title="Kích thước">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <Chip key={s} label={s} active={filters.sizes.includes(s)}
              onClick={() => toggleArray("sizes", s)} />
          ))}
        </div>
      </Section>
 
      {/* Thương hiệu */}
      <Section title="Thương hiệu">
        <ul className="space-y-0.5">
          {BRANDS.map((b) => (
            <li key={b}>
              <label className="flex items-center gap-2 cursor-pointer group py-0.5">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(b)}
                  onChange={() => toggleArray("brands", b)}
                  className="accent-red-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-red-500 transition-colors">
                  {b} <span className="text-gray-400 text-xs">({BRAND_COUNT[b]})</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Section>
 
      {/* Đánh giá */}
      <Section title="Đánh giá">
        {[5, 4, 3, 2].map((n) => (
          <StarRow key={n} count={n}
            selected={filters.rating === n}
            onClick={() => update("rating", filters.rating === n ? null : n)} />
        ))}
      </Section>
 
    </aside>
  );
}