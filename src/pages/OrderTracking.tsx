/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import OrderFilter from "../components/ordertracking/orderfilter";
import OrderList from "../components/ordertracking/orderlist";
import { type Order, type OrderStatus } from "../components/ordertracking/orderitem";

function getCurrentUserId(): number | null {
  const rawUser =
    localStorage.getItem("current_user") ||
    localStorage.getItem("currentUser")  ||
    localStorage.getItem("user");
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser).userId ?? null;
  } catch {
    return null;
  }
}

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [timeSort, setTimeSort] = useState<"NEWEST" | "OLDEST" | "BY_HOUR">("NEWEST");
  const [selectedMonth, setSelectedMonth] = useState<string>("Tất cả");
  const [selectedYear, setSelectedYear] = useState<string>("Tất cả");

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8080/api/orders/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải đơn hàng");
        return res.json();
      })
      .then((data: Order[]) => setOrders(data))
      .catch((err) => {
        console.error(err);
        setError("Đã có lỗi khi tải đơn hàng. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold tracking-wide mb-8 uppercase">Lịch sử đơn hàng</h1>

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
            <OrderList orders={filteredAndSortedOrders} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}