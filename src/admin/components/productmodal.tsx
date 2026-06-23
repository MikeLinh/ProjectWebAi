import React, { useState, useEffect } from "react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  editingProduct: any | null;
}

export default function ProductModal({ isOpen, onClose, onSave, editingProduct }: ProductModalProps) {
  const [formData, setFormData] = useState({
    product_name: "",
    brand: "",
    price: 0,
    stock_quantity: 0,
    category_id: 1,
    image_url: "",
    description: ""
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (editingProduct) setFormData(editingProduct);
    else setFormData({ product_name: "", brand: "", price: 0, stock_quantity: 0, category_id: 1, image_url: "", description: "" });
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-black">
        <h2 className="text-xl font-bold border-b pb-3">
          {editingProduct ? "CẬP NHẬT SẢN PHẨM" : "THÊM SẢN PHẨM MỚI"}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Tên sản phẩm *</label>
            <input type="text" className="w-full border p-2.5 rounded-lg" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Thương hiệu *</label>
            <input type="text" className="w-full border p-2.5 rounded-lg" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Giá ($) *</label>
            <input type="number" className="w-full border p-2.5 rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Số lượng kho *</label>
            <input type="number" className="w-full border p-2.5 rounded-lg" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Danh mục ID</label>
            <input type="number" className="w-full border p-2.5 rounded-lg" value={formData.category_id} onChange={e => setFormData({...formData, category_id: Number(e.target.value)})} />
          </div>
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Link URL ảnh sản phẩm</label>
            <input type="text" className="w-full border p-2.5 rounded-lg" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Mô tả chi tiết</label>
            <textarea rows={3} className="w-full border p-2.5 rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 text-xs font-bold">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Hủy bỏ</button>
          <button onClick={() => onSave(formData)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu lại</button>
        </div>
      </div>
    </div>
  );
}