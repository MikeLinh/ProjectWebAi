import { useState, useEffect } from "react";
import axios from "axios";
import ReviewStats from "../components/review/reviewstat";
import ReviewList from "../components/review/reviewlist";
import ReviewForm from "../components/review/reviewform";

interface DBReview {
  reviewId?: number;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  createdAt?: string;
}

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get<DBReview[]>(`http://localhost:8080/api/products/${productId}/reviews`);
        setReviews(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách đánh giá:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleAddReview = async (newReview: DBReview): Promise<boolean> => {
    try {
      const res = await axios.post(`http://localhost:8080/api/products/${productId}/reviews`, newReview);
      setReviews([res.data, ...reviews]); 
      return true;
    } catch (err) {
      console.error("Lỗi gửi API review:", err);
      return false;
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