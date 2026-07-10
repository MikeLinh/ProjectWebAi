/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/* Tạo bộ nhớ lưu trạng thái người dùng khi đăng nhập */
import React, { createContext, useContext, useState } from "react";

export interface User {
  userId?: number;
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  role: "ADMIN" | "USER";
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SỬA TẠI ĐÂY: Khởi tạo giá trị đồng bộ từ localStorage ngay lập tức
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("current_user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Lỗi parse user từ localStorage:", e);
      return null;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("current_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("current_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được bọc bên trong AuthProvider");
  return context;
};