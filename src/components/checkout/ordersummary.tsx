import React from "react";
import CartItemsList from "./ordersummary/cartitem";
import PriceBreakdown from "./ordersummary/pricebreakdown";
import ConfirmButton from "./ordersummary/confirmbutton";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummaryProps {
  cart: CartItem[];
  subTotal: number;
  discount: number;
  couponCode?: string;
  submitting?: boolean;
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