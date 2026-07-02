import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface DBReview {
  rating: number;
}

interface ReviewStatsProps {
  reviews: DBReview[];
}

export default function ReviewStats({ reviews }: ReviewStatsProps) {
  const reviewCount = reviews.length;
  
  // Tính điểm trung bình dựa trên data thực tế
  const averageRating = reviewCount > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
    : 0;

  // Đếm xem có bao nhiêu đánh giá ứng với số sao cụ thể
  const getStarCount = (star: number) => reviews.filter(r => r.rating === star).length;

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center bg-gray-50 p-6 rounded-xl border border-gray-100">
      <div className="text-center space-y-1 shrink-0">
        <div className="text-4xl font-black text-amber-500">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center text-amber-400 text-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            i < Math.round(averageRating) ? <StarIcon key={i} style={{ fontSize: 18 }} /> : <StarBorderIcon key={i} style={{ fontSize: 18 }} />
          ))}
        </div>
        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Điểm trung bình</div>
      </div>
      
      <div className="flex-1 w-full space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = getStarCount(star);
          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
          return (
            <div key={star} className="flex items-center text-xs gap-3">
              <span className="w-6 text-gray-400 font-medium text-right">{star}★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${percentage}%` }} />
              </div>
              <span className="w-4 text-right text-gray-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}