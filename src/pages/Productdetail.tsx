import { useLocation } from "react-router-dom";

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
  inStock?: number;
  description?: string;
}

export default function ProductDetail() {
  const location = useLocation();
  const state = location.state as { product?: ProductData } | null;
  const product = state?.product;

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

          {/* Product Info*/}
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
              reviewCount={product.reviewCount}
              inStock={product.inStock || 15}
              description={product.description || "Dòng xe đạp cao cấp với thiết kế hiện đại, độ bền vượt trội vượt mọi địa hình."}
            />
          </div>

          {/* Reviews*/}
          <ProductReviews
            reviewCount={product.reviewCount}
            rating={product.rating}
          />

          {/* Related Products*/}
          <RelatedProducts
            products={[
              {
                id: product?.id || 0,
                name: product?.name || "Sản phẩm liên quan",
                price: product?.price || 0,
                originalPrice: product?.originalPrice,
                discount: product?.discount,
                rating: product?.rating || 5, 
                reviewCount: product?.reviewCount || 0,
                category: product?.category || "Bicycles",
                image: product?.image || ""
              }
            ]}
          />
        </div>
        <Chatbox />
      </div>

      <Footer />
    </div>
  );
}