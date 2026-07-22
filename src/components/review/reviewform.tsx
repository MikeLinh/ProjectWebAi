/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useNotification } from "../context/notificationcontext";

interface DBReviewInput {
  userId?: number;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
}

interface ReviewFormProps {
  onSubmitReview: (review: DBReviewInput) => Promise<{ success: boolean; message: string }>;
}

export default function ReviewForm({ onSubmitReview }: ReviewFormProps) {
  const { showNotification } = useNotification();
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [currentUser, setCurrentUserId] = useState<number | undefined>(undefined);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");
      if (userStr && token) {
        const currentUser = JSON.parse(userStr);
        if (currentUser.userId || currentUser.id) {
          setCurrentUserId(currentUser.userId || currentUser.id);
        }
        if (currentUser.fullName || currentUser.userName) {
          setName(currentUser.fullName || currentUser.userName);
        }
        if (currentUser.email) {
          setEmail(currentUser.email);
        }
      }else{
        setCurrentUserId(undefined);
        setName("");
        setEmail("");
      }
    } catch (e) {
      console.error("Lỗi đọc thông tin người dùng từ localStorage", e);
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentUser) {
      const notLoggedInMsg = "Bạn phải cần đăng nhập để đánh giá sản phẩm!";
      setErrorMsg(notLoggedInMsg);
      showNotification(notLoggedInMsg, "error"); 
      return;
    }

    if (ratingInput < 3 && !comment.trim()) {
      setErrorMsg("Vui lòng nhập nội dung đánh giá để chúng tôi cải thiện sản phẩm!");
      return;
    }

    const isSuccess = await onSubmitReview({
      userId: currentUser,
      rating: ratingInput,
      reviewerName: name,
      reviewerEmail: email,
      comment: comment.trim() || "Người dùng không để lại bình luận."
      
    });

    if (isSuccess.success) {
      setSuccessMsg("Gửi đánh giá thành công!");
      showNotification("Cảm ơn bạn đã đánh giá sản phẩm!", "success");
      setComment("");
      setRatingInput(5);
    } else {
      const errorMess= "Sản phẩm này phải được mua và đã được giao trong giỏ hàng của bạn thì mới được đánh giá!"
      setErrorMsg(errorMess);
      showNotification(errorMess, "error");
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 h-fit">
      <h3 className="font-bold text-sm tracking-wide text-gray-900">Thêm đánh giá</h3>
      
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500">Chấm điểm sao </p>
        <div className="flex text-amber-400 cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} onClick={() => setRatingInput(star)}>
              {star <= ratingInput ? <StarIcon style={{ fontSize: 20 }} /> : <StarBorderIcon style={{ fontSize: 20 }} />}
            </span>
          ))}
        </div>
      </div>

      {errorMsg && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg font-medium">{errorMsg}</p>}
      {successMsg && <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg font-medium">{successMsg}</p>}
      <textarea 
        placeholder="Nội dung đánh giá" 
        rows={3} 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700 focus:outline-none focus:border-red-500" 
        required={ratingInput < 3}
      />
      
      <input 
        type="text" 
        placeholder="Tên của bạn" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700 focus:outline-none focus:border-red-500" 
        required 
      />
      
      <input 
        type="email" 
        placeholder="Email  " 
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