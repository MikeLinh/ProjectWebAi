import React from "react";
import bike1 from "../../assets/images/bk1.png";
import bike2 from "../../assets/images/bk2.png";
import bike3 from "../../assets/images/bk3.png";
import { formatVND } from "../../components/utils/formatCurrency";

export default function ProductHighlight() {
  
  const products = [
    { 
      name: "Xe Đạp Giant Touring", 
      price: "1200", 
      img: bike1 
    },
    { 
      name: "Xe đạp Giant LIV", 
      price: "2300", 
      img: bike2 
    },
    { 
      name: "Xe đạp Giant Escape", 
      price: "3000", 
      img: bike3 
    },
  ];

  return (
    <div id="sanpham" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Sản phẩm nổi bật</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <div 
              key={i} 
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="overflow-hidden">
                <img 
                  src={p.img} 
                  alt={p.name} 
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-semibold text-xl mb-3 text-gray-800">{p.name}</h3>
                <p className="text-3xl font-bold text-green-600">
                    {formatVND(parseInt(p.price))}
                </p>
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium transition-colors" >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}