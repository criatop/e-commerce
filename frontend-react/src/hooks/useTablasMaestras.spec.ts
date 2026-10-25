import { renderHook } from "@testing-library/react";
import { useTablasMaestras } from "./useTablasMaestras";
import { CHIC_KEYS } from "../storage/claves";
import { beforeEach, describe, expect, it } from "vitest";

describe("useTablasMaestras", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      CHIC_KEYS.categorias,
      JSON.stringify([
        { id: 1, nombre: "Collares", descripcion: "" },
        { id: 2, nombre: "Pulseras", descripcion: "" },
      ]),
    );
    localStorage.setItem(
      CHIC_KEYS.comunas,
      JSON.stringify([
        { id: 1, regionId: 1, nombre: "Santiago" },
        { id: 2, regionId: 1, nombre: "Providencia" },
        { id: 10, regionId: 2, nombre: "Valparaíso" },
      ]),
    );
  });

  it("nombreCategoria devuelve el nombre o vacío", () => {
    const { result } = renderHook(() => useTablasMaestras());
    expect(result.current.nombreCategoria(1)).toBe("Collares");
    expect(result.current.nombreCategoria(99)).toBe("");
  });

  it("comunasDe filtra por región", () => {
    const { result } = renderHook(() => useTablasMaestras());
    expect(result.current.comunasDe(1).length).toBe(2);
    expect(result.current.comunasDe(2).length).toBe(1);
    expect(result.current.comunasDe(99).length).toBe(0);
  });
});
