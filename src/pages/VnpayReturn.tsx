/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import { useCart } from "../components/context/carcontext";
import axios from "axios";

// Module-level Set — sống sót qua StrictMode remount
const processedTxnRefs = new Set<string>();

export default function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(true);

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    const txnRef = searchParams.get("vnp_TxnRef");

    const success = responseCode === "00";
    setIsSuccess(success);

    if (!txnRef) {
      setUpdating(false);
      return;
    }

    // Đã xử lý txnRef này → dừng ngay, không gọi API nữa
    if (processedTxnRefs.has(txnRef)) {
      setUpdating(false);
      return;
    }
    processedTxnRefs.add(txnRef);

    const extractedId = txnRef.split("_")[0];
    setOrderId(extractedId);

    if (success) {
      clearCart();
    }

    if (responseCode) {
      axios
        .patch(
          `${import.meta.env.VITE_API_URL}/api/orders/${extractedId}/payment-result`,
          null,
          {
            params: {
              vnp_ResponseCode: responseCode,
              vnp_TxnRef: txnRef,
            },
          }
        )
        .then(() => console.log("Đã cập nhật thanh toán"))
        .catch((err) => console.log("Lỗi cập nhật thanh toán", err))
        .finally(() => setUpdating(false));
    } else {
      setUpdating(false);
    }
  }, [searchParams]); // chỉ phụ thuộc searchParams

  const handlePayAgain = () => {
    if (orderId) {
      navigate("/checkout", { state: { retryOrderId: orderId } });
    } else {
      navigate("/product");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {isSuccess ? (
            <>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl">✓</span>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-3">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 mb-8">
                Cảm ơn bạn đã mua hàng tại <strong>BIKECYC STORE</strong>.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl">✕</span>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-3">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 mb-8">
                Đã có lỗi xảy ra. Vui lòng thử lại sau.
              </p>
            </>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePayAgain}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg"
            >
              Thanh toán lại
            </button>

            <button
              onClick={() => navigate("/product")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg"
            >
              ← Trở về trang sản phẩm
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}