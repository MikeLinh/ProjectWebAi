/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { useCart } from "../components/context/carcontext";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";

import DeliveryForm from "../components/checkout/deliveryform";
import PaymentMethods, { type PaymentMethodType } from "../components/checkout/paymethods";
import OrderSummary from "../components/checkout/ordersummary";

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const discount = location.state?.discount || 0;
  const couponCode = location.state?.couponCode || "";
  
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", note: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("COD");

  useEffect(() => {
    const applyUserData = (user: Record<string, string>) => {
      setFormData({
        name: user.fullName || "",
        phone: user.phoneNumber || "",
        email: user.email || "",
        address: user.address || "",
        note: ""
      });
    };

    const rawUser =
      localStorage.getItem("current_user") ||
      localStorage.getItem("currentUser") ||
      localStorage.getItem("user");

    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        if (user.fullName || user.email || user.phoneNumber) {
          applyUserData(user);
          return;
        }
      } catch (error) {
        console.error("Lỗi giải mã user JSON:", error);
      }
    }

    let userId = localStorage.getItem("userId") || localStorage.getItem("userId");
    if (!userId && rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u.userId) userId = String(u.userId);
      } catch { /* ignore */ }
    }

    if (userId) {
      fetch(`http://localhost:8080/api/users/${userId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Không thể tải thông tin tài khoản");
          return res.json();
        })
        .then((user) => {
          applyUserData(user);
        })
        .catch((err) => console.error("Lỗi autofill checkout:", err));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert("Giỏ hàng rỗng!");
      return;
    }
    const subTotal = getCartTotal();
    const finalTotal = subTotal - discount;

    const completedOrder = {
      customer: formData,
      discount: discount,
      total: finalTotal,
      payment: paymentMethod
    };

    console.log("Xử lý tạo đơn hàng thành công:", completedOrder);

    if (paymentMethod === "MOMO") {
      alert("Hệ thống đang liên kết ứng dụng ví MoMo...");
    }
    clearCart(); 
    navigate("/checkout/success", { state: { order: completedOrder } });
  };

  return (
    <div className="bg-gray-100 min-h-screen text-black flex flex-col justify-between">
      <Navbar />
      <div className="max-w-6xl w-full mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl font-bold tracking-wide mb-8">THANH TOÁN</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col">
            <DeliveryForm formData={formData} handleInputChange={handleInputChange} />
            <PaymentMethods selectedMethod={paymentMethod} onMethodChange={setPaymentMethod} />
          </div>
          <OrderSummary 
            cart={cart} 
            subTotal={getCartTotal()} 
            discount={discount}
            couponCode={couponCode} />
        </form>
      </div>
      <Footer />
    </div>
  );
}