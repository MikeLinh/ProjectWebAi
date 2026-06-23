import React, { useState } from "react";
import ProductModal from "../components/productmodal";

export default function ManageProducts() {
  const [products, setProducts] = useState([
    { product_id: 1, product_name: "Mountain Bike X1", brand: "Giant", price: 1200, stock_quantity: 15, category_id: 1, image_url: "", description: "Xe địa hình cao cấp" }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleOpenAdd = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleOpenEdit = (p: any) => { setEditingProduct(p); setIsModalOpen(true); };

  const handleSave = (productData: any) => {
    if (editingProduct) {
      setProducts(products.map(p => p.product_id === productData.product_id ? productData : p));
    } else {
      setProducts([...products, { ...productData, product_id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      setProducts(products.filter(p => p.product_id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý kho sản phẩm</h1>
        <button onClick={handleOpenAdd} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide">
          ➕ Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-black">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Tên sản phẩm</th>
              <th className="p-4">Hãng</th>
              <th className="p-4">Đơn giá</th>
              <th className="p-4">Tồn kho</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.product_id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold">#{p.product_id}</td>
                <td className="p-4 font-semibold text-gray-900">{p.product_name}</td>
                <td className="p-4 text-gray-600">{p.brand}</td>
                <td className="p-4 text-red-600 font-bold">${p.price.toLocaleString()}</td>
                <td className="p-4 font-medium">{p.stock_quantity} xe</td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => handleOpenEdit(p)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold">Sửa</button>
                  <button onClick={() => handleDelete(p.product_id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editingProduct={editingProduct} />
    </div>
  );
}