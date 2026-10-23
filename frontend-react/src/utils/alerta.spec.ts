import Swal from "sweetalert2";
import { alertas } from "./alerta";

describe("alertas", () => {
  let fireSpy: jasmine.Spy;

  beforeEach(() => {
    fireSpy = spyOn(Swal, "fire").and.returnValue(
      Promise.resolve({ isConfirmed: true }) as never,
    );
  });

  it("exito dispara Swal con icono success", () => {
    void alertas.exito("Listo", "texto");
    expect(fireSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: "success", title: "Listo", text: "texto" }),
    );
  });

  it("error dispara Swal con icono error", () => {
    void alertas.error("Ups", "falló");
    expect(fireSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: "error", title: "Ups" }),
    );
  });

  it("aviso dispara Swal con icono warning", () => {
    void alertas.aviso("Ojo", "cuidado");
    expect(fireSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: "warning", title: "Ojo" }),
    );
  });

  it("confirmar devuelve true cuando el usuario confirma", async () => {
    const r = await alertas.confirmar("¿Seguro?", "detalle");
    expect(r).toBeTrue();
  });

  it("confirmar devuelve false cuando el usuario cancela", async () => {
    fireSpy.and.returnValue(Promise.resolve({ isConfirmed: false }) as never);
    const r = await alertas.confirmar("¿Seguro?", "detalle");
    expect(r).toBeFalse();
  });
});
