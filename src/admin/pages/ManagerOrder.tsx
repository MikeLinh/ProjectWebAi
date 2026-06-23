import React, { useState } from "react";
import OrderDetailModal from "../components/orderdetailmodel";

export default function ManageOrders() {
  const [orders, setOrders] = useState([
    { 
      order_id: 101, 
      receiver_name: "Nguyễn Văn A", 
      receiver_phone: "0901234567",
      shipping_address: "123 Đường ABC, Quận 1, TP.HCM",
      order_date: "2026-06-23",
      total_amount: 960, 
      status: "PENDING",
      items: [{ name: "Mountain Bike X1", quantity: 1, price: 1200 }]
    }
  ]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleUpdateStatus = (id: number, newStatus: string) => {
    setOrders(orders.map(o => o.order_id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý hóa đơn mua hàng</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-black">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
            <tr>
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Tổng cộng</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Xử lý hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.order_id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold">#{o.order_id}</td>
                <td className="p-4 font-medium text-gray-900">{o.receiver_name}</td>
                <td className="p-4 text-red-600 font-bold">${o.total_amount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    o.status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-green-50 text-green-600 border border-green-200"
                  }`}>
                    {o.status === "PENDING" ? "CHỜ XỬ LÝ" : "ĐÃ XÁC NHẬN"}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => setSelectedOrder(o)} className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-semibold text-gray-700">Chi tiết</button>
                  {o.status === "PENDING" && (
                    <button onClick={() => handleUpdateStatus(o.order_id, "CONFIRMED")} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold">Xác nhận đơn</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}