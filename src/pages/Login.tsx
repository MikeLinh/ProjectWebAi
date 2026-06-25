import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import LoginHeader from "../components/login/loginheader";
import InputField from "../components/login/inputfield";
import RememberForgot from "../components/login/rememberforgot";
import GoogleLoginButton from "../components/login/logingooglebutton";


const MOCK_USERS_DATABASE = [
  { user_id: 1, full_name: "Hệ thống Admin", email: "admin@gmail.com", password: "123", role: "ADMIN" },
  { user_id: 2, full_name: "Nguyễn Văn A", email: "user@gmail.com", password: "user123", role: "USER" }
];

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleNormalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const accountFound = MOCK_USERS_DATABASE.find(
      (u) => u.email === email.trim() && u.password === password
    );

    if (accountFound) {
      const sessionUser = {
        user_id: accountFound.user_id,
        full_name: accountFound.full_name,
        email: accountFound.email,
        role: accountFound.role
      };
      localStorage.setItem("currentUser", JSON.stringify(sessionUser));
      
      if (sessionUser.role === "ADMIN") {
        alert("Đăng nhập quyền Quản trị viên thành công!");
        navigate("/admin");
      } else {
        alert(`Chào mừng quay trở lại, ${sessionUser.full_name}!`);
        navigate("/product");
      }
    } else {
      setErrorMessage("Email hoặc mật khẩu không chính xác. Hãy thử lại!");
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const googleAuthApi = import.meta.env.VITE_GOOGLE_API as string;
        const res = await fetch(googleAuthApi, {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const data = await res.json();
        console.log(data);
      
      } catch (error) {
        console.error("Lỗi xác thực Google:", error);
      }
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

          {/* Thông báo lỗi tập trung */}
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
            Login
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-medium">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <GoogleLoginButton onGoogleClick={() => loginWithGoogle()} />

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500 cursor-pointer hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}