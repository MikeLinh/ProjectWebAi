import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authcontext"; 
import { useNotification } from "../context/notificationcontext";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const {showNotification} = useNotification();
  const { user } = useAuth();

  if (!user || user.role !== "ADMIN") {
    showNotification("Bạn không có quyền truy cập vào khu vực Admin!","warning");
    return <Navigate to="/home" replace />;
  }
  // Nếu điều kiện thỏa mãn, render nội dung bên trong 
  return <>{children}</>;
}

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const {showNotification} = useNotification();
  const { user } = useAuth();
  if (!user) {
    showNotification("Vui lòng đăng nhập để tiếp tục!","warning");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}