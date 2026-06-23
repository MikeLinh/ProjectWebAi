import React from "react";
import StatCard from "../components/statcard";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"; 
import LocalShippingIcon from "@mui/icons-material/LocalShipping";   
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";

export default function DashboardOverview() {
  const stats = [
    { title: "Tổng doanh thu", value: "$124,500", icon: <MonetizationOnIcon className="text-xl"/>, bgColor: "bg-green-50 text-green-600" },
    { title: "Đơn hàng mới", value: "48 đơn", icon: <LocalShippingIcon className="text-xl"/>, bgColor: "bg-blue-50 text-blue-600" },
    { title: "Sản phẩm hệ thống", value: "120 xe", icon: <DirectionsBikeIcon className="text-xl"/>, bgColor: "bg-purple-50 text-purple-600" },
    { title: "Khuyến mãi đang chạy", value: "5 mã", icon: <LocalActivityIcon className="text-xl"/>, bgColor: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <p className="text-sm text-gray-500">Hệ thống đang vận hành ổn định. Mọi giao dịch cổng thanh toán đều khớp với bảng dữ liệu PAYMENTS.</p>
      </div>
    </div>
  );
}