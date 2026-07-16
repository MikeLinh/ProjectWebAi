/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../components/context/carcontext";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";

import DeliveryForm from "../components/checkout/deliveryform";
import PaymentMethods, { type PaymentMethodType } from "../components/checkout/paymethods";
import OrderSummary from "../components/checkout/ordersummary";
import { useNotification } from "../components/context/notificationcontext";

import {
  EMPTY_FORM,
  fetchAutofillData,
  buildOrderPayload,
  submitOrder,
} from "../components/utils/checkouthelper";

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  

  const discount = location.state?.discount || 0;
  const couponCode = location.state?.couponCode || "";
  const promoId = location.state?.promoId || null;

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("COD");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAutofillData().then((data) => {
      if (data) setFormData(data);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const subTotal = getCartTotal();
  const finalTotal = subTotal - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showNotification("Giỏ hàng rỗng!","error");
      return;
    }
    if (submitting) return;

    setSubmitting(true);

    const payload = buildOrderPayload({
      cart,
      formData,
      paymentMethod,
      discount,
      promoId,
      finalTotal,
    });

    try {
      const result = await submitOrder(payload);

      if (paymentMethod === "VNPAY" && result?.payUrl) {
        showNotification("Đang chuyển hướng đến VNPay...","info");
        window.location.href = result.payUrl;
        return;
      }

      clearCart();

      const orderState = {
        orderId: result.orderId,
        order: {
          customer: formData,
          discount,
          total: finalTotal,
          payment: paymentMethod,
          status: "PENDING",
        },
      };

      if (paymentMethod === "COD") {
        navigate("/checkout/success", { state: orderState });
      } else {
        navigate("/order-tracking", { state: orderState });
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Đặt hàng thất bại. Vui lòng thử lại.","error");
    } finally {
      setSubmitting(false);
    }
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
            subTotal={subTotal}
            discount={discount}
            couponCode={couponCode}
            submitting={submitting}
          />
        </form>
      </div>
      <Footer />
    </div>
  );
}