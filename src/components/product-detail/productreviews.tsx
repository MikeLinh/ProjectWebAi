import React from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface ProductReviewsProps {
  reviewCount: number;
  rating: number;
}

export default function ProductReviews({ reviewCount, rating }: ProductReviewsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-6 rounded-2xl border border-gray-100 text-gray-800">
      {/* Bên Trái: Thống kê & Danh sách Review */}
      <div className="md:col-span-2 space-y-6">
        <h2 className="text-base sm:text-lg font-bold tracking-wider text-gray-900">{reviewCount} Review For This Product</h2>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="text-center space-y-1 shrink-0">
            <div className="text-4xl font-black text-amber-400">{rating.toFixed(2)}</div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Out Of 5 Stars</div>
          </div>
          
          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center text-xs gap-3">
                <span className="w-4 text-gray-400 font-medium text-right">{star}★</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: star === 4 ? "100%" : "0%" }}></div>
                </div>
                <span className="w-3 text-right text-gray-400">{star === 4 ? "1" : "0"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Khách hàng comment mẫu */}
        <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center font-bold text-gray-600 text-sm">J</div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2"><span className="font-bold text-sm text-gray-900">Jessica</span><span className="text-xs text-gray-400">— October 13, 2023</span></div>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => i < 4 ? <StarIcon key={i} style={{ fontSize: 14 }} /> : <StarBorderIcon key={i} style={{ fontSize: 14 }} />)}
            </div>
            <p className="text-sm text-gray-600 pt-1">Its was good..</p>
          </div>
        </div>
      </div>

      {/* Bên Phải: Form Add Review */}
      <form className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 h-fit">
        <h3 className="font-bold text-sm tracking-wide text-gray-900">Add A Review</h3>
        <input type="text" placeholder="Review title" className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs text-gray-500 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
        <textarea placeholder="Your Review *" rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs text-gray-500 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" required></textarea>
        <input type="text" placeholder="Name *" className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs text-gray-500 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" required />
        <input type="email" placeholder="Email *" className="w-full bg-gray-50 border border-gray-100rounded-lg p-2.5 text-xs text-gray-500 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" required />
        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg uppercase tracking-wider transition-colors">Submit</button>
      </form>
    </div>
  );
}