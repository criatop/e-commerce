import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiGet, ApiError } from "./client";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("api client", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
  });

  it("agrega el Bearer y desenvuelve datos", async () => {
    localStorage.setItem("chic_token", "abc");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ exitoso: true, datos: { id: 1 } }),
    });
    await expect(apiGet("/api/v1/auth/me")).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/me"),
      expect.anything(),
    );
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer abc");
  });

  it("lanza ApiError con el mensaje del backend", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ exitoso: false, mensaje: "Credenciales invalidas" }),
    });
    await expect(apiGet("/x")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Credenciales invalidas",
    } satisfies Partial<ApiError>);
  });
});
