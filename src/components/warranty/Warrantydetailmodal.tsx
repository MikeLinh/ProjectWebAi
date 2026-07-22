/* eslint-disable react-hooks/set-state-in-effect */


import React, { useEffect, useState, useCallback } from "react";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import ErrorOutlineIcon from "@mui/icons-material/Error";
import BlockIcon from "@mui/icons-material/Block";

import {
  warrantyService,
  warrantyHistoryService,
  type Warranty,
  type WarrantyHistory,
  type WarrantyStatus,
  type RepairStatus,
} from "../../../backend/src/main/java/com/source/service/WarrantyService";

interface WarrantyDetailModalProps {
  warrantyId: number | null;
  onClose: () => void;
  readOnly?: boolean;
  onUpdated?: () => void;
}

const STATUS_LABEL: Record<WarrantyStatus, string> = {
  ACTIVE: "Còn hiệu lực",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
};

const STATUS_STYLE: Record<WarrantyStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-600",
  EXPIRED: "bg-gray-100 text-gray-500 border-gray-400",
  CANCELLED: "bg-red-100 text-red-600 border-red-600",
};

const STATUS_ICON: Record<WarrantyStatus, React.ElementType> = {
  ACTIVE: VerifiedIcon,
  EXPIRED: ErrorOutlineIcon,
  CANCELLED: BlockIcon,
};

const REPAIR_STEPS: { value: RepairStatus; label: string; icon: React.ElementType }[] = [
  { value: "RECEIVED", label: "Đã tiếp nhận máy", icon: Inventory2Icon },
  { value: "REPAIRING", label: "Đang sửa chữa", icon: BuildIcon },
  { value: "COMPLETED", label: "Đã sửa xong", icon: CheckCircleOutlineIcon },
  { value: "RETURNED", label: "Đã trả khách", icon: LocalShippingIcon },
];

function repairLabel(status: string) {
  return REPAIR_STEPS.find((s) => s.value === status)?.label ?? status;
}

function repairIcon(status: string) {
  return REPAIR_STEPS.find((s) => s.value === status)?.icon ?? BuildIcon;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN");
}

function formatMoney(amount: number | null) {
  if (amount == null) return null;
  return amount.toLocaleString("vi-VN") + " đ";
}

export default function WarrantyDetailModal({
  warrantyId,
  onClose,
  readOnly = false,
  onUpdated,
}: WarrantyDetailModalProps) {
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [history, setHistory] = useState<WarrantyHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form chỉnh sửa thẻ bảo hành
  const [status, setStatus] = useState<WarrantyStatus>("ACTIVE");
  const [note, setNote] = useState("");

  // Form thêm lịch sử sửa chữa mới
  const [newStatus, setNewStatus] = useState<RepairStatus>("RECEIVED");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [technician, setTechnician] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [addingHistory, setAddingHistory] = useState(false);

  const loadData = useCallback(async () => {
    if (warrantyId == null) return;
    setLoading(true);
    setError(null);
    try {
      const [w, h] = await Promise.all([
        warrantyService.getById(warrantyId),
        warrantyHistoryService.getByWarrantyId(warrantyId),
      ]);
      setWarranty(w);
      setStatus(w.status);
      setNote(w.note ?? "");
      setHistory(
        [...h].sort(
          (a, b) =>
            new Date(b.receivedDate ?? b.createdAt).getTime() -
            new Date(a.receivedDate ?? a.createdAt).getTime()
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu bảo hành");
    } finally {
      setLoading(false);
    }
  }, [warrantyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (warrantyId == null) return null;

  const handleSave = async () => {
    if (!warranty) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await warrantyService.update(warranty.warrantyId, {
        ...warranty,
        status,
        note: note || null,
      });
      setWarranty(updated);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleAddHistory = async () => {
    if (!warranty) return;
    if (!problem.trim() && newStatus === "RECEIVED") {
      setError("Vui lòng nhập mô tả vấn đề/lỗi khi tiếp nhận máy");
      return;
    }
    setAddingHistory(true);
    setError(null);
    try {
      await warrantyHistoryService.create({
        warranty: { warrantyId: warranty.warrantyId },
        status: newStatus,
        problem: problem || undefined,
        solution: solution || undefined,
        technician: technician || undefined,
        repairCost: repairCost ? Number(repairCost) : null,
      });
      setProblem("");
      setSolution("");
      setTechnician("");
      setRepairCost("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thêm lịch sử thất bại");
    } finally {
      setAddingHistory(false);
    }
  };

  const StatusIcon = warranty ? STATUS_ICON[warranty.status] : VerifiedIcon;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-7 space-y-5 text-black text-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-800 pb-3">
          <h2 className="text-xl font-extrabold">
            Thẻ bảo hành {warranty ? `#${warranty.warrantyCode}` : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {loading && <p className="text-gray-500">Đang tải...</p>}
        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {warranty && !loading && (
          <>
            {/* Trạng thái nổi bật */}
            <div
              className={`flex items-center gap-2 border rounded-xl px-4 py-3 font-bold ${STATUS_STYLE[warranty.status]}`}
            >
              <StatusIcon fontSize="small" />
              {STATUS_LABEL[warranty.status]}
            </div>

            {/* Thông tin sản phẩm / đơn hàng */}
            <div className="space-y-2 border border-gray-800 p-4 rounded-xl">
              <p>
                <b>Sản phẩm:</b> {warranty.orderDetail?.productName ?? "—"}
              </p>
              {warranty.orderDetail?.orderId != null && (
                <p>
                  <b>Thuộc đơn hàng:</b> #{warranty.orderDetail.orderId}
                </p>
              )}
              <p>
                <b>Thời hạn bảo hành:</b> {warranty.warrantyMonth} tháng
              </p>
              <p>
                <b>Ngày bắt đầu:</b> {formatDate(warranty.startDate)}
              </p>
              <p>
                <b>Ngày kết thúc:</b> {formatDate(warranty.endDate)}
              </p>
            </div>

            {/* Form chỉnh sửa thẻ bảo hành - chỉ admin */}
            {!readOnly && (
              <div className="space-y-3 border border-gray-800 p-4 rounded-xl">
                <h3 className="font-extrabold uppercase text-gray-400 text-xs">
                  Cập nhật thẻ bảo hành
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Trạng thái thẻ bảo hành
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as WarrantyStatus)}
                  >
                    <option value="ACTIVE">Còn hiệu lực</option>
                    <option value="EXPIRED">Hết hạn</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Ghi chú chung
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú nội bộ về thẻ bảo hành"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#00a651] hover:bg-green-700 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}

            {/* Lịch sử sửa chữa - dòng thời gian */}
            <div>
              <h3 className="font-extrabold mb-2 uppercase text-gray-400 text-xs">
                Lịch sử sửa chữa
              </h3>

              {history.length === 0 ? (
                <p className="text-gray-400 italic">Chưa có lần sửa chữa nào.</p>
              ) : (
                <div className="space-y-4 border border-gray-800 rounded-xl p-4">
                  {history.map((h) => {
                    const Icon = repairIcon(h.status);
                    const cost = formatMoney(h.repairCost);
                    return (
                      <div key={h.historyId} className="flex gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Icon fontSize="small" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold">{repairLabel(h.status)}</p>
                            <p className="text-xs text-gray-400">
                              {formatDate(h.receivedDate)}
                            </p>
                          </div>
                          {h.problem && (
                            <p className="text-gray-700 mt-1">
                              <b>Vấn đề:</b> {h.problem}
                            </p>
                          )}
                          {h.solution && (
                            <p className="text-gray-700">
                              <b>Xử lý:</b> {h.solution}
                            </p>
                          )}
                          {h.technician && (
                            <p className="text-gray-500 text-xs mt-1">
                              Kỹ thuật viên: {h.technician}
                            </p>
                          )}
                          {cost && (
                            <p className="text-red-600 text-xs font-bold">
                              Chi phí sửa chữa: {cost}
                            </p>
                          )}
                          {h.returnedDate && (
                            <p className="text-gray-500 text-xs">
                              Ngày trả khách: {formatDate(h.returnedDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Thêm mốc lịch sử sửa chữa mới - chỉ admin */}
              {!readOnly && (
                <div className="mt-4 space-y-2 border border-dashed border-gray-400 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Thêm mốc sửa chữa mới
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {REPAIR_STEPS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setNewStatus(s.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          newStatus === s.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Vấn đề / lỗi (ví dụ: xe không lên nguồn)"
                  />
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Cách xử lý (không bắt buộc)"
                  />
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs"
                      value={technician}
                      onChange={(e) => setTechnician(e.target.value)}
                      placeholder="Kỹ thuật viên"
                    />
                    <input
                      type="number"
                      min={0}
                      className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-xs"
                      value={repairCost}
                      onChange={(e) => setRepairCost(e.target.value)}
                      placeholder="Chi phí (đ)"
                    />
                  </div>

                  <button
                    onClick={handleAddHistory}
                    disabled={addingHistory}
                    className="w-full bg-gray-800 hover:bg-black disabled:opacity-50 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    {addingHistory ? "Đang thêm..." : "Thêm vào lịch sử"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}