import { useColeccion } from "../storage/useColeccion";

describe("Pruebas Unitarias: Hook de Persistencia Local (useColeccion.ts)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // PRUEBA 1
  it("Debería retornar un arreglo vacío si no existen datos en localStorage", () => {
    spyOn(localStorage, "getItem").and.returnValue(null);

    const { datos } = useColeccion("chic_test");

    expect(datos).toEqual([]);
  });

  // PRUEBA 2
  it("Debería guardar los nuevos datos en localStorage convertidos a JSON", () => {
    spyOn(localStorage, "setItem");

    const { guardar } = useColeccion<{ id: number; nombre: string }>("chic_test");
    const nuevosDatos = [{ id: 1, nombre: "Item Test" }];

    guardar(nuevosDatos);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "chic_test",
      JSON.stringify(nuevosDatos)
    );
  });
});