import React from "react";
import OrderItem from "./orderitem";
import type { Order } from "./orderitem";

interface OrderListProps {
  orders: Order[];
  onCancelOrder?: (orderId: number) => void;
}

export default function OrderList({ orders, onCancelOrder }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-2xl text-gray-400 text-sm">
        Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderItem key={order.orderId} order={order} onCancelOrder={onCancelOrder} />
      ))}
    </div>
  );
}