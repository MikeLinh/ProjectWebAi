import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useCart } from "../../components/context/carcontext"; 
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  discount?: number; 
}

interface CardProps {
  product: Product;
}

export default function Card({ product }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate(); 
  const { addToCart }=useCart();

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`,{state:{product}}); 
  };
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    addToCart(product, 1); 
    alert(`Đã thêm ${product.name} vào giỏ hàng thành công!`);
  };

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick} 
    >
      <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
            -{product.discount}%
          </div>
        )}

        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-contain transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
      </div>

      <div className="p-4">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[42px] text-gray-800 group-hover:text-red-600 transition-colors">
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
            <span className="text-lg font-semibold text-red-600">
              ${product.price.toLocaleString()}
            </span>
            
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ${product.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="bg-blue-950 text-sm text-white hover:bg-blue-900 p-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center focus:outline-none shrink-0"
            title="Thêm vào giỏ hàng"
          >Thêm vào giỏ hàng
            <ShoppingCartIcon style={{ fontSize: 18 }} />
          </button>
        </div>
  
      </div>
    </div>
  );
}