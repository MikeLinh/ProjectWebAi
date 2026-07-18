import React from "react";

// Cấu trúc Props truyền từ Component cha
interface DeliveryFormProps {
  formData: { name: string; phone: string; email: string; address: string; note: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Hàm xử lý khi người dùng gõ phím để cập nhật dữ liệu (State) ở component cha
}
export default function DeliveryForm({formData, handleInputChange}:DeliveryFormProps){
    return(
        <div className="bg-gray-100 p-6 rounded-2xl border border-gray-800 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-800 pb-3 text-black">Thông tin giao hàng</h2>
      <div>
        <label className="text-xs text-black block mb-1">Họ và tên *</label>
        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-100 border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500" placeholder="Nguyễn Văn A" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-black block mb-1">Số điện thoại *</label>
          <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-100 border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500" placeholder="0901234567" />
        </div>
        <div>
          <label className="text-xs text-black block mb-1">Địa chỉ Email *</label>
          <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-100 border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500" placeholder="email@viethan.com" />
        </div>
      </div>
      <div>
        <label className="text-xs text-black block mb-1">Địa chỉ nhận hàng *</label>
        <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-100 border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500" placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh thành" />
      </div>
      <div>
        <label className="text-xs text-black block mb-1">Ghi chú đơn hàng (Tùy chọn)</label>
        <textarea name="note" value={formData.note} onChange={handleInputChange} rows={3} className="w-full bg-gray-100 border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500" placeholder="Lưu ý về thời gian giao hàng..."></textarea>
      </div>
    </div>
    )
}