import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useTablasMaestras } from "../../hooks/useTablasMaestras";
import { formatearPrecio } from "../../utils/formato";
import ImagenProducto from "./ImagenProducto";
import type { Producto } from "../../types";
export default function TarjetaProducto({ producto }: { producto: Producto }) {
    const { agregar } = useCart();
    const { nombreCategoria } = useTablasMaestras();
    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div className="card-nexo-hover h-100 d-flex flex-column bg-white rounded-4 overflow-hidden shadow-sm
border-0">
                <Link
                    to={`/producto-detalle?codigo=${encodeURIComponent(producto.codigo)}`}

                    className="d-block overflow-hidden bg-light p-2 position-relative d-flex align-items-center justify-
content-center"

                    style={{ height: 280 }}
                >
                    <ImagenProducto
                        imagen={producto.imagen}
                        alt={producto.nombre}
                        className="mw-100 mh-100"
                        style={{ objectFit: "contain", width: "auto", height: "auto", maxHeight: 260 }}
                    />
                </Link>
                <div className="card-body d-flex flex-column p-3 bg-white">
                    <div>
                        <span className="badge badge-categoria mb-2">
                            {nombreCategoria(producto.categoriaId)}
                        </span>
                        <Link to={`/producto-detalle?codigo=${encodeURIComponent(producto.codigo)}`}>
                            <h5 className="card-title text-truncate fw-bold mb-1 text-dark">
                                {producto.nombre}
                            </h5>
                        </Link>
                        <p className="card-text text-accent fw-bold fs-5 mb-3">
                            {formatearPrecio(producto.precio)}

                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-contacto mt-auto w-100 py-2 fw-semibold"
                        onClick={() => agregar(producto.codigo)}
                    >
                        Añadir al carrito
                    </button>
                </div>
            </div>
        </div>
    );
}