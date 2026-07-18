/* eslint-disable react-hooks/set-state-in-effect */
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import ProductInfoLeft from "../components/product-detail/productinfoleft.tsx";
import ProductInfoRight from "../components/product-detail/productinforight.tsx";
import ProductReviews from "../components/product-detail/productreviews.tsx";
import RelatedProducts from "../components/product-detail/relatedproduct.tsx";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import Chatbox from "../components/chatbox/chatbox";


// Định nghĩa cấu trúc kiểu dữ liệu
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
  // Sử dụng hook useLocation để nhận thông tin vị trí URL hiện tại và trích xuất dữ liệu tạm thời được truyền ngầm qua Router (state)
  const location = useLocation();
  // Sử dụng hook useParams để lấy tham số 'id' động từ trên thanh địa chỉ URL
  const { id } = useParams<{ id: string }>();
  //kiểm tra xem có sản phẩm được truyền sẵn từ trang trước sang không
  const state = location.state as { product?: ProductData } | null;

  const [product, setProduct] = useState<ProductData | undefined>(state?.product);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(!state?.product);

  const [reviewCount, setReviewCount] = useState(state?.product?.reviewCount || 0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    //Nếu sản phẩm đã được truyền sẵn thông qua state
    if (state?.product) {
      // Gán trực tiếp đối tượng sản phẩm đó vào state 'product' mà không cần gọi API nữa
      setProduct(state.product);
      setLoadingProduct(false);
      return;
    }
    //Nếu kh trích xuất được id hợp lệ
    if (!id) {
      setLoadingProduct(false);
      return;
    }

    setLoadingProduct(true);
    // Sử dụng Axios gửi yêu cầu GET tới API lấy chi tiết một sản phẩm theo ID từ server
    axios.get(`http://localhost:8080/api/products/${id}`)
      .then((res) => {
        const p = res.data;
        const imageName = p.imageUrl ? p.imageUrl.trim() : "bike1.png";
        const finalImage = new URL(`../assets/images/${imageName}`, import.meta.url).href;

        const discountPercent = p.discountPercent || 0;
        const discountAmount = Math.round(p.price * (discountPercent / 100));
        const salePrice = p.price - discountAmount;

        setProduct({
          id: p.productId,
          name: p.productName,
          price: salePrice,
          originalPrice: p.price,
          image: finalImage,
          rating: 5,
          reviewCount: p.reviewCount || 0,
          discount: discountPercent,
          category: p.category?.categoryName || "Bicycles",
          brand: p.brand,
          inStock: p.stockQuantity,
          description: p.description,
        });
      })
      .catch((err) => {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
        setProduct(undefined); // Đưa trạng thái sản phẩm về undefined để giao diện hiển thị thông báo không tìm thấy sản phẩm
      })
      .finally(() => setLoadingProduct(false)); // Tắt hiệu ứng loading để hiển thị giao diện chính thức
  }, [id]);

  useEffect(() => {
     // Kiểm tra điều kiện tiên quyết nếu đã có đối tượng sản phẩm và mã id sản phẩm tồn tại hợp lệ
    if (product?.id) {
      //Gọi API lấy dữ liệu đánh giá
      axios.get(`http://localhost:8080/api/products/${product.id}/reviews`)
        .then(res => setReviewCount(res.data.length))
        .catch(() => setReviewCount(0));
      //kiểm tra xem sản phẩm có brand liên quan không
      if (product.brand) {
        // Gửi yêu cầu lấy sản phẩm liên quan cùng hãng
        axios.get(`http://localhost:8080/api/products/related-by-brand?brand=${encodeURIComponent(product.brand)}&excludeId=${product.id}`)
          .then(res => {
            const relatedData = res.data || []; // Lấy mảng dữ liệu trả về, nếu không trả về thì là rỗng
            const topRelated = relatedData.slice(0, 4); // lấy 4 sản phẩm liên đầu tiên

            // duyệt qua từng sản phẩm trong top 4 để chuẩn hóa lại cấu trúc dữ liệu trước khi lưu vào state
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

  if (loadingProduct) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Đang tải thông tin sản phẩm...
        </div>
        <Footer />
      </div>
    );
  }

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