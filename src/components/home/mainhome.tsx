import React from "react";
import bike1 from "../../assets/images/bike1.png";
import card1 from "../../assets/images/card1.png";
import card2 from "../../assets/images/card2.png";
import card3 from "../../assets/images/card3.png";

export default function MainHome() {
    return (
        <div className="max-w-6xl mx-auto my-10 px-4">
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
                    <div className="pt-1 ">
                        <button className="bg-blue-500 rounded-3xl font-normal text-white px-4 py-2 hover:bg-blue-600  transition-all duration-300 hover:scale-125
                        hover:text-black">Khám phá ngay</button>
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    <img src={bike1} alt="Bike" className="w-full rounded-2xl transition-all hover:scale-105"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-[250px]  rounded-2xl bg-cover bg-center relative group cursor-pointer shadow-md transition-all hover:scale-105" style={{ backgroundImage: `url(${card1})` }}>
                    <div className="absolute inset-0 rounded-2xl bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                            <h3 className="font-bold text-lg md:text-xl">Chất lượng cao</h3>
                            <p className="text-gray-300 text-xs md:text-sm mt-1">
                                Xe được sản xuất từ vật liệu cao cấp như carbon và hợp kim siêu nhẹ...
                            </p>
                        </div>
                </div>
                <div className="h-[250px] rounded-2xl bg-cover bg-center relative group cursor-pointer shadow-md transition-all hover:scale-105" style={{ backgroundImage: `url(${card2})` }}>
                    <div className="absolute inset-0 rounded-2xl bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                            <h3 className="font-bold text-lg md:text-xl">Công nghệ mới</h3>
                            <p className="text-gray-300 text-xs md:text-sm mt-1">
                                Tích hợp GPS cảm biến thông minh và hệ thống điện...
                            </p>
                        </div>
                </div>
                <div className="h-[250px] rounded-2xl bg-cover bg-center relative group cursor-pointer shadow-md transition-all hover:scale-105" style={{ backgroundImage: `url(${card3})` }}>
                    <div className="absolute inset-0 rounded-2xl bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                            <h3 className="font-bold text-lg md:text-xl">Mọi địa hình</h3>
                            <p className="text-gray-300 text-xs md:text-sm mt-1">
                                Thiết kế đa dạng từ xe đạp đường phố đến xe đạp leo núi...
                            </p>
                        </div>
                </div>
            </div>
            

        </div>
    );
}