import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authcontext"; 

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user || user.role !== "ADMIN") {
    alert("Bạn không có quyền truy cập vào khu vực Admin!");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    alert("Vui lòng đăng nhập để tiếp tục!");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}