import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface ReviewItemProps {
  review: {
    reviewId?: number;
    rating: number;
    reviewerName?: string;     
    comment: string;
    createdAt?: string;
  };
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const initial = review.reviewerName 
    ? review.reviewerName.charAt(0).toUpperCase() 
    : "U";

  return (
    <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center font-bold text-gray-600 text-sm">
        {initial}
      </div>
      <div className="space-y-1 w-full">
        <div className="flex flex-wrap items-center justify-between gap-x-2">
          <span className="font-bold text-sm text-gray-900">
            {review.reviewerName || "Người dùng ẩn danh"}
          </span>
          <span className="text-xs text-gray-400">
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : "Vừa xong"}
          </span>
        </div>
        <div className="flex text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => 
            i < review.rating ? <StarIcon key={i} style={{ fontSize: 14 }} /> : <StarBorderIcon key={i} style={{ fontSize: 14 }} />
          )}
        </div>
        <p className="text-sm text-gray-600 pt-1">{review.comment}</p>
      </div>
    </div>
  );
}