import React, { useState } from "react";
import FormInput from "../components/common/frominput";
import SubmitButton from "../components/common/submitbutton";
import RegisterFooter from "../components/register/registerfooter";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/context/notificationcontext";

export default function RegisterForm() {
    const {showNotification} = useNotification();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        address: "",
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMessage) setErrorMessage("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        // Validate client-side
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Mật khẩu xác nhận không khớp!");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự!");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    phoneNumber: formData.phoneNumber.trim(),
                    address: formData.address.trim(),
                }),
            });

            const data = await res.text();

            if (!res.ok) {
                throw new Error(data || "Đăng ký thất bại!");
            }

            showNotification("Đăng ký thành công! Vui lòng đăng nhập.","success");
            navigate("/login");

        } catch (error: any) {
            setErrorMessage(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-gray-100">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-wide">Create Account</h1>
                    <p className="text-gray-400 text-xs mt-1">Sign up to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Họ và tên" 
                        type="text" 
                        name="fullName"
                        placeholder="Nhập đầy đủ họ và tên" 
                        value={formData.fullName}
                        onChange={handleChange} 
                        required
                    />
                    <FormInput
                        label="Đại chỉ email" 
                        type="email" 
                        name="email"
                        placeholder="Nhập địa chỉ email" 
                        value={formData.email}
                        onChange={handleChange} 
                        required
                    />
                    <FormInput
                        label="Số điện thoại" 
                        type="tel" 
                        name="phoneNumber"
                        placeholder="Nhập số điện thoại" 
                        value={formData.phoneNumber}
                        onChange={handleChange} 
                    />
                    <FormInput
                        label="Địa chỉ" 
                        type="text" 
                        name="address"
                        placeholder="Nhập địa chỉ của bạn" 
                        value={formData.address}
                        onChange={handleChange} 
                    />
                    <FormInput
                        label="Mật khẩu" 
                        type="password" 
                        name="password"
                        placeholder="Nhập mật khẩu" 
                        value={formData.password}
                        onChange={handleChange} 
                        required
                    />
                    <FormInput
                        label="Xác nhận Mật khẩu" 
                        type="password" 
                        name="confirmPassword"
                        placeholder="Xác nhận mật khẩu" 
                        value={formData.confirmPassword}
                        onChange={handleChange} 
                        required
                    />

                    {errorMessage && (
                        <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-200">
                            {errorMessage}
                        </p>
                    )}

                    <SubmitButton isLoading={loading}>Register</SubmitButton>
                </form>

                <RegisterFooter />
            </div>
        </div>
    );
}