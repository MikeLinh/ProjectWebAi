import React from "react";

export default function PromotionSection() {
  return (
    <div id="khuyenmai" className="py-20 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Ưu đãi đặc biệt</h2>
        <p className="text-xl text-gray-600 mb-12">Giảm ngay hôm nay - Cơ hội không thể bỏ lỡ</p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-5xl font-bold text-red-500 mb-2">20%</div>
            <h3 className="text-2xl font-semibold mb-3">Xe đạp điện</h3>
            <p className="text-gray-500">Áp dụng cho toàn bộ dòng xe đạp điện cao cấp</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-yellow-400">
            <div className="text-5xl font-bold text-yellow-500 mb-2">TẶNG</div>
            <h3 className="text-2xl font-semibold mb-3">Phụ kiện cao cấp</h3>
            <p className="text-gray-500">Khi mua xe trên 15 triệu</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-5xl font-bold text-green-500 mb-2">0%</div>
            <h3 className="text-2xl font-semibold mb-3">Trả góp</h3>
            <p className="text-gray-500">Lãi suất 0% trong 12 tháng</p>
          </div>
        </div>
      </div>
    </div>
  );
}