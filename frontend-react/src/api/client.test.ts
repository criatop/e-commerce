import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { apiGet, ApiError, httpClient } from "./client";

const adapterOriginal = httpClient.defaults.adapter;

/** Respuesta falsa con la forma que axios espera de un adapter. */
function respuesta<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {},
    config,
  };
}

describe("api client (axios)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpClient.defaults.adapter = adapterOriginal;
  });

  it("agrega el Bearer y desenvuelve datos", async () => {
    localStorage.setItem("chic_token", "abc");
    let configVisto: InternalAxiosRequestConfig | undefined;

    const adapter: AxiosAdapter = async (config) => {
      configVisto = config;
      return respuesta(config, { exitoso: true, datos: { id: 1 } });
    };
    httpClient.defaults.adapter = adapter;

    await expect(apiGet("/api/v1/auth/me")).resolves.toEqual({ id: 1 });
    expect(configVisto?.url).toContain("/api/v1/auth/me");
    expect(configVisto?.headers.get("Authorization")).toBe("Bearer abc");
  });

  it("lanza ApiError con el mensaje del backend y limpia la sesion en 401", async () => {
    localStorage.setItem("chic_token", "abc");

    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError(
        "Request failed with status code 401",
        "ERR_BAD_REQUEST",
        config,
        undefined,
        respuesta(config, { exitoso: false, mensaje: "Credenciales invalidas" }, 401),
      );
    };
    httpClient.defaults.adapter = adapter;

    await expect(apiGet("/x")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Credenciales invalidas",
    } satisfies Partial<ApiError>);
    expect(localStorage.getItem("chic_token")).toBeNull();
  });

  it("convierte un exitoso:false con HTTP 200 en error de negocio", async () => {
    const adapter: AxiosAdapter = async (config) =>
      respuesta(config, { exitoso: false, mensaje: "Sin stock" }, 200);
    httpClient.defaults.adapter = adapter;

    await expect(apiGet("/x")).rejects.toMatchObject({
      name: "ApiError",
      status: 200,
      message: "Sin stock",
    } satisfies Partial<ApiError>);
  });
});
