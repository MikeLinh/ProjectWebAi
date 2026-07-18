/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from "react";
import VerifiedIcon from "@mui/icons-material/Verified";
import ErrorOutlineIcon from "@mui/icons-material/Error";
import BlockIcon from "@mui/icons-material/Block";
import InventoryIcon from "@mui/icons-material/Inventory";
import RefreshIcon from "@mui/icons-material/Refresh";

import { warrantyService, type Warranty, type WarrantyStatus } from "../../backend/src/main/java/com/source/service/WarrantyService";
import WarrantyDetailModal from "../components/warranty/Warrantydetailmodal";
import { useAuth } from "../components/context/authcontext";

import Navbar from "../components/home/navbar"; 
import Footer from "../components/home/footer";

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

export default function UserWarranty() {
  const { user } = useAuth();
  const resolvedUserId: number | null = user?.userId ?? null;

  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadWarranties = useCallback(async () => {
    if (!user) {
      setError("Vui lòng đăng nhập để xem bảo hành của bạn.");
      setLoading(false);
      return;
    }
    if (resolvedUserId == null) {
      setError("Không xác định được tài khoản đang đăng nhập.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await warrantyService.getByUser(resolvedUserId);
      setWarranties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách bảo hành");
    } finally {
      setLoading(false);
    }
  }, [user, resolvedUserId]);

  useEffect(() => {
    loadWarranties();
  }, [loadWarranties]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-grow p-6 space-y-5 text-black max-w-4xl w-full mx-auto mt-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-extrabold text-blue-950">Bảo hành của tôi</h1>
        
          <button
            onClick={loadWarranties}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 active:scale-95 disabled:opacity-50 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl shadow-sm transition-all duration-200"
          >
            <RefreshIcon fontSize="small" className={loading ? "animate-spin" : ""} />
            {loading ? "Đang tải..." : "Tải lại"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
            {error}
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-10">
            <p className="text-gray-400 animate-pulse text-sm">Đang đồng bộ dữ liệu bảo hành...</p>
          </div>
        )}

        {!loading && !error && warranties.length === 0 && (
          <div className="border border-dashed border-gray-300 bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm">
            <InventoryIcon fontSize="large" className="mb-2 text-gray-300" />
            <p className="font-medium text-gray-600">Bạn chưa có thẻ bảo hành nào.</p>
            <p className="text-xs mt-1">
              Thẻ bảo hành sẽ tự động xuất hiện tại đây sau khi đơn hàng được giao thành công.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {warranties.map((w) => {
            const StatusIcon = STATUS_ICON[w.status];
            return (
              <div
                key={w.warrantyId}
                onClick={() => setSelectedId(w.warrantyId)}
                className="border border-gray-200 shadow-sm rounded-2xl p-5 space-y-3 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 bg-white"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-950 tracking-wide">{w.warrantyCode}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[w.status]}`}
                  >
                    <StatusIcon fontSize="inherit" style={{ fontSize: '14px' }} />
                    {STATUS_LABEL[w.status]}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 line-clamp-2">
                  {w.orderDetail?.productName ?? "—"}
                </p>
                <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                  Thời hạn: <span className="text-gray-600 font-medium">{formatDate(w.startDate)}</span> — <span className="text-gray-600 font-medium">{formatDate(w.endDate)}</span>
                </p>
              </div>
            );
          })}
        </div>

        <WarrantyDetailModal
          warrantyId={selectedId}
          onClose={() => setSelectedId(null)}
          readOnly={true}
        />
      </div>
      <Footer />
    </div>
  );
}