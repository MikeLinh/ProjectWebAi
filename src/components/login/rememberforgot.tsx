import React from "react";
import { Link } from "react-router-dom";

export default function RememberForgot() {
  return (
    <div className="flex items-center justify-between text-sm">
      <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
        <input type="checkbox" className="accent-blue-950" />
        Nhớ
      </label>

      <Link to="/forgotpassword" className="text-blue-500 hover:underline">
        Quên mật khẩu?
      </Link>
    </div>
  );
}