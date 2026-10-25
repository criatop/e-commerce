import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import TarjetaProducto from "./TarjetaProducto";
import { CartProvider } from "../../context/CartContext";
import { CHIC_KEYS } from "../../storage/claves";
import { alertas } from "../../utils/alerta";
import type { Producto } from "../../types";

const producto: Producto = {
  codigo: "P1",
  nombre: "Collar Rosa",
  descripcion: "",
  precio: 12000,
  stock: 5,
  stockCritico: 1,
  categoriaId: 1,
  imagen: "collar.png",
  estado: "Activo",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <CartProvider>{children}</CartProvider>
  </MemoryRouter>
);

describe("TarjetaProducto", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(CHIC_KEYS.productos, JSON.stringify([producto]));
    localStorage.setItem(
      CHIC_KEYS.categorias,
      JSON.stringify([{ id: 1, nombre: "Collares", descripcion: "" }]),
    );
    vi.spyOn(alertas, "exito").mockResolvedValue(undefined as never);
  });

  it("muestra el nombre, el precio formateado y la categoría", () => {
    render(<TarjetaProducto producto={producto} />, { wrapper });
    expect(screen.getByText("Collar Rosa")).toBeInTheDocument();
    expect(screen.getByText("$12.000")).toBeInTheDocument();
    expect(screen.getByText("Collares")).toBeInTheDocument();
  });

  it("enlaza al detalle del producto con su código", () => {
    render(<TarjetaProducto producto={producto} />, { wrapper });
    const enlaces = screen.getAllByRole("link");
    expect(enlaces.length).toBeGreaterThan(0);
    expect(enlaces[0].getAttribute("href")).toBe(
      "/producto-detalle?codigo=P1",
    );
  });

  it("añade el producto al carrito al hacer clic en el botón", () => {
    render(<TarjetaProducto producto={producto} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /añadir al carrito/i }));

    const carrito = JSON.parse(
      localStorage.getItem(CHIC_KEYS.carrito) ?? "[]",
    ) as Array<{ codigo: string; cantidad: number }>;

    expect(carrito).toEqual([{ codigo: "P1", cantidad: 1 }]);
    expect(alertas.exito).toHaveBeenCalled();
  });
});