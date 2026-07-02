import React, { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface DBReviewInput {
  userId?: number;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
}

interface ReviewFormProps {
  onSubmitReview: (review: DBReviewInput) => Promise<boolean>;
}

export default function ReviewForm({ onSubmitReview }: ReviewFormProps) {
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (ratingInput < 3 && !comment.trim()) {
      setErrorMsg("Vui lòng nhập nội dung đánh giá để chúng tôi cải thiện sản phẩm!");
      return;
    }

    const isSuccess = await onSubmitReview({
      rating: ratingInput,
      reviewerName: name,
      reviewerEmail: email,
      comment: comment.trim() || "Người dùng không để lại bình luận."
      
    });

    if (isSuccess) {
      setComment("");
      setName("");
      setEmail("");
      setRatingInput(5);
    } else {
      setErrorMsg("Gửi đánh giá không thành công. Vui lòng thử lại!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 h-fit">
      <h3 className="font-bold text-sm tracking-wide text-gray-900">Thêm đánh giá</h3>
      
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500">Chấm điểm sao *</p>
        <div className="flex text-amber-400 cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} onClick={() => setRatingInput(star)}>
              {star <= ratingInput ? <StarIcon style={{ fontSize: 20 }} /> : <StarBorderIcon style={{ fontSize: 20 }} />}
            </span>
          ))}
        </div>
      </div>

      {errorMsg && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg font-medium">{errorMsg}</p>}

      <textarea 
        placeholder="Nội dung đánh giá *" 
        rows={3} 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700 focus:outline-none focus:border-red-500" 
        required={ratingInput < 3}
      />
      
      <input 
        type="text" 
        placeholder="Tên của bạn *" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700 focus:outline-none focus:border-red-500" 
        required 
      />
      
      <input 
        type="email" 
        placeholder="Email *" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700 focus:outline-none focus:border-red-500" 
        required 
      />
      
      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg uppercase tracking-wider transition-colors">
        Gửi đánh giá
      </button>
    </form>
  );
}