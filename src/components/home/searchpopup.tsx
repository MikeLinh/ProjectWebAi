/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useRef, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPopup({ isOpen, onClose }: SearchPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
      
      setLoading(true);
      axios.get("http://localhost:8080/api/products")
        .then(res => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi khi tải danh sách sản phẩm:", err);
          setLoading(false);
        });
    } else {
      document.body.style.overflow = "unset";
      setSearchTerm("");
      setSuggestions([]);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  //Đồng bộ dữ liệu từ db
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const keyword = searchTerm.toLowerCase();
    const filtered = products.filter(item => {
      const brandName = item.manufacturer?.manufacturerName || item.brand || "";
      return (
        item.productName?.toLowerCase().includes(keyword) || 
        brandName.toLowerCase().includes(keyword)
      );
    });

    setSuggestions(filtered.slice(0, 6));
  }, [searchTerm, products]);

  const handleSelectProduct = (product: any) => {
    const imageName = product.imageUrl ? product.imageUrl.trim() : "bike1.png";
    const finalImage = new URL(`../../assets/images/${imageName}`, import.meta.url).href;

    // Tính toán lại giá sale và discount thực tế từ DB để truyền sang trang chi tiết
    const discountPercent = product.discountPercent || 0;
    const discountAmount = Math.round(product.price * (discountPercent / 100));
    const salePrice = product.price - discountAmount;

    //Các trường dữ liệu hiển thị
    const formattedProduct = {
      id: product.productId,
      name: product.productName,
      price: salePrice,
      originalPrice: product.price,
      discount: discountPercent,
      rating: 5,
      reviewCount: product.reviewCount || 0,
      category: product.category?.categoryName || "Bicycles",
      brand: product.manufacturer?.manufacturerName || product.brand || "", 
      inStock: product.stockQuantity, 
      image: finalImage,
      description: product.description
    };

    onClose(); 
    navigate("/product/" + product.productId, { state: { product: formattedProduct } });
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-6 relative">
          <div className="flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 flex-1 border-b-2 border-gray-200 focus-within:border-blue-950 py-2 transition-colors">
              <SearchIcon className="text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu xe đạp..."
                className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2"
                >
                  Xóa
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            >
              <CloseIcon style={{ fontSize: 24 }} />
            </button>
          </div>

          {searchTerm.trim() !== "" && (
            <div className="absolute left-6 right-6 top-full bg-white shadow-xl border border-gray-100 rounded-b-xl overflow-hidden z-50 max-h-[350px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">Đang tìm dữ liệu...</div>
              ) : suggestions.length > 0 ? (
                <div>
                  <div className="bg-gray-50 px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Sản phẩm gợi ý ({suggestions.length})
                  </div>
                  <ul>
                    {suggestions.map((item) => {
                      const itemBrand = item.manufacturer?.manufacturerName || item.brand || "Đang cập nhật";
                      const discountPercent = item.discountPercent || 0;
                      const discountAmount = Math.round(item.price * (discountPercent / 100));
                      const finalPrice = item.price - discountAmount;

                      return (
                        <li 
                          key={item.productId}
                          onClick={() => handleSelectProduct(item)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 transition-colors last:border-none"
                        >
                          <div className="flex items-center gap-3">
                            <SearchIcon className="text-gray-300 !text-base" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800 hover:text-blue-600">
                                {item.productName}
                              </p>
                              <span className="text-xs text-gray-400">Thương hiệu: {itemBrand}</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-red-500">
                            ${finalPrice.toLocaleString()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  Không tìm thấy xe đạp nào khớp với từ khóa "<span className="font-semibold">{searchTerm}</span>".
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}