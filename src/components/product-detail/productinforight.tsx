import React, { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SecurityIcon from "@mui/icons-material/Security";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import { useCart } from "../../components/context/carcontext"

interface ProductInfoRightProps {
  id: number;
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviewCount: number;
  inStock?: number;
  description?: string;
}

export default function ProductInfoRight({ id, image, name, price, originalPrice, category, rating, reviewCount, inStock = 15, description }: ProductInfoRightProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>("M");

  const { addToCart } = useCart();
  const hasDiscount = originalPrice && originalPrice > price;

  const handleAddToCart = () => {
    if (inStock <= 0) {
      alert(`Xin lỗi, sản phẩm "${name}" hiện tại đã hết hàng!`);
      return;
    }
    if (quantity > inStock) {
      alert(`Số lượng yêu cầu (${quantity}) vượt quá số lượng còn lại trong kho (${inStock} sản phẩm). Vui lòng điều chỉnh lại!`);
      return;
    }

    addToCart({
      id,
      name,
      price,
      image,
      size: selectedSize
    }, quantity);
    alert(`Đã thêm thành công ${quantity} sản phẩm "${name}" vào giỏ hàng!`);
  }

  return (
    <div className="space-y-5 text-gray-800">
      <span className="text-xs text-blue-500 font-bold tracking-wider uppercase">{category}</span>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{name}</h1>

      {/* Đánh giá sao */}
      <div className="flex items-center space-x-2">
        <div className="flex text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            i < rating ? <StarIcon key={i} style={{ fontSize: 20 }} /> : <StarBorderIcon key={i} style={{ fontSize: 20 }} />
          ))}
        </div>
        <span className="text-gray-500 text-xs">({reviewCount} đánh giá)</span>
      </div>

      {/* Giá tiền */}
      <div className="flex items-baseline space-x-3 pt-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-red-500">${price.toLocaleString()}</span>
        {hasDiscount && (
          <span className="text-gray-500 line-through text-base sm:text-lg">${originalPrice?.toLocaleString()}</span>
        )}
      </div>

      {/* Mô tả */}
      <div className="text-gray-600 text-sm border-t border-gray-200 pt-4">{description}</div>

      {/* Chọn size */}
      <div className="space-y-2 pt-2">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Size</span>
        <div className="flex space-x-3">
          {["S", "M", "L"].map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${selectedSize === size
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : "border-gray-300 text-gray-500 hover:border-gray-400"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Tình trạng kho */}
      <div className={`text-xs font-bold pt-2 ${inStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
        {inStock > 0 ? `✓ Còn lại ${inStock} sản phẩm trong kho` : `✕ Hết hàng`}
      </div>

      {/* Tăng giảm số lượng, thêm vào giỏ hàng */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <div className="flex items-center border border-gray-700 rounded-xl overflow-hidden w-fit shrink-0">
          {/* Nút giảm: Tối thiểu là 1 */}
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
            disabled={inStock <= 0}
          >
            -
          </button>
          
          <span className="px-3 py-2 font-bold text-sm min-w-[30px] text-center">
            {inStock > 0 ? quantity : 0}
          </span>
          
          {/* Nút tăng: Chặn không cho tăng quá số lượng tồn kho (inStock) */}
          <button
            onClick={() => setQuantity(Math.min(inStock, quantity + 1))}
            className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold transition-colors disabled:opacity-40"
            disabled={quantity >= inStock || inStock <= 0}
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={inStock <= 0}
          className={`flex-1 font-bold py-3 px-6 rounded-xl uppercase tracking-wider text-xs sm:text-sm transition-colors shadow-lg active:scale-[0.99] ${inStock > 0
              ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/10"
              : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            }`}
        >
          {inStock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
        </button>
      </div>

      {/* Khối tiện ích cam kết */}
      <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-200 text-center text-[11px] text-gray-500">
        <div className="space-y-1"><SecurityIcon className="text-blue-500" style={{ fontSize: 20 }} /><p>100% Chính hãng</p></div>
        <div className="space-y-1"><LocalAtmIcon className="text-blue-500" style={{ fontSize: 20 }} /><p>Giá rẻ nhất</p></div>
        <div className="space-y-1"><LocalShippingIcon className="text-blue-500" style={{ fontSize: 20 }} /><p>Miễn phí giao hàng</p></div>
      </div>
    </div>
  );
}