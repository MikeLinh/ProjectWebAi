import React from "react";
import Star from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface ProductProps {
    name: string;
    category: string;
    description: string;
    price: string;
    rating: number;
    image: string;
}

export default function ProductCard({ 
    name, 
    category, 
    description, 
    price, 
    rating, 
    image 
}: ProductProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
        <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 flex flex-col h-full transition-all duration-300 hover:scale-110">
            
            <div className="flex items-center justify-center mb-5">
                <img 
                    src={image} 
                    alt={name} 
                    className="rounded-2xl w-full h-48"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 px-1">
                {/* Category */}
                <span className="text-[#1976d2] font-bold text-xs uppercase">
                    {category}
                </span>

                {/* Product Name */}
                <h3 className="text-gray-900 font-bold text-[17px] mt-1 mb-2">
                    {name}
                </h3>

                {/* Rating Stars */}
                <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star 
                            key={i} 
                            style={{ fontSize: 18 }}
                            className={
                                i < fullStars ? 'text-amber-400' : hasHalfStar && i === fullStars ? 'text-amber-400' : 'text-gray-200'
                            } 
                        />
                    ))}
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm mb-auto">
                    {description}
                </p>

                {/* Price, Button */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <span className="text-gray-900 font-bold text-2xl">
                        {price}
                    </span>
                    
                    <button className="bg-[#1976d2] hover:bg-[#1565c0] text-white text-sm font-bold px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 ">
                        <ShoppingCartIcon className="text-2xl"/>
                        <span>THÊM</span>
                    </button>
                </div>
            </div>
        </div>
    );
}