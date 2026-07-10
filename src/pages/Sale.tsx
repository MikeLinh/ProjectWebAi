import React, { useState, useEffect } from "react";
import ProductCard from "../components/products/productcard"; 
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";

import bg from "../assets/images/background.png";

interface Product {
  productId: number;
  productName: string;
  brand: string;
  price: number;
  imageUrl: string;
  discountPercent: number;
  stockQuantity: number;
  description?: string;
  reviewCount: number;
}

export default function Sale() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/products?sale=true")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu");
        return res.json();
      })
      .then((data) => {
        const filtered = data
          .filter((p: Product) => p.discountPercent && p.discountPercent > 15)
          .sort((a: Product, b: Product) => b.discountPercent - a.discountPercent)
          .slice(0, 5);

        setSaleProducts(filtered);
      })
      .catch((err) => {
        console.error("Lỗi tải khuyến mãi:", err);
        setSaleProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return "/assets/images/bike1.png";
    if (imageUrl.startsWith("http")) return imageUrl;
    return new URL(`../assets/images/${imageUrl.trim()}`, import.meta.url).href;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 z-0"
        style={{ backgroundImage: `url(${bg})` }}
      />

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-3 rounded-3xl mb-6 shadow-xl">
            <span className="text-4xl">🔥</span>
            <span className="font-bold uppercase tracking-[4px] text-xl">SUPER SALE</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Giảm Giá Mạnh Nhất</h1>
          <p className="text-2xl text-gray-600">Top 5 sản phẩm giảm trên 20% - Số lượng có hạn</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
          </div>
        ) : saleProducts.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-3xl text-gray-400">Hiện không có sản phẩm giảm trên 20%</p>
            <p className="mt-6 text-gray-500">Bạn có thể xem tất cả sản phẩm khác <a href="/products" className="text-red-600 underline">tại đây</a></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {saleProducts.map((product) => {
              const discountAmount = Math.round(product.price * (product.discountPercent / 100));
              const salePrice = product.price - discountAmount;

              return (
                <ProductCard
                  key={product.productId}
                  product={{
                    id: product.productId,
                    name: product.productName,
                    brand: product.brand,
                    price: salePrice,
                    originalPrice: product.price,
                    image: getImageUrl(product.imageUrl),
                    rating: 5,
                    reviewCount: product.reviewCount || 0,
                    discount: product.discountPercent,
                    category: "Khuyến mãi",
                    inStock: product.stockQuantity,
                    description: product.description,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}