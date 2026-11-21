import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { CartApi } from "./types";

export interface CartItemRequest { productId: string; quantity: number; }
export const cartApi = {
  getCart: (uid: string | number) => apiGet<CartApi>(`/api/v1/cart/${uid}`),
  addItem: (uid: string | number, productId: string, quantity: number) => apiPost<CartApi>(`/api/v1/cart/${uid}/items`, { productId, quantity }),
  updateItem: (uid: string | number, productId: string, quantity: number) => apiPut<CartApi>(`/api/v1/cart/${uid}/items/${productId}`, { quantity }),
  removeItem: (uid: string | number, productId: string) => apiDelete<void>(`/api/v1/cart/${uid}/items/${productId}`),
  clear: (uid: string | number) => apiDelete<void>(`/api/v1/cart/${uid}`),
  merge: (uid: string | number, items: CartItemRequest[]) => apiPost<CartApi>(`/api/v1/cart/${uid}/merge`, items),
};
