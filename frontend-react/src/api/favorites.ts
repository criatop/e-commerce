import { apiDelete, apiGet, apiPost } from "./client";

export const favoritesApi = {
  list: () => apiGet<string[]>("/api/v1/favorites"),
  toggle: (productId: string) => apiPost<string[]>(`/api/v1/favorites/${productId}`),
  remove: (productId: string) => apiDelete<void>(`/api/v1/favorites/${productId}`),
};
