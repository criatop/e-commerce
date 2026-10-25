import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import Navbar from "./Navbar";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import { CHIC_KEYS } from "../../storage/claves";

function Ubicacion() {
  const { pathname, search } = useLocation();
  return <div data-testid="ubicacion">{pathname + search}</div>;
}

function renderNavbar(entrada = "/") {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[entrada]}>
          <Navbar />
          <Ubicacion />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>,
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("muestra el buscador y los enlaces de navegación", () => {
    renderNavbar();
    expect(screen.getByPlaceholderText("Buscar accesorios ...")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "INICIO" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "NOSOTROS" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CONTACTO" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carrito" })).toBeInTheDocument();
  });

  it("navega a /productos con el texto buscado", () => {
    renderNavbar();
    const buscador = screen.getByPlaceholderText("Buscar accesorios ...");
    fireEvent.change(buscador, { target: { value: "collar" } });
    fireEvent.submit(buscador.closest("form") as HTMLFormElement);

    expect(screen.getByTestId("ubicacion").textContent).toBe(
      "/productos?q=collar",
    );
  });

  it("no navega si la búsqueda está vacía", () => {
    renderNavbar();
    const buscador = screen.getByPlaceholderText("Buscar accesorios ...");
    fireEvent.submit(buscador.closest("form") as HTMLFormElement);
    expect(screen.getByTestId("ubicacion").textContent).toBe("/");
  });

  it("cierra la sesión y navega a /login", () => {
    localStorage.setItem(
      CHIC_KEYS.sesion,
      JSON.stringify({ nombre: "Ana", apellidos: "Pérez", rolId: 3 }),
    );
    renderNavbar();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(screen.getByTestId("ubicacion").textContent).toBe("/login");
    expect(localStorage.getItem(CHIC_KEYS.sesion)).toBeNull();
  });
});