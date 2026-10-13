import { useMemo, useState, type ReactNode } from "react";

export interface Columna<T> {
  clave: string;
  titulo: string;
  render: (fila: T) => ReactNode;
  orden?: (fila: T) => string | number;
  claseCelda?: string;
  claseCabecera?: string;
}

interface Props<T> {
  filas: T[];
  columnas: Columna<T>[];
  claveFila: (fila: T) => string | number;
  coincide?: (fila: T, texto: string) => boolean;
  placeholderBusqueda?: string;
  porPagina?: number;
  textoVacio?: string;
  accionesEncabezado?: ReactNode;
}

export default function DataTable<T>({
  filas,
  columnas,
  claveFila,
  coincide,
  placeholderBusqueda = "Buscar...",
  porPagina = 5,
  textoVacio = "No se encontraron registros.",
  accionesEncabezado,
}: Props<T>) {
  const [texto, setTexto] = useState("");
  const [orden, setOrden] = useState<{ clave: string; direccion: "asc" | "desc" } | null>(null);
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    if (!texto.trim() || !coincide) return filas;
    const t = texto.trim().toLowerCase();
    return filas.filter((fila) => coincide(fila, t));
  }, [filas, texto, coincide]);

  const ordenadas = useMemo(() => {
    if (!orden) return filtradas;
    const columna = columnas.find((c) => c.clave === orden.clave);
    if (!columna?.orden) return filtradas;

    const factor = orden.direccion === "asc" ? 1 : -1;
    return [...filtradas].sort((a, b) => {
      const va = columna.orden!(a);
      const vb = columna.orden!(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * factor;
      return String(va).localeCompare(String(vb), "es") * factor;
    });
  }, [filtradas, orden, columnas]);

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visibles = ordenadas.slice(
    (paginaSegura - 1) * porPagina,
    paginaSegura * porPagina,
  );

  function ordenarPor(clave: string) {
    setOrden((actual) => {
      if (actual?.clave !== clave) return { clave, direccion: "asc" };
      return actual.direccion === "asc" ? { clave, direccion: "desc" } : null;
    });
    setPagina(1);
  }

  function buscar(valor: string) {
    setTexto(valor);
    setPagina(1);
  }

  const iconoOrden = (clave: string) => {
    if (orden?.clave !== clave) return "⇅";
    return orden.direccion === "asc" ? "▲" : "▼";
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center p-3">
        {coincide && (
          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={placeholderBusqueda}
              value={texto}
              onChange={(e) => buscar(e.target.value)}
            />
          </div>
        )}
        {accionesEncabezado}
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columnas.map((columna) => (
                <th key={columna.clave} scope="col" className={columna.claseCabecera}>
                  {columna.orden ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none text-dark"
                      onClick={() => ordenarPor(columna.clave)}
                    >
                      {columna.titulo} <small>{iconoOrden(columna.clave)}</small>
                    </button>
                  ) : (
                    columna.titulo
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="text-center text-muted py-4">
                  {textoVacio}
                </td>
              </tr>
            ) : (
              visibles.map((fila) => (
                <tr key={claveFila(fila)}>
                  {columnas.map((columna) => (
                    <td key={columna.clave} className={columna.claseCelda}>
                      {columna.render(fila)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center p-3">
          <small className="text-muted">
            Mostrando {(paginaSegura - 1) * porPagina + 1}
            {Math.min(paginaSegura * porPagina, ordenadas.length)} de {ordenadas.length}
          </small>
          <nav aria-label="Paginación">
            <ul className="pagination pagination-sm mb-0">
              <li className={"page-item" + (paginaSegura === 1 ? " disabled" : "")}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPagina(paginaSegura - 1)}
                >
                  Anterior
                </button>
              </li>
              <li className={"page-item" + (paginaSegura === totalPaginas ? " disabled" : "")}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPagina(paginaSegura + 1)}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}