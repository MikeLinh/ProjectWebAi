import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import hook điều hướng

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
  const navigate = useNavigate(); // Khởi tạo hàm chuyển hướng trang

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  // Hàm xử lý khi người dùng click vào thẻ sản phẩm
  const handleCardClick = () => {
    navigate(`/product/${product.id}`); // Chuyển hướng sang trang chi tiết /product/123
  };

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick} // Kích hoạt sự kiện click chuyển trang
    >
      {/* Hình ảnh sản phẩm */}
      <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        {/* Hiển thị tag discount nếu có phần trăm giảm giá */}
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

      {/* Nội dung */}
      <div className="p-4">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[42px] text-gray-800 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        {/* Đánh giá */}
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

        {/* Giá sản phẩm */}
        <div className="mt-3 flex items-baseline gap-2">
          {/* Luôn hiển thị giá bán hiện tại */}
          <span className="text-lg font-semibold text-red-600">
            ${product.price.toLocaleString()}
          </span>
          
          {/* Chỉ hiển thị giá gốc gạch ngang nếu nó thực sự lớn hơn giá bán */}
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ${product.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}