import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HeroSection() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const navigate = useNavigate();
  return (
    <div className="relative h-[90vh] bg-gradient-to-br from-blue-200 via-indigo-300 to-purple-500 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative text-center text-white z-10 px-6 max-w-4xl">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
          BIKEYC - <span className="text-yellow-400">Xe Đạp Việt Nam</span>
        </h1>
        <p className="text-2xl md:text-3xl mb-8 font-light">
          Chất lượng Châu Âu - Giá Việt Nam
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/product" className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold hover:bg-yellow-400 transition-all">Xem sản phẩm</Link>
          <a href="#khuyenmai" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-all">Khuyến mãi</a>
        </div>
      </div>
    </div>
  );
}