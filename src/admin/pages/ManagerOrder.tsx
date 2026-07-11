/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import OrderDetailModal from "../components/orderdetailmodel";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  ;

interface OrderItem {
  orderDetailId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: number;
  userId: number;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  note?: string;
  items: OrderItem[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PACKING:   "Đang đóng gói",
  SHIPPING:  "Đang vận chuyển",
  DELIVERED: "Đã nhận hàng",
  CANCELLED: "Đã hủy",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:   "bg-amber-50  text-amber-600  border-amber-200",
  CONFIRMED: "bg-blue-50   text-blue-600   border-blue-200",
  PACKING:   "bg-purple-50 text-purple-600 border-purple-200",
  SHIPPING:  "bg-orange-50 text-orange-600 border-orange-200",
  DELIVERED: "bg-green-50  text-green-600  border-green-200",
  CANCELLED: "bg-red-50    text-red-600    border-red-200",
};

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  PENDING:   { label: "Xác nhận đơn",       next: "CONFIRMED" },
  CONFIRMED: { label: "Bắt đầu đóng gói",   next: "PACKING" },
  PACKING:   { label: "Giao cho vận chuyển", next: "SHIPPING" },
  SHIPPING:  { label: "Xác nhận đã giao",   next: "DELIVERED" },
};

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const displayOrders = orders.filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchSearch = o.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.orderId.toString().includes(searchTerm);
    return matchSearch && matchStatus;
  })

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/orders");
      if (!res.ok) throw new Error("Lỗi tải đơn hàng");
      const data = await res.json();
      setOrders(data);
    } catch (err) { 
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: OrderStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");

      setOrders((prev) =>
        prev.map((o) => (o.orderId === id ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder?.orderId === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (err) {
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý hóa đơn mua hàng</h1>
        <div className="flex gap-3 items-center text-[15px]"> 
            <input
              type="text"
              placeholder="Tìm kiếm tên khách, mã đơn"
              className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PACKING">Đang đóng gói</option>
              <option value="SHIPPING">Đang vận chuyển</option>
              <option value="DELIVERED">Đã nhận hàng</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
            <button
                  onClick={fetchOrders}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg font-semibold text-gray-700"
                >
                  ↻ Tải lại
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-black">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Chưa có đơn hàng nào.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Tổng cộng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Xử lý hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayOrders.map((o) => {
                const action = NEXT_ACTION[o.status];
                const isUpdating = updatingId === o.orderId;
                return (
                  <tr key={o.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold">#{o.orderId}</td>
                    <td className="p-4 font-medium text-gray-900">{o.receiverName}</td>
                    <td className="p-4 text-red-600 font-bold">
                      ${o.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${STATUS_COLOR[o.status]}`}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-semibold text-gray-700"
                      >
                        Chi tiết
                      </button>
                      {action && (
                        <button
                          onClick={() => handleUpdateStatus(o.orderId, action.next)}
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-bold"
                        >
                          {isUpdating ? "..." : action.label}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        updatingId={updatingId}
      />
    </div>
  );
}