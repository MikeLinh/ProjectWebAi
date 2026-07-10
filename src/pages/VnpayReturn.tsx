/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";

export default function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    setIsSuccess(responseCode === "00");
  }, [searchParams]);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {isSuccess ? (
            <>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl"></span>
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
                <span className="text-5xl"></span>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-3">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 mb-8">
                Đã có lỗi xảy ra. Vui lòng thử lại sau.
              </p>
            </>
          )}

          <button
            onClick={() => navigate("/product")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg"
          >
            ← Trở về trang sản phẩm
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}