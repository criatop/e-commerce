import { Link, Navigate, useSearchParams } from "react-router-dom";
import ImagenProducto from "../components/common/ImagenProducto";
import { useCart } from "../context/CartContext";
import { useTablasMaestras } from "../hooks/useTablasMaestras";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import { formatearPrecio } from "../utils/formato";
import type { Producto } from "../types";

export default function ProductoDetalle() {
  const [parametros] = useSearchParams();
  const codigo = parametros.get("codigo");
  const { datos: productos } = useColeccion<Producto>(CHIC_KEYS.productos);
  const { nombreCategoria } = useTablasMaestras();
  const { agregar } = useCart();

  if (!codigo) return <Navigate to="/productos" replace />;

  const producto = productos.find((p) => p.codigo === codigo);

  if (!producto) {
    return (
      <div className="col-12 text-center py-5">
        <p className="text-muted fs-5">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <section className="container-section">
      <Link to="/productos" className="btn-back">
        &larr; Volver al catálogo
      </Link>

      <div className="detalle-wrap">
        <div className="row g-5 align-items-center">
          <div className="col-md-6 text-center">
            <div
              className="p-3 bg-pink-panel rounded-4 shadow-sm d-flex align-items-center justify-content-center"
              style={{ minHeight: 350, maxHeight: 500 }}
            >
              <ImagenProducto
                imagen={producto.imagen}
                alt={producto.nombre}
                className="img-fluid rounded-3"
                style={{ maxHeight: 460, width: "auto", objectFit: "contain" }}
              />
            </div>
          </div>

          <div className="col-md-6">
            <span className="badge badge-categoria mb-2">
              {nombreCategoria(producto.categoriaId)}
            </span>
            <h1 className="fw-bold my-2">{producto.nombre}</h1>
            <p className="fs-3 text-accent fw-bold mb-3">{formatearPrecio(producto.precio)}</p>
            <p className="text-muted mb-4">{producto.descripcion}</p>
            <p className="small text-muted mb-4">
              <i className="bi bi-box-seam me-1" /> Stock disponible: {producto.stock} unidades
            </p>
            <button
              type="button"
              className="btn btn-contacto btn-lg px-4"
              onClick={() => agregar(producto.codigo)}
            >
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
