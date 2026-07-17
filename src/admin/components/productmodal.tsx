/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useNotification } from "../../components/context/notificationcontext";

// Đinh nghĩa dữ liệu đầu vào
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingProduct: any | null;
}

export default function ProductModal({ isOpen, onClose, onSave, editingProduct }: ProductModalProps) {
  const {showNotification} = useNotification();
  const [categories, setCategories] = useState<any[]>([]); // Danh sách các danh mục sản phẩm từ API
  const [warehouseProducts, setwarehouseProducts] = useState<any[]>([]); // Danh sách sản phẩm khả dụng trong kho hàng

  // State lưu trữ dữ liệu của Form nhập liệu
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    price: 0,
    stockQuantity: 0,
    categoryId: "",
    imageUrl: "",
    description: "",
    discountPercent: 0   
  });
    // State lưu trữ file ảnh được người dùng chọn từ máy tính để upload
    const updateStock = async (productId: number, newStock: number) => {
    try {
      await fetch(`http://localhost:8080/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newStock })
      });
    } catch (err) {
      console.error("Không thể cập nhật tồn kho:", err);
    }
  };

  // State lưu trữ file ảnh được người dùng chọn từ máy tính để upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Gọi API lấy danh sách danh mục khi Modal được mở
  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:8080/api/categories")
        .then((res) => res.json())
        .then((data) => {
          setCategories(data);
          // Nếu ở chế độ THÊM MỚI và có danh mục, tự động chọn danh mục đầu tiên làm mặc định
          if (data.length > 0 && !editingProduct) {
            setFormData((prev) => ({ ...prev, categoryId: data[0].categoryId.toString() }));
          }
        })
        .catch((err) => console.error("Lỗi lấy danh mục:", err));
    }
  }, [isOpen, editingProduct]);
  //Gọi API lấy danh sách sản phẩm khả dụng trong kho
  useEffect(()=>{
    fetch("http://localhost:8080/api/warehouse/available")
      .then((res) => res.json())
      .then((data) => setwarehouseProducts(data))
      .catch((err) => console.log("Lỗi lấy sản phẩm từ kho: ",err));
  },[isOpen,editingProduct])

  //dữ liệu vào Form tùy theo chế độ Chỉnh sửa hay Thêm mới
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        productName: editingProduct.productName || "",
        brand: editingProduct.brand || "",
        price: editingProduct.price || 0,
        stockQuantity: editingProduct.stockQuantity || 0,
        categoryId: editingProduct.category ? editingProduct.category.categoryId.toString() : "",
        imageUrl: editingProduct.imageUrl || "",
        description: editingProduct.description || "",
        discountPercent: editingProduct.discountPercent || 0
      });
    } else {
      setFormData({
        productName: "",
        brand: "",
        price: 0,
        stockQuantity: 0,
        categoryId: categories.length > 0 ? categories[0].categoryId.toString() : "",
        imageUrl: "",
        description: "",
        discountPercent: 0
      });
    }
    setSelectedFile(null);
  }, [editingProduct, isOpen, categories]);

  if (!isOpen) return null; // Nếu Modal không ở trạng thái mở thì không vẽ bất kỳ giao diện nào

  //Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();

    form.append("productName", formData.productName);
    form.append("brand", formData.brand);
    form.append("price", formData.price.toString());
    form.append("stockQuantity", formData.stockQuantity.toString());
    form.append("categoryId", formData.categoryId);
    form.append("description", formData.description);
    form.append("discountPercent", formData.discountPercent.toString());

    //Ưu tiên file ảnh cục bộ mới upload, nếu không có thì giữ lại URL ảnh cũ
    if (selectedFile) {
      form.append("image", selectedFile);
    } else if (formData.imageUrl) {
      form.append("imageUrl", formData.imageUrl);
    }
    // Định tuyến API: PUT đối với chỉnh sửa (yêu cầu ID), POST đối với thêm mới sản phẩm
    const url = editingProduct 
      ? `http://localhost:8080/api/products/${editingProduct.productId}` 
      : "http://localhost:8080/api/products"; 
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: form });
      if (res.ok) {
        const saveProduct = await res.json();
        //Chỉnh sửa và có thay đổi số lượng tồn kho so với ban đầu
        if(editingProduct && formData.stockQuantity !== editingProduct.stockQuantity){
          await updateStock(saveProduct.productId, formData.stockQuantity)
        }
        //Thêm mới sản phẩm thành công có thương hiệu mới
        if(!editingProduct && formData.brand){
          window.dispatchEvent(new CustomEvent('newBrandAdded',{
            detail: formData.brand
          }));
          console.log("Đã gửi brand mới:" , formData.brand);
        }
        showNotification(editingProduct ? "Cập nhật sản phẩm thành công!": "Thêm sản phẩm thành công!","success");
        onSave(); 
      } else {
        showNotification("Lưu thất bại! Xin vui lòng kiểm tra lại.","error");
      }
    } catch (error) {
      console.error("Lỗi gửi dữ liệu:", error);
      showNotification("Không thể kết nối đến máy chủ.","warning");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-black text-xs">
        {/* Tiêu đề Modal (Tự động đổi tiêu đề theo chế độ) */}
        <h2 className="text-lg font-bold border-b pb-3 text-gray-800">
          {editingProduct ? `CHỈNH SỬA SẢN PHẨM #${editingProduct.productId}` : "THÊM SẢN PHẨM MỚI"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              {!editingProduct &&(
                <div className="col-span-2">
                  <label className="block font-semibold mb-1 text-gray-700">Chọn sản phẩm từ kho</label>
                  <select
                    className="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-500"
                    onChange={(e)=>{
                      // Khi chọn sản phẩm trong kho, tự động điền các thông tin đã có sẵn vào form nhập liệu phía dưới
                      const selected = warehouseProducts.find(p => p.productId === Number(e.target.value));
                      if(selected){
                        setFormData(prev =>({
                          ...prev,
                          productName: selected.productName || "",
                          brand: selected.brand || "",
                          price: selected.price || 0,
                          stockQuantity: selected.stockQuantity || 0
                        }));
                      }
                    }}
                    >
                      <option value="">-- Chọn kho để lấy dữ liệu --</option>
                      {warehouseProducts.map(p=>(
                        <option key={p.productId} value={p.productId}>
                          {p.productName} - {p.brand} (Tồn: {p.stockQuantity})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            <div className="col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">Tên sản phẩm</label>
              <input type="text" required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">Thương hiệu</label>
              <input type="text" required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">% Giảm giá</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" 
                value={formData.discountPercent} 
                onChange={e => setFormData({...formData, discountPercent: Number(e.target.value)})} 
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">Đơn giá ($)</label>
              <input type="number" required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">Tồn kho</label>
              <input type="number" required className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-500" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">Danh mục</label>
              <select className="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-500" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">Ảnh sản phẩm</label>
              <input 
                type="file" 
                accept="image/*" 
                className="w-full border p-2.5 rounded-lg" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
              />
              {formData.imageUrl && !selectedFile && (
                <p className="text-xs text-gray-500 mt-1">Ảnh hiện tại: {formData.imageUrl}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block font-semibold mb-1 text-gray-700">Mô tả</label>
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