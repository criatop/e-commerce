import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

const { mockMerge } = vi.hoisted(() => ({ mockMerge: vi.fn() }));

vi.mock("../api/cart", () => ({
  cartApi: {
    merge: mockMerge,
    getCart: vi.fn(async () => ({ id: "cart-7", userId: "7", items: [], totalAmount: 0 })),
    addItem: vi.fn(async () => ({ id: "cart-7", userId: "7", items: [], totalAmount: 0 })),
    updateItem: vi.fn(async () => ({ id: "cart-7", userId: "7", items: [], totalAmount: 0 })),
    removeItem: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
  },
}));

vi.mock("./AuthContext", () => ({
  useAuth: () => ({
    sesion: {
      id: "7",
      run: "12345678-9",
      nombre: "Prueba",
      apellidos: "Usuario",
      correo: "prueba@example.com",
      rolId: 3,
    },
  }),
}));

import { CartProvider } from "./CartContext";

function renderConSesion() {
  return render(
    <CartProvider>
      <div />
    </CartProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  mockMerge.mockReset();
  mockMerge.mockResolvedValue({ id: "cart-7", userId: "7", items: [], totalAmount: 0 });
});

describe("CartContext con sesión", () => {
  it("fusiona el carrito pendiente al autenticarse y limpia la clave local", async () => {
    localStorage.setItem("chic_carrito_pendiente", JSON.stringify([{ productId: "p1", cantidad: 2 }]));

    renderConSesion();

    await waitFor(() => expect(mockMerge).toHaveBeenCalledWith("7", [{ productId: "p1", quantity: 2 }]));
    expect(localStorage.getItem("chic_carrito_pendiente")).toBeNull();
  });
});
