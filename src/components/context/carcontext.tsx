/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Định nghĩa dữ liệu đại diện cho một sản phẩm trong giỏ hàng
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  discount?: number;
}
// Định nghĩa cấu trúc dữ liệu và các hàm mà bộ nhớ giỏ hàng
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
}
// Khởi tạo một Context lưu trữ thông tin giỏ hàng, giá trị mặc định ban đầu là undefined
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Khởi tạo state 'cart' lưu danh sách sản phẩm, sử dụng kỹ thuật Lazy Initial State để đọc từ bộ nhớ trình duyệt
  const [cart, setCart] = useState<CartItem[]>(() => {
    const localData = localStorage.getItem("cart"); // Tìm và lấy chuỗi dữ liệu giỏ hàng
    return localData ? JSON.parse(localData) : []; //Nếu tìm được thì sẽ trả về mảng chứa dữ liệu CartItem
  });

  // Sử dụng useEffect để tự động lưu giỏ hàng mới nhất
  useEffect(() => {
    // Chuyển mảng giỏ hàng 'cart' thành chuỗi JSON và ghi đè vào key "cart" ở localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Định nghĩa hàm thêm sản phẩm vào giỏ hàng
  const addToCart = (product: any, quantity: number = 1) => {
    setCart((prevCart) => {
      // Tìm xem sản phẩm định thêm này đã tồn tại trong giỏ hàng
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Duyệt qua giỏ hàng và cộng dồn số lượng mua mới vào sản phẩm trùng ID
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity } // Sao chép phần tử cũ và tăng số lượng lên
            : item // Giữ nguyên phần tử không trùng khớp
        );
      }
      // Trả về một mảng mới gồm tất cả sản phẩm cũ cộng thêm sản phẩm mới ở cuối mảng 
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          discount: product.discount,
        },
      ];
    });
  };
  // Định nghĩa hàm thay đổi số lượng trực tiếp
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      // Duyệt qua mảng giỏ hàng, tìm sản phẩm khớp ID để cập nhật thuộc tính quantity mới, giữ nguyên các món khác
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };
  //Định nghĩa hàm xoá
  const removeFromCart = (id: number) => {
    // Lọc mảng giỏ hàng giữ lại ID khác trùng thì xoá
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };
  //Định nghĩa hàm làm rỗng giỏ hàng
  const clearCart = () => setCart([]);
  // Hàm tính tổng số lượng các mặt hàng trong giỏ
  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);
  // Hàm tính tổng thành tiền của cả giỏ hàng
  const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext); // Đọc dữ liệu đang lưu trong CartContext thông qua hook useContext
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}