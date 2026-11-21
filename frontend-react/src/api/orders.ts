import { apiGet, apiPost, apiPut } from "./client";
import type { OrdenApi, OrdenEstadoApi, OrderStatsApi } from "./types";

export interface CheckoutItem { productId: string; quantity: number; }
export interface CheckoutRequest {
  shippingAddress: string; shippingRegion: string; shippingComuna: string; shippingPhone: string;
  paymentMethod: string; items: CheckoutItem[];
}

export const ordersApi = {
  checkout: (payload: CheckoutRequest) => apiPost<OrdenApi>("/api/v1/orders/checkout", payload),
  myOrders: (uid: string | number) => apiGet<OrdenApi[]>(`/api/v1/orders/user/${uid}`),
  getOrder: (id: string | number) => apiGet<OrdenApi>(`/api/v1/orders/${id}`),
  listOrders: () => apiGet<OrdenApi[]>("/api/v1/orders"),
  stats: () => apiGet<OrderStatsApi>("/api/v1/orders/stats"),
  updateStatus: (id: string, status: OrdenEstadoApi) =>
    apiPut<OrdenApi>(`/api/v1/orders/${id}/status?status=${encodeURIComponent(status)}`),
  cancel: (id: string) => apiPut<OrdenApi>(`/api/v1/orders/${id}/cancel`),
};
