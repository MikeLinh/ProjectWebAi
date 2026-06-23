import React, { useState } from "react";

export default function ManagePromotions() {
  const [promos, setPromos] = useState([
    { promo_id: 1, coupon_code: "BIKE1000", discount_value: 0.30, start_date: "2026-06-01", end_date: "2026-06-30" },
    { promo_id: 2, coupon_code: "BIKE2000", discount_value: 0.20, start_date: "2026-06-01", end_date: "2026-06-30" },
    { promo_id: 3, coupon_code: "BIKE3000", discount_value: 0.10, start_date: "2026-06-01", end_date: "2026-06-30" },
  ]);

  const [newPromo, setNewPromo] = useState({ coupon_code: "", discount_value: 0 });

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.coupon_code) return;
    
    setPromos([...promos, {
      promo_id: Date.now(),
      coupon_code: newPromo.coupon_code.toUpperCase(),
      discount_value: newPromo.discount_value / 100, 
      start_date: "2026-06-23",
      end_date: "2026-07-23"
    }]);
    setNewPromo({ coupon_code: "", discount_value: 0 });
  };

  const handleDelete = (id: number) => {
    if (confirm("Hủy bỏ mã giảm giá này?")) {
      setPromos(promos.filter(p => p.promo_id !== id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-fit text-black text-xs space-y-4">
        <h2 className="text-sm font-bold border-b pb-3 uppercase tracking-wide">➕ Tạo mã ưu đãi mới</h2>
        <form onSubmit={handleCreatePromo} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">Mã Code (Ví dụ: GIAM20)</label>
            <input type="text" className="w-full border p-2 rounded-lg uppercase" value={newPromo.coupon_code} onChange={e => setNewPromo({...newPromo, coupon_code: e.target.value})} placeholder="GIAM20" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Mức giảm (%)</label>
            <input type="number" className="w-full border p-2 rounded-lg" value={newPromo.discount_value} onChange={e => setNewPromo({...newPromo, discount_value: Number(e.target.value)})} placeholder="20" />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2 uppercase">Kích hoạt mã</button>
        </form>
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-black">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b">
            <tr>
              <th className="p-4">Mã Code</th>
              <th className="p-4">Giá trị giảm</th>
              <th className="p-4">Hạn dùng</th>
              <th className="p-4 text-center">Xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {promos.map((p) => (
              <tr key={p.promo_id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-blue-600">{p.coupon_code}</td>
                <td className="p-4 font-medium text-green-600">Giảm {p.discount_value * 100}%</td>
                <td className="p-4 text-gray-500">{p.start_date} ~ {p.end_date}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(p.promo_id)} className="text-red-600 hover:underline font-semibold">Xóa bỏ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}