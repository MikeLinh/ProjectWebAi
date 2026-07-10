/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8080/api/categories";

interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
}

const emptyForm = { categoryName: "", description: "" };

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleEdit = (cat: Category) => {
    setEditingId(cat.categoryId);
    setForm({ categoryName: cat.categoryName, description: cat.description || "" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryName.trim()) return;
    setSaving(true);

    const isEdit = editingId !== null;
    const url = isEdit ? `${API}/${editingId}` : API;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchCategories();
        handleCancel();
      } else {
        alert("Lưu thất bại! Vui lòng kiểm tra lại.");
      }
    } catch {
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa danh mục này? Các sản phẩm thuộc danh mục sẽ bị ảnh hưởng.")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter(c => c.categoryId !== id));
      } else {
        alert("Xóa thất bại! Danh mục có thể đang được sử dụng.");
      }
    } catch {
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục sản phẩm</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form thêm / sửa */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-fit text-black text-xs space-y-4">
          <h2 className="text-sm font-bold border-b pb-3 uppercase tracking-wide">
            {editingId ? `Chỉnh sửa danh mục #${editingId}` : "Thêm danh mục mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Tên danh mục</label>
              <input
                type="text"
                required
                className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500"
                value={form.categoryName}
                onChange={e => setForm({ ...form, categoryName: e.target.value })}
                placeholder="VD: Xe địa hình"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Mô tả</label>
              <textarea
                rows={3}
                className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500 resize-none"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn về danh mục..."
              />
            </div>
            <div className="flex gap-2 pt-1">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-950 hover:bg-blue-900 text-white font-bold py-2 rounded-lg uppercase transition-colors disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo danh mục"}
              </button>
            </div>
          </form>
        </div>

        {/* Bảng danh mục */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-black">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">Chưa có danh mục nào.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Tên danh mục</th>
                  <th className="p-4">Mô tả</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat) => (
                  <tr
                    key={cat.categoryId}
                    className={`hover:bg-gray-50 transition-colors ${editingId === cat.categoryId ? "bg-blue-50" : ""}`}
                  >
                    <td className="p-4 font-bold text-gray-400">#{cat.categoryId}</td>
                    <td className="p-4 font-semibold text-gray-900">{cat.categoryName}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{cat.description || "—"}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(cat.categoryId)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Xóa
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