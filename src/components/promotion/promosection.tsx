/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";

interface Promotion {
  promoId: number;
  couponCode: string;
  discountValue: number;
  discountType: "PERCENTAGE" | "FIXED";
  minSpend: number;
  startDate: string | null;
  endDate: string | null;
}

interface PromoSectionProps {
  cartTotal: number;
  onApplyDiscount: (discountAmount: number, code: string, promoId: number | null) => void;
}

export default function PromoSection({ cartTotal, onApplyDiscount }: PromoSectionProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; isError: boolean }>({ text: "", isError: false });

  // Tải danh sách mã hiển thị lên select box
  useEffect(() => {
    fetch("http://localhost:8080/api/promotions") 
      .then((res) => res.json())
      .then((data: Promotion[]) => setPromotions(data))
      .catch((err) => console.error("Lỗi khi tải mã giảm giá:", err));
  }, []);

  // SỬA LỖI: Đồng bộ tham số truyền vào chuẩn hóa theo Object Promotion
  const calculateDiscount = (promo: Promotion, total: number): number => {
    if (promo.discountType === "PERCENTAGE") {
      return (total * promo.discountValue) / 100;
    }
    return promo.discountValue; 
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
      : `Giảm $${safeDiscount.toLocaleString()}`;
      
    return `Mã ${promo.couponCode || "CODE"} - ${detail} (Đơn từ $${safeMinSpend.toLocaleString()})`;
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

    // Kiểm tra xem mã đã hết hạn chưa
    if (isExpired(localPromo.endDate)) {
      onApplyDiscount(0, "", null);
      setMessage({ text: "Mã giảm giá này đã hết hạn sử dụng!", isError: true });
      return;
    }

    // Kiểm tra điều kiện giá trị giỏ hàng tối thiểu
    const minSpend = Number(localPromo.minSpend) || 0;
    if (cartTotal < minSpend) {
      onApplyDiscount(0, "", null);
      setMessage({ 
        text: `Giỏ hàng chưa đủ $${minSpend.toLocaleString()} để áp dụng mã này.`, 
        isError: true 
      });
      return;
    }

    try {
      // Gọi API validate ở Backend để Double Check thời gian thực tế từ Server
      const response = await fetch(`http://localhost:8080/api/promotions/validate?code=${code}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const discountAmount = calculateDiscount(localPromo, cartTotal);
        onApplyDiscount(discountAmount, data.couponCode, data.promoId);
        setMessage({ 
          text: `Áp dụng thành công! Đã giảm $${discountAmount.toLocaleString()}`, 
          isError: false 
        });
      } else {
        onApplyDiscount(0, "", null);
        setMessage({ text: data.message || "Mã giảm giá không hợp lệ!", isError: true });
      }
    } catch (error) {
      console.error("Lỗi validate promotion:", error);
      // Fallback khi mất mạng
      const discountAmount = calculateDiscount(localPromo, cartTotal);
      onApplyDiscount(discountAmount, localPromo.couponCode, localPromo.promoId);
      setMessage({ text: "Áp dụng tạm thời (Lỗi kết nối kiểm tra hạn dùng)", isError: false });
    }
  };

  // Theo dõi biến động giỏ hàng (khi tăng/giảm số lượng món đồ)
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
            text: `Mã đã bị hủy vì giỏ hàng giảm xuống dưới $${minSpend.toLocaleString()}`, 
            isError: true 
          });
        } else {
          const discountAmount = calculateDiscount(promo, cartTotal);
          onApplyDiscount(discountAmount, promo.couponCode, promo.promoId);
          setMessage({ 
            text: `Áp dụng thành công! Đã giảm $${discountAmount.toLocaleString()}`, 
            isError: false 
          });
        }
      }
    }
  }, [cartTotal, selectedCode, promotions]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Ưu đãi của bạn</h3>
        <span className="text-[11px] text-gray-400">Tổng đơn: ${cartTotal.toLocaleString()}</span>
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
            const isEligible = cartTotal >= promo.minSpend && !hasExpired;
            
            // Hết hạn -> màu xám, Còn hạn sử dụng được -> màu xanh lá
            const optionClass = hasExpired 
              ? "text-gray-400 line-through" 
              : isEligible 
                ? "text-green-600 font-medium" 
                : "text-orange-500"; // Có màu cam cảnh báo nếu chưa đủ min_spend

            return (
              <option 
                key={promo.promoId} 
                value={promo.couponCode}
                className={optionClass}
                disabled={hasExpired} // Khóa không cho chọn nếu mã đã hết hạn hẳn
              >
                {getPromoText(promo)} 
                {hasExpired ? " (Hết hạn)" : !isEligible ? " (Chưa đủ điều kiện đơn hàng)" : " (Sẵn sàng)"}
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