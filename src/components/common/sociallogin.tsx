import React from "react";
import GoogleIcon from '@mui/icons-material/Google';
// Cấu trúc Props truyền từ Component cha
interface SosicalLoginProps{
    text: string; //Để tạo dữ liệu trong nút bấm
}
export default function SocialLogin({text}:SosicalLoginProps){
    return(
        <>
            <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <span className="relative bg-white px-3 text-gray-400 text-[10px] uppercase tracking-wider">Hoặc</span>
            </div>
            <button
            type="button"
            className="w-full border border-gray-200 bg-white py-2.5 rounded-lg font-bold font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-xs mb-4"
            >
                <GoogleIcon className="w-4 h-4"/>
                {text}
            </button>
        </>
    )
}