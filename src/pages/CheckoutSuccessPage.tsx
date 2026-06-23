import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";

export default function CheckoutSuccess() {
  const location = useLocation();
  const orderDetails = location.state?.order;

  if (!orderDetails) {
    return <Navigate to="/product" replace />;
  }

  return (
    <div className="bg-[#d6d6d6] min-h-screen text-white flex flex-col justify-between">
      <Navbar />
      <div className="text-center py-20 max-w-xl mx-auto px-4 bg-white my-10 rounded-2xl shadow-xl border border-gray-300 text-black">
        <div className="text-5xl mb-4">CẢM ƠN BẠN !</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">ĐẶT HÀNG THÀNH CÔNG!</h1>
        <p className="text-gray-700 text-sm mb-6">Cảm ơn bạn **{orderDetails.customer.name}** đã tin tưởng lựa chọn BIKECYC STORE.</p>
        
        {orderDetails.payment === "BANK" && (
          <div className="mb-8 p-4 border border-blue-300 bg-blue-50/50 rounded-xl max-w-sm mx-auto space-y-3">
            <p className="text-xs font-bold text-blue-900 uppercase">Quét mã QR để hoàn tất chuyển khoản</p>
            <img 
              src={`https://img.vietqr.io/image/MB-0901234567-compact2.jpg?amount=${orderDetails.total}&addInfo=BIKECYC%20${orderDetails.customer.phone}`} 
              alt="VietQR Code" 
              className="w-48 h-48 mx-auto border bg-white p-2 rounded-lg"
            />
            <div className="text-left text-xs text-gray-800 space-y-1 bg-white p-3 rounded-lg border">
              <p><b>Số tiền:</b> ${orderDetails.total.toLocaleString()}</p>
              <p><b>Nội dung CK:</b> BIKECYC {orderDetails.customer.phone}</p>
              <p className="text-[10px] text-red-500 italic mt-1">* Đơn hàng sẽ được xử lý sau khi hệ thống nhận được tiền.</p>
            </div>
          </div>
        )}

        {orderDetails.payment === "MOMO" && (
          <p className="text-xs text-pink-600 font-semibold mb-6 bg-pink-50 p-3 rounded-lg border border-pink-200">
            Vui lòng kiểm tra ứng dụng MoMo trên điện thoại để xác nhận giao dịch.
          </p>
        )}

        <a href="/product" className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors">
          Tiếp tục mua sắm
        </a>
      </div>
      <Footer />
    </div>
  );
}