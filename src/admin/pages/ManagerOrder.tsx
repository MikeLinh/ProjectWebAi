/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import OrderDetailModal from "../components/orderdetailmodel";
import { useNotification } from "../../components/context/notificationcontext";

// Định nghĩa các loại trạng thái mà một đơn hàng có thể có
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  ;
// Khai báo cấu trúc dữ liệu cho một sản phẩm nằm trong đơn hàng
interface OrderItem {
  orderDetailId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}
// Khai báo cấu trúc dữ liệu tổng quan của một Đơn hàng
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
  paymentMethod?: string;
  items: OrderItem[];

}
// Ánh xạ trạng thái đơn hàng từ mã hệ thống sang hiển thị Tiếng Việt
const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PACKING:   "Đang đóng gói",
  SHIPPING:  "Đang vận chuyển",
  DELIVERED: "Đã nhận hàng",
  CANCELLED: "Đã hủy",
  REFUNDED:  "Đã hoàn tiền",
};
// Ánh xạ các class Tailwind CSS màu sắc giao diện tương ứng với từng trạng thái
const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:   "bg-amber-50  text-amber-600  border-amber-200",
  CONFIRMED: "bg-blue-50   text-blue-600   border-blue-200",
  PACKING:   "bg-purple-50 text-purple-600 border-purple-200",
  SHIPPING:  "bg-orange-50 text-orange-600 border-orange-200",
  DELIVERED: "bg-green-50  text-green-600  border-green-200",
  CANCELLED: "bg-red-50    text-red-600    border-red-200",
  REFUNDED:  "bg-gray-50   text-gray-600   border-gray-200",
};
// Định nghĩa nút hành động tiếp theo và trạng thái chuyển tiếp tương ứng trong quy trình vận hành đơn hàng
const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  PENDING:   { label: "Xác nhận đơn",       next: "CONFIRMED" },
  CONFIRMED: { label: "Bắt đầu đóng gói",   next: "PACKING" },
  PACKING:   { label: "Giao cho vận chuyển", next: "SHIPPING" },
  SHIPPING:  { label: "Xác nhận đã giao",   next: "DELIVERED" },
};

export default function ManageOrders() {
  const {showNotification} = useNotification();
  const [orders, setOrders] = useState<Order[]>([]); // Danh sách tất cả đơn hàng tải từ API
  const [loading, setLoading] = useState(true); 
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // ID của đơn hàng đang trong tiến trình xử lý cập nhật trạng thái API
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm (Tên khách hàng / Mã đơn)
  const [statusFilter, setStatusFilter] = useState("ALL"); // Bộ lọc trạng thái đơn hàng

  // Xử lý bộ lọc dữ liệu đơn hàng
  const displayOrders = orders.filter((o) => {
    // Kiểm tra trùng khớp bộ lọc trạng thái
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    // Kiểm tra trùng khớp từ khóa tìm kiếm
    const matchSearch = o.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.orderId.toString().includes(searchTerm);
    return matchSearch && matchStatus;
  }).slice(0,20); //Tối đa 20 dữ liệu đầu tiên

  // Chạy nạp dữ liệu một lần duy nhất khi component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  // Thêm hàm mới, gọi đúng endpoint /cancel (có refund + restock) thay vì /status
  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này? Nếu đã thanh toán VNPAY, hệ thống sẽ tự động hoàn tiền.")) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        showNotification(data.message || "Không thể hủy đơn hàng ở trạng thái hiện tại.", "error");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: data.status as OrderStatus } : o))
      );
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: data.status as OrderStatus } : prev));
      }
      showNotification(data.message || "Đơn hàng đã được hủy thành công!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Có lỗi xảy ra khi hủy đơn hàng.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Hàm gọi API lấy danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/orders");
      if (!res.ok) throw new Error("Lỗi tải đơn hàng");
      const data = await res.json();
      setOrders(data); // Cập nhật danh sách đơn hàng vào state
    } catch (err) { 
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // Hàm xử lý cập nhật trạng thái đơn hàng bất đồng bộ
  const handleUpdateStatus = async (id: number, newStatus: OrderStatus) => {
    setUpdatingId(id); // Đặt ID đang cập nhật để tạm khóa nút, ngăn việc click trùng lặp (spam click)
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${id}/status`, {
        method: "PATCH", // sử dụng để cập nhập riêng cho một đối tượng 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");

      // Cập nhật lại mảng danh sách đơn hàng ở Client mà không cần gọi lại fetchOrders
      setOrders((prev) =>
        prev.map((o) => (o.orderId === id ? { ...o, status: newStatus } : o))
      );
      // Nếu người dùng đang mở Modal chi tiết đơn hàng hiện tại, đồng bộ luôn trạng thái mới vào Modal đó
      if (selectedOrder?.orderId === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (err) {
      showNotification("Không thể cập nhật trạng thái. Vui lòng thử lại.","error");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };
  //Hàm xử lý hoàn tiền
  const handleRefund = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc muốn hoàn tiền đơn hàng này?")) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch("http://localhost:8080/api/vnpay/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId,
          createBy: "admin", // có thể lấy từ user đang login
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showNotification(data.message || "Hoàn tiền thất bại nhưng đã ghi nhận thông tin", "success");
        return;
      }

      // Cập nhật local state
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: "REFUNDED" as OrderStatus } : o
        )
      );
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "REFUNDED" as OrderStatus } : prev
        );
      }

      showNotification(data.message || "Hoàn tiền thành công!", "success");
    } catch (err: any) {
      showNotification(err.message || "Đã xử lý hoàn tất.", "success");
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
          {/* Input tìm kiếm */}
            <input
              type="text"
              placeholder="Tìm kiếm tên khách, mã đơn"
              className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {/* Bộ lọc lựa chọn trạng thái đơn */}
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
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
            {/* Nút refresh tải lại danh sách thủ công */}
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
          // Trạng thái đang tải từ API
          <div className="text-center py-16 text-gray-400 text-sm">Đang tải...</div>
        ) : orders.length === 0 ? (
          // Trạng thái mảng rỗng
          <div className="text-center py-16 text-gray-400 text-sm">
            Chưa có đơn hàng nào.
          </div>
        ) : (
          // Bảng kết quả chính
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
                const action = NEXT_ACTION[o.status]; // Lấy thông tin hành động tiếp theo của đơn hàng này
                const isUpdating = updatingId === o.orderId; // Kiểm tra xem dòng đơn hàng này có đang gửi request PATCH hay không
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
                      {/* Nút xem chi tiết đơn hàng */}
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-semibold text-gray-700"
                      >
                        Chi tiết
                      </button>
                      {/* Chỉ hiển thị nút duyệt bước tiếp theo nếu đơn hàng có cấu hình định nghĩa hành động hợp lệ */}
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
        order={selectedOrder} // Truyền dữ liệu chi tiết của đơn hàng đang chọn
        onClose={() => setSelectedOrder(null)} // Đóng modal bằng cách reset về null
        onUpdateStatus={handleUpdateStatus} // Cho phép cập nhật trạng thái đơn trực tiếp từ giao diện Modal chi tiết
        onRefund={handleRefund}  // Cho phép hoàn tiền trực tiếp từ giao diện Modal chi tiết
        onCancelOrder={handleCancelOrder} // Cho phép hủy đơn trực tiếp từ giao diện Modal chi tiết
        updatingId={updatingId} 
      />
    </div>
  );
}