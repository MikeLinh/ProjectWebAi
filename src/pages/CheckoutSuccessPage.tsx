import { useLocation, useSearchParams } from "react-router-dom";
import { useCart } from "../components/context/carcontext";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "../components/context/notificationcontext";

export default function CheckoutSuccess() {
  // Khởi tạo hook lấy thông tin route hiện tại
  const location = useLocation();
  const [searchParams] = useSearchParams(); // Khởi tạo hook lấy các tham số query trên URL
  const { clearCart } = useCart();
  // Xác định mã đơn hàng (orderId) lấy từ state chuyển trang, nếu không có thì trích xuất từ tham số vnp_TxnRef của VNPay
  const orderId = location.state?.orderId || searchParams.get("vnp_TxnRef")?.split("_")[0];
  // Lấy mã phản hồi kết quả giao dịch từ VNPay trên URL
  const responseCode = searchParams.get("vnp_ResponseCode");
  const { showNotification } = useNotification();
  

  const isSuccess = responseCode === "00" || !responseCode; 
  const isUpdated = useRef(false);
  const [rePaying, setRePaying] = useState(false);
  const txnRef = searchParams.get("vnp_TxnRef");

  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
    // Nếu có mã phản hồi từ VNPay và có mã đơn hàng hợp lệ thì tiến hành cập nhật
    if (responseCode && orderId && !isUpdated.current) {
      const confirmOrder = async () => {
        try {
          isUpdated.current = true;
          // Gọi endpoint /payment-result để backend tự động đồng bộ trạng thái đơn hàng và thanh toán
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/payment-result?vnp_ResponseCode=${responseCode}&vnp_TxnRef=${txnRef}`,
            { method: "PATCH" }
          );
        } catch (error) {
          console.log("Lỗi khi cập nhập trạng thái đơn hàng", error); 
        }
      };
      confirmOrder();
    }
  }, [isSuccess, clearCart, orderId, responseCode]); // tự động chạy lại khi một trong các tham số này thay đổi
  
  // Định nghĩa hàm xử lý thanh toán lại
  const handleRepay = async () => {
    if (!orderId) {
      showNotification("Không tìm thấy mã đơn hàng để thực hiện thanh toán lại!", "error");
      return;
    }
    setRePaying(true);
    try {
      // Xác định số tiền chuẩn của đơn hàng
      let finalAmount = location.state?.order?.total || location.state?.order?.totalAmount;

      if (!finalAmount) {
        // Nếu không có sẵn trong state, fetch từ API chi tiết đơn hàng dựa trên orderId
        const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`); 
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          finalAmount = orderData.totalAmount; // Lấy trường totalAmount từ Model Order
        }
      }

      if (!finalAmount || isNaN(Number(finalAmount))) {
        throw new Error("Không thể xác định số tiền thanh toán của đơn hàng này.");
      }

      // Gửi request chuẩn lên Backend để tạo URL thanh toán mới
      const vnpayRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vnpay/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: Number(orderId),
          amount: Number(finalAmount), 
          orderInfo: `Thanh toan lai don hang ${orderId}`,
        }),
      });

      if (!vnpayRes.ok) {
        const errorText = await vnpayRes.text();
        throw new Error(errorText || "Không thể tạo lại link VNPay");
      }
      
      const vnpayData = await vnpayRes.json();
      if (vnpayData.payUrl) {
        showNotification("Đang chuyển hướng lại đến VNPay...", "info");
        window.location.href = vnpayData.payUrl;
      }
    } catch (error: any) {
      showNotification(error.message || "Tạo liên kết thanh toán lại thất bại.", "error");
    } finally {
      setRePaying(false);
    }
  };

  return (
    <div className="bg-[#d6d6d6] min-h-screen text-white flex flex-col justify-between">
      <Navbar />
      <div className="text-center py-20 max-w-xl mx-auto px-4 bg-white my-10 rounded-2xl shadow-xl border border-gray-300 text-black">
        
        {isSuccess ? (
          <>
            <h1 className="text-3xl font-bold text-green-600 mb-4">THANH TOÁN THÀNH CÔNG!</h1>
            <p className="text-gray-700 mb-8">Cảm ơn bạn đã mua hàng tại BIKECYC STORE.</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Thanh toán thất bại</h1>
            <p className="text-gray-700 mb-8">Giao dịch đã bị huỷ hoặc gặp sự cố. Bạn có thể thử thanh toán lại phía dưới.</p>
          </>
        )}

        <p className="mb-8 text-sm text-gray-600">
          Mã đơn hàng: <strong>#{orderId || "Không xác định"}</strong>
        </p>

        <div className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto">
          {!isSuccess && (
            <button 
              onClick={handleRepay}
              disabled={rePaying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50"
            >
              {rePaying ? "Đang xử lý..." : "Thanh toán lại qua VNPAY"}
            </button>
          )}
          <a 
            href="/product" 
            className="w-full inline-block bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold text-lg text-center"
          >
            Tiếp tục mua sắm
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}