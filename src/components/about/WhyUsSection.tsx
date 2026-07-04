import React from "react";
import { 
  Security, 
  Speed, 
  SupportAgent, 
  LocalShipping, 
  Verified 
} from "@mui/icons-material";
import AdbIcon from '@mui/icons-material/Adb';

export default function WhyUsSection() {
  const reasons = [
    {
      icon: <Security className="text-5xl text-blue-600" />,
      title: "Bảo hành dài hạn",
      desc: "Bảo hành chính hãng lên đến 24 tháng cho khung xe và 12 tháng cho pin"
    },
    {
      icon: <Speed className="text-5xl text-green-600" />,
      title: "Hiệu suất vượt trội",
      desc: "Động cơ mạnh mẽ, pin bền bỉ, quãng đường di chuyển lên đến 80km/lần sạc"
    },
    {
      icon: <SupportAgent className="text-5xl text-purple-600" />,
      title: "Hỗ trợ tận tâm",
      desc: "Đội ngũ kỹ thuật viên chuyên nghiệp, hỗ trợ 24/7 qua hotline & Zalo"
    },
    {
      icon: <AdbIcon className="text-5xl text-emerald-600" />,
      title: "Thân thiện môi trường",
      desc: "Sản phẩm sử dụng năng lượng sạch, góp phần giảm khí thải carbon"
    },
    {
      icon: <LocalShipping className="text-5xl text-orange-600" />,
      title: "Giao hàng nhanh chóng",
      desc: "Giao hàng toàn quốc trong 2-5 ngày, miễn phí vận chuyển đơn từ 10 triệu"
    },
    {
      icon: <Verified className="text-5xl text-amber-600" />,
      title: "Sản phẩm chính hãng",
      desc: "100% xe nhập khẩu và lắp ráp chính hãng, có tem chống hàng giả"
    }
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Tại sao nên chọn BIKEYC?</h2>
          <p className="text-xl text-gray-600">Những lý do khiến hàng ngàn khách hàng tin tưởng</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  {reason.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-center mb-3">{reason.title}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{reason.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button 
            onClick={() => document.getElementById('sanpham')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all"
          >
            Khám phá sản phẩm ngay
          </button>
        </div>
      </div>
    </div>
  );
}