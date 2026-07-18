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
  // Khởi tạo đối tượng location để lấy thông tin giảm giá được truyền sang từ trang giỏ hàng trước đó
  const location = useLocation();
  const { showNotification } = useNotification();
  

  const discount = location.state?.discount || 0; // Lấy số tiền giảm giá từ state của trang trước
  const couponCode = location.state?.couponCode || ""; // Lấy tên mã giảm giá đã áp dụng thành công từ trang trước
  const promoId = location.state?.promoId || null; // Lấy ID của mã giảm giá đã áp dụng

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("COD");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Gọi hàm fetch dữ liệu cá nhân của người dùng để tự động điền vào form
    fetchAutofillData().then((data) => {
      if (data) setFormData(data); //Hợp lệ, tự điền dữ liệu vào form
    });
  }, []);
  //Hàm xử lý sự kiện khi người dùng nhập form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Cập nhật thuộc tính tương ứng trong state 'formData' dựa trên thuộc tính 'name' của ô nhập liệu
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  // Tính tiền tạm tính
  const subTotal = getCartTotal();
  const finalTotal = subTotal - discount;

  // Định nghĩa hàm xử lý gửi đơn hàng
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showNotification("Giỏ hàng rỗng!","error");
      return;
    }
    if (submitting) return; //Nếu trong quá trình gửi đơn hàng, thì return tránh bị lặp lại đơn hàng
    setSubmitting(true);

    // Sử dụng hàm helper đóng gói toàn bộ dữ liệu đơn hàng thành cấu trúc payload gửi lên API
    const payload = buildOrderPayload({
      cart,
      formData,
      paymentMethod,
      discount,
      promoId,
      finalTotal,
    });

    try {
      // Gọi hàm gửi đơn hàng lên Server thông qua API và nhận kết quả trả về từ cơ sở dữ liệu
      const result = await submitOrder(payload); 

      //Nếu chọn thanh toán bằng VNPAY thì sẽ chuyển hướng tới trang thanh toán VNPAY
      if (paymentMethod === "VNPAY" && result?.payUrl) {
        showNotification("Đang chuyển hướng đến VNPay...","info");
        window.location.href = result.payUrl; // Điều hướng trình duyệt chuyển hẳn sang trang thanh toán bảo mật của cổng VNPay
        return;
      }

      clearCart(); // Xóa sạch giỏ hàng
      // Đóng gói thông tin đơn hàng
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
      // Nếu phương thức thanh toán là COD
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