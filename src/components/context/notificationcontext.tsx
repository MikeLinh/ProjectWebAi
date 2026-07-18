/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

// Định nghĩa cấu trúc dữ liệu và hàm mà bộ nhớ thông báo
interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void;
}
// Khởi tạo một Context lưu trữ thông tin điều khiển thông báo, giá trị mặc định ban đầu là undefined
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Định nghĩa Component bọc để cung cấp bộ điều khiển thông báo xuống cho các Component con (children) bên trong
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");

  // Định nghĩa hàm kích hoạt hiển thị thông báo với tham số mặc định của mức độ 'sev' là "success" nếu không truyền vào
  const showNotification = (msg: string, sev: AlertColor = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };
  // Định nghĩa hàm xử lý khi hộp thông báo đóng lại
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar 
        open={open} 
        autoHideDuration={3000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Hiển thị góc trên bên phải 
      >
        <Alert 
          onClose={handleClose} 
          severity={severity} 
          variant="filled" 
          sx={{ width: "100%", borderRadius: "12px", fontWeight: "bold" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification phải được sử dụng bên trong NotificationProvider");
  }
  return context;
};