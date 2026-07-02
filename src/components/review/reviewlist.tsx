import ReviewItem from "./reviewitem";

interface DBReview {
  reviewId?: number;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  createdAt?: string;
}

interface ReviewListProps {
  reviews: DBReview[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-4">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {reviews.map((review, idx) => (
        <ReviewItem key={review.reviewId || idx} review={review} />
      ))}
    </div>
  );
}