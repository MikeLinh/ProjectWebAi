import React from "react";
import bike1 from "../../assets/images/bike1.png";


export default function MainHome() {
    return (
        
        <div className="max-w-6xl mx-auto my-10 flex items-center justify-between gap-10">
            <div className="flex-1 space-y-6 ">
                <h2 className="text-gray-900 font-bold text-xl">
                    Ride Your <span className="text-blue-500">Dream Bike</span>
                </h2>
                <p className="text-gray-700 font-normal !text[30px]">
                    Khám phá bộ sưu tập xe đạp cao cấp từ Road, Mountain đến Electric, được 
                    thiết kế dành riêng cho những người yêu tốc độ và đam mê chinh phục. Mỗi 
                    chiếc xe đều sở hữu kiểu dáng hiện đại, khung sườn bền bỉ và công nghệ tiên 
                    tiến, mang lại trải nghiệm lái mượt mà, ổn định trên mọi cung đường.
                </p>
                <div className="pt-1">
                    <button className="bg-blue-500 rounded-3xl font-normal text-white px-4 py-2 hover:bg-blue-600 duration-200 
                    hover:text-black">Khám phá ngay</button>
                </div>
            </div>
            <div className="flex-1 space-y-4">
                <img src={bike1} alt="Bike" className="w-full rounded-2xl"/>
            </div>
        </div>
    );
}