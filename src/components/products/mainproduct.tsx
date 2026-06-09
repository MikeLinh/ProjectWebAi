import React from "react";
import backgroundp from "../../assets/images/backgroundproduct.png";

export default function MainProduct() {
  return (
    <div className="w-full mx-auto">
        <div className="w-full h-[180px] md:h-[200px] bg-cover bg-center relative flex flex-col items-center justify-center text-white"
            style={{ backgroundImage: `url(${backgroundp})` }}>
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 text-center space-y-1">
                    <p className="text-white text-2xl tracking-wide font-normal">HOME / PRODUCTS</p>
                    <h1 className="text-3xl text-white tracking-wide font-bold">PRODUCTS</h1>
                </div>
        </div>
     
    </div>
);
}