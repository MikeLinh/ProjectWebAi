/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/* Tạo bộ nhớ lưu trạng thái người dùng khi đăng nhập */
import React, { createContext, useContext, useState, useEffect } from "react";

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("current_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

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