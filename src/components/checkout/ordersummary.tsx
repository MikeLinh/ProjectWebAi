import React from "react";
import CartItemsList from "./ordersummary/cartitem";
import PriceBreakdown from "./ordersummary/pricebreakdown";
import ConfirmButton from "./ordersummary/confirmbutton";

// Tái định nghĩa cấu trúc dữ liệu cho một sản phẩm trong giỏ hàng 
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
// Cấu trúc Props truyền từ Component cha
interface OrderSummaryProps {
  cart: CartItem[]; // Mảng danh sách sản phẩm để truyền xuống cho CartItemsList
  subTotal: number; // Tiền tạm tính, truyền xuống cho PriceBreakdown
  discount: number; // Tiền được giảm giá, truyền xuống cho PriceBreakdown
  couponCode?: string; // Mã giảm giá (nếu có), truyền xuống cho PriceBreakdown
  submitting?: boolean; // Trạng thái đang gửi đơn hàng, truyền xuống cho ConfirmButton
}

export default function OrderSummary({
  cart, subTotal, discount, couponCode, submitting,
}: OrderSummaryProps) {
  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-gray-800 h-fit space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-800 pb-3">
        ĐƠN HÀNG CỦA BẠN
      </h2>

      <CartItemsList cart={cart} />
      <PriceBreakdown
        subTotal={subTotal}
        discount={discount}
        couponCode={couponCode}
      />
      <ConfirmButton submitting={submitting} />
    </div>
  );
}