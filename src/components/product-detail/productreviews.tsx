import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../components/context/authcontext";   
import ReviewStats from "../review/reviewstat";
import ReviewItem from "../review/reviewitem";
import ReviewForm from "../review/reviewform";

interface DBReview {
  reviewId?: number;
  rating: number;
  reviewerName?: string;
  reviewerEmail?: string;
  comment: string;
  createdAt?: string;
}

interface ProductReviewsProps {
  productId: number; 
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();   
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`);
        setReviews(res.data);
      } catch (err: any) {
        console.error("Lỗi fetch reviews:", err);
        setError("Không thể tải đánh giá.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchReviews();
  }, [productId]);

    const handleAddReview = async (newReview: any): Promise<{ success: boolean; message: string }> => {
    try {
      const reviewData = {
        ...newReview,
        userId: user?.userId,
        reviewerName: newReview.reviewerName || user?.fullName,
        reviewerEmail: newReview.reviewerEmail || user?.email,
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`, reviewData);
      setReviews([res.data, ...reviews]);
      return { success: true, message: "Đánh giá thành công!" };
    } catch (err: any) {
      console.error("Lỗi gửi review:", err);
      const errorMessage = err.response?.data?.message || err.response?.data || "Gửi đánh giá không thành công.";
      return {
        success: false,
        message: typeof errorMessage === "string" ? errorMessage : "Gửi đánh giá không thành công.",
      };
    }
  };

  if (loading) return <div className="text-center py-6 text-xs text-gray-400 animate-pulse">Đang tải thông tin đánh giá...</div>;
  if (error) return <div className="text-center py-6 text-red-500 text-sm">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-6 rounded-2xl border border-gray-100 text-gray-800">
      <div className="md:col-span-2 space-y-6">
        <h2 className="text-base sm:text-lg font-bold tracking-wider text-gray-900">
          {reviews.length} Đánh giá cho sản phẩm này
        </h2>
        
        <ReviewStats reviews={reviews} />

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-4">Sản phẩm chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
          ) : (
            reviews.map((review, idx) => (
              <ReviewItem key={review.reviewId || idx} review={review} />
            ))
          )}
        </div>
      </div>

      <div>
        <ReviewForm onSubmitReview={handleAddReview} />
      </div>
    </div>
  );
}