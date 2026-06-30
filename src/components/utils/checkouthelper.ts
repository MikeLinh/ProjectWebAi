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
}

export const EMPTY_FORM: CheckoutFormData = {
  name: "", phone: "", email: "", address: "", note: "",
};


function readRawUser(): string | null {
  return (
    localStorage.getItem("current_user") ||
    localStorage.getItem("currentUser")  ||
    localStorage.getItem("user")
  );
}


function mapUserToFormData(user: Record<string, string>): CheckoutFormData {
  return {
    name:    user.fullName    || "",
    phone:   user.phoneNumber || "",
    email:   user.email       || "",
    address: user.address     || "",
    note:    "",
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
        const res = await fetch(`http://localhost:8080/api/users/${user.userId}`);
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
    receiverName:    formData.name,
    receiverPhone:   formData.phone,
    shippingAddress: formData.address,
    note:            formData.note,
    paymentMethod,
    discount,
    totalAmount: finalTotal,
    items: cart.map((item) => ({
      productId:   item.id,
      productName: item.name,
      quantity:    item.quantity,
      price:       item.price,
    })),
  };
}


export async function submitOrder(
  payload: ReturnType<typeof buildOrderPayload>
): Promise<number> {
  const res = await fetch("http://localhost:8080/api/orders", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Không thể tạo đơn hàng");

  const createdOrder = await res.json();
  return createdOrder.orderId ?? createdOrder.order_id;
}