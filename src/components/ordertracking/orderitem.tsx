import React from "react";
import { useState } from "react";
import { useNotification } from "../context/notificationcontext";
import { handleExportInvoice } from "../utils/exportInvoice";
// Định nghĩa kiểu dữ liệu cho trạng thái đơn hàng
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

// Định nghĩa cấu trúc đối tượng Order
export interface Order {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  receiverName: string;
  shippingAddress: string;
  paymentMethod: string;
  items: { orderDetailId: number; productId?: number; productName: string; quantity: number; price: number }[];
}

//Mapping nhãn hiển thị cho từng trạng thái
const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PACKING:   "Đang đóng gói",
  SHIPPING:  "Đang vận chuyển",
  DELIVERED: "Đã nhận hàng",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};
//Mapping màu sắc cho Badge dựa trên trạng thái
const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING:   "bg-amber-50  text-amber-600  border-amber-200",
  CONFIRMED: "bg-blue-50   text-blue-600   border-blue-200",
  PACKING:   "bg-purple-50 text-purple-600 border-purple-200",
  SHIPPING:  "bg-orange-50 text-orange-600 border-orange-200",
  DELIVERED: "bg-green-50  text-green-600  border-green-200",
  CANCELLED: "bg-red-50    text-red-600    border-red-200",
  REFUNDED:  "bg-gray-50   text-gray-600   border-gray-200",
};
//Định nghĩa 1 props
interface OrderItemProps {
  order: Order;
  onCancelOrder?: (orderId: number) => void;   
  onReviewOrder?: (orderId: number) => void;
  onGoToProduct?: (productItem: any) => void;
  onViewDetail?: (order : Order) => void;
}

export default function OrderItem({ order, onCancelOrder, onReviewOrder, onGoToProduct, onViewDetail }: OrderItemProps) {
  const {showNotification} = useNotification();
  const [rePaying, setRePaying] = useState(false);
  //Hàm xử lý tách ngày và giờ từ chuỗi ISO Date trả về từ API
  const formatOrderDate = (dateString: string) => {
    const d = new Date(dateString);
    const giờ  = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const ngày = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return { giờ, ngày };
  };


  const { giờ, ngày } = formatOrderDate(order.orderDate);
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const canReview = order.status === "DELIVERED";
  const isVnPayPending = order.status === "PENDING" && order.paymentMethod === "VNPAY"; // Hiện nút thanh toán lại nếu dùng VNPay mà chưa thanh toán

  //Hàm thanh toán lại qua VNPAY
  const handleRepay = async () => {
    setRePaying(true);
    try {
      const vnpayRes = await fetch("http://localhost:8080/api/vnpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          amount: order.totalAmount,
          orderInfo: `Thanh toán lại đơn hàng ${order.orderId}`,
        }),
      });

      if (!vnpayRes.ok) throw new Error("Không thể tạo lại liên kết VNPay");

      // Chuyển đổi phản hồi từ API thành đối tượng JSON
      const vnpayData = await vnpayRes.json();
      if (vnpayData.payUrl) {
        showNotification("Đang chuyển hướng đến cổng thanh toán VNPay...","success");
        window.location.href = vnpayData.payUrl;
      } else {
        throw new Error("Không tìm thấy đường dẫn thanh toán");
      }
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Thanh toán lại thất bại. Vui lòng thử lại sau.","error");
    } finally {
      setRePaying(false);
    }
  };
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow space-y-4 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="font-mono font-bold text-sm text-gray-900 mr-2">#{order.orderId}</span>
          <span className="text-xs text-gray-400">
            Đặt lúc: <strong className="text-gray-700 font-normal">{giờ}</strong> - {ngày}
          </span>
          <p className="mb-0.5">|</p>
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(order)}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
            >
              Xem chi tiết
            </button>
          )}
        </div>
        
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      
      </div>

      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.orderDetailId} className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onGoToProduct && onGoToProduct(item)}
                className="text-gray-800 hover:text-red-500 font-medium transition-colors text-left"
              >
                {item.productName} <span className="text-gray-400 font-mono">x{item.quantity}</span>
              </button>
              <p>|</p>
              {order.status === "DELIVERED" && (
                <a href={`/warranty?orderDetailId=${item.orderDetailId}`}
                  className="text-[10px] text-green-600 font-semibold hover:underline mt-1 block"
                  >
                   Xem thẻ bảo hành sản phẩm
                </a>
              )}
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
      {isVnPayPending && (
        <button onClick={handleRepay} disabled = {rePaying} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
          {rePaying ? "Đang xử lý..." : "Thanh toán lại qua VNPAY"}
        </button>
      )}
      <div className="flex items-center gap-2">
       {order.status === "DELIVERED" && (
        <button
          onClick={() => handleExportInvoice(order, ngày, giờ)}
          className="w-full py-2 bg-green-600 hover:bg-green-900 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          Xem hóa đơn
        </button>
       )}
        {canCancel && onCancelOrder && (
        <button 
          onClick={() => onCancelOrder(order.orderId)}
          className="mt-3 w-full py-2.5 text-red-600 border border-red-300 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors"
        >
          Hủy đơn hàng
        </button>
      )}
      {canReview && onReviewOrder && (
        <button
          onClick={() => onReviewOrder ? onReviewOrder(order.orderId) : showNotification(`Đánh giá đơn hàng #${order.orderId}`,"info")}
          className="w-full py-2.5 bg-blue-500 text-white hover:bg-blue-700 rounded-xl text-xs font-medium transition-colors"
        >
          Đánh giá đơn hàng
        </button>
      )}
      </div>

      
    </div>
  );
}