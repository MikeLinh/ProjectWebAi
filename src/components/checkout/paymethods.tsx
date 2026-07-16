import React from "react";

export type PaymentMethodType = "COD" | "VNPAY"
interface PaymentMethodsProps{
    selectedMethod: PaymentMethodType;
    onMethodChange: (method: PaymentMethodType) => void;
}
export default function PayMethods({selectedMethod, onMethodChange}: PaymentMethodsProps){
    return(
        <div className="bg-gray-100 p-6 rounded-2xl border border-gray-800 space-y-4 mt-6">
            <h2 className="text-lg font-bold border-b border-gray-800 pb-3 text-black">Phương thức thanh toán</h2>
            <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selectedMethod === "COD" ? "border-green-600 bg-green-50/20" : "border-gray-300"}`}>
                    <input type="radio" name="paymentMethod" checked={selectedMethod === "COD"} onChange={() => onMethodChange("COD")} className="w-4 h-4 accent-green-600" />
                    <div>
                        <p className="text-sm font-bold text-black">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-xs text-gray-600">Trả tiền mặt trực tiếp cho nhân viên giao hàng khi nhận xe.</p>
                    </div>
                </label>
       
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selectedMethod === "VNPAY" ? "border-green-600 bg-green-50/20" : "border-gray-300"}`}>
                <input type="radio" name="paymentMethod" checked={selectedMethod === "VNPAY"} onChange={() => onMethodChange("VNPAY")} className="w-4 h-4 accent-green-600" />
                <div>
                    <p className="text-sm font-bold text-black">Thanh toán qua ví điện tử VNPAY</p>
                    <p className="text-xs text-gray-600">Chuyển hướng sang giao diện thanh toán an toàn của ví VNPAY.</p>
                </div>
                </label>

            </div>
        </div>
    )
}