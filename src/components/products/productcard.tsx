import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useCart } from "../context/carcontext"; 
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface Product {
  id: number;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  discount?: number; 
  category?: string;   
  inStock?: number;     
  description?: string;  
}

interface CardProps {
  product: Product;
}

export default function Card({ product }: CardProps) {
  const [, setIsHovered] = useState(false);
  const navigate = useNavigate(); 
  const { addToCart } = useCart();

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`, { state: { product } }); 
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: "M"
    }, 1); 
    alert(`Đã thêm ${product.name} vào giỏ hàng thành công!`);
  };

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Khung ảnh */}
      <div className="w-full h-52 bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Thông tin nội dung */}
      <div className="p-4">
        {/* Category + Brand badge cùng hàng */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider truncate">
            {product.category || "Bicycles"}
          </span>
          {product.brand && (
            <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0">
              {product.brand}
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-sm mt-1 line-clamp-2 min-h-[42px] text-gray-800 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span 
              key={i}
              className={`text-base ${i < product.rating ? 'text-amber-400' : 'text-gray-200'}`}
            >
              ★
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
        </div>
         
        <div className="mt-3 flex items-center justify-between"> 
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-red-600">
              ${product.price.toLocaleString()}
            </span>
            
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                ${product.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="bg-blue-950 text-sm text-white hover:bg-blue-900 p-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center focus:outline-none shrink-0"
          >
            <ShoppingCartIcon style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </div>
  );
}