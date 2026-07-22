import React, { useState } from "react";
import FormInput from "../common/frominput";
import SubmitButton from "../common/submitbutton";

export default function ForgotForm() {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    //Hàm xử lý gửi form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        try {
            // Thực hiện gọi API bất đồng bộ bằng fetch tới server local chạy ở cổng 8080
            const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Email không tồn tại!");
            }

            setIsSuccess(true);
        } catch (error: any) {
            setErrorMessage(error.message || "Gửi mật khẩu mới thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-5xl">📧</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Đã gửi mật khẩu mới!</h3>
                <p className="text-gray-600 leading-relaxed">
                    Chúng tôi đã gửi mật khẩu mới đến<br />
                    <strong className="text-blue-600 break-all">{email}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-8">
                    Vui lòng kiểm tra hộp thư đến.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
                label="Email Address"
                type="email"
                name="email"
                placeholder="Nhập email đã đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Cập nhật state khi người dùng gõ
                required
            />

            {errorMessage && (
                <p className="text-red-500 text-sm bg-red-50 p-4 rounded-2xl border border-red-200 text-center">
                    {errorMessage}
                </p>
            )}

            <SubmitButton isLoading={loading}>
                Gửi mật khẩu mới
            </SubmitButton>

            <p className="text-center text-xs text-gray-500 pt-2">
                Mật khẩu mới sẽ được gửi ngay đến email của bạn
            </p>
        </form>
    );
}