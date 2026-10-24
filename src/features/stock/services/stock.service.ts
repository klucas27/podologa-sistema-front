import { api } from "@/lib/api";

interface ApiResponse<T> {
  data: T;
}

export type StockUnit = "un" | "ml" | "g" | "par";

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  unit: StockUnit;
  minQuantity: number;
  isActive: boolean;
  balance: number;
  nextExpiry: string | null;
}

export interface StockAlertsData {
  expiring: { batchId: string; productId: string; name: string; unit: StockUnit; quantity: number; expiryDate: string }[];
  belowMin: { productId: string; name: string; unit: StockUnit; minQuantity: number; balance: number }[];
  shortages: { id: string; productId: string; name: string; unit: StockUnit; quantity: number; appointmentId: string | null; createdAt: string }[];
}

export interface ProductInput {
  name: string;
  brand?: string | null;
  category?: string | null;
  unit: StockUnit;
  minQuantity: number;
}

export interface EntryInput {
  productId: string;
  quantity: number;
  expiryDate: string | null;
  unitCost: number | null;
  receivedAt: string;
}

export interface ExitInput {
  productId: string;
  quantity: number;
  reason?: string | null;
  appointmentId?: string | null;
}

export const stockService = {
  listProducts: () => api.get<ApiResponse<Product[]>>("/api/stock/products").then((res) => res.data),

  alerts: () => api.get<ApiResponse<StockAlertsData>>("/api/stock/alerts").then((res) => res.data),

  createProduct: (data: ProductInput) => api.post<ApiResponse<Product>>("/api/stock/products", data).then((res) => res.data),

  updateProduct: (id: string, data: Partial<ProductInput>) =>
    api.patch<ApiResponse<Product>>(`/api/stock/products/${id}`, data).then((res) => res.data),

  deleteProduct: (id: string) => api.delete<unknown>(`/api/stock/products/${id}`),

  registerEntry: (data: EntryInput) => api.post<unknown>("/api/stock/entries", data),

  registerExit: (data: ExitInput) => api.post<unknown>("/api/stock/exits", data),

  discardBatch: (batchId: string) => api.post<unknown>(`/api/stock/batches/${batchId}/discard`, {}),
};
