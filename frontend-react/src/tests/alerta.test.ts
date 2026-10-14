import Swal from "sweetalert2";
import { alertas } from "../utils/alerta";

describe("Pruebas Unitarias: Módulo de Alertas (alerta.ts)", () => {
  const estiloEsperado = { confirmButtonColor: "#f0568f" };

  beforeEach(() => {
    spyOn(Swal, "fire");
  });

  // PRUEBA 1
  it("Debería mostrar la alerta de éxito con la estructura y color corporativo", () => {
    alertas.exito("Operación Exitosa", "El producto fue agregado");

    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: "success",
        title: "Operación Exitosa",
        text: "El producto fue agregado",
        ...estiloEsperado,
      })
    );
  });

  // PRUEBA 2
  it("Debería mostrar la alerta de error en caso de fallo", () => {
    alertas.error("Error", "No se pudo conectar al servidor");

    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar al servidor",
        ...estiloEsperado,
      })
    );
  });
});