/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import MonetizationOnIcon  from "@mui/icons-material/MonetizationOn";
import LocalShippingIcon   from "@mui/icons-material/LocalShipping";
import DirectionsBikeIcon  from "@mui/icons-material/DirectionsBike";
import LocalActivityIcon   from "@mui/icons-material/LocalActivity";
import CancelIcon          from "@mui/icons-material/Cancel";

interface Stats {
  totalRevenue:    number;
  totalOrders:     number;
  pendingOrders:   number;
  cancelledOrders: number;
  totalProducts:   number;
  totalUsers:      number;
  activePromos:    number;
  revenueByMonth:  Record<string, number>;
  ordersByMonth:   Record<string, number>;
  topProducts:     { name: string; sold: number }[];
  chartYear:       number;
}

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export default function DashboardOverview() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [month, setMonth]       = useState<string>("ALL");
  const [year, setYear]         = useState<string>(String(CURRENT_YEAR));

  useEffect(() => {
    fetchStats();
  }, [month, year]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month !== "ALL") params.set("month", month);
      if (year  !== "ALL") params.set("year",  year);
      const res  = await fetch(`http://localhost:8080/api/overview/stats?${params}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    } finally {
      setLoading(false);
    }
  };

  const barHeight = (value: number, max: number) =>
    max === 0 ? 0 : Math.max(4, Math.round((value / max) * 100));

  const revenueMax = stats
    ? Math.max(...Object.values(stats.revenueByMonth).map(Number), 1)
    : 1;
  const ordersMax = stats
    ? Math.max(...Object.values(stats.ordersByMonth).map(Number), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>

        <div className="flex gap-2 text-xs">
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500 bg-white font-medium">
            <option value="ALL">Tất cả tháng</option>
            {MONTHS.map((m, i) => (
              <option key={i+1} value={String(i+1)}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500 bg-white font-medium">
            <option value="ALL">Tất cả năm</option>
            {YEARS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          <button onClick={fetchStats}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl font-semibold text-gray-600">
            ↻
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Đang tải thống kê...</div>
      ) : !stats ? (
        <div className="text-center py-20 text-red-400 text-sm">Lỗi tải dữ liệu.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Doanh thu",
                value: `$${Number(stats.totalRevenue).toLocaleString()}`,
                icon:  <MonetizationOnIcon fontSize="small" />,
                bg:    "bg-green-50 text-green-600 border-green-200",
              },
              {
                label: "Tổng đơn hàng",
                value: `${stats.totalOrders} đơn`,
                icon:  <LocalShippingIcon fontSize="small" />,
                bg:    "bg-blue-50 text-blue-600 border-blue-200",
              },
              {
                label: "Chờ xử lý",
                value: `${stats.pendingOrders} đơn`,
                icon:  <LocalShippingIcon fontSize="small" />,
                bg:    "bg-amber-50 text-amber-600 border-amber-200",
              },
              {
                label: "Đã hủy",
                value: `${stats.cancelledOrders} đơn`,
                icon:  <CancelIcon fontSize="small" />,
                bg:    "bg-red-50 text-red-600 border-red-200",
              },
              {
                label: "Sản phẩm",
                value: `${stats.totalProducts} xe`,
                icon:  <DirectionsBikeIcon fontSize="small" />,
                bg:    "bg-purple-50 text-purple-600 border-purple-200",
              },
              {
                label: "Khuyến mãi",
                value: `${stats.activePromos} mã`,
                icon:  <LocalActivityIcon fontSize="small" />,
                bg:    "bg-pink-50 text-pink-600 border-pink-200",
              },
            ].map((card) => (
              <div key={card.label}
                className={`${card.bg} border rounded-2xl p-4 space-y-2`}>
                <div className="flex items-center gap-2 opacity-80">{card.icon}
                  <span className="text-[11px] font-bold uppercase tracking-wide">{card.label}</span>
                </div>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-1">
              Doanh thu theo tháng — {stats.chartYear}
            </h2>
            <p className="text-xs text-gray-400 mb-5">Chỉ tính đơn hàng đã giao (DELIVERED)</p>
            <div className="flex items-end gap-1.5 h-40">
              {MONTHS.map((label, i) => {
                const val = Number(stats.revenueByMonth[String(i + 1)] ?? 0);
                const h   = barHeight(val, revenueMax);
                const isCurrentMonth = month !== "ALL"
                  ? parseInt(month) === i + 1
                  : new Date().getMonth() === i;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    {val > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        ${val.toLocaleString()}
                      </div>
                    )}
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isCurrentMonth ? "bg-blue-600" : "bg-blue-300"
                      } ${val === 0 ? "bg-gray-100" : ""}`}
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[9px] text-gray-400 font-medium">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-1">
                Đơn hàng theo tháng — {stats.chartYear}
              </h2>
              <p className="text-xs text-gray-400 mb-5">Tất cả trạng thái</p>
              <div className="flex items-end gap-1.5 h-28">
                {MONTHS.map((label, i) => {
                  const val = Number(stats.ordersByMonth[String(i + 1)] ?? 0);
                  const h   = barHeight(val, ordersMax);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {val > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {val}
                        </div>
                      )}
                      <div
                        className={`w-full rounded-t-lg ${val === 0 ? "bg-gray-100" : "bg-emerald-400"}`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[9px] text-gray-400">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">
                Top sản phẩm bán chạy
                {month !== "ALL" && ` — T${month}`}
                {year  !== "ALL" && `/${year}`}
              </h2>
              {stats.topProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Chưa có dữ liệu trong kỳ này.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topProducts.map((p, idx) => {
                    const maxSold = stats.topProducts[0].sold;
                    const pct     = maxSold === 0 ? 0 : Math.round((p.sold / maxSold) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-800 truncate max-w-[200px]">
                            <span className="text-gray-400 mr-1">#{idx + 1}</span>
                            {p.name}
                          </span>
                          <span className="font-bold text-blue-600 flex-shrink-0">
                            {p.sold} xe
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}