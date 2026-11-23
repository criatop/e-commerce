import axios from "axios";
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { CHIC_KEYS } from "../storage/claves";
import type { ApiResponse } from "../types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:9000";

export function getToken(): string | null {
  return localStorage.getItem(CHIC_KEYS.token);
}

export function setToken(token: string) {
  localStorage.setItem(CHIC_KEYS.token, token);
}

export function clearToken() {
  localStorage.removeItem(CHIC_KEYS.token);
  localStorage.removeItem(CHIC_KEYS.sesion);
}

/** Una sola instancia de axios para todo el frontend. */
export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

/**
 * Interceptor de petición: adjunta el "pase" (JWT) a cada llamada.
 * Es el equivalente a mostrar la credencial en cada puerta del edificio.
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

type CuerpoError = { mensaje?: string; message?: string };

/**
 * Interceptor de respuesta: abre el "sobre" ApiResponse y se queda con .datos.
 * También convierte cualquier fallo HTTP en nuestro ApiError.
 */
httpClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown> | null;
    if (payload && typeof payload === "object" && "exitoso" in payload) {
      if (!payload.exitoso) {
        throw new ApiError(response.status, payload.mensaje || "Error de negocio");
      }
      response.data = payload.datos;
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) clearToken();
    const status = error.response?.status ?? 0;
    const payload = error.response?.data as CuerpoError | undefined;
    const message =
      payload?.mensaje ||
      payload?.message ||
      error.message ||
      `Error HTTP ${status}`;
    return Promise.reject(new ApiError(status, message));
  },
);

async function request<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await httpClient.request<T>({ url, method, data: body });
  return response.data;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, "GET");
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, "POST", body);
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, "PUT", body);
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, "DELETE");
}
