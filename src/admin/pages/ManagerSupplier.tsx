import React, { useState, useEffect } from "react";
import { useNotification } from "../../components/context/notificationcontext";

export default function ManagerSupplier() {
  const { showNotification } = useNotification();
  const [list, setList] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    supplierName: "",
    contactName: "",
    phone: "",
    email: "",
    address: ""
  });

  const fetchData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`)
      .then((res) => res.json())
      .then((data) => setList(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        supplierName: item.supplierName || "",
        contactName: item.contactName || "",
        phone: item.phone || "",
        email: item.email || "",
        address: item.address || ""
      });
    } else {
      setFormData({ supplierName: "", contactName: "", phone: "", email: "", address: "" });
    }
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingItem
      ? `${import.meta.env.VITE_API_URL}/api/suppliers/${editingItem.supplierId}`
      : `${import.meta.env.VITE_API_URL}/api/suppliers`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        showNotification(editingItem ? "Cập nhật thành công!" : "Thêm nhà cung cấp mới thành công!", "success");
        setIsOpen(false);
        fetchData();
      } else {
        showNotification("Không thể lưu thông tin!", "error");
      }
    } catch (err) {
      showNotification("Lỗi kết nối server!", "warning");
       console.log(err)
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa nhà cung cấp này? Hành động không thể hoàn tác!")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Xóa nhà cung cấp thành công!", "success");
        fetchData();
      } else {
        showNotification("Lỗi khi xóa!", "error");
      }
    } catch (err) {
      showNotification("Lỗi kết nối máy chủ!", "warning");
      console.log(err)
    }
  };

  return (
    <div className="p-6 text-black bg-gray-50 min-h-screen text-xs">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-gray-800">QUẢN LÝ NHÀ CUNG CẤP (SUPPLIER)</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-950 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-900">
          + Thêm Nhà Cung Cấp
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 font-semibold text-gray-700 border-b">
              <th className="p-3 w-16">ID</th>
              <th className="p-3">Tên Nhà Cung Cấp</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3">Email</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3 text-right w-36">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.supplierId} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-500">#{item.supplierId}</td>
                <td className="p-3 font-bold text-gray-900">{item.supplierName}</td>
                <td className="p-3 font-medium">{item.phone || "—"}</td>
                <td className="p-3 text-gray-600">{item.email || "—"}</td>
                <td className="p-3 text-gray-500 max-w-xs truncate">{item.address || "—"}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-600 font-bold hover:underline">Sửa</button>
                  <button onClick={() => handleDelete(item.supplierId)} className="text-red-600 font-bold hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-gray-800 border-b pb-2">
              {editingItem ? `SỬA NHÀ CUNG CẤP #${editingItem.supplierId}` : "THÊM NHÀ CUNG CẤP"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold mb-0.5 text-gray-700">Tên nhà cung cấp *</label>
                <input type="text" required value={formData.supplierName} onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })} className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-0.5 text-gray-700">Điện thoại</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5 text-gray-700">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-0.5 text-gray-700">Địa chỉ</label>
                <textarea rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="flex justify-end gap-2 font-bold pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}