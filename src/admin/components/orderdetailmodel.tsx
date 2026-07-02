import React from "react";
import type { OrderStatus } from "../pages/ManagerOrder";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PACKING:   "Đang đóng gói",
  SHIPPING:  "Đang vận chuyển",
  DELIVERED: "Đã nhận hàng",
  CANCELLED: "Đã hủy",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:   "bg-amber-100  text-amber-800",
  CONFIRMED: "bg-blue-100   text-blue-800",
  PACKING:   "bg-purple-100 text-purple-800",
  SHIPPING:  "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100  text-green-800",
  CANCELLED: "bg-red-100    text-red-800",
};

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  PENDING:   { label: "Xác nhận đơn",       next: "CONFIRMED" },
  CONFIRMED: { label: "Bắt đầu đóng gói",   next: "PACKING" },
  PACKING:   { label: "Giao cho vận chuyển", next: "SHIPPING" },
  SHIPPING:  { label: "Xác nhận đã giao",   next: "DELIVERED" },
};

interface OrderDetailModalProps {
  order: any | null;
  onClose: () => void;
  onUpdateStatus: (orderId: number, newStatus: OrderStatus) => void;
  updatingId: number | null;
}

export default function OrderDetailModal({
  order, onClose, onUpdateStatus, updatingId,
}: OrderDetailModalProps) {
  if (!order) return null;

  const action = NEXT_ACTION[order.status as OrderStatus];
  const isUpdating = updatingId === order.orderId;
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4 text-black text-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-bold">Chi tiết đơn #{order.orderId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">Trạng thái:</span>
          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${STATUS_COLOR[order.status as OrderStatus]}`}>
            {STATUS_LABEL[order.status as OrderStatus]}
          </span>
        </div>

        <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border">
          <p><b>Khách hàng:</b> {order.receiverName}</p>
          <p><b>Số điện thoại:</b> {order.receiverPhone}</p>
          <p><b>Địa chỉ nhận:</b> {order.shippingAddress}</p>
          <p><b>Ngày đặt:</b> {new Date(order.orderDate).toLocaleString("vi-VN")}</p>
          {order.note && <p><b>Ghi chú:</b> {order.note}</p>}
        </div>

        <div>
          <h3 className="font-bold mb-2 uppercase text-gray-400 text-[10px]">Sản phẩm</h3>
          <div className="divide-y border rounded-xl overflow-hidden bg-white">
            {order.items.map((item: any) => (
              <div key={item.orderDetailId} className="flex justify-between p-3">
                <span>{item.productName} <b className="text-red-500">x{item.quantity}</b></span>
                <span className="font-bold">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm font-bold border-t pt-3">
          <span>Tổng thanh toán:</span>
          <span className="text-red-600 text-base">${order.totalAmount.toLocaleString()}</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-[11px] uppercase tracking-wider"
          >
            Đóng
          </button>

          {action && (
            <button
              onClick={() => onUpdateStatus(order.orderId, action.next)}
              disabled={isUpdating}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-[11px] uppercase tracking-wider"
            >
              {isUpdating ? "Đang xử lý..." : action.label}
            </button>
          )}

          {/* Nút Hủy đơn hàng */}
          {canCancel && (
            <button
              onClick={() => onUpdateStatus(order.orderId, "CANCELLED")}
              disabled={isUpdating}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-[11px] uppercase tracking-wider"
            >
              {isUpdating ? "Đang xử lý..." : "Hủy đơn hàng"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}