import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTablasMaestras } from "../hooks/useTablasMaestras";

export default function Cuenta() {
  const { sesion, iniciales, esPersonal, logout } = useAuth();
  const { roles, regiones, comunas } = useTablasMaestras();

  if (!sesion) {
    return (
      <section className="container-section">
        <div className="container">
          <div className="text-center mb-4">
            <h1 className="section-title">Mi cuenta</h1>
          </div>

          <div className="text-center p-5 bg-pink-panel rounded-4">
            <h3 className="fw-bold text-accent mb-3">Aún no has iniciado sesión</h3>
            <p className="text-muted mb-4">
              Inicia sesión para ver tu información personal.
            </p>
            <Link to="/login" className="btn btn-accent px-4 py-2 fw-semibold">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const rol = roles.datos.find((r) => r.id === sesion.rolId);
  const region = regiones.datos.find((r) => r.id === sesion.regionId);
  const comuna = comunas.datos.find((c) => c.id === sesion.comunaId);

  const filas: [string, string][] = [
    ["Correo", sesion.correo],
    ["RUN", sesion.run],
    ["Fecha de nacimiento", sesion.fechaNacimiento],
    ["Dirección", sesion.direccion],
    ["Región", region?.nombre ?? ""],
    ["Comuna", comuna?.nombre ?? ""],
    ["Estado", sesion.estado],
  ];

  return (
    <section className="container-section">
      <div className="container">
        <div className="text-center mb-4">
          <h1 className="section-title">Mi cuenta</h1>
          <Link to="/productos" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1" /> Seguir comprando
          </Link>
        </div>

        <div className="row justify-content-center g-4">
          <div className="col-lg-8">
            <div className="card-nexo-hover p-4">
              <div className="row g-4 align-items-center">
                <div className="col-md-4 text-center">
                  <div className="avatar-iniciales">{iniciales}</div>
                  <h2 className="h5 mt-3 mb-1">
                    {sesion.nombre} {sesion.apellidos}
                  </h2>
                  <span
                    className={
                      "badge rounded-pill " +
                      (esPersonal ? "text-bg-danger" : "text-bg-secondary")
                    }
                  >
                    {rol?.nombre ?? "Usuario"}
                  </span>

                  {esPersonal && (
                    <div className="mt-3">
                      <Link to="/admin" className="btn btn-accent w-100">
                        <i className="bi bi-speedometer2 me-1" /> Ir al panel admin
                      </Link>
                    </div>
                  )}

                  <div className="mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={logout}
                    >
                      <i className="bi bi-box-arrow-right me-1" /> Cerrar sesión
                    </button>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="ps-md-3">
                    {filas.map(([etiqueta, valor]) => (
                      <div
                        key={etiqueta}
                        className="d-flex justify-content-between align-items-center border-bottom py-2"
                      >
                        <span className="text-muted small">{etiqueta}</span>
                        <span className="fw-semibold text-end">{valor || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
