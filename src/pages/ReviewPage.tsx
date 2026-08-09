import { useState, useEffect } from "react";
import axios from "axios";
import ReviewStats from "../components/review/reviewstat";
import ReviewList from "../components/review/reviewlist";
import ReviewForm from "../components/review/reviewform";

// Định nghĩa cấu trúc kiểu dữ liệu review
interface DBReview {
  reviewId?: number;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  createdAt?: string;
}
// Định nghĩa kiểu dữ liệu cho các tham số đầu vào
interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<DBReview[]>([]); //Khởi tạo state lưu trữ các danh sách review, dữ liệu đầu là rỗng
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Sử dụng thư viện axios để gửi một yêu cầu HTTP GET tới endpoint chứa danh sách đánh giá của sản phẩm này
        const res = await axios.get<DBReview[]>(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`);
        setReviews(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách đánh giá:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);
   
  // Định nghĩa hàm bất đồng bộ handleAddReview xử lý khi người dùng gửi một đánh giá mới, kiểu dữ liệu Promise
  const handleAddReview = async (newReview: DBReview): Promise<{ success: boolean; message: string }> => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`, newReview);
        setReviews([res.data, ...reviews]);
        return { success: true, message: "Đánh giá thành công!" };
      } catch (err: any) {
        console.error("Lỗi gửi API review:", err);
        const errorMessage = err.response?.data?.message || err.response?.data || "Lỗi hệ thống, vui lòng thử lại sau.";
        return { success: false, message: typeof errorMessage === 'string' ? errorMessage : "Gửi đánh giá không thành công." };
      }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-xs text-gray-400 animate-pulse">
        Đang tải đánh giá sản phẩm...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-6 rounded-2xl border border-gray-100 text-gray-800">
      
      {/* Khối bên trái: Thống kê & Danh sách hiển thị */}
      <div className="md:col-span-2 space-y-6">
        <h2 className="text-base sm:text-lg font-bold tracking-wider text-gray-900">
          {reviews.length} Đánh giá cho sản phẩm này
        </h2>
        
        <ReviewStats reviews={reviews} />

        <ReviewList reviews={reviews} />
      </div>

      <div>
        <ReviewForm onSubmitReview={handleAddReview} />
      </div>

    </div>
  );
}