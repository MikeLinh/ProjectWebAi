import React, { useState, useEffect } from "react";

interface PromoSectionProps {
  cartTotal: number;
  onApplyDiscount: (discountAmount: number, code: string) => void;
}

export default function PromoSection({ cartTotal, onApplyDiscount }: PromoSectionProps) {
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; isError: boolean }>({ text: "", isError: false });

  const promoList = [
    { code: "BIKE1000", discount: 0.20, minSpend: 1000, text: "Mã BIKE1000 - Giảm 20% (Đơn từ $1,000)" },
    { code: "BIKE2000", discount: 0.15, minSpend: 2000, text: "Mã BIKE2000 - Giảm 15% (Đơn từ $2,000)" },
    { code: "BIKE3000", discount: 0.10, minSpend: 3000, text: "Mã BIKE3000 - Giảm 10% (Đơn từ $3,000)" },
  ];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCode(code);

    if (!code) {
      onApplyDiscount(0, "");
      setMessage({ text: "", isError: false });
      return;
    }

    const promo = promoList.find((p) => p.code === code);

    if (promo) {
      if (cartTotal >= promo.minSpend) {
        const discountAmount = cartTotal * promo.discount;
        onApplyDiscount(discountAmount, promo.code);
        setMessage({ 
          text: `Áp dụng thành công! Đã giảm $${discountAmount.toLocaleString()}`, 
          isError: false 
        });
      } else {
        onApplyDiscount(0, "");
        setMessage({ 
          text: `Giỏ hàng chưa đủ $${promo.minSpend.toLocaleString()} để áp dụng mã này.`, 
          isError: true 
        });
      }
    }
  };

  useEffect(() => {
    if (selectedCode) {
      const promo = promoList.find((p) => p.code === selectedCode);
      if (promo && cartTotal < promo.minSpend) {
        onApplyDiscount(0, "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessage({ 
          text: `Mã đã bị hủy vì giỏ hàng giảm xuống dưới $${promo.minSpend.toLocaleString()}`, 
          isError: true 
        });
      } else if (promo) {
        const discountAmount = cartTotal * promo.discount;
        onApplyDiscount(discountAmount, promo.code);
      }
    }
  }, [cartTotal]);

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
          {promoList.map((promo) => {
            const isEligible = cartTotal >= promo.minSpend;
            return (
              <option 
                key={promo.code} 
                value={promo.code}
                className={isEligible ? "text-green-600 font-medium" : "text-gray-400"}
              >
                {promo.text} {!isEligible ? " (Chưa đủ điều kiện)" : ""}
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