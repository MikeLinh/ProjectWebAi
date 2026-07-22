// components/products/ProductListHeader.tsx
import type { SortOption } from "./mainproduct";

interface ProductListHeaderProps {
  sortedProductsLength: number; // Tổng số lượng sp khi sắp xếp
  startIndex: number; 
  PRODUCTS_PER_PAGE: number; //SL sản phẩm hiển thị
  sortBy: SortOption; //Sắp xếp
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; //Hàm xử lý chọn sắp xếp
}

export default function ProductListHeader({
  sortedProductsLength,
  startIndex,
  PRODUCTS_PER_PAGE,
  sortBy,
  onSortChange,
}: ProductListHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tất cả sản phẩm</h2>
        <p className="text-sm text-gray-500 mt-1">
          {sortedProductsLength === 0
            ? "Không có sản phẩm nào"
            : `Hiển thị ${startIndex + 1}–${Math.min(startIndex + PRODUCTS_PER_PAGE, sortedProductsLength)} / ${sortedProductsLength} sản phẩm`}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-gray-500">Sắp xếp:</span>
        <select
          value={sortBy}
          onChange={onSortChange}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-400 cursor-pointer"
        >
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
        </select>
      </div>
    </div>
  );
}