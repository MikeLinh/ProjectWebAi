/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { formatVND } from "../utils/formatCurrency";

interface Promotion {
  promoId: number;
  couponCode: string;
  discountValue: number;
  discountType: "PERCENTAGE" | "FIXED";
  minSpend: number;
  startDate: string | null;
  endDate: string | null;
  targetProductId: number | null; 
}

interface PromoSectionProps {
  cart: any[]; // Thêm nhận mảng giỏ hàng để duyệt tìm sản phẩm mục tiêu
  cartTotal: number;
  onApplyDiscount: (discountAmount: number, code: string, promoId: number | null) => void;
}

export default function PromoSection({ cart, cartTotal, onApplyDiscount }: PromoSectionProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; isError: boolean }>({ text: "", isError: false });

  // Tải danh sách mã hiển thị lên select box
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/promotions`) 
      .then((res) => res.json())
      .then((data: Promotion[]) => setPromotions(data))
      .catch((err) => console.error("Lỗi khi tải mã giảm giá:", err));
  }, []);

  //Từng sản phẩm hoặc Tất cả
  const calculateDiscount = (promo: Promotion): number => {
    if (promo.targetProductId) {
      // Tìm sản phẩm mục tiêu được áp dụng mã trong giỏ hàng
      const targetItem = cart.find(item => item.id === promo.targetProductId);
      if (!targetItem) return 0;

      // Tính tổng giá trị của riêng sản phẩm đó 
      const itemTotalSub = targetItem.price * targetItem.quantity;
      if (promo.discountType === "PERCENTAGE") {
        return (itemTotalSub * promo.discountValue) / 100;
      }
      // Nếu là FIXED (ví dụ giảm $50), không để số tiền giảm vượt quá tổng giá trị sản phẩm đó
      return Math.min(promo.discountValue, itemTotalSub);
    }

    // Nếu áp dụng cho tất cả sản phẩm (toàn bộ giỏ hàng)
    if (promo.discountType === "PERCENTAGE") {
      return (cartTotal * promo.discountValue) / 100;
    }
    return Math.min(promo.discountValue, cartTotal); 
  };

  // Kiểm tra thời gian hết hạn ngay trên Client để nhuộm màu text
  const isExpired = (endDateStr: string | null): boolean => {
    if (!endDateStr) return false;
    const endDate = new Date(endDateStr);
    const now = new Date();
    return now > endDate;
  };

  const getPromoText = (promo: Promotion) => {
    const safeDiscount = Number(promo.discountValue) || 0;
    const safeMinSpend = Number(promo.minSpend) || 0;

    const detail = promo.discountType === "PERCENTAGE" 
      ? `Giảm ${safeDiscount}%` 
      : `Giảm ${formatVND(safeDiscount)}`; // Hiển thị số tiền giảm theo định dạng VND
      
    const scope = promo.targetProductId ? `[Sản phẩm #${promo.targetProductId}]` : "[Tất cả đơn]";
    return `Mã ${promo.couponCode || "CODE"} - ${detail} ${scope} (Đơn từ ${formatVND(safeMinSpend)})`;
  };

  // Xử lý khi người dùng chủ động chọn mã giảm giá
  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCode(code);

    if (!code) {
      onApplyDiscount(0, "", null);
      setMessage({ text: "", isError: false });
      return;
    }

    const localPromo = promotions.find((p) => p.couponCode === code);
    if (!localPromo) return;

    //Kiểm tra xem mã đã hết hạn chưa
    if (isExpired(localPromo.endDate)) {
      onApplyDiscount(0, "", null);
      setMessage({ text: "Mã giảm giá này đã hết hạn sử dụng!", isError: true });
      return;
    }

    //Kiểm tra điều kiện giá trị giỏ hàng tối thiểu
    const minSpend = Number(localPromo.minSpend) || 0;
    if (cartTotal < minSpend) {
      onApplyDiscount(0, "", null);
      setMessage({ 
        text: `Giỏ hàng chưa đủ ${formatVND(minSpend)} để áp dụng mã này.`, 
        isError: true 
      });
      return;
    }

    //Kiểm tra điều kiện sản phẩm mục tiêu (Nếu có)
    if (localPromo.targetProductId && !cart.some(item => item.id === localPromo.targetProductId)) {
      onApplyDiscount(0, "", null);
      setMessage({ 
        text: `Mã này chỉ dành riêng cho một sản phẩm cụ thể hiện chưa có trong giỏ hàng!`, 
        isError: true 
      });
      return;
    }

    try {
      // Gọi API validate ở Backend để Double Check thời gian thực tế từ Server
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/promotions/validate?code=${code}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const discountAmount = calculateDiscount(localPromo);
        onApplyDiscount(discountAmount, data.couponCode, data.promoId);
        setMessage({ 
          text: `Áp dụng thành công! Đã giảm ${formatVND(discountAmount)}`, 
          isError: false 
        });
      } else {
        onApplyDiscount(0, "", null);
        setMessage({ text: data.message || "Mã giảm giá không hợp lệ!", isError: true });
      }
    } catch (error) {
      console.error("Lỗi validate promotion:", error);
      const discountAmount = calculateDiscount(localPromo);
      onApplyDiscount(discountAmount, localPromo.couponCode, localPromo.promoId);
      setMessage({ text: "Áp dụng tạm thời (Lỗi kết nối kiểm tra hạn dùng)", isError: false });
    }
  };

  // Theo dõi biến động giỏ hàng (khi tăng/giảm số lượng hoặc xóa món đồ khỏi giỏ hàng)
  useEffect(() => {
    if (selectedCode) {
      const promo = promotions.find((p) => p.couponCode === selectedCode);
      if (promo) {
        if (isExpired(promo.endDate)) {
          onApplyDiscount(0, "", null);
          setMessage({ text: "Mã giảm giá đã hết hạn sử dụng!", isError: true });
          setSelectedCode("");
          return;
        }

        const minSpend = Number(promo.minSpend) || 0;
        if (cartTotal < minSpend) {
          onApplyDiscount(0, "", null);
          setMessage({ 
            text: `Mã đã bị hủy vì giỏ hàng giảm xuống dưới ${formatVND(minSpend)}`, 
            isError: true 
          });
          return;
        }

        //Kiểm tra nếu sản phẩm bị xóa khỏi giỏ hàng lúc đang áp dụng mã
        if (promo.targetProductId && !cart.some(item => item.id === promo.targetProductId)) {
          onApplyDiscount(0, "", null);
          setMessage({ 
            text: `Mã bị hủy do sản phẩm được áp dụng ưu đãi không còn trong giỏ hàng.`, 
            isError: true 
          });
          setSelectedCode("");
          return;
        }

        const discountAmount = calculateDiscount(promo);
        onApplyDiscount(discountAmount, promo.couponCode, promo.promoId);
        setMessage({ 
          text: `Áp dụng thành công! Đã giảm ${formatVND(discountAmount)}`, 
          isError: false 
        });
      }
    }
  }, [cartTotal, cart, selectedCode, promotions]); // Thêm 'cart' vào mảng dependency

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Ưu đãi của bạn</h3>
        <span className="text-[11px] text-gray-400">Tổng đơn: {formatVND(cartTotal)}</span>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="promo-select" className="block text-xs font-medium text-gray-600">
          Chọn mã giảm giá khả dụng:
        </label>
        
        <select
          id="promo-select"
          value={selectedCode}
          onChange={handleSelectChange}
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 cursor-pointer outline-none transition-all"
        >
          <option value="">-- Chọn mã giảm giá phù hợp --</option>
          {promotions.map((promo) => {
            const hasExpired = isExpired(promo.endDate);
            const hasTargetProduct = promo.targetProductId ? cart.some(item => item.id === promo.targetProductId) : true;
            const isEligible = cartTotal >= promo.minSpend && !hasExpired && hasTargetProduct;
            
            const optionClass = hasExpired 
              ? "text-gray-400 line-through" 
              : isEligible 
                ? "text-green-600 font-medium" 
                : "text-orange-500";

            return (
              <option 
                key={promo.promoId} 
                value={promo.couponCode}
                className={optionClass}
                disabled={hasExpired}
              >
                {getPromoText(promo)} 
                {hasExpired 
                  ? " (Hết hạn)" 
                  : !hasTargetProduct 
                    ? " (Thiếu sản phẩm áp dụng)" 
                    : !isEligible 
                      ? " (Chưa đủ điều kiện đơn)" 
                      : " (Sẵn sàng)"}
              </option>
            );
          })}
        </select>
      </div>
      {message.text && (
        <p className={`text-xs font-semibold mt-2 ${message.isError ? "text-red-500" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}