import React from "react";
import bike1 from "../../assets/images/bike1.png";
import card1 from "../../assets/images/card1.png";
import card2 from "../../assets/images/card2.png";
import card3 from "../../assets/images/card3.png";
import ProductCard from "./card"; 
import bike2 from "../../assets/images/bike2.png";
import bike3 from "../../assets/images/bike3.png";
import bike4 from "../../assets/images/bike4.png";
import bike5 from "../../assets/images/bike5.png";

const shopProducts = [  
    {
        id: 1,
        name: "Specialized Roubaix",
        category: "ROAD",
        description: "Xe đua đường trường khung carbon.",
        price: "$4,500",
        rating: 5,
        image: bike2
    },
    {
        id: 2,
        name: "Canyon Spectral",
        category: "MOUNTAIN",
        description: "Chinh phục mọi địa hình hiểm trở.",
        price: "$3,200",
        rating: 4,
        image: bike3
    },
    {
        id: 3,
        name: "VanMoof S5",
        category: "ELECTRIC",
        description: "Xe đạp điện thông minh tích hợp GPS.",
        price: "$2,500",
        rating: 5,
        image: bike4
    },
    {
        id: 4,
        name: "Specialized Roubaix",
        category: "MOUNTAIN",
        description: "Chinh phục mọi địa hình.",
        price: "$3,200",
        rating: 4,
        image: bike5
    }
];
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
            <div className="space-y-10 pt-10">
                <div className="text-center">
                    <h2 className="font-bold text-5xl text-blue-950">
                        FROM THE SHOP 
                        <div className="w-30 h-1 bg-red-500 mx-auto mt-3 rounded-full"></div>
                    </h2>
                </div>
            </div>
            <div className="max-w-6xl mx-auto my-10 px-4 space-y-20">
                    <div className="space-y-10 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {shopProducts.map((product) => (
                                <ProductCard 
                                    key={product.id}
                                    name={product.name}
                                    category={product.category}
                                    description={product.description}
                                    price={product.price}
                                    rating={product.rating}
                                    image={product.image}
                                />
                            ))}
                        </div>
                </div>

             </div>
        </div>
    );
}