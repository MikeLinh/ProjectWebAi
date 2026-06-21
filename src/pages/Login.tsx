import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google';
import {Link} from "react-router-dom"

export default function Login() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Login to your account</p>
        </div>
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" />
              Remember me
            </label>

            <button type="button" className="text-blue-500 hover:underline">
              <Link to="/forgotpassword">Forgot password?</Link> 
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-950 hover:bg-blue-900 text-white py-3 rounded-xl font-semibold transition-colors">
            Login
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-900 text-xs uppercase">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="w-full flex items-center justify-center gap-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded text-sm font-medium transition-colors">
          <GoogleIcon className="text-sm text-red-500" style={{ fontSize: 18 }} />
          Sign in with Google
        </button>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500 cursor-pointer hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}