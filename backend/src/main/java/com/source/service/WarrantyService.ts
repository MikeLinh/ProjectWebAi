const API_BASE = "http://localhost:8080/api";

export type WarrantyStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface OrderDetailInfo {
  orderDetailId: number;
  orderId?: number | null;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Warranty {
  warrantyId: number;
  orderDetail: OrderDetailInfo;
  warrantyCode: string;
  serialNumber: string | null;
  warrantyMonth: number;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
  note: string | null;
  createdAt: string;
}

// Trạng thái của một lần sửa chữa/bảo hành cụ thể (khác với status của Warranty)
export type RepairStatus = "RECEIVED" | "REPAIRING" | "COMPLETED" | "RETURNED";

export interface WarrantyHistory {
  historyId: number;
  warranty: { warrantyId: number };
  receivedDate: string | null;
  returnedDate: string | null;
  problem: string | null;
  solution: string | null;
  technician: string | null;
  repairCost: number | null;
  status: RepairStatus | string;
  createdAt: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Lỗi ${res.status}`);
  }
  // DELETE trả về 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const warrantyService = {
  getAll: () =>
    fetch(`${API_BASE}/warranties`).then((res) => handle<Warranty[]>(res)),

  getById: (id: number) =>
    fetch(`${API_BASE}/warranties/${id}`).then((res) => handle<Warranty>(res)),

  // Dùng cho trang User: lấy toàn bộ thẻ bảo hành thuộc các đơn hàng của khách
  getByUser: (userId: number) =>
    fetch(`${API_BASE}/warranties/user/${userId}`).then((res) =>
      handle<Warranty[]>(res)
    ),

  getByCode: (warrantyCode: string) =>
    fetch(`${API_BASE}/warranties/code/${encodeURIComponent(warrantyCode)}`).then(
      (res) => handle<Warranty>(res)
    ),

  update: (id: number, data: Partial<Warranty>) =>
    fetch(`${API_BASE}/warranties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => handle<Warranty>(res)),

  remove: (id: number) =>
    fetch(`${API_BASE}/warranties/${id}`, { method: "DELETE" }).then((res) =>
      handle<void>(res)
    ),
};

export const warrantyHistoryService = {
  getByWarrantyId: (warrantyId: number) =>
    fetch(`${API_BASE}/warranty-histories/warranty/${warrantyId}`).then(
      (res) => handle<WarrantyHistory[]>(res)
    ),

  create: (data: {
    warranty: { warrantyId: number };
    status: RepairStatus | string;
    problem?: string;
    solution?: string;
    technician?: string;
    repairCost?: number | null;
    returnedDate?: string | null;
  }) =>
    fetch(`${API_BASE}/warranty-histories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => handle<WarrantyHistory>(res)),
};