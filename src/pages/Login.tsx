/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import LoginHeader from "../components/login/loginheader";
import InputField from "../components/login/inputfield";
import RememberForgot from "../components/login/rememberforgot";
import GoogleLoginButton from "../components/login/logingooglebutton";
import {useAuth} from "../components/context/authcontext"
import { useNotification } from "../components/context/notificationcontext";

export default function Login() {
  const navigate = useNavigate();
  const {login} = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {showNotification} = useNotification();

  const handleNormalLogin = async (e: React.FormEvent) => { //Hàm đồng bộ cho phép sử dụng await để gọi API đăng nhập
    e.preventDefault(); //Sẽ ngăn chặn load trang khi người dùng bấm submit
    setErrorMessage("");
    setLoading(true);

  try {
    // Gọi API đăng nhập ở Back-end bằng phương thức POST
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!res.ok) {
      throw new Error("Email hoặc mật khẩu không chính xác!");
    }
    //Trả về dữ liệu JSON
    const data = await res.json();
    const { user, token, expiresAt } = data;

    // Lưu thông tin vào bộ nhớ trình duyệt (LocalStorage) để duy trì phiên đăng nhập
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("expiresAt", expiresAt);

    login(user);

    if (user.role === "ADMIN") {
      showNotification("Đăng nhập quyền Quản trị viên thành công!");
      navigate("/admin");
    } else {
      showNotification(`Chào mừng quay trở lại, ${user.fullName}!`);
      navigate("/");
    }
  } catch (error: any) {
    setErrorMessage(error.message || "Không thể kết nối đến máy chủ.");
  } finally {
    setLoading(false);
  }
};
  // Cấu hình và khởi tạo hàm đăng nhập qua bên thứ ba bằng Google
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => { // Chạy khi phía Google xác thực tài khoản thành công và trả về access_token
      try {
        setLoading(true);
        setErrorMessage("");
        // Lấy đường dẫn API Google của Back-end từ file môi trường (.env)
        const googleAuthApi = import.meta.env.VITE_GOOGLE_API as string;

        const res = await fetch(googleAuthApi, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenResponse.access_token}` // Gửi token trong Header Authorization
          },
        });

        const data = await res.json();
        console.log(data);
        if (!res.ok) {
          throw new Error(data.message || "Đăng nhập Google thất bại!");
        }
        // Đồng bộ dữ liệu User: Lấy từ thuộc tính data.user, nếu Server trả thẳng cấu trúc user ở gốc dữ liệu thì lấy chính 'data'
        const user = data.user || data;
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("token", data.token);
        localStorage.setItem("expiresAt", data.expiresAt);

        // Đồng bộ trạng thái đăng nhập cho toàn bộ ứng dụng bằng hàm login lấy từ AuthContext
        login(user);

        if (user.role === "ADMIN") {
          showNotification("Đăng nhập quyền Quản trị viên thành công!","success");
          navigate("/admin");
        } else {
          showNotification(`Chào mừng, ${user.fullName}!`, "success");
          navigate("/");
        }

      } catch (error: any) {
        console.error("Lỗi Google Login:", error);
        setErrorMessage(error.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
      setErrorMessage("Không thể kết nối với Google.");
    },
});
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        
        <LoginHeader />
        <form className="space-y-5" onSubmit={handleNormalLogin}>
          <InputField 
            label="Email" 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={setEmail} 
          />
          <InputField 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
            value={password} 
            onChange={setPassword} 
          />
          {errorMessage && (
            <p className="text-xs text-red-500 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
              !{errorMessage}
            </p>
          )}

          <RememberForgot />

          <button
            type="submit"
            className="w-full bg-blue-950 hover:bg-blue-900 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
          >
            Đăng nhập
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-medium">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <GoogleLoginButton onGoogleClick={() => loginWithGoogle()} />

        <p className="text-center text-sm text-gray-500 mt-6">
         Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-500 cursor-pointer hover:underline">
            Đăng ký
          </Link>
        </p>
        <p className="text-center text-sm text-blue-400 mt-6">
          <Link to="/home">Quay trở lại</Link>
        </p>
      </div>
    </div>
  );
}

function setLoading(_arg0: boolean) {
  throw new Error("Function not implemented.");
}
