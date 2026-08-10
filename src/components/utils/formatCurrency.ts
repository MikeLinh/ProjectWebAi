
export function formatVND(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "0 đ";
  return amount.toLocaleString("vi-VN") + " đ";
}
