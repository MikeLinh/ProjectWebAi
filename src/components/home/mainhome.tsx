import React, { useState, useEffect } from "react";
import bike1 from "../../assets/images/bike1.png";
import card1 from "../../assets/images/card1.png";
import card2 from "../../assets/images/card2.png";
import card3 from "../../assets/images/card3.png";
import ProductCard from "../products/productcard"; 
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface DBProduct {
  productId: number;
  productName: string;
  manufacturer?: string;
  price: number;
  description: string;
  imageUrl: string;
  stockQuantity: number;
  category?: {
    categoryId: number;
    categoryName: string;
  };
  discount: number;
  isNew?: boolean;
  discountPercent?: number;
  new?: boolean;
  reviewCount: number;
  
}

export default function MainHome() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const newProducts = data.filter((product: { isNew: boolean; new: boolean; }) => product.isNew === true || product.new === true);
        newProducts.sort((a: { productId: number; }, b: { productId: number; }) => b.productId - a.productId);
        setProducts(newProducts.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch sản phẩm mới nhất:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto my-10 px-4">
      <div className="max-w-6xl mx-auto my-10 flex items-center justify-between gap-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 space-y-6"
        >
          <h2 className="text-gray-900 font-bold text-xl">
            Ride Your <span className="text-blue-500">Dream Bike</span>
          </h2>
          <p className="text-gray-700 font-normal text-[16px]">
            Khám phá bộ sưu tập xe đạp cao cấp từ Road, Mountain đến Electric, được 
            thiết kế dành riêng cho những người yêu tốc độ và đam mê chinh phục. Mỗi 
            chiếc xe đều sở hữu kiểu dáng hiện đại, khung sườn bền bỉ và công nghệ tiên 
            tiến, mang lại trải nghiệm lái mượt mà, ổn định trên mọi cung đường.
          </p>
          <div className="pt-1">
            <button className="bg-blue-500 rounded-3xl font-normal text-white px-4 py-2 hover:bg-blue-600 transition-all duration-300 hover:scale-125 hover:text-black">
              <Link to="/product">Khám phá ngay</Link>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex-1 space-y-4"
        >
          <img src={bike1} alt="Bike" className="w-full rounded-2xl transition-all hover:scale-105" />
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-[250px] rounded-2xl bg-cover bg-center relative group cursor-pointer shadow-md transition-all hover:scale-105" 
             style={{ backgroundImage: `url(${card1})` }}>
          <div className="absolute inset-0 rounded-2xl bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
            <h3 className="font-bold text-lg md:text-xl">Chất lượng cao</h3>
            <p className="text-gray-300 text-xs md:text-sm mt-1">
              Xe được sản xuất từ vật liệu cao cấp như carbon và hợp kim siêu nhẹ...
            </p>
          </div>
        </div>

        <div className="h-[250px] rounded-2xl bg-cover bg-center relative group cursor-pointer shadow-md transition-all hover:scale-105" 
             style={{ backgroundImage: `url(${card2})` }}>
          <div className="absolute inset-0 rounded-2xl bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
            <h3 className="font-bold text-lg md:text-xl">Công nghệ mới</h3>
            <p className="text-gray-300 text-xs md:text-sm mt-1">
              Tích hợp GPS cảm biến thông minh và hệ thống điện...
            </p>
          </div>
        </div>

        <div className="h-[250px] rounded-2xl bg-cover bg-center relative group cursor-pointer shadow-md transition-all hover:scale-105" 
             style={{ backgroundImage: `url(${card3})` }}>
          <div className="absolute inset-0 rounded-2xl bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
            <h3 className="font-bold text-lg md:text-xl">Mọi địa hình</h3>
            <p className="text-gray-300 text-xs md:text-sm mt-1">
              Thiết kế đa dạng từ xe đạp đường phố đến xe đạp leo núi...
            </p>
          </div>
        </div>
      </div>

      {/* Sản phẩm từ cửa hàng */}
      <div className="space-y-10 pt-10">
        <div className="text-center">
          <h2 className="font-bold text-5xl text-blue-950">
            SẢN PHẨM TỪ CỬA HÀNG
            <div className="w-45 h-1 bg-red-500 mx-auto mt-3 rounded-full"></div>
          </h2>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => {
                const imageName = product.imageUrl ? product.imageUrl.trim() : "bike1.png";
                const finalImage = new URL(`../../assets/images/${imageName}`, import.meta.url).href;
                const discountPercent = product.discountPercent || 0;
                const discountAmount = Math.round(product.price * (discountPercent/100));
                const salePrice = product.price - discountAmount;

                return (
                  <ProductCard
                    key={product.productId}
                    product={{
                      id: product.productId,
                      name: product.productName,
                      price: salePrice,
                      image: finalImage,
                      rating: 5,
                      reviewCount: product.reviewCount || 0,
                      discount: discountPercent,
                      originalPrice: product.price,
                      category: product.category?.categoryName || "Bicycles",
                      inStock: product.stockQuantity,
                      description: product.description,
                      manufacturer: typeof product.manufacturer === 'object' && product.manufacturer !== null
                      ? (product.manufacturer as any).manufacturerName 
                      : product.manufacturer,
                      isNew: product.isNew || product.new,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}