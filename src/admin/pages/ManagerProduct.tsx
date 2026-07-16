/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from "react";
import ProductModal from "../components/productmodal";
import { useNotification } from "../../components/context/notificationcontext";

const API = "http://localhost:8080/api/products";

export default function ManageProducts() {
  const {showNotification} = useNotification();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productId.toString().includes(searchTerm)
  )

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleOpenAdd = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleOpenEdit = (p: any) => { setEditingProduct(p); setIsModalOpen(true); };

  const handleSave = () => {
    setIsModalOpen(false);
    fetchProducts(); 
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.productId !== id));
      } else {
        showNotification("Xóa thất bại!","error");
      }
    } catch {
      showNotification("Không thể kết nối đến máy chủ.","warning");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý kho sản phẩm</h1>
        <div className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm mã hoặc tên sản phẩm"
              className="border border-gray-300 rounded-xl px-4 py-2 text-[15px] outline-none focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          <button
            onClick={handleOpenAdd}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide"
          >
            Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-black">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Chưa có sản phẩm nào.</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Tên sản phẩm</th>
                <th className="p-4">Hãng</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Đơn giá</th>
                <th className="p-4">Tồn kho</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((p) => (
                <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-400">#{p.productId}</td>
                  <td className="p-4 font-semibold text-gray-900">{p.productName}</td>
                  <td className="p-4 text-gray-600">{p.brand}</td>
                  <td className="p-4 text-gray-500">{p.category?.categoryName || "—"}</td>
                  <td className="p-4 text-red-600 font-bold">${Number(p.price).toLocaleString()}</td>
                  <td className="p-4 font-medium">{p.stockQuantity} xe</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(p.productId)}
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

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingProduct={editingProduct}
      />
    </div>
  );
}