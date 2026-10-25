import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AppRoutes } from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CHIC_KEYS } from "./storage/claves";
import { alertas } from "./utils/alerta";

function renderRuta(ruta: string) {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[ruta]}>
          <AppRoutes />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>,
  );
}

describe("navegación de la aplicación", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(alertas, "accesoRestringido").mockResolvedValue(
      Promise.resolve() as never,
    );
  });

  it("renderiza el inicio en /", () => {
    renderRuta("/");
    expect(screen.getByText("Productos destacados")).toBeInTheDocument();
  });

  it("renderiza Nosotros en /nosotros", () => {
    renderRuta("/nosotros");
    expect(
      screen.getByRole("heading", { name: "Sobre Nosotros" }),
    ).toBeInTheDocument();
  });

  it("renderiza el Login en /login", () => {
    renderRuta("/login");
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });

  it("navega al hacer clic en un enlace del menú", () => {
    renderRuta("/");
    fireEvent.click(screen.getByRole("link", { name: "NOSOTROS" }));
    expect(
      screen.getByRole("heading", { name: "Sobre Nosotros" }),
    ).toBeInTheDocument();
  });

  it("protege /cuenta y redirige al login sin sesión", () => {
    renderRuta("/cuenta");
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Aún no has iniciado sesión")).toBeNull();
    expect(alertas.accesoRestringido).toHaveBeenCalled();
  });

  it("permite /cuenta con sesión de cliente", () => {
    localStorage.setItem(
      CHIC_KEYS.sesion,
      JSON.stringify({
        run: "11111111-1",
        nombre: "Ana",
        apellidos: "Pérez",
        correo: "ana@test.cl",
        fechaNacimiento: "1990-01-01",
        rolId: 3,
        regionId: 1,
        comunaId: 1,
        direccion: "Calle 1",
        estado: "Activo",
      }),
    );
    renderRuta("/cuenta");
    expect(screen.getByRole("heading", { name: "Mi cuenta" })).toBeInTheDocument();
    expect(alertas.accesoRestringido).not.toHaveBeenCalled();
  });

  it("permite el panel admin con rol administrador", () => {
    localStorage.setItem(
      CHIC_KEYS.sesion,
      JSON.stringify({ nombre: "Jefe", apellidos: "Uno", rolId: 1 }),
    );
    renderRuta("/admin");
    expect(screen.getByRole("link", { name: /Resumen/ })).toBeInTheDocument();
    expect(alertas.accesoRestringido).not.toHaveBeenCalled();
  });
});