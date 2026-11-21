import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { CategoriaApi, ProductoApi } from "./types";

export interface ProductQuery { category?: string | number; search?: string; lowStock?: boolean; page?: number; size?: number; }
export interface CategoryPayload { name: string; description?: string; activa?: boolean; }
/** ProductRequest de ms-product. */
export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  category: string | number;
  sku?: string;
  imageUrl?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export const catalogApi = {
  listProducts: (q: ProductQuery = {}) => {
    const p = new URLSearchParams();
    if (q.category !== undefined && q.category !== "") p.set("category", String(q.category));
    if (q.search) p.set("search", q.search);
    if (q.lowStock !== undefined) p.set("lowStock", String(q.lowStock));
    if (q.page !== undefined) p.set("page", String(q.page));
    if (q.size !== undefined) p.set("size", String(q.size));
    const qs = p.toString();
    return apiGet<ProductoApi[]>(`/api/v1/products${qs ? `?${qs}` : ""}`);
  },
  listCategories: () => apiGet<CategoriaApi[]>("/api/v1/categories"),
  getProduct: (id: string) => apiGet<ProductoApi>(`/api/v1/products/${id}`),
  createProduct: (body: ProductPayload) => apiPost<ProductoApi>("/api/v1/products", body),
  updateProduct: (id: string, body: ProductPayload) => apiPut<ProductoApi>(`/api/v1/products/${id}`, body),
  deleteProduct: (id: string) => apiDelete<void>(`/api/v1/products/${id}`),
  createCategory: (body: CategoryPayload) => apiPost<CategoriaApi>("/api/v1/categories", body),
  updateCategory: (id: string | number, body: CategoryPayload) => apiPut<CategoriaApi>(`/api/v1/categories/${id}`, body),
  deleteCategory: (id: string | number) => apiDelete<void>(`/api/v1/categories/${id}`),
};
