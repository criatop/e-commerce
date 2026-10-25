import { describe, it, expect, beforeEach } from "vitest";
import { inicializarDatos } from "./seed";
import { CHIC_KEYS, CHIC_VERSION } from "../storage/claves";

function leer(clave: string): unknown[] {
  return JSON.parse(localStorage.getItem(clave) ?? "[]") as unknown[];
}

describe("inicializarDatos", () => {
  beforeEach(() => localStorage.clear());

  it("siembra todas las tablas la primera vez", () => {
    inicializarDatos();
    expect(leer(CHIC_KEYS.regiones).length).toBe(16);
    expect(leer(CHIC_KEYS.comunas).length).toBe(345);
    expect(leer(CHIC_KEYS.productos).length).toBe(17);
    expect(leer(CHIC_KEYS.usuarios).length).toBe(4);
    expect(leer(CHIC_KEYS.categorias).length).toBe(5);
    expect(leer(CHIC_KEYS.roles).length).toBe(3);
    expect(leer(CHIC_KEYS.blog).length).toBe(2);
    expect(localStorage.getItem("chic_version")).toBe(CHIC_VERSION);
  });

  it("no pisa los datos de usuario si la versión no cambia", () => {
    inicializarDatos();
    localStorage.setItem(
      CHIC_KEYS.productos,
      JSON.stringify([{ codigo: "X", nombre: "Personalizado" }]),
    );
    inicializarDatos();
    expect(leer(CHIC_KEYS.productos).length).toBe(1);
  });

  it("re-siembra las tablas maestras cuando cambia la versión", () => {
    inicializarDatos();
    localStorage.setItem(
      CHIC_KEYS.categorias,
      JSON.stringify([{ id: 99, nombre: "Otra", descripcion: "" }]),
    );
    localStorage.setItem("chic_version", "999");
    inicializarDatos();
    expect(leer(CHIC_KEYS.categorias).length).toBe(5);
    expect(localStorage.getItem("chic_version")).toBe(CHIC_VERSION);
  });
});