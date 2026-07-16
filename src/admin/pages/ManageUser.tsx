/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../components/context/notificationcontext";
const API = "http://localhost:8080/api/users";

interface User {
  userId: number;
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  role: string;
  createdAt: string;
}

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  address: "",
  role: "USER",
};

function formatDate(dt: string) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ManageUsers() {
  const {showNotification} = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Lỗi tải tài khoản:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      fullName: u.fullName || "",
      email: u.email || "",
      password: "",
      phoneNumber: u.phoneNumber || "",
      address: u.address || "",
      role: u.role || "USER",
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    const isEdit = editingUser !== null;
    const url = isEdit ? `${API}/${editingUser.userId}` : API;
    const method = isEdit ? "PUT" : "POST";

    // Nếu sửa mà không nhập mật khẩu mới → không gửi field password
    const bodyData: any = { ...form };
    if (isEdit && !form.password) {
      delete bodyData.password;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        await fetchUsers();
        handleClose();
      } else {
        const text = await res.text();
        setErrorMsg(text || "Lưu thất bại! Vui lòng kiểm tra lại.");
      }
    } catch {
      setErrorMsg("Không thể kết nối đến máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa tài khoản "${name}"?`)) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.userId !== id));
      } else {
        showNotification("Xóa thất bại!","error");
      }
    } catch {
      showNotification("Không thể kết nối đến máy chủ.","warning");
    }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-red-50 text-red-600 border-red-200",
      USER: "bg-blue-50 text-blue-600 border-blue-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${styles[role] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản người dùng</h1>
        <button
          onClick={openAdd}
          className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide"
        >
          Thêm tài khoản
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-black">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Chưa có tài khoản nào.</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Điện thoại</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-400">#{u.userId}</td>
                  <td className="p-4 font-semibold text-gray-900">{u.fullName}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 text-gray-500">{u.phoneNumber || "—"}</td>
                  <td className="p-4">{roleBadge(u.role)}</td>
                  <td className="p-4 text-gray-400">{formatDate(u.createdAt)}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(u.userId, u.fullName)}
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

      {/* Modal thêm / sửa */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-black text-xs">
            <h2 className="text-lg font-bold border-b pb-3 text-gray-800">
              {editingUser
                ? `CHỈNH SỬA TÀI KHOẢN #${editingUser.userId}`
                : "THÊM TÀI KHOẢN MỚI"}
            </h2>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1 text-gray-700">Họ và tên</label>
                  <input
                    type="text"
                    required
                    className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="example@gmail.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">
                    Mật khẩu
                    {editingUser && (
                      <span className="text-gray-400 font-normal ml-1">(để trống = giữ cũ)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? "••••••••" : "Nhập mật khẩu"}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500"
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="09xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">Vai trò</label>
                  <select
                    className="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-500"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold mb-1 text-gray-700">Địa chỉ</label>
                  <textarea
                    rows={2}
                    className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500 resize-none"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 font-bold">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}