import React from "react";
import { CheckCircle } from "@mui/icons-material";

export default function QualitySection() {
  const qualities = [
    "Khung xe hợp kim cao cấp, nhẹ và bền",
    "Pin Lithium-ion chính hãng, tuổi thọ cao",
    "Động cơ mạnh mẽ, vận hành êm ái",
    "Bảo hành chính hãng lên đến 24 tháng",
    "Kiểm tra chất lượng nghiêm ngặt trước khi xuất xưởng",
  ];

  return (
    <div className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Chất lượng vượt trội</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {qualities.map((item, index) => (
            <div key={index} className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <CheckCircle className="text-green-500 text-3xl mt-1" />
              <p className="text-lg">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}