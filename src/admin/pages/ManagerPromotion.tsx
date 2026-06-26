/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8080/api/promotions";

interface Promotion {
  promoId: number;
  couponCode: string;
  discountValue: number;   // Số tiền giảm cố định (VD: 50, 100)
  startDate: string;
  endDate: string;
}

const today = new Date().toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm"

const emptyForm = {
  couponCode: "",
  discountValue: 0,
  startDate: today,
  endDate: "",
};

function formatDateTime(dt: string) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function isExpired(endDate: string) {
  return endDate && new Date(endDate) < new Date();
}

function isActive(startDate: string, endDate: string) {
  const now = new Date();
  return new Date(startDate) <= now && new Date(endDate) >= now;
}

export default function ManagePromotions() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setPromos(data);
    } catch (err) {
      console.error("Lỗi tải khuyến mãi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.couponCode.trim() || !form.endDate) return;
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: form.couponCode.toUpperCase(),
          discountValue: form.discountValue,
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      });

      if (res.ok) {
        await fetchPromos();
        setForm(emptyForm);
      } else {
        const text = await res.text();
        setErrorMsg(text || "Tạo mã thất bại!");
      }
    } catch {
      setErrorMsg("Không thể kết nối đến máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Xóa mã khuyến mãi "${code}"?`)) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPromos(promos.filter(p => p.promoId !== id));
      } else {
        alert("Xóa thất bại!");
      }
    } catch {
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  const statusBadge = (start: string, end: string) => {
    if (isExpired(end)) {
      return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">HẾT HẠN</span>;
    }
    if (isActive(start, end)) {
      return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">ĐANG CHẠY</span>;
    }
    return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">SẮP TỚI</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form tạo mã */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-fit text-black text-xs space-y-4">
          <h2 className="text-sm font-bold border-b pb-3 uppercase tracking-wide">➕ Tạo mã ưu đãi mới</h2>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Mã Code</label>
              <input
                type="text"
                required
                className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500 uppercase"
                value={form.couponCode}
                onChange={e => setForm({ ...form, couponCode: e.target.value })}
                placeholder="VD: WELCOME2026"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Giá trị giảm ($)</label>
              <input
                type="number"
                required
                min={1}
                className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500"
                value={form.discountValue}
                onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
                placeholder="50"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                required
                className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Ngày kết thúc</label>
              <input
                type="datetime-local"
                required
                className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg uppercase tracking-wide disabled:opacity-50 transition-colors"
            >
              {saving ? "Đang lưu..." : "Kích hoạt mã"}
            </button>
          </form>
        </div>

        {/* Bảng danh sách */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-black">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
          ) : promos.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">Chưa có mã khuyến mãi nào.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
                <tr>
                  <th className="p-4">Mã Code</th>
                  <th className="p-4">Giá trị giảm</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {promos.map((p) => (
                  <tr key={p.promoId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{p.couponCode}</td>
                    <td className="p-4 font-bold text-green-600">-${Number(p.discountValue).toLocaleString()}</td>
                    <td className="p-4 text-gray-500">
                      {formatDateTime(p.startDate)} ~ {formatDateTime(p.endDate)}
                    </td>
                    <td className="p-4">{statusBadge(p.startDate, p.endDate)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(p.promoId, p.couponCode)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Xóa bỏ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}