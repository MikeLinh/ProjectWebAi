import { useLocation, useSearchParams } from "react-router-dom";
import { useCart } from "../components/context/carcontext";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import { useEffect, useRef } from "react";


export default function CheckoutSuccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = location.state?.orderId || searchParams.get("vnp_TxnRef")?.split("_")[0];
  const responseCode = searchParams.get("vnp_ResponseCode");

  const isSuccess = responseCode === "00" || !responseCode; 
  const isUpdated = useRef(false);
  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
    if(responseCode === "00" && orderId && !isUpdated.current){
      const confirmOrder = async () => {
        try{
          isUpdated.current = true;
          await fetch(`http://localhost:8080/api/orders/{$orderId}/status`,{
            method: "PATCH",
            headers: {
              "Content-Type" : "application/json",
            },
            body: JSON.stringify({status : "CONFIRMED"}),
          });
        }catch(error){
          console.log("Lỗi khi cập nhập trạng thái đơn hàng", error)
        }
      }
      confirmOrder();
    }
  }, [isSuccess, clearCart, orderId,responseCode]);
  return (
    <div className="bg-[#d6d6d6] min-h-screen text-white flex flex-col justify-between">
      <Navbar />
      <div className="text-center py-20 max-w-xl mx-auto px-4 bg-white my-10 rounded-2xl shadow-xl border border-gray-300 text-black">
        
        {isSuccess ? (
          <>
            <div className="text-6xl mb-6"></div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">THANH TOÁN THÀNH CÔNG!</h1>
            <p className="text-gray-700 mb-8">Cảm ơn bạn đã mua hàng tại BIKECYC STORE.</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6"></div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Thanh toán thất bại</h1>
          </>
        )}

        <p className="mb-8 text-sm text-gray-600">
          Mã đơn hàng: <strong>#{orderId || "Không xác định"}</strong>
        </p>

        <a 
          href="/product" 
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold text-lg"
        >
          Tiếp tục mua sắm
        </a>
      </div>
      <Footer />
    </div>
  );
}