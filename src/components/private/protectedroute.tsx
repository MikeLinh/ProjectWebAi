import React from "react";
import { Navigate } from "react-router-dom";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const userSession = localStorage.getItem("currentUser");
  const user = userSession ? JSON.parse(userSession) : null;

  if (!user || user.role !== "ADMIN") {
    alert("Bạn không có quyền truy cập vào khu vực Admin!");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const userSession = localStorage.getItem("currentUser");
  
  if (!userSession) {
    alert("Vui lòng đăng nhập để tiếp tục!");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}