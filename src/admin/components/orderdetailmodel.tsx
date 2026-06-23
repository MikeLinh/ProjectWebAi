import React from "react";

interface OrderDetailModalProps {
  order: any | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4 text-black text-xs">
        <h2 className="text-lg font-bold border-b pb-3">CHI TIẾT ĐƠN HÀNG #{order.order_id}</h2>
        <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border">
          <p><b>Khách hàng:</b> {order.receiver_name}</p>
          <p><b>Số điện thoại:</b> {order.receiver_phone}</p>
          <p><b>Địa chỉ nhận:</b> {order.shipping_address}</p>
          <p><b>Ngày đặt đơn:</b> {order.order_date}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2 uppercase text-gray-500 text-[10px]">Danh sách sản phẩm mua:</h3>
          <div className="divide-y border rounded-xl overflow-hidden bg-white">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between p-3">
                <span>{item.name} <b className="text-red-500">x{item.quantity}</b></span>
                <span className="font-bold">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm font-bold border-t pt-3">
          <span>Tổng tiền thanh toán:</span>
          <span className="text-red-600 text-base">${order.total_amount.toLocaleString()}</span>
        </div>
        <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[11px] mt-2">Đóng cửa sổ</button>
      </div>
    </div>
  );
}