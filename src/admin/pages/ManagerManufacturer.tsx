import React, { useState, useEffect } from "react";
import { useNotification } from "../../components/context/notificationcontext";

export default function ManagerManufacturer() {
  const { showNotification } = useNotification();
  const [list, setList] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  const fetchData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/manufacturers`)
      .then((res) => res.json())
      .then((data) => setList(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    setName(item ? item.manufacturerName : "");
    setCountry(item ? item.country : "")
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingItem
      ? `${import.meta.env.VITE_API_URL}/api/manufacturers/${editingItem.manufacturerId || editingItem.id}`
      : `${import.meta.env.VITE_API_URL}/api/manufacturers`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manufacturerName: name, country: country }),
      });
      if (res.ok) {
        showNotification(editingItem ? "Sửa thành công!" : "Thêm thành công!", "success");
        setIsOpen(false);
        fetchData();
      } else {
        showNotification("Thao tác thất bại!", "error");
      }
    } catch(err) {
      showNotification("Lỗi máy chủ!", "warning");
      console.log(err)
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa NSX này?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/manufacturers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Xóa thành công!", "success");
        fetchData();
      } else {
        showNotification("Không thể xóa (có thể sản phẩm đang liên kết NSX này)!", "error");
      }
    } catch (err) {
      showNotification("Lỗi máy chủ!", "warning");
        console.log(err)
    }
  };

  return (
    <div className="p-6 text-black bg-gray-50 min-h-screen text-xs">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-gray-800">QUẢN LÝ NHÀ SẢN XUẤT (NSX)</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-950 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-900">
          + Thêm Nhà Sản Xuất
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 font-semibold text-gray-700 border-b">
              <th className="p-3 w-20">ID</th>
              <th className="p-3">Tên Nhà Sản Xuất</th>
                <th className="p-3">Xuất xứ</th>
              <th className="p-3 text-right w-40">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.manufacturerId || item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-600">#{item.manufacturerId || item.id}</td>
                <td className="p-3 text-sm font-semibold">{item.manufacturerName}</td>
                <td className="p-3 text-sm font-semibold">{item.country}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-600 font-bold hover:underline">Sửa</button>
                  <button onClick={() => handleDelete(item.manufacturerId || item.id)} className="text-red-600 font-bold hover:underline">Xóa</button>
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
              {editingItem ? "CẬP NHẬT NHÀ SẢN XUẤT" : "THÊM NHÀ SẢN XUẤT MỚI"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">Tên nhà sản xuất</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" />
              </div>
               <div>
                <label className="block font-semibold mb-1 text-gray-700">Xuất xứ</label>
                <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" />
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