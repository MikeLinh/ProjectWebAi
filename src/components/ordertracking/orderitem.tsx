import React from "react";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  receiverName: string;
  shippingAddress: string;
  items: { orderDetailId: number; productName: string; quantity: number; price: number }[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PACKING:   "Đang đóng gói",
  SHIPPING:  "Đang vận chuyển",
  DELIVERED: "Đã nhận hàng",
  CANCELLED: "Đã hủy",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING:   "bg-amber-50  text-amber-600  border-amber-200",
  CONFIRMED: "bg-blue-50   text-blue-600   border-blue-200",
  PACKING:   "bg-purple-50 text-purple-600 border-purple-200",
  SHIPPING:  "bg-orange-50 text-orange-600 border-orange-200",
  DELIVERED: "bg-green-50  text-green-600  border-green-200",
  CANCELLED: "bg-red-50    text-red-600    border-red-200",
};

interface OrderItemProps {
  order: Order;
  onCancelOrder?: (orderId: number) => void;   
}

export default function OrderItem({ order, onCancelOrder }: OrderItemProps) {
  const formatOrderDate = (dateString: string) => {
    const d = new Date(dateString);
    const giờ  = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const ngày = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return { giờ, ngày };
  };

  const { giờ, ngày } = formatOrderDate(order.orderDate);
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow space-y-4 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <span className="font-mono font-bold text-sm text-gray-900 mr-2">#{order.orderId}</span>
          <span className="text-xs text-gray-400">
            Đặt lúc: <strong className="text-gray-700 font-normal">{giờ}</strong> - {ngày}
          </span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.orderDetailId} className="flex justify-between items-center text-xs">
            <div className="text-gray-800">
              {item.productName} <span className="text-gray-400 font-mono">x{item.quantity}</span>
            </div>
            <div className="font-medium text-gray-900">
              ${(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
        <span className="text-gray-500">Thành tiền:</span>
        <span className="text-sm font-bold text-red-500">${order.totalAmount.toLocaleString()}</span>
      </div>

      {canCancel && onCancelOrder && (
        <button 
          onClick={() => onCancelOrder(order.orderId)}
          className="mt-3 w-full py-2.5 text-red-600 border border-red-300 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors"
        >
          Hủy đơn hàng
        </button>
      )}
    </div>
  );
}