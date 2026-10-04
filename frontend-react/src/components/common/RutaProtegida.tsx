import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { alertas } from "../../utils/alertas";

export default function RutaProtegida({
  roles,
  children,
}: {
  roles: number[];
  children: ReactNode;
}) {
  const { sesion } = useAuth();
  const ubicacion = useLocation();
  const permitido = sesion !== null && roles.includes(sesion.rolId);

  useEffect(() => {
    if (!permitido) {
      void alertas.accesoRestringido();
    }
  }, [permitido]);

  if (!permitido) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  return <>{children}</>;
}
