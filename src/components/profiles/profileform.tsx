/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authcontext"; 
import ProfileInput from "./profileinput";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function ProfileForm() {
  const { user, login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);


  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setAddress(user.address || "");
      setPassword(user.password || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!user?.userId) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-profile/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) throw new Error("Cập nhật thông tin thất bại. Vui lòng thử lại!");

      const updatedUser = await res.json();
      login(updatedUser); 

      setMessage({ type: "success", text: "Cập nhật thông tin tài khoản thành công!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:col-span-2 space-y-6 text-black">
      <div>
        <h1 className="text-2xl font-black text-blue-950">Thông tin cá nhân</h1>
        <p className="text-xs text-black mt-1">
          Quản lý và cập nhật thông tin liên hệ của bạn để thuận tiện khi mua hàng.
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-semibold border-white ${
          message.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-500 border-red-200"
        }`}>
          {message.type === "success" ? "" : "! "} {message.text}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <ProfileInput
          label="Địa chỉ Email (Cố định)"
          icon={<EmailIcon style={{ fontSize: 16 }} />}
          type="email"
          disabled
          value={user?.email || ""}
        />

        <ProfileInput
          label="Họ và tên"
          icon={<BadgeIcon style={{ fontSize: 16 }} />}
          value={fullName}
          onChange={setFullName}
          placeholder="Nhập họ và tên đầy đủ"
        />

        <ProfileInput
          label="Số điện thoại"
          icon={<PhoneIcon style={{ fontSize: 16 }} />}
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="Nhập số điện thoại của bạn"
        />
        <div className="relative">
          <ProfileInput
            label="Mật khẩu mới (tùy chọn)"
            icon={<PhoneIcon style={{ fontSize: 16 }} />} 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="Để trống nếu không muốn đổi mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-9 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
          </button>
        </div>

        <ProfileInput
          label="Địa chỉ nhận hàng"
          icon={<HomeIcon style={{ fontSize: 16 }} />}
          isTextArea
          value={address}
          onChange={setAddress}
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl font-bold transition-colors text-sm"
          >
            {loading ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}