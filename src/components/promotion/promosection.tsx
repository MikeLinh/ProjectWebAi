/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";

interface Promotion {
  promoId: number;
  couponCode: string;
  discountValue: number;
  discountType: "PERCENT" | "FIXED";
  minSpend: number;
  startDate: string | null;
  endDate: string | null;
}

interface PromoSectionProps {
  cartTotal: number;
  onApplyDiscount: (discountAmount: number, code: string) => void;
}

export default function PromoSection({ cartTotal, onApplyDiscount }: PromoSectionProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; isError: boolean }>({ text: "", isError: false });

  useEffect(() => {
    fetch("http://localhost:8080/api/promotions") 
      .then((res) => res.json())
      .then((data: Promotion[]) => setPromotions(data))
      .catch((err) => console.error("Lỗi khi tải mã giảm giá:", err));
  }, []);

  const calculateDiscount = (promo: Promotion, total: number): number => {
    if (promo.discountType === "PERCENT") {
      return total * promo.discountValue;
    }
    return promo.discountValue; 
  };

  const getPromoText = (promo: Promotion) => {
    const safeDiscount = Number(promo.discountValue) || 0;
    const safeMinSpend = Number(promo.minSpend) || 0;

    const detail = promo.discountType === "PERCENT" 
      ? `Giảm ${safeDiscount * 100}%` 
      : `Giảm $${safeDiscount.toLocaleString()}`;
      
    return `Mã ${promo.couponCode || "CODE"} - ${detail} (Đơn từ $${safeMinSpend.toLocaleString()})`;
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCode(code);

    if (!code) {
      onApplyDiscount(0, "");
      setMessage({ text: "", isError: false });
      return;
    }

    const promo = promotions.find((p) => p.couponCode === code);

    if (promo) {
      const minSpend = Number(promo.minSpend) || 0; // Thêm dòng này

      if (cartTotal >= minSpend) {
        const discountAmount = calculateDiscount(promo, cartTotal);
        onApplyDiscount(discountAmount, promo.couponCode);
        setMessage({ 
          text: `Áp dụng thành công! Đã giảm $${(Number(discountAmount) || 0).toLocaleString()}`, 
          isError: false 
        });
      } else {
        onApplyDiscount(0, "");
        setMessage({ 
          text: `Giỏ hàng chưa đủ $${minSpend.toLocaleString()} để áp dụng mã này.`, 
          isError: true 
        });
      }
    }
  };

  useEffect(() => {
    if (selectedCode) {
      const promo = promotions.find((p) => p.couponCode === selectedCode);
      if (promo) {
        const minSpend = Number(promo.minSpend) || 0; // Thêm dòng này

        if (cartTotal < minSpend) {
          onApplyDiscount(0, "");
          setMessage({ 
            text: `Mã đã bị hủy vì giỏ hàng giảm xuống dưới $${minSpend.toLocaleString()}`, 
            isError: true 
          });
        } else {
          const discountAmount = calculateDiscount(promo, cartTotal);
          onApplyDiscount(discountAmount, promo.couponCode);
          setMessage({ 
            text: `Áp dụng thành công! Đã giảm $${(Number(discountAmount) || 0).toLocaleString()}`, 
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
            const isEligible = cartTotal >= promo.minSpend;
            return (
              <option 
                key={promo.promoId} 
                value={promo.couponCode}
                className={isEligible ? "text-green-600 font-medium" : "text-gray-400"}
              >
                {getPromoText(promo)} {!isEligible ? " (Chưa đủ điều kiện)" : ""}
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