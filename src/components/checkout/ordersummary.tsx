import React from "react";

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
}

export default function OrderSummary({ cart,subTotal,discount,couponCode }: OrderSummaryProps) {
const finalTotal = subTotal - discount;
  return (
    <div className="bg-gray-100 p-6 rounded-2xl border border-gray-800 h-fit space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-800 pb-3">YOUR ORDER</h2>
      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-xs text-black">
            <span className="truncate max-w-[180px]">{item.name} <b className="text-red-500">x{item.quantity}</b></span>
            <span>${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800 pt-3 space-y-2 text-sm text-black">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span>${subTotal.toLocaleString()}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Giảm giá {couponCode ? `(${couponCode})` : ""}:</span>
            <span>-${discount.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t border-gray-400 pt-2 flex justify-between font-bold text-base">
          <span>Tổng thanh toán:</span>
          <span className="text-red-500">${finalTotal.toLocaleString()}</span>
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors mt-4"
      >
        Xác nhận đặt hàng
      </button>
    </div>
  );
}