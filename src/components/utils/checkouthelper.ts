import type { PaymentMethodType } from "../checkout/paymethods";

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
}

export const EMPTY_FORM: CheckoutFormData = {
  name: "", phone: "", email: "", address: "", note: "",
};

function readRawUser(): string | null {
  return (
    localStorage.getItem("current_user") ||
    localStorage.getItem("currentUser") ||
    localStorage.getItem("user")
  );
}

function mapUserToFormData(user: Record<string, string>): CheckoutFormData {
  return {
    name: user.fullName || "",
    phone: user.phoneNumber || "",
    email: user.email || "",
    address: user.address || "",
    note: "",
  };
}

export async function fetchAutofillData(): Promise<CheckoutFormData | null> {
  const rawUser = readRawUser();

  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      if (user.fullName || user.email || user.phoneNumber) {
        return mapUserToFormData(user);
      }

      if (user.userId) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.userId}`);
        if (res.ok) return mapUserToFormData(await res.json());
      }
    } catch (e) {
      console.error("Lỗi parse/fetch user:", e);
    }
  }

  return null;
}

export function getCurrentUserId(): number | null {
  const rawUser = readRawUser();
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser).userId ?? null;
  } catch {
    return null;
  }
}

interface BuildPayloadParams {
  cart: CartItem[];
  formData: CheckoutFormData;
  paymentMethod: PaymentMethodType;
  discount: number;
  promoId: number | null;
  finalTotal: number;
}

export function buildOrderPayload({
  cart, formData, paymentMethod, discount, promoId, finalTotal,
}: BuildPayloadParams) {
  return {
    userId: getCurrentUserId(),
    promoId,
    receiverName: formData.name,
    receiverPhone: formData.phone,
    shippingAddress: formData.address,
    note: formData.note,
    paymentMethod,
    discount,
    totalAmount: finalTotal,
    items: cart.map((item) => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
    })),
  };
}

export async function submitOrder(
  payload: ReturnType<typeof buildOrderPayload>
): Promise<{ orderId: number; payUrl?: string }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Không thể tạo đơn hàng";
    try {
      const errData = await res.json();
      message = errData.message || message;
    } catch {
      // body không phải JSON hợp lệ, giữ message mặc định
    }
    throw new Error(message);
  }

  const result = await res.json();
  const orderId = result.orderId ?? result.order_id;

    if (payload.paymentMethod === "VNPAY") {  
    const vnpayRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vnpay/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        amount: payload.totalAmount,
        orderInfo: `Thanh toan don hang ${orderId}`,
      }),
    });

    if (!vnpayRes.ok) throw new Error("Không thể tạo link VNPay");

    const vnpayData = await vnpayRes.json();
    return { orderId, payUrl: vnpayData.payUrl };
  }

  return { orderId };
}