/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../components/context/notificationcontext";

// Đường dẫn API Backend dùng để thao tác dữ liệu CRUD danh mục
const API = "http://localhost:8080/api/categories";

// Định nghĩa kiểu dữ liệu (TypeScript Interface) cho đối tượng Danh mục
interface Category { 
  categoryId: number;
  categoryName: string;
  description: string;
}

// Giá trị mặc định của form khi trống
const emptyForm = { categoryName: "", description: "" };


export default function ManageCategories() {
  const {showNotification} = useNotification();
  const [categories, setCategories] = useState<Category[]>([]); // Danh sách danh mục
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu từ API
  const [form, setForm] = useState(emptyForm); // Trạng thái dữ liệu của form nhập liệu
  const [editingId, setEditingId] = useState<number | null>(null); // ID của danh mục đang được chọn để sửa (null = đang thêm mới)
  const [saving, setSaving] = useState(false); // Trạng thái đang gửi yêu cầu lưu dữ liệu lên server

  // Hàm gọi API lấy danh sách toàn bộ danh mục từ Backend
  // Dùng useCallback để tối ưu hiệu năng, tránh tạo lại hàm khi render
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API); // Gửi request GET
      const data = await res.json(); // Chuyển kết quả thành JSON
      setCategories(data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    } finally {
      setLoading(false);
    }
  }, []);
 // Gọi fetchCategories một lần duy nhất khi component được nạp vào DOM
  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  // Khi nhấn nút "Sửa" trên một dòng: chuyển thông tin danh mục đó vào form và đặt editingId
  const handleEdit = (cat: Category) => {
    setEditingId(cat.categoryId);
    setForm({ categoryName: cat.categoryName, description: cat.description || "" });
  };
  // Hủy bỏ chế độ chỉnh sửa, xóa trắng form để quay lại chế độ thêm mới
  const handleCancel = () => {
    setEditingId(null); // Reset ID chỉnh sửa về null
    setForm(emptyForm);// Xóa trắng form
  };

 // Xử lý gửi form (cho cả hành động Thêm mới và Cập nhật)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn sự kiện tải lại trang
    if (!form.categoryName.trim()) return; // Không cho phép gửi nếu tên danh mục trống
    setSaving(true);
    
    // Kiểm tra xem là đang Sửa (PUT) hay Thêm mới (POST)
    const isEdit = editingId !== null;
    const url = isEdit ? `${API}/${editingId}` : API; // Nếu sửa thì thêm ID vào đường dẫn
    const method = isEdit ? "PUT" : "POST"; // Chọn phương thức HTTP tương ứng

    try {
      // Thực hiện gửi request lên API
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchCategories(); // Tải lại danh sách danh mục mới nhất
        handleCancel(); // Reset form về trạng thái ban đầu
      } else {
        showNotification("Lưu thất bại! Vui lòng kiểm tra lại.","error");
      }
    } catch {
      showNotification("Không thể kết nối đến máy chủ.","warning");
    } finally {
      setSaving(false);
    }
  };
  // Xử lý xóa danh mục
  const handleDelete = async (id: number) => {
    if (!confirm("Xóa danh mục này? Các sản phẩm thuộc danh mục sẽ bị ảnh hưởng.")) return;
    try {
      // Gửi request DELETE tới server
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Nếu xóa thành công, lọc bỏ danh mục vừa xóa khỏi state local để cập nhật giao diện ngay lập tức
        setCategories(categories.filter(c => c.categoryId !== id));
      } else {
        showNotification("Xóa thất bại! Danh mục có thể đang được sử dụng.","error");
      }
    } catch {
      showNotification("Không thể kết nối đến máy chủ.","warning");
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
          {/* Trường nhập tên danh mục */}
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
            {/* Trường nhập mô tả danh mục*/}
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
            {/* Các nút bấm thao tác của form */}
            <div className="flex gap-2 pt-1">
              {/* Chỉ hiện nút Hủy khi đang ở chế độ Chỉnh sửa*/}
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors"
                >
                  Hủy
                </button>
              )}
              {/* Nút Submit chính (vô hiệu hóa khi đang trong tiến trình lưu dữ liệu `saving`)*/}
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
            <div className="p-12 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div> // Hiển thị trạng thái đang tải dữ liệu
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">Chưa có danh mục nào.</div> // Hiển thị trạng thái rỗng khi không có bản ghi nào
          ) : (
            // Hiển thị bảng danh mục dữ liệu chính
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