import React from "react";

interface ProductInfoLeftProps{
    image: string;
    name: string;
    discount?: number;
}

export default function ProductInfoLeft({image,name,discount}: ProductInfoLeftProps){
    return(
        <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl p-6 items-center justify-center h-[350px] overflow-hidden relative">
                {discount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">-{discount}%</div>
                )}
                <img src={image} alt={name} className="max-h-full max-w-full object-contain  rounded-2xl"/>
           </div>
        </div>
    );

}