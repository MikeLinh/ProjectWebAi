import React, { useState } from "react";
import { useCart } from "../components/context/carcontext";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", note: "" });
  const [isOrdered, setIsOrdered] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý gửi API đặt hàng 
    console.log("Thông tin đơn hàng:", { customer: formData, products: cart, total: getCartTotal() });
    clearCart(); // Đặt hàng thành công xóa giỏ hàng
    setIsOrdered(true);
  };

  if (isOrdered) {
    return (
      <div className="bg-[#121212] min-h-screen text-white flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-32 max-w-md mx-auto px-4">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-500 mb-2">ĐẶT HÀNG THÀNH CÔNG!</h1>
          <p className="text-gray-400 text-sm mb-6">Cảm ơn bạn đã tin tưởng lựa chọn chúng tôi. Mã đơn hàng đang được hệ thống xử lý.</p>
          <a href="/product" className="inline-block bg-red-600 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider">Tiếp tục mua sắm</a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen text-black flex flex-col justify-between">
      <Navbar />
      <div className="max-w-6xl w-full mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl font-bold tracking-wide mb-8">CHECKOUT</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form nhập thông tin */}
          <div className="lg:col-span-2 bg-gray-100 p-6 rounded-2xl border border-gray-800 space-y-4">
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

          {/* Tóm tắt đơn hàng bên phải */}
          <div className="bg-gray-100 p-6 rounded-2xl border border-gray-800 h-fit space-y-4">
            <h2 className="text-lg font-bold border-b border-gray-800 pb-3">YOUR ORDER</h2>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-black">
                  <span className="truncate max-w-[180px]">{item.name} <b className="text-red-500">x{item.quantity}</b></span>
                  <span>${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-3 flex justify-between font-bold text-base">
              <span>Tổng thanh toán:</span>
              <span className="text-red-500">${getCartTotal().toLocaleString()}</span>
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors mt-4">
              Xác nhận đặt hàng
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}