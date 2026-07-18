import React from "react";

// Cấu trúc Props truyền từ Component cha vào nút bấm này
interface ConfirmButtonProps {
  submitting?: boolean;
}

export default function ConfirmButton({ submitting }: ConfirmButtonProps) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors mt-4"
    >
      {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
    </button>
  );
}