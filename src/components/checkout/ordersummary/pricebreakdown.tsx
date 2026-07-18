import React from "react";


// Cấu trúc Props truyền từ Component cha (Checkout hoặc Giỏ hàng)
interface PriceBreakdownProps {
  subTotal: number; // Số tiền tạm tính
  discount: number; // Số tiền được giảm giá
  couponCode?: string; // Mã giảm giá áp dụng
}

export default function PriceBreakdown({
  subTotal, discount, couponCode,
}: PriceBreakdownProps) {
  const finalTotal = subTotal - discount;

  return (
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
  );
}