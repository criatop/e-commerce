import { describe, it, expect, beforeEach, vi } from "vitest";
import Swal from "sweetalert2";
import { alertas } from "./alerta";

describe("alertas", () => {
  let fireSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fireSpy = vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true } as never);
  });

  it("exito dispara Swal con icono success", () => {
    void alertas.exito("Listo", "texto");
    expect(fireSpy).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", title: "Listo", text: "texto" }),
    );
  });

  it("error dispara Swal con icono error", () => {
    void alertas.error("Ups", "falló");
    expect(fireSpy).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", title: "Ups" }),
    );
  });

  it("aviso dispara Swal con icono warning", () => {
    void alertas.aviso("Ojo", "cuidado");
    expect(fireSpy).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "warning", title: "Ojo" }),
    );
  });

  it("confirmar devuelve true cuando el usuario confirma", async () => {
    const r = await alertas.confirmar("¿Seguro?", "detalle");
    expect(r).toBe(true);
  });

  it("confirmar devuelve false cuando el usuario cancela", async () => {
    fireSpy.mockResolvedValue(Promise.resolve({ isConfirmed: false }) as never);
    const r = await alertas.confirmar("¿Seguro?", "detalle");
    expect(r).toBe(false);
  });
});