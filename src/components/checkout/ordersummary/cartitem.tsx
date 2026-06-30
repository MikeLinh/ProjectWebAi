import React from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartItemsListProps {
  cart: CartItem[];
}

export default function CartItemsList({ cart }: CartItemsListProps) {
  return (
    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
      {cart.map((item) => (
        <div key={item.id} className="flex justify-between text-xs text-black">
          <span className="truncate max-w-[180px]">
            {item.name} <b className="text-red-500">x{item.quantity}</b>
          </span>
          <span>${(item.price * item.quantity).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}