import type { OrdenEstadoApi } from "../../api/types";

/** Espejo de OrderStatus (ms-order) y de validateStatusTransition(). */
export const ESTADOS: OrdenEstadoApi[] = [
  "PENDING",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ETIQUETAS: Record<OrdenEstadoApi, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  PAID: "Pagada",
  SHIPPED: "Enviada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

/** Transiciones aceptadas por OrderService.validateStatusTransition(). */
export const TRANSICIONES: Record<OrdenEstadoApi, OrdenEstadoApi[]> = {
  PENDING: ["CONFIRMED", "PAID", "CANCELLED"],
  CONFIRMED: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
