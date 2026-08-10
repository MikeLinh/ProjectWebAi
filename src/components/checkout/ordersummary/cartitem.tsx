import React from "react";
import { formatVND } from "../../utils/formatCurrency";

//Định nghĩa cấu trúc dữ liệu cho một sản phẩm nằm trong giỏ hàng
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
// Cấu trúc Props truyền từ Component cha vào Component con
interface CartItemsListProps {
  cart: CartItem[];
}

export default function CartItemsList({ cart }: CartItemsListProps) {
  return (
    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
      {cart.map((item) => ( //Sử dụng map lặp qua từng phần tử 'Item' trong mảng cart
        <div key={item.id} className="flex justify-between text-xs text-black">
          <span className="truncate max-w-[180px]">
            {item.name} <b className="text-red-500">x{item.quantity}</b>
          </span>
          <span>{formatVND(item.price * item.quantity)}</span>
        </div>
      ))}
    </div>
  );
}