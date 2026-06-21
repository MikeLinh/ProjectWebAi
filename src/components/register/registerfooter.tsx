import React from "react";
import { Link } from "react-router-dom"
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google';

export default function RegisterFooter(){
     const loginWithGoogle = useGoogleLogin({
    onSuccess: async (access_token) => {
      try {
        const googleAuthApi= import.meta.env.VITE_GOOGLE_API as string
        const res = await fetch(googleAuthApi, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const userInfo = await res.json();
        console.log("Thông tin người dùng Google:", userInfo);
        alert(`Chào mừng ${userInfo.name} đã đăng nhập thành công!`);
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
      }
    },
    onError: (error) => {
      console.log("Đăng nhập thất bại:", error);
    },
  });
    return(
        <>
            <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
                </div>
                <span className="relative bg-white px-3 text-gray-400 text-[10px] uppercase tracking-wider">
                Or
                </span>
            </div>

            <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded text-sm font-medium transition-colors">
                <GoogleIcon className="text-sm text-red-500" style={{ fontSize: 18 }} />
                Sign in with Google
            </button>

            <div className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{""}
                <Link to="/login" className="text-blue-500 font-medium hover:underline">Login</Link>
            </div>
    </>
    )
}