import React from "react";
import { useCart } from "../context/carcontext";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom"; 

interface CartModelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CardModel({ isOpen, onClose }: CartModelProps) {
  //Lấy các hàm và dữ liệu từ CartContext
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div 
        className={`fixed top-0 right-0 bottom-0 z-50 bg-white w-full max-w-sm p-5 border-l border-gray-200 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pb-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Giỏ hàng của bạn</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {cart.length === 0 ?
            <p className="text-center text-gray-400 py-10 text-xs">Giỏ hàng của bạn đang trống.</p>
          : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain border border-gray-200 rounded p-1 bg-gray-50" />
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 truncate">{item.name}</h4>
                  <p className="text-xs text-red-500 font-bold mt-0.5">${item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center border border-gray-300 rounded overflow-hidden shrink-0">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                    className="px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-1.5 py-0.5 text-xs font-medium w-6 text-center text-gray-800">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                    className="px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <DeleteIcon style={{ fontSize: 18 }} />
                </button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Tổng thanh toán:</span>
              <span className="text-sm font-bold text-red-500">${getCartTotal().toLocaleString()}</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    onClose(); 
                    navigate("/cart"); 
                  }}
                  className="flex-1 border border-blue-950 text-blue-950 hover:bg-gray-50 py-2 rounded text-xs font-bold transition-colors text-center uppercase"
                >
                  Xem giỏ hàng
                </button>
                <button 
                  onClick={clearCart}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-100 text-gray-600 rounded text-xs font-medium transition-colors uppercase"
                >
                  Xóa hết
                </button>
              </div>

              <button 
                onClick={() => {
                  onClose();
                  navigate("/checkout"); 
                }}
                className="w-full bg-blue-950 hover:bg-blue-900 text-white py-2.5 rounded text-xs font-bold transition-colors uppercase tracking-wider"
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}