import { describe, expect, it } from "vitest";
import { ESTADOS_ORDEN } from "../../api/mappers";
import type { OrdenEstadoApi } from "../../api/types";
import { ESTADOS, ETIQUETAS, TRANSICIONES } from "./estadosOrden";

/** OrderStatus.java de ms-order: fuente de verdad del contrato. */
const ORDER_STATUS_BACKEND: OrdenEstadoApi[] = [
  "PENDING",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

describe("contrato de estados de orden con ms-order", () => {
  it("ESTADOS cubre exactamente el enum OrderStatus del backend", () => {
    expect(new Set(ESTADOS)).toEqual(new Set(ORDER_STATUS_BACKEND));
    expect(ESTADOS).toHaveLength(ORDER_STATUS_BACKEND.length);
  });

  it("todas las tablas etiquetan los seis estados sin huecos", () => {
    for (const estado of ORDER_STATUS_BACKEND) {
      expect(ETIQUETAS[estado], `etiqueta de ${estado}`).toBeTruthy();
      expect(ESTADOS_ORDEN[estado], `etiqueta mapper de ${estado}`).toBeTruthy();
      expect(TRANSICIONES[estado], `transiciones de ${estado}`).toBeDefined();
    }
    expect(Object.keys(ETIQUETAS)).toHaveLength(ORDER_STATUS_BACKEND.length);
    expect(Object.keys(ESTADOS_ORDEN)).toHaveLength(ORDER_STATUS_BACKEND.length);
    expect(Object.keys(TRANSICIONES)).toHaveLength(ORDER_STATUS_BACKEND.length);
  });

  it("los estados terminales no ofrecen transiciones", () => {
    expect(TRANSICIONES.DELIVERED).toEqual([]);
    expect(TRANSICIONES.CANCELLED).toEqual([]);
  });
});
