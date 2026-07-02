/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Product {
  productId: number;
  productName: string;
  stockQuantity: number;
  price: number;
  imageUrl?: string;
}

interface Receipt {
  receiptId: number;
  productId: number;
  productName?: string;
  quantityAdded: number;
  importPrice: number;
  supplier?: string;
  manufacturer?: string;
  importedAt: string;
}

const EMPTY_FORM = {
  receiptId: "", 
  productId: "",
  quantityAdded: "",
  importPrice: "",
  supplier: "",
  manufacturer: "",
};

const MANUFACTURERS = ["Giant", "Specialized", "Trek", "Shimano", "Maxxis", "Trinx"];
const SUPPLIERS = ["Công ty Xe đạp Toàn Cầu", "Nhà phân phối Đại Nam", "XNK Thể Thao Việt", "Phụ tùng Chợ Lớn"];

export default function ManagerWarehouse() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [receipts, setReceipts]       = useState<Receipt[]>([]);
  const [lowStock, setLowStock]       = useState<Product[]>([]);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);
  const [isEditing, setIsEditing]     = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [pRes, rRes, lRes] = await Promise.all([
        axios.get<Product[]>("http://localhost:8080/api/products"),
        axios.get<Receipt[]>("http://localhost:8080/api/warehouse"),
        axios.get<Product[]>("http://localhost:8080/api/warehouse/low-stock")
      ]);
      setProducts(pRes.data);
      setReceipts(rRes.data);
      setLowStock(lRes.data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu kho:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleEditClick = (receipt: Receipt) => {
    setIsEditing(true);
    setForm({
      receiptId: String(receipt.receiptId),
      productId: String(receipt.productId),
      quantityAdded: String(receipt.quantityAdded),
      importPrice: String(receipt.importPrice),
      supplier: receipt.supplier || "",
      manufacturer: receipt.manufacturer || "",
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
      await axios.delete(`http://localhost:8080/api/warehouse/${receiptId}`);
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

    if (!form.productId || !form.quantityAdded || !form.importPrice || !form.manufacturer || !form.supplier) {
      setFormError("Vui lòng điền và chọn đầy đủ thông tin mẫu.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productId: Number(form.productId),
        quantityAdded: Number(form.quantityAdded),
        importPrice: Number(form.importPrice),
        supplier: form.supplier.trim(),
        manufacturer: form.manufacturer.trim(),
      };

      if (isEditing) {

        await axios.put(`http://localhost:8080/api/warehouse/${form.receiptId}`, payload);
        setSuccessMsg("Cập nhật thông tin phiếu kho thành công!");
        setIsEditing(false);
      } else {
        await axios.post("http://localhost:8080/api/warehouse", payload);
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
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                  <option value="">-- Chọn Nhà Sản Xuất --</option>
                  {MANUFACTURERS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nhà cung cấp (Supplier)</label>
                <select
                  name="supplier"
                  value={form.supplier}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                  <option value="">-- Chọn Nhà Cung Cấp --</option>
                  {SUPPLIERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
                            <div className="font-medium text-gray-700">{r.manufacturer || "—"}</div>
                            <div className="text-[10px] text-gray-400">{r.supplier || "—"}</div>
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