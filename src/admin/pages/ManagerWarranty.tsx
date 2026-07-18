/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/ManagerWarranty.tsx
// Trang quản lý bảo hành dành cho Admin: xem toàn bộ thẻ bảo hành, lọc theo trạng thái,
// tìm theo mã bảo hành/serial/tên sản phẩm, và mở modal để cập nhật + thêm lịch sử sửa chữa.
// Đặt file này trong src/pages/ (cùng cấp với ManagerOrder.tsx) rồi thêm route trỏ tới đây.

import React, { useEffect, useMemo, useState, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedIcon from "@mui/icons-material/Verified";
import ErrorOutlineIcon from "@mui/icons-material/Error";
import BlockIcon from "@mui/icons-material/Block";

import { warrantyService, type Warranty, type WarrantyStatus } from "../../../backend/src/main/java/com/source/service/WarrantyService";
import WarrantyDetailModal from "../../components/warranty/Warrantydetailmodal";

const STATUS_LABEL: Record<WarrantyStatus, string> = {
  ACTIVE: "Còn hiệu lực",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
};

const STATUS_STYLE: Record<WarrantyStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-600",
};

const STATUS_ICON: Record<WarrantyStatus, React.ElementType> = {
  ACTIVE: VerifiedIcon,
  EXPIRED: ErrorOutlineIcon,
  CANCELLED: BlockIcon,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export default function ManagerWarranty() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadWarranties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await warrantyService.getAll();
      setWarranties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách bảo hành");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarranties();
  }, [loadWarranties]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return warranties.filter((w) => {
      const matchStatus = statusFilter === "ALL" || w.status === statusFilter;
      const matchKeyword =
        keyword === "" ||
        w.warrantyCode.toLowerCase().includes(keyword) ||
        (w.serialNumber ?? "").toLowerCase().includes(keyword) ||
        (w.orderDetail?.productName ?? "").toLowerCase().includes(keyword);
      return matchStatus && matchKeyword;
    });
  }, [warranties, search, statusFilter]);

  return (
    <div className="p-6 space-y-5 text-black">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">Quản lý bảo hành</h1>
      </div>

      {/* Thanh tìm kiếm + lọc */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon
            fontSize="small"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2.5"
            placeholder="Tìm theo mã bảo hành, serial, tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border border-gray-300 rounded-xl px-3 py-2.5"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WarrantyStatus | "ALL")}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Còn hiệu lực</option>
          <option value="EXPIRED">Hết hạn</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Bảng danh sách */}
      <div className="border border-gray-800 rounded-2xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="text-left p-3">Mã bảo hành</th>
              <th className="text-left p-3">Sản phẩm</th>
              <th className="text-left p-3">Ngày bắt đầu</th>
              <th className="text-left p-3">Ngày kết thúc</th>
              <th className="text-left p-3">Trạng thái</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Đang tải...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Không tìm thấy thẻ bảo hành nào.
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((w) => {
                const StatusIcon = STATUS_ICON[w.status];
                return (
                  <tr
                    key={w.warrantyId}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedId(w.warrantyId)}
                  >
                    <td className="p-3 font-bold">{w.warrantyCode}</td>
                    <td className="p-3">{w.orderDetail?.productName ?? "—"}</td>
                    <td className="p-3">{formatDate(w.startDate)}</td>
                    <td className="p-3">{formatDate(w.endDate)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[w.status]}`}
                      >
                        <StatusIcon fontSize="inherit" />
                        {STATUS_LABEL[w.status]}
                      </span>
                    </td>
                    <td className="p-3 text-blue-600 font-bold">Xem</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <WarrantyDetailModal
        warrantyId={selectedId}
        onClose={() => setSelectedId(null)}
        readOnly={false}
        onUpdated={loadWarranties}
      />
    </div>
  );
}