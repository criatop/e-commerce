import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { alertas } from "../../utils/alerta";

export type RolRequerido = "ADMIN" | "SELLER" | "CLIENTE" | number;

interface Props {
  roles?: RolRequerido[];
  children: ReactNode;
}

/** Controla el acceso a una ruta según la sesión y los roles permitidos. */
export default function RutaProtegida({ roles, children }: Props) {
  const { sesion, esAdmin, esVendedor } = useAuth();
  const ubicacion = useLocation();

  const permitido = sesion !== null && (roles === undefined || roles.length === 0 || roles.some((rol) => {
    if (rol === "ADMIN") return esAdmin;
    if (rol === "SELLER") return esVendedor;
    if (rol === "CLIENTE") return !esAdmin && !esVendedor;
    return sesion?.rolId === rol || sesion?.rol?.toUpperCase() === String(rol).toUpperCase();
  }));

  useEffect(() => {
    if (!permitido && sesion !== null) void alertas.accesoRestringido();
  }, [permitido, sesion]);

  if (sesion === null) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  if (!permitido) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
