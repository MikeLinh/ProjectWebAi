import ProductCard from "../productcard";


interface ProductGridProps {
  currentProducts: any[];
  loading: boolean;
}

export default function ProductGrid({ currentProducts, loading }: ProductGridProps) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="w-full h-52 bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-5 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (currentProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-200 rounded-2xl gap-3">
        <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-400 font-medium">Không tìm thấy sản phẩm nào</p>
        <p className="text-gray-300 text-sm">Thử thay đổi hoặc xóa bớt tiêu chí lọc</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {currentProducts.map((product) => {
        const imageName = product.imageUrl ? product.imageUrl.trim() : "bike1.png";
        const finalImage = new URL(`../../../assets/images/${imageName}`, import.meta.url).href;
        return (
          <ProductCard
            key={product.productId}
            product={{
              id: product.productId,
              name: product.productName,
              price: product.price,
              image: finalImage,
              rating: 5,
              reviewCount: product.reviewCount || 0,
              discount: 0,
              originalPrice: product.price,
              category: product.category?.categoryName || "Bicycles",
              inStock: product.stockQuantity,
              description: product.description,
              brand: product.brand,
            }}
          />
        );
      })}
    </div>
  );
}