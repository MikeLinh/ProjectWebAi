import React, { useState, useMemo } from "react";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import OrderFilter from "../components/ordertracking/orderfilter"; 
import OrderList from "../components/ordertracking/orderlist"; 
import { type Order } from "../components/ordertracking/orderitem"; 

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-9982",
    date: "2026-06-19T08:30:00",
    total: 3500,
    status: "Đang giao",
    items: [{ name: "Trek Emonda SLR 9", quantity: 1, price: 3500 }]
  },
  {
    id: "ORD-9123",
    date: "2026-06-15T14:45:00",
    total: 1200,
    status: "Đã giao",
    items: [{ name: "Specialized Allez Sprint", quantity: 1, price: 1200 }]
  },
  {
    id: "ORD-8841",
    date: "2026-05-20T19:15:00",
    total: 2400,
    status: "Đã hủy",
    items: [{ name: "Giant TCR Advanced Pro", quantity: 1, price: 2400 }]
  },
  {
    id: "ORD-7721",
    date: "2026-05-02T10:00:00",
    total: 4500,
    status: "Đã giao",
    items: [{ name: "Cervelo S5 Disc", quantity: 1, price: 4500 }]
  }
];

export default function OrderTrackingPage() {
    const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
    const [timeSort, setTimeSort] = useState<"NEWEST" | "OLDEST" | "BY_HOUR">("NEWEST");
    const [selectedMonth, setSelectedMonth] = useState<string>("Tất cả");
    const [selectedYear, setSelectedYear] = useState<string>("Tất cả");

 
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...MOCK_ORDERS]; 
        if (statusFilter !== "Tất cả") {
        result = result.filter((order) => order.status === statusFilter);
        }

    if (selectedMonth !== "Tất cả") {
        result = result.filter((order) => {
            const orderMonth = new Date(order.date).getMonth() + 1;
            return orderMonth === parseInt(selectedMonth,10); 
        });
    }
    if(selectedYear !== "Tất cả"){
        result = result.filter((order)=>{
            const orderYear= new Date(order.date).getFullYear();
            return orderYear === parseInt(selectedYear,10);
        })
    }

  
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (timeSort === "NEWEST") {
        return dateB.getTime() - dateA.getTime(); 
      }
      if (timeSort === "OLDEST") {
        return dateA.getTime() - dateB.getTime(); 
      }
      if (timeSort === "BY_HOUR") {
        const hourA = dateA.getHours() * 60 + dateA.getMinutes();
        const hourB = dateB.getHours() * 60 + dateB.getMinutes();
        return hourB - hourA; 
      }
      return 0; 
    });

    return result;
  }, [statusFilter, timeSort, selectedMonth, selectedYear]); 

  return (
 
    <div className="bg-white min-h-screen text-black flex flex-col justify-between">
      <Navbar /> 
      <div className="max-w-4xl w-full mx-auto px-4 py-10 flex-1">
        <h1 className="text-2xl font-bold tracking-wide mb-8 uppercase">Lịch sử đơn hàng</h1>

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
      </div>

      <Footer />
    </div>
  );
}