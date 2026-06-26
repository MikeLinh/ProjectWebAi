/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingProduct: any | null;
}

export default function ProductModal({ isOpen, onClose, onSave, editingProduct }: ProductModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    price: 0,
    stockQuantity: 0,
    categoryId: "",
    imageUrl: "",
    description: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:8080/api/categories")
        .then((res) => res.json())
        .then((data) => {
          setCategories(data);
          if (data.length > 0 && !editingProduct) {
            setFormData((prev) => ({ ...prev, categoryId: data[0].categoryId.toString() }));
          }
        })
        .catch((err) => console.error("Lỗi lấy danh mục:", err));
    }
  }, [isOpen, editingProduct]);


  useEffect(() => {
    if (editingProduct) {
      setFormData({
        productName: editingProduct.productName || "",
        brand: editingProduct.brand || "",
        price: editingProduct.price || 0,
        stockQuantity: editingProduct.stockQuantity || 0,
        categoryId: editingProduct.category ? editingProduct.category.categoryId.toString() : "",
        imageUrl: editingProduct.imageUrl || "",
        description: editingProduct.description || ""
      });
    } else {
      setFormData({
        productName: "",
        brand: "",
        price: 0,
        stockQuantity: 0,
        categoryId: categories.length > 0 ? categories[0].categoryId.toString() : "",
        imageUrl: "",
        description: ""
      });
    }
  }, [editingProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bodyData = {
      productName: formData.productName,
      brand: formData.brand,
      price: formData.price,
      stockQuantity: formData.stockQuantity,
      imageUrl: formData.imageUrl,
      description: formData.description,
      category: {
        categoryId: parseInt(formData.categoryId)
      }
    };

    const url = editingProduct 
      ? `http://localhost:8080/api/products/${editingProduct.productId}` 
      : "http://localhost:8080/api/products"; 
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        alert(editingProduct ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
        onSave(); 
      } else {
        alert("Lưu thất bại! Xin vui lòng kiểm tra lại API.");
      }
    } catch (error) {
      console.error("Lỗi gửi dữ liệu:", error);
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-black text-xs">
        <h2 className="text-lg font-bold border-b pb-3 text-gray-800">
          {editingProduct ? `CHỈNH SỬA SẢN PHẨM #${editingProduct.productId}` : "THÊM SẢN PHẨM MỚI"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">Tên sản phẩm</label>
              <input type="text" required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Thương hiệu (Brand)</label>
              <input type="text" required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Đơn giá ($)</label>
              <input type="number" required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Số lượng tồn kho</label>
              <input type="number" required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Danh mục sản phẩm</label>
              <select className="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-500" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">Link URL ảnh sản phẩm</label>
              <input type="text" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">Mô tả chi tiết</label>
              <textarea rows={3} className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 text-xs font-bold">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Hủy bỏ</button>
            <button type="submit" className="px-5 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition-colors">Lưu thông tin</button>
          </div>
        </form>
      </div>
    </div>
  );
}