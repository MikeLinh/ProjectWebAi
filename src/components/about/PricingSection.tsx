import React from "react";

export default function PricingSection() {
  return (
    <div className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Giá thành hợp lý</h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Chúng tôi cam kết mang đến sản phẩm chất lượng cao với mức giá cạnh tranh nhất trên thị trường
        </p>
        
        <div className="inline-flex bg-white rounded-3xl p-2 shadow">
          <div className="px-10 py-6 text-left">
            <p className="text-sm text-gray-500">Từ</p>
            <p className="text-5xl font-bold text-blue-600">4.990.000 ₫</p>
            <p className="text-gray-600">Xe đạp cơ bản</p>
          </div>
          <div className="border-l px-10 py-6 text-left">
            <p className="text-sm text-gray-500">Cao nhất</p>
            <p className="text-5xl font-bold text-green-600">89.000.000 ₫</p>
            <p className="text-gray-600">Xe đạp điện cao cấp</p>
          </div>
        </div>
      </div>
    </div>
  );
}