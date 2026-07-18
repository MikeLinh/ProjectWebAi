/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react"; 
import { useCart } from "../components/context/carcontext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";
import PromoSection from "../components/promotion/promosection"; 

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  
  const [discount, setDiscount] = useState<number>(0);
  const [appliedCode, setAppliedCode] = useState<string>("");
  const[promoId,setPromoId]= useState<number | null>(null);
  const cartTotal = getCartTotal();
  
  // Lắng nghe sự thay đổi của tổng tiền tạm tính 'cartTotal' thông qua useEffect
  useEffect(() => {
  if (cartTotal === 0) {
    handleResetDiscount();
  }
  }, [cartTotal]);
  // Định nghĩa hàm reset trạng thái giảm giá về ban đầu
  const handleResetDiscount = () => {
    setDiscount(0);
    setAppliedCode("");
    setPromoId(null);
  };
  // Định nghĩa hàm nhận và lưu trữ thông tin mã giảm giá
  const handleApplyDiscount = (discountAmount: number, code: string, id: number | null = null) => {
    setDiscount(discountAmount);
    setAppliedCode(code);
    setPromoId(id);
  };
  // Tính toán số tiền thực tế
  const finalTotal = cartTotal - discount;

  return (
    <div className="bg-white min-h-screen text-black flex flex-col justify-between">
      <Navbar />
      <div className="max-w-6xl w-full mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl font-bold tracking-wide mb-8">GIỎ HÀNG CỦA BẠN</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 border border-gray-800 rounded-2xl bg-gray-50">
            <p className="text-black mb-4">Giỏ hàng của bạn đang trống.</p>
            <button onClick={() => navigate("/product")} className="bg-red-600 px-6 py-2 rounded-lg font-bold uppercase text-sm hover:bg-red-700 transition-colors">
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-lg p-2 shrink-0 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate text-black">{item.name}</h3>
                    <p className="text-red-500 font-semibold text-sm mt-1">${item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden shrink-0">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1 bg-gray-100 text-black hover:bg-gray-200">-</button>
                    <span className="px-3 text-xs font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1 bg-gray-100 text-black hover:bg-gray-200">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 text-xs px-2 transition-colors">Xoá</button>
                </div>
              ))}
            </div>

            <div className="h-fit space-y-4">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <h2 className="text-lg font-bold border-b border-gray-200 pb-3">TỔNG GIỎ HÀNG</h2>
                <div className="flex justify-between text-sm">
                  <span className="text-black">Tạm tính:</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Giảm giá ({appliedCode}):</span>
                    <span>-${discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm border-b border-gray-200 pb-3">
                  <span className="text-black">Giao hàng:</span>
                  <span className="text-green-500">Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Tổng cộng:</span>
                  <span className="text-red-500">${finalTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => navigate("/checkout", {
                    state:{
                      discount: discount,
                      couponCode: appliedCode,
                      promoId: promoId,
                    }
                  })}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors mt-4"
                >
                  Tiến hành thanh toán
                </button>
              </div>
              <PromoSection 
                cartTotal={cartTotal} 
                onApplyDiscount={handleApplyDiscount} 
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}