/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import axios from "axios";

// Định nghĩa kiểu dữ liệu cho Sản phẩm
interface Product {
  productId: number;
  productName: string;
  stockQuantity: number;
  price: number;
  imageUrl?: string;
  brand?: string;
}

// Định nghĩa kiểu dữ liệu NSX
interface Manufacturer {
  manufacturerId: number;
  manufacturerName: string;
  country?: string;
  active?: boolean;
}
// Định nghĩa kiểu dữ liệu NCC
interface Supplier {
  supplierId: number;
  supplierName: string;
  phone?: string;
  email?: string;
  address?: string;
  active?: boolean;
}

interface Receipt {
  receiptId: number;
  productId: number;
  productName?: string;
  quantityAdded: number;
  importPrice: number;
  supplier?: any;         
  manufacturer?: any;     
  supplierName?: string;  
  manufacturerName?: string; 
  importedAt: string;
}

// Khởi tạo giá trị rỗng mặc định cho form nhập liệu (Dùng ID để quản lý select)
const EMPTY_FORM = {
  receiptId: "", 
  productId: "",
  quantityAdded: "",
  importPrice: "",
  supplierId: "", // Quản lý qua ID
  manufacturerId: "", // Quản lý qua ID
};

export default function ManagerWarehouse() {
  const [products, setProducts] = useState<Product[]>([]); 
  const [receipts, setReceipts] = useState<Receipt[]>([]); 
  const [lowStock, setLowStock] = useState<Product[]>([]); 
  const [form, setForm] = useState(EMPTY_FORM); 
  const [submitting, setSubmitting] = useState(false); 
  const [formError, setFormError] = useState<string | null>(null); 
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Lưu danh sách Object từ Backend đổ về thay vì mảng String cứng
  const [dbManufacturers, setDbManufacturers] = useState<Manufacturer[]>([]);
  const [dbSuppliers, setDbSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  // Hàm nạp đồng thời toàn bộ dữ liệu từ server
  const fetchAll = async () => {
    try {
      const [pRes, rRes, lRes, mRes, sRes] = await Promise.all([ 
        axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/api/products`),
        axios.get<Receipt[]>(`${import.meta.env.VITE_API_URL}/api/warehouse`),
        axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/api/warehouse/low-stock`),
        axios.get<Manufacturer[]>(`${import.meta.env.VITE_API_URL}/api/manufacturers`), 
        axios.get<Supplier[]>(`${import.meta.env.VITE_API_URL}/api/suppliers`) 
      ]);
      setProducts(pRes.data);
      setReceipts(rRes.data);
      setLowStock(lRes.data);
      setDbManufacturers(mRes.data || []);
      setDbSuppliers(sRes.data || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu kho:", err);
      // Fallback nếu chưa có API danh sách riêng, tạm tạo danh sách ảo từ data receipts để tránh sập
    }
  };

  // Tự động gom danh sách từ receipts nếu không có API riêng
  useEffect(() => {
    if (receipts.length > 0) {
      const uniqueManus: Manufacturer[] = [];
      const uniqueSups: Supplier[] = [];
      
      receipts.forEach(r => {
        if (r.manufacturer && !uniqueManus.some(m => m.manufacturerId === r.manufacturer?.manufacturerId)) {
          uniqueManus.push(r.manufacturer);
        }
        if (r.supplier && !uniqueSups.some(s => s.supplierId === r.supplier?.supplierId)) {
          uniqueSups.push(r.supplier);
        }
      });
      
      if (dbManufacturers.length === 0) setDbManufacturers(uniqueManus);
      if (dbSuppliers.length === 0) setDbSuppliers(uniqueSups);
    }
  }, [receipts]);

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
    const { name, value } = e.target;
    
    // 1. Cập nhật giá trị ô đang nhập vào form
    setForm(prev => {
      const nextForm = { ...prev, [name]: value };
      
      // 2. Nếu vừa chọn sản phẩm, tự động tìm Manufacturer gắn liền với sản phẩm đó
      if (name === "productId" && value) {
        const selectedProduct = products.find(p => p.productId === Number(value));
        
        // Kiểm tra xem sản phẩm có đối tượng manufacturer đính kèm từ Backend không
        // Đảm bảo kiểm tra qua thuộc tính đối tượng (any) do kiểu Product khai báo thiếu trường này
        const prodManu = (selectedProduct as any)?.manufacturer;
        
        if (prodManu && prodManu.manufacturerId) {
          // So khớp ID với danh sách hệ thống để đảm bảo an toàn dữ liệu
          const matched = dbManufacturers.find(m => m.manufacturerId === prodManu.manufacturerId);
          nextForm.manufacturerId = matched ? String(matched.manufacturerId) : "";
        } else {
          nextForm.manufacturerId = "";
        }
      }
      
      return nextForm;
    });
  };

  // Chỉnh sửa phiếu nhập kho
  const handleEditClick = (receipt: Receipt) => {
    setIsEditing(true);
    setForm({
      receiptId: String(receipt.receiptId),
      productId: String(receipt.productId),
      quantityAdded: String(receipt.quantityAdded),
      importPrice: String(receipt.importPrice),
      supplierId: receipt.supplier?.supplierId ? String(receipt.supplier.supplierId) : "",
      manufacturerId: receipt.manufacturer?.manufacturerId ? String(receipt.manufacturer.manufacturerId) : "",
    });
    setFormError(null);
    setSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setForm(EMPTY_FORM);
  };

  const handleDeleteClick = async (receiptId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu nhập kho này? Số lượng tồn kho sản phẩm sẽ không tự hoàn tác.")) return; 
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/warehouse/${receiptId}`);
      setSuccessMsg("Xóa phiếu nhập kho thành công!");
      fetchAll(); 
    } catch (err: any) {
      console.error(err);
      setFormError("Không thể xóa phiếu này.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); 
    setSuccessMsg(null);

    if (!form.productId || !form.quantityAdded || !form.importPrice || !form.manufacturerId || !form.supplierId) {
      setFormError("Vui lòng điền và chọn đầy đủ thông tin mẫu.");
      return; 
    }

    setSubmitting(true); 
    try {
      // Xây dựng cấu trúc Object đúng chuẩn gởi lên Backend Java
      const payload = { 
        productId: Number(form.productId),
        quantityAdded: Number(form.quantityAdded),
        importPrice: Number(form.importPrice),
        supplier: {
          supplierId: Number(form.supplierId)
        },
        manufacturer: {
          manufacturerId: Number(form.manufacturerId)
        }
      };

      if (isEditing) {  
        await axios.put(`${import.meta.env.VITE_API_URL}/api/warehouse/${form.receiptId}`, payload);
        setSuccessMsg("Cập nhật thông tin phiếu kho thành công!");
        setIsEditing(false); 
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/warehouse`, payload);
        setSuccessMsg("Tạo phiếu nhập kho và tăng tồn kho thành công!");
      }

      setForm(EMPTY_FORM); 
      fetchAll(); 
    } catch (err: any) {
      setFormError(err.response?.data || "Có lỗi xảy ra trong quá trình truyền tải.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalInvestment = receipts.reduce((sum, r) => sum + (r.importPrice * r.quantityAdded), 0); 
  const totalQuantityImported = receipts.reduce((sum, r) => sum + r.quantityAdded, 0);
  
  const formatDate = (isoString: string) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleString("vi-VN");
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản Lý Nhập Kho & Warehouse</h1>
            <p className="text-sm text-gray-500 mt-1">Theo dõi, nhập xuất nguyên vật liệu thành phẩm xe đạp thể thao.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng vốn nhập kho</span>
            <span className="text-2xl font-black text-red-600 mt-2">${totalInvestment.toLocaleString()}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng sản lượng nhập</span>
            <span className="text-2xl font-black text-blue-600 mt-2">+{totalQuantityImported.toLocaleString()} chiếc</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng số phiếu đã lập</span>
            <span className="text-2xl font-black text-emerald-600 mt-2">{receipts.length} đơn</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
              {isEditing ? "Cập Nhật Phiếu Nhập Kho" : "Lập Phiếu Nhập Kho Mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg">{formError}</div>}
              {successMsg && <div className="p-3 text-xs bg-green-50 border border-green-200 text-green-600 rounded-lg">{successMsg}</div>}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Chọn sản phẩm</label>
                <select
                  name="productId"
                  value={form.productId}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                  disabled={isEditing} 
                >
                  <option value="">-- Chọn một sản phẩm từ hệ thống --</option>
                  {products.map((p) => (
                    <option key={p.productId} value={p.productId}>
                      {p.productName} (Tồn: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Số lượng nhập</label>
                  <input
                    type="number"
                    name="quantityAdded"
                    min="1"
                    placeholder="Ví dụ: 10"
                    value={form.quantityAdded}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Giá nhập ($)</label>
                  <input
                    type="number"
                    name="importPrice"
                    min="1"
                    placeholder="Giá nhập vào"
                    value={form.importPrice}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nhà sản xuất (Brand)</label>
                <select
                  name="manufacturerId"
                  value={form.manufacturerId}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                  <option value="">-- Chọn Nhà Sản Xuất --</option>
                  {dbManufacturers.map((m) => (
                    <option key={m.manufacturerId} value={m.manufacturerId}>{m.manufacturerName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nhà cung cấp (Supplier)</label>
                <select
                  name="supplierId"
                  value={form.supplierId}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                  <option value="">-- Chọn Nhà Cung Cấp --</option>
                  {dbSuppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow"
                >
                  {submitting ? "Đang xử lý..." : isEditing ? "Lưu thay đổi" : "Xác nhận nhập kho"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>

            <div className="pt-4 border-t">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">⚠️ Sản phẩm sắp hết hàng (&le; 5)</h3>
              {lowStock.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Mọi sản phẩm đều đủ số lượng tồn.</p>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {lowStock.map((p) => (
                    <div key={p.productId} className="flex justify-between items-center text-xs bg-amber-50 p-2 border border-amber-100 rounded-lg">
                      <span className="font-medium text-gray-800 truncate max-w-[180px]">{p.productName}</span>
                      <span className="font-bold text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded">Còn {p.stockQuantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Lịch Sử Phiếu Nhập Kho</h2>

            {receipts.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-10">Chưa có lịch sử nhập kho nào được ghi nhận.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-400 text-xs uppercase font-bold tracking-wider">
                      <th className="p-3">Sản phẩm</th>
                      <th className="p-3 text-center">SL</th>
                      <th className="p-3">Giá nhập</th>
                      <th className="p-3">Thương hiệu / Đối tác</th>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {receipts.map((r) => {
                      const product = products.find((p) => p.productId === r.productId);
                      return (
                        <tr key={r.receiptId} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium text-gray-900 max-w-[150px] truncate">
                            {product?.productName ?? r.productName ?? `#${r.productId}`}
                          </td>
                          <td className="p-3 text-center font-bold text-blue-600">+{r.quantityAdded}</td>
                          <td className="p-3 text-gray-700 font-semibold">${Number(r.importPrice).toLocaleString()}</td>
                          <td className="p-3 text-gray-500">
                            <div className="font-medium text-gray-700">{r.manufacturerName || "—"}</div>
                            <div className="text-[10px] text-gray-400">{r.supplierName || "—"}</div>
                          </td>
                          <td className="p-3 text-gray-400">{formatDate(r.importedAt)}</td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditClick(r)}
                                className="text-indigo-600 hover:text-indigo-900 font-semibold px-1.5 py-1 bg-indigo-50 hover:bg-indigo-100 rounded"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteClick(r.receiptId)}
                                className="text-red-600 hover:text-red-900 font-semibold px-1.5 py-1 bg-red-50 hover:bg-red-100 rounded"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}