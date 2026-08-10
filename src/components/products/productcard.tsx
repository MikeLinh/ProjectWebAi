import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useCart } from "../context/carcontext"; 
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNotification } from "../context/notificationcontext";
import { formatVND } from "../utils/formatCurrency";

interface Product {
  id: number;
  name: string;
  manufacturer?: string,
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  discount?: number; 
  category?: string;   
  inStock?: number;     
  description?: string;  
  isNew? :boolean;
  new?: boolean;
}

interface CardProps {
  product: Product;
}

export default function Card({ product }: CardProps) {
  const {showNotification} = useNotification()
  const [, setIsHovered] = useState(false);
  const navigate = useNavigate(); 
  const { addToCart } = useCart();

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = product.discount || 0;

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
    showNotification(`Đã thêm ${product.name} vào giỏ hàng thành công!`);
  };

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {(product.isNew || product.new) && (
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
          Mới
        </div>
      )}
      {/* Badge % Giảm Giá */}
      {discountPercent > 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
          -{discountPercent}%
        </div>
      )}

      {/* Khung ảnh */}
      <div className="w-full h-52 bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {product.inStock === 0 && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="bg-gray-800/90 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md uppercase tracking-wider">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Thông tin nội dung */}
      <div className="p-4">
        {/* Category + Brand badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider truncate">
            {product.category || "Bicycles"}
          </span>
          {product.manufacturer && (
            <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0">
              {product.manufacturer}
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
              {formatVND(product.price)}
            </span>
            
            {hasDiscount && product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>
          
         <button
          onClick={handleAddToCart}
          disabled={product.inStock === 0} // Vô hiệu hóa hành động click khi hết hàng
          className={`text-sm text-white p-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center focus:outline-none shrink-0 ${
            product.inStock === 0 
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' // Giao diện khi hết hàng
              : 'bg-blue-950 hover:bg-blue-900' // Giao diện bình thường
          }`}
        >
          <ShoppingCartIcon style={{ fontSize: 18 }} />
        </button>
        </div>
      </div>
    </div>
  );
}