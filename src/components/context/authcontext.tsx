/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/* Tạo bộ nhớ lưu trạng thái người dùng khi đăng nhập */
import React, { createContext, useContext, useState } from "react";
// Cấu trúc dữ liệu của một tài khoản user
export interface User {
  userId?: number;
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  role: "ADMIN" | "USER";
}
// Định nghĩa các dữ liệu và hàm mà bộ nhớ dùng chung
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Khởi tạo bộ lưu trữ dữ liệu xác thực ngầm định ban đầu là undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Component bọc ngoài cùng của ứng dụng để truyền dữ liệu đi xuống dưới
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //Khởi tạo trạng thái người dùng
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("current_user"); // Đọc chuỗi thông tin người dùng được lưu trữ dưới trình duyệt bằng key "current_user"
    try {
      return savedUser ? JSON.parse(savedUser) : null; // Nếu tìm thấy chuỗi đã lưu thì tiến hành dịch ngược JSON thành Object
    } catch (e) {
      console.error("Lỗi parse user từ localStorage:", e);
      return null;
    }
  });
  // Định nghĩa hàm xử lý đăng nhập
  const login = (userData: User) => {
    setUser(userData); // Cập nhật thông tin người dùng vừa đăng nhập
    // Chuyển Object thông tin người dùng thành chuỗi và lưu vào bộ nhớ trình duyệt để duy trì đăng nhập khi F5
    localStorage.setItem("current_user", JSON.stringify(userData));
  };

  // Định nghĩa hàm xử lý đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem("current_user"); // Xóa sạch key "current_user" khỏi bộ nhớ trình duyệt
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// Định nghĩa Custom Hook giúp các component con lấy dữ liệu nhanh
export const useAuth = () => {
  const context = useContext(AuthContext); // Trích xuất dữ liệu đang được lưu trữ bên trong AuthContext bằng hook useContext
  if (!context) throw new Error("useAuth phải được bọc bên trong AuthProvider");
  return context;
};