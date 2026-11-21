import { apiGet, apiPost } from "./client";
import type { ContactMessageApi, NoticiaApi, PaginaApi } from "./types";

export const contentApi = {
  listNews: (page = 0, size = 10) => apiGet<PaginaApi<NoticiaApi>>(`/api/v1/news?page=${page}&size=${size}`),
  getNews: (slug: string) => apiGet<NoticiaApi>(`/api/v1/news/${slug}`),
  sendContact: (body: { nombre: string; apellido: string; email: string; mensaje: string }) => apiPost<ContactMessageApi>("/api/v1/contact", body),
};
