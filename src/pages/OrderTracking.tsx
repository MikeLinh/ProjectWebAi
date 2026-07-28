/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo} from "react";
import Navbar from "../components/home/navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/home/footer";
import OrderFilter from "../components/ordertracking/orderfilter";
import OrderList from "../components/ordertracking/orderlist";
import { type Order, type OrderStatus } from "../components/ordertracking/orderitem";
import { useNotification } from "../components/context/notificationcontext";
import OrderDetailModal from "../admin/components/orderdetailmodel";

// Định nghĩa hàm để lấy ID người dùng hiện tại từ bộ nhớ cục bộ
function getCurrentUserId(): number | null {
  const rawUser = localStorage.getItem("current_user") || 
                  localStorage.getItem("currentUser") || 
                  localStorage.getItem("user");
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser).userId ?? null;
  } catch {
    return null;
  }
}

export default function OrderTrackingPage() {
  const {showNotification} = useNotification()
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [timeSort, setTimeSort] = useState<"NEWEST" | "OLDEST" | "BY_HOUR">("NEWEST");
  const [selectedMonth, setSelectedMonth] = useState<string>("Tất cả");
  const [selectedYear, setSelectedYear] = useState<string>("Tất cả");
  const navigate = useNavigate();
  
  const handleUpdateStatus = async (id: number, newStatus: OrderStatus) =>{
    setUpdateId(id);
    try{
      const res = await fetch(`http://localhost:8080/api/orders/${id}/status`,{
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Cập nhật thất bại");

      setOrders((prev) => 
        prev.map((o)=> (o.orderId === id ? {...o, status: newStatus} : o))
      );
      if(selectedOrder?.orderId === id){
      setSelectedOrder((prev) => (prev ? {...prev, status: newStatus} : prev));
    }
    }catch(err){
      showNotification("Không thể cập nhâp trạng thái vui lòng thử lại","error");
      console.log(err);
    }finally{
      setUpdateId(null);
    }
  }
  // Định nghĩa hàm xử lý việc chuyển hướng người dùng đến trang chi tiết của một sản phẩm cụ thể trong đơn hàng
  const handleGoToProductDetail = (productItem: any) => {
    const productId = productItem.productId;
    if (!productId) {
      showNotification("Không xác định được sản phẩm để xem chi tiết.","error");
      return;
    }
    navigate(`/product/${productId}`);
  };
  // Định nghĩa hàm xử lý việc điều hướng người dùng đi đánh giá sản phẩm của một đơn hàng cụ thể
  const handleReviewOrder = (orderId: number) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order || order.items.length === 0) {
      showNotification("Không tìm thấy sản phẩm để đánh giá trong đơn hàng này.","error");
      return;
    }

    // Đơn hàng có thể có nhiều sản phẩm, mặc định điều hướng tới sản phẩm đầu tiên có productId hợp lệ
    const reviewableItem = order.items.find((item) => item.productId);
    if (!reviewableItem || !reviewableItem.productId) {
      showNotification("Không xác định được sản phẩm để đánh giá.","error");
      return;
    }
    navigate(`/product/${reviewableItem.productId}`);
  };
  // Định nghĩa hàm bất đồng bộ fetchOrders phụ trách việc gọi API lấy danh sách các đơn hàng từ máy chủ Backend
  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    const userId = getCurrentUserId();
    if (!userId) {
      setError("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/orders/user/${userId}`);
      if (!res.ok) throw new Error("Không thể tải đơn hàng");
      
      const data: Order[] = await res.json(); // Chuyển đổi dữ liệu phản hồi thành mảng dữ liệu định dạng JSON kiểu Order[]
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Đã có lỗi khi tải đơn hàng.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
   // Định nghĩa hàm bất đồng bộ handleCancelOrder xử lý việc yêu cầu hủy một đơn hàng từ phía khách hàng
  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        //Duyệt qua từng orderId cũ nếu trùng với ID thì sửa lại trạng thái CANCELLED
        setOrders(prev => prev.map(order => 
          order.orderId === orderId ? { ...order, status: "CANCELLED" as OrderStatus } : order
        ));
        showNotification("Đơn hàng đã được hủy thành công!","success");
      } else {
        showNotification("Không thể hủy đơn hàng ở trạng thái hiện tại.","error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Có lỗi xảy ra khi hủy đơn hàng.","error");
    }
  };
  // Hook useEffect tự động gọi hàm tải đơn hàng
  useEffect(() => {
    fetchOrders();
  }, []);

  // Sử dụng useMemo để tự động tính toán, lọc và sắp xếp lại danh sách đơn hàng
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (selectedMonth !== "Tất cả") {
      result = result.filter((order) => {
        const orderMonth = new Date(order.orderDate).getMonth() + 1;
        return orderMonth === parseInt(selectedMonth, 10);
      });
    }

    if (selectedYear !== "Tất cả") {
      result = result.filter((order) => {
        const orderYear = new Date(order.orderDate).getFullYear();
        return orderYear === parseInt(selectedYear, 10);
      });
    }
    // Thực hiện hàm sort để sắp xếp mảng kết quả sau khi đã qua tất cả các bộ lọc phía trên
    result.sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);

      if (timeSort === "NEWEST") return dateB.getTime() - dateA.getTime();
      if (timeSort === "OLDEST") return dateA.getTime() - dateB.getTime();
      if (timeSort === "BY_HOUR") {
        const hourA = dateA.getHours() * 60 + dateA.getMinutes();
        const hourB = dateB.getHours() * 60 + dateB.getMinutes();
        return hourB - hourA;
      }
      return 0;
    });

    return result;
  }, [orders, statusFilter, timeSort, selectedMonth, selectedYear]);

  return (
    <div className="bg-white min-h-screen text-black flex flex-col justify-between">
      <Navbar />
      <div className="max-w-4xl w-full mx-auto px-4 py-10 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide uppercase">Lịch sử đơn hàng</h1>
          
          <button
            onClick={() => fetchOrders(false)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-70"
          >
            {refreshing ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Đang tải đơn hàng...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        ) : (
          <>
            <OrderFilter
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              timeSort={timeSort}
              setTimeSort={setTimeSort}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              setSelectedYear={setSelectedYear}
              selectedYear={selectedYear}
            />
            <OrderList 
              orders={filteredAndSortedOrders} 
              onCancelOrder={handleCancelOrder}
              onReviewOrder={handleReviewOrder}
              onGoToProduct={handleGoToProductDetail}
              onViewDetail={(orders) => setSelectedOrder(orders)}
            />
          </>
        )}
      </div>
      {selectedOrder &&(
        <OrderDetailModal
          order={selectedOrder}
          onClose={()=> setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          updatingId={updateId} 
        />
      )}

      <Footer />
    </div>
  );
}