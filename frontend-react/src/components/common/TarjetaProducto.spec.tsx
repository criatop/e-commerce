import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import TarjetaProducto from "./TarjetaProducto";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import { CHIC_KEYS } from "../../storage/claves";
import { alertas } from "../../utils/alerta";
import type { Producto } from "../../types";

vi.mock("../../api/catalog", () => ({
  catalogApi: {
    listCategories: vi.fn().mockResolvedValue([
      { id: "1", name: "Collares", description: "", activa: true },
    ]),
    listProducts: vi.fn().mockResolvedValue([]),
  },
}));

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
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe("TarjetaProducto", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(alertas, "exito").mockResolvedValue(undefined as never);
  });

  it("muestra el nombre, el precio formateado y la categoría", async () => {
    render(<TarjetaProducto producto={producto} />, { wrapper });
    expect(screen.getByText("Collar Rosa")).toBeInTheDocument();
    expect(screen.getByText("$12.000")).toBeInTheDocument();
    expect(await screen.findByText("Collares")).toBeInTheDocument();
  });

  it("enlaza al detalle del producto con su código", () => {
    render(<TarjetaProducto producto={producto} />, { wrapper });
    const enlaces = screen.getAllByRole("link");
    expect(enlaces.length).toBeGreaterThan(0);
    expect(enlaces[0].getAttribute("href")).toBe(
      "/producto-detalle?codigo=P1",
    );
  });

  it("añade el producto al carrito pendiente al hacer clic en el botón", async () => {
    render(<TarjetaProducto producto={producto} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /añadir al carrito/i }));

    await waitFor(() => {
      const carrito = JSON.parse(
        localStorage.getItem(CHIC_KEYS.carritoPendiente) ?? "[]",
      ) as Array<{ productId: string; cantidad: number }>;
      expect(carrito).toEqual([
        { productId: "P1", codigo: "P1", cantidad: 1, nombre: "Collar Rosa", precio: 12000, stock: 5, imagen: "collar.png" },
      ]);
    });
    expect(alertas.exito).toHaveBeenCalled();
  });
});
