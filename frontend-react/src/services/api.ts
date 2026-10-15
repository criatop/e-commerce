import axios from "axios";
import type { Producto } from "../types";

export const API_BASE_URL = "https://api.pinkpink.cl";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

export type ProductoApi = Pick<
  Producto,
  "codigo" | "nombre" | "precio" | "stock" | "categoriaId"
>;

export async function obtenerProductos(): Promise<ProductoApi[]> {
  const { data } = await api.get<ProductoApi[]>("/productos");
  return data;
}

export async function obtenerProducto(codigo: string): Promise<ProductoApi> {
  const { data } = await api.get<ProductoApi>(
    `/productos/${encodeURIComponent(codigo)}`,
  );
  return data;
}

export async function crearProducto(
  payload: Omit<ProductoApi, "codigo">,
): Promise<ProductoApi> {
  const { data } = await api.post<ProductoApi>("/productos", payload);
  return data;
}

export function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) return `Error ${error.response.status} del servidor`;
    if (error.request) return "No se pudo conectar con el servidor";
  }
  return "Error inesperado";
}

export default api;
