import React, { useState } from "react";
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

  const discount= location.state?.discount || 0;
  const couponCode = location.state?.couponCode || "";
  
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", note: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("COD");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert("Giỏ hàng rỗng!");
      return;
    }
    const subTotal= getCartTotal();
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
        <h1 className="text-3xl font-bold tracking-wide mb-8">CHECKOUT</h1>
        
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