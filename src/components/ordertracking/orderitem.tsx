import React from "react";

export interface Order {
  id: string;
  date: string;
  total: number;
  status: "Đang giao" | "Đã giao" | "Đã hủy";
  items: { name: string; quantity: number; price: number }[];
}

interface OrderItemProps {
  order: Order; 
}

export default function OrderItem({ order }: OrderItemProps) {
  
  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "Đang giao": return "bg-blue-50 text-blue-600 border-blue-200"; 
      case "Đã giao": return "bg-green-50 text-green-600 border-green-200"; 
      case "Đã hủy": return "bg-red-50 text-red-600 border-red-200"; 
    }
  };

  const formatOrderDate = (dateString: string) => {
    const d = new Date(dateString); 
    const giờ= d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }); 
    const ngày = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); 
    return { giờ, ngày };
  };

  const { giờ, ngày } = formatOrderDate(order.date); 

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow space-y-4 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <span className="font-mono font-bold text-sm text-gray-900 mr-2">{order.id}</span>
          <span className="text-xs text-gray-400">
            Đặt lúc: <strong className="text-gray-700 font-normal">{giờ}</strong> - {ngày}
          </span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <div className="text-gray-800">
              {item.name} <span className="text-gray-400 font-mono">x{item.quantity}</span>
            </div>
            <div className="font-medium text-gray-900">${item.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
        <span className="text-gray-500">Thành tiền:</span>
        <span className="text-sm font-bold text-red-500">${order.total.toLocaleString()}</span>
      </div>

    </div>
  );
}