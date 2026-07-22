import React from "react";
import type { OrderStatus } from "./orderitem";

// Định nghĩa danh sách tùy chọn cho bộ lọc trạng thái
const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL",        label: "Tất cả" },
  { value: "PENDING",    label: "Chờ xác nhận" },
  { value: "CONFIRMED",  label: "Đã xác nhận" },
  { value: "PACKING",    label: "Đang đóng gói" },
  { value: "SHIPPING",   label: "Đang vận chuyển" },
  { value: "DELIVERED",  label: "Đã nhận hàng" },
];

interface OrderFilterProps {
  statusFilter: OrderStatus | "ALL";
  setStatusFilter: (status: OrderStatus | "ALL") => void;
  timeSort: "NEWEST" | "OLDEST" | "BY_HOUR";
  setTimeSort: (sort: "NEWEST" | "OLDEST" | "BY_HOUR") => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

export default function OrderFilter({
  statusFilter, setStatusFilter,
  timeSort, setTimeSort,
  selectedMonth, setSelectedMonth,
  setSelectedYear, selectedYear,
}: OrderFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
      <div className="space-y-3 md:col-span-2">
        <label className="font-bold text-gray-600 block mb-3">Trạng thái đơn hàng</label>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                statusFilter === opt.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="font-bold text-gray-600 block mb-3">Sắp xếp thời gian</label>
        <select
          value={timeSort}
          onChange={(e) => setTimeSort(e.target.value as "NEWEST" | "OLDEST" | "BY_HOUR")}
          className="w-full bg-white border border-gray-300 p-2 rounded-lg font-medium cursor-pointer outline-none focus:border-black"
        >
          <option value="NEWEST">Mới nhất</option>
          <option value="OLDEST">Cũ nhất</option>
          <option value="BY_HOUR">Giờ trong ngày</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          <label className="font-bold text-gray-600 block mb-3">Tháng</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-white border border-gray-300 p-2 rounded-lg font-medium cursor-pointer outline-none focus:border-black"
          >
            <option value="Tất cả">Tất cả</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m.toString()}>Tháng {String(m).padStart(2, "0")}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="font-bold text-gray-600 block mb-3">Năm</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-white border border-gray-300 p-2 rounded-lg font-medium cursor-pointer outline-none focus:border-black"
          >
            <option value="Tất cả">Tất cả</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>Năm {year}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}