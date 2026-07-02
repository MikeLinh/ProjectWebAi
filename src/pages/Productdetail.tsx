import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import ProductInfoLeft from "../components/product-detail/productinfoleft.tsx";
import ProductInfoRight from "../components/product-detail/productinforight.tsx";
import ProductReviews from "../components/product-detail/productreviews.tsx";
import RelatedProducts from "../components/product-detail/relatedproduct.tsx";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import Chatbox from "../components/chatbox/chatbox";

interface ProductData {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  discount?: number;
  category?: string;
  brand?: string;           
  inStock?: number;
  description?: string;
}

export default function ProductDetail() {
  const location = useLocation();
  const state = location.state as { product?: ProductData } | null;
  const product = state?.product;

  const [reviewCount, setReviewCount] = useState(product?.reviewCount || 0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (product?.id) {
      axios.get(`http://localhost:8080/api/products/${product.id}/reviews`)
        .then(res => setReviewCount(res.data.length))
        .catch(() => setReviewCount(0));
      if (product.brand) {
        axios.get(`http://localhost:8080/api/products/related-by-brand?brand=${encodeURIComponent(product.brand)}&excludeId=${product.id}`)
          .then(res => {
            const relatedData = res.data || [];
            
            // Lấy tối đa 4 sản phẩm
            const topRelated = relatedData.slice(0, 4);

            const mappedProducts = topRelated.map((p: any) => {
              const imageName = p.imageUrl ? p.imageUrl.trim() : "bike1.png";
              const finalImage = new URL(`../assets/images/${imageName}`, import.meta.url).href; 

              return {
                id: p.productId,
                name: p.productName,
                price: p.price,
                originalPrice: p.price, 
                discount: 0,
                rating: 5,
                reviewCount: p.reviewCount || 0,
                category: p.category?.categoryName || product.category,
                image: finalImage
              };
            });

            setRelatedProducts(mappedProducts);
          })
          .catch(err => {
            console.error("Lỗi lấy sản phẩm liên quan:", err);
            setRelatedProducts([]);
          });
      }
    }
  }, [product?.id, product?.brand]);

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-red-500 font-bold text-lg">
          Dữ liệu của sản phẩm không tìm thấy !
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 w-full py-10">
        <div className="max-w-7xl mx-auto px-4 space-y-10">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 rounded-2xl border border-gray-200">
            <ProductInfoLeft
              image={product.image}
              name={product.name}
              discount={product.discount}
            />
            <ProductInfoRight
              id={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              category={product.category || "Bicycles"}
              rating={product.rating}
              reviewCount={reviewCount}
              inStock={product.inStock || 15}
              description={product.description || "Dòng xe đạp cao cấp với thiết kế hiện đại, độ bền vượt trội vượt mọi địa hình."}
            />
          </div>

          <ProductReviews productId={product.id} />
          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}

        </div>
        <Chatbox />
      </div>

      <Footer />
    </div>
  );
}