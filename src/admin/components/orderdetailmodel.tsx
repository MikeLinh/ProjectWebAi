import React from "react";
import type { OrderStatus } from "../pages/ManagerOrder";

// Import các Icon từ Material UI
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PACKING:   "Đang đóng gói",
  SHIPPING:  "Đang vận chuyển",
  DELIVERED: "Đã nhận hàng",
  CANCELLED: "Đã hủy",
};

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  PENDING:   { label: "Xác nhận đơn",      next: "CONFIRMED" },
  CONFIRMED: { label: "Bắt đầu đóng gói",   next: "PACKING" },
  PACKING:   { label: "Giao cho vận chuyển", next: "SHIPPING" },
  SHIPPING:  { label: "Xác nhận đã giao",   next: "DELIVERED" },
};

// Mảng quy định thứ tự các bước trạng thái
const STEP_ORDER = ["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "DELIVERED"];

// Map Icon cho từng trạng thái
const STEP_ICONS: Record<string, React.ElementType> = {
  PENDING: AccessTimeIcon,
  CONFIRMED: AssignmentTurnedInIcon,
  PACKING: Inventory2Icon,
  SHIPPING: LocalShippingIcon,
  DELIVERED: CheckCircleOutlineIcon,
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
      {/* Tăng độ rộng từ max-w-md lên max-w-lg để nhìn thoáng hơn */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-7 space-y-5 text-black text-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-800 pb-3">
          <h2 className="text-xl font-extrabold">Chi tiết đơn #{order.orderId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors">✕</button>
        </div>

        {/* --- KHU VỰC STEPPER TRẠNG THÁI CÓ ICON MUI --- */}
        <div className="w-full relative mt-6 mb-8 px-2">
          {/* Thanh ngang nền */}
          <div className="absolute top-[1.25rem] left-8 right-8 h-[2px] bg-gray-200 z-0"></div>
          
          <div className="flex justify-between items-start relative z-10">
            {STEP_ORDER.map((step, idx) => {
              const isCompleted = STEP_ORDER.indexOf(order.status) >= idx;
              const isCurrent = order.status === step;
              const isCancelled = order.status === "CANCELLED";
              const Icon = STEP_ICONS[step];
              
              let iconBgClass = "bg-gray-200 text-gray-500";
              let textClass = "text-gray-400";

              if (isCancelled) {
                 iconBgClass = "bg-red-500 text-white";
                 textClass = isCurrent ? "text-red-500" : "text-gray-400";
              } else if (isCurrent) {
                 iconBgClass = "bg-blue-600 text-white ring-4 ring-blue-100";
                 textClass = "text-blue-600";
              } else if (isCompleted) {
                 iconBgClass = "bg-blue-600 text-white"; // Theo ảnh reference các bước qua rồi có thể dùng màu xanh nhẹ hoặc xám, mình để xanh cho đồng bộ
                 textClass = "text-blue-600";
              }

              return (
                <div key={step} className="flex flex-col items-center gap-2 bg-white px-2 w-1/5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${iconBgClass}`}>
                    {isCancelled && isCurrent ? <CancelIcon fontSize="small" /> : <Icon fontSize="small" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase text-center leading-tight ${textClass}`}>
                    {STATUS_LABEL[step as OrderStatus]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {/* --- KẾT THÚC KHU VỰC STEPPER --- */}

        {/* Thông tin khách hàng - Viền đen bo góc như ảnh reference */}
        <div className="space-y-2 border border-gray-800 p-4 rounded-xl">
          <p><b>Khách hàng:</b> {order.receiverName}</p>
          <p><b>Số điện thoại:</b> {order.receiverPhone}</p>
          <p><b>Địa chỉ nhận:</b> {order.shippingAddress}</p>
          <p><b>Ngày đặt:</b> {new Date(order.orderDate).toLocaleString("vi-VN")}</p>
          {order.note && <p><b>Ghi chú:</b> {order.note}</p>}
        </div>

        {/* Danh sách sản phẩm - Viền đen bo góc */}
        <div>
          <h3 className="font-extrabold mb-2 uppercase text-gray-400 text-xs">Sản phẩm</h3>
          <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden bg-white">
            {order.items.map((item: any) => (
              <div key={item.orderDetailId} className="flex justify-between items-center p-3">
                <span className="text-gray-800">
                  {item.productName} <b className="text-red-600 ml-1">x{item.quantity}</b>
                </span>
                <span className="font-extrabold">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng thanh toán */}
        <div className="flex justify-between items-center font-extrabold border-t-2 border-gray-800 pt-4">
          <span className="text-base text-gray-900">Tổng thanh toán:</span>
          <span className="text-red-600 text-xl">${order.totalAmount.toLocaleString()}</span>
        </div>

        {/* Các nút hành động */}
        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Đóng
          </button>

          {action && (
            <button
              onClick={() => onUpdateStatus(order.orderId, action.next)}
              disabled={isUpdating}
              className="flex-1 bg-[#00a651] hover:bg-green-700 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              {isUpdating ? "Đang xử lý..." : action.label}
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => onUpdateStatus(order.orderId, "CANCELLED")}
              disabled={isUpdating}
              className="flex-1 bg-[#e30019] hover:bg-red-700 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              {isUpdating ? "Đang xử lý..." : "Hủy đơn hàng"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}