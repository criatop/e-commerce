// @ts-nocheck
import * as useColeccionModule from "../storage/useColeccion";
import { useTablasMaestras } from "../hooks/useTablasMaestras";

describe("Pruebas Unitarias: Hook de Tablas Maestras (useTablasMaestras.ts)", () => {
  beforeEach(() => {
   
    spyOn(useColeccionModule, "useColeccion").and.callFake((clave) => {
      if (clave.includes("categorias")) {
        return {
          datos: [
            { id: 1, nombre: "Ropa" },
            { id: 2, nombre: "Calzado" },
          ],
        };
      }
      if (clave.includes("comunas")) {
        return {
          datos: [
            { id: 101, regionId: 13, nombre: "Santiago" },
            { id: 102, regionId: 13, nombre: "Maipú" },
            { id: 103, regionId: 5, nombre: "Viña del Mar" },
          ],
        };
      }
      return { datos: [] };
    });
  });

  // PRUEBA 1
  it("Debería obtener el nombre de la categoría por su ID de la lista de referencia", () => {
    const { nombreCategoria } = useTablasMaestras();

    const nombre = nombreCategoria(1);

    expect(nombre).toBe("Ropa");
  });

  // PRUEBA 2
  it("Debería filtrar las comunas correspondientes a una región específica", () => {
    const { comunasDe } = useTablasMaestras();

    const comunasRegion13 = comunasDe(13);

    expect(comunasRegion13.length).toBe(2);
    expect(comunasRegion13[0].nombre).toBe("Santiago");
  });
});