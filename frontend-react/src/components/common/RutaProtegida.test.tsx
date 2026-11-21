import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RutaProtegida from "./RutaProtegida";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  accesoRestringido: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({ useAuth: mocks.useAuth }));
vi.mock("../../utils/alerta", () => ({
  alertas: { accesoRestringido: mocks.accesoRestringido },
}));

interface SesionPrueba {
  rolId: number;
  rol: string;
  nombre: string;
}

function sesionDe(rolId: number, rol: string): SesionPrueba {
  return { rolId, rol, nombre: "Prueba" };
}

function renderConSesion(sesion: SesionPrueba | null, roles: ("ADMIN" | "SELLER")[]) {
  mocks.useAuth.mockReturnValue({
    sesion,
    esAdmin: sesion?.rolId === 1 || sesion?.rol === "ADMIN",
    esVendedor: sesion?.rolId === 2 || sesion?.rol === "SELLER",
    esPersonal: sesion !== null && (sesion.rolId === 1 || sesion.rolId === 2),
  });

  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/" element={<p>Inicio público</p>} />
        <Route path="/login" element={<p>Inicia sesión</p>} />
        <Route
          path="/admin"
          element={
            <RutaProtegida roles={roles}>
              <p>Panel de administración</p>
            </RutaProtegida>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocks.useAuth.mockReset();
  mocks.accesoRestringido.mockReset();
});

describe("RutaProtegida", () => {
  it("redirige a /login cuando no hay sesión", () => {
    renderConSesion(null, ["ADMIN"]);
    expect(screen.getByText(/inicia sesión/i)).toBeInTheDocument();
    expect(screen.queryByText(/panel de administración/i)).not.toBeInTheDocument();
  });

  it("redirige al inicio cuando el rol no está permitido", () => {
    renderConSesion(sesionDe(2, "SELLER"), ["ADMIN"]);
    expect(screen.getByText(/inicio público/i)).toBeInTheDocument();
    expect(screen.queryByText(/panel de administración/i)).not.toBeInTheDocument();
  });

  it("renderiza a los hijos cuando el rol está permitido", () => {
    renderConSesion(sesionDe(1, "ADMIN"), ["ADMIN"]);
    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();
  });

  it("permite a un vendedor las rutas compartidas con administración", () => {
    renderConSesion(sesionDe(2, "SELLER"), ["ADMIN", "SELLER"]);
    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();
  });
});
