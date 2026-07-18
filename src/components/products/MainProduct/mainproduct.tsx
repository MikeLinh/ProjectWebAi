/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

import backgroundp from "../../../assets/images/backgroundproduct.png";
import SidebarFilter, { type FilterState } from "../SlideBar/SlidebarFilter.tsx";

import ProductBanner from "./productbanner.tsx";
import ProductListHeader from "./productlistheader.tsx";
import ProductGrid from "./productgrid.tsx";
import ProductPagination from "./productpagination.tsx";

interface DBProduct {
  productId: number;
  productName: string;
  manufacturer?: {
    manufacturerId: number;
    manufacturerName: string;
    country?: string;
    active?: boolean;
  };
  price: number;
  description: string;
  imageUrl: string;
  stockQuantity: number;
  category?: {
    categoryId: number;
    categoryName: string;
    description?: string;
  };
  reviewCount?: number;
}

export type SortOption = "newest" | "price-asc" | "price-desc";

const PRODUCTS_PER_PAGE = 6;

const INITIAL_FILTERS: FilterState = {
  categories: [],
  brands: [],
  priceMin: 0,
  priceMax: 5000,
  sizes: [],
  rating: null,
};

export default function MainProduct() {
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  function handleFilterChange(newFilters: FilterState) {
    console.log("Filter thay đổi:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
  }

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();

    if (filters.categories.length > 0) {
      params.append("categoryName", filters.categories.join(","));
    }
    if (filters.brands.length > 0) {
      filters.brands.forEach(b => params.append("brand", b));
    }
    if (filters.priceMin > 0) {
      params.append("minPrice", filters.priceMin.toString());
    }
    if (filters.priceMax < 5000) {
      params.append("maxPrice", filters.priceMax.toString());
    }

    const url = `http://localhost:8080/api/products${params.toString() ? `?${params.toString()}` : ""}`;

    console.log("Fetching URL:", url);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Số sản phẩm nhận được:", data.length, data.slice(0, 3)); 
        setDbProducts(data || []);
      })
      .catch((err) => {
        console.error("Lỗi API:", err);
        setDbProducts([]);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const sortedProducts = [...dbProducts].sort((a: any, b: any) => {
    if(sortBy === "newest"){
      const isNewA= a.isNew || a.new ? 1 : 0;
      const isNewB= b.isNew || b.new ? 1 : 0;

      if(isNewB === isNewA){
        return b.productId - a.productId;
      }
      return isNewB - isNewA;
    }
    if(sortBy === "price-asc") return a.price - b.price;
    if(sortBy === "price-desc") return b.price - a.price;
    return b.productId - a.productId;
  });

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
    setCurrentPage(1);
  };

  return (
    <div className="w-full mx-auto">
      <ProductBanner backgroundp={backgroundp} />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[280px] shrink-0">
            <SidebarFilter onFilterChange={handleFilterChange} />
          </div>

          <div className="flex-1 min-w-0">
            <ProductListHeader
              sortedProductsLength={sortedProducts.length}
              startIndex={startIndex}
              PRODUCTS_PER_PAGE={PRODUCTS_PER_PAGE}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            <ProductGrid currentProducts={currentProducts} loading={loading} />

            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}