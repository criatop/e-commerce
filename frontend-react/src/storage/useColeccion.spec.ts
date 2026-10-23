import { act, renderHook } from "@testing-library/react";
import { useColeccion } from "./useColeccion";

interface Item {
  id: number;
}

describe("useColeccion", () => {
  beforeEach(() => localStorage.clear());

  it("carga el arreglo guardado en localStorage", () => {
    localStorage.setItem("clave", JSON.stringify([{ id: 1 }, { id: 2 }]));
    const { result } = renderHook(() => useColeccion<Item>("clave"));
    expect(result.current.datos).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("devuelve [] cuando no hay nada guardado", () => {
    const { result } = renderHook(() => useColeccion<Item>("clave"));
    expect(result.current.datos).toEqual([]);
  });

  it("devuelve [] cuando el JSON está corrupto", () => {
    localStorage.setItem("clave", "{no-es-json");
    const { result } = renderHook(() => useColeccion<Item>("clave"));
    expect(result.current.datos).toEqual([]);
  });

  it("guardar persiste en localStorage y actualiza el estado", () => {
    const { result } = renderHook(() => useColeccion<Item>("clave"));
    act(() => result.current.guardar([{ id: 7 }]));
    expect(localStorage.getItem("clave")).toBe(JSON.stringify([{ id: 7 }]));
    expect(result.current.datos).toEqual([{ id: 7 }]);
  });
});
