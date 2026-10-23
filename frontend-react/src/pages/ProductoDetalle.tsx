import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import ImagenProducto from "../components/common/ImagenProducto";
import TarjetaProducto from "../components/common/TarjetaProducto";
import { useCart } from "../context/CartContext";
import { useTablasMaestras } from "../hooks/useTablasMaestras";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import { formatearPrecio } from "../utils/formato";
import type { Producto } from "../types";

export default function ProductoDetalle() {
    const [parametros] = useSearchParams();
    const navigate = useNavigate();
    const codigo = parametros.get("codigo");
    const { datos: productos } = useColeccion<Producto>(CHIC_KEYS.productos);
    const { nombreCategoria } = useTablasMaestras();
    const { agregar } = useCart();
    const [cantidad, setCantidad] = useState(1);
    const [favorito, setFavorito] = useState(() => {
        try {
            const favs = JSON.parse(localStorage.getItem("chic_favoritos") ?? "[]") as string[];
            return codigo ? favs.includes(codigo) : false;
        } catch {
            return false;
        }
    });

    if (!codigo) return <Navigate to="/productos" replace />;
    const producto = productos.find((p) => p.codigo === codigo);
    if (!producto) {
        return (
            <div className="col-12 text-center py-5">
                <p className="text-muted fs-5">Producto no encontrado.</p>
            </div>
        );
    }
    const p = producto;

    function toggleFavorito() {
        try {
            const favs = JSON.parse(localStorage.getItem("chic_favoritos") ?? "[]") as string[];
            if (favs.includes(p.codigo)) {
                const nuevo = favs.filter((f) => f !== p.codigo);
                localStorage.setItem("chic_favoritos", JSON.stringify(nuevo));
                setFavorito(false);
            } else {
                localStorage.setItem("chic_favoritos", JSON.stringify([...favs, p.codigo]));
                setFavorito(true);
            }
        } catch {
            // ignore
        }
    }

    function comprarAhora() {
        for (let i = 0; i < cantidad; i++) {
            agregar(p.codigo);
        }
        navigate("/carrito");
    }

    const relacionados = productos
        .filter((prod) => prod.categoriaId === p.categoriaId && prod.codigo !== p.codigo && prod.estado === "Activo")
        .slice(0, 4);

    const envioGratis = p.precio * cantidad >= 50000;

    return (
        <section className="container-section">
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
                    <li className="breadcrumb-item"><Link to="/productos">Productos</Link></li>
                    <li className="breadcrumb-item"><Link to={`/productos?categoria=${producto.categoriaId}`}>{nombreCategoria(producto.categoriaId)}</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
                </ol>
            </nav>
            <div className="detalle-wrap">
                <div className="row g-5">
                    <div className="col-md-6 text-center">
                        <div
                            className="p-3 bg-pink-panel rounded-4 shadow-sm d-flex align-items-center justify-content-center"
                            style={{ minHeight: 350, maxHeight: 500 }}
                        >
                            <ImagenProducto
                                imagen={p.imagen}
                                alt={p.nombre}
                                className="img-fluid rounded-3"
                                style={{ maxHeight: 460, width: "auto", objectFit: "contain" }}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="badge badge-categoria mb-2">
                                {nombreCategoria(p.categoriaId)}
                            </span>
                            <button className="btn btn-sm btn-outline-secondary" onClick={toggleFavorito} title={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}>
                                <i className={`bi ${favorito ? "bi-heart-fill text-danger" : "bi-heart"}`}></i>
                            </button>
                        </div>
                        <h1 className="fw-bold my-2">{p.nombre}</h1>
                        <p className="fs-3 text-accent fw-bold mb-2">{formatearPrecio(p.precio)}</p>
                        {envioGratis ? (
                            <p className="text-success small mb-3"><i className="bi bi-truck me-1"></i>Envío gratis por compra mayor a $50.000</p>
                        ) : (
                            <p className="text-muted small mb-3"><i className="bi bi-truck me-1"></i>Envío gratis desde $50.000</p>
                        )}
                        <p className="text-muted mb-4">{p.descripcion}</p>
                        <p className="small mb-2">
                            <i className="bi bi-box-seam me-1" /> Stock disponible: <b>{p.stock}</b> unidades
                        </p>
                        {p.stock <= (p.stockCritico || 5) && p.stock > 0 && (
                            <p className="small text-warning mb-3"><i className="bi bi-exclamation-triangle me-1"></i>¡Últimas unidades!</p>
                        )}
                        {p.stock === 0 && (
                            <p className="small text-danger mb-3"><i className="bi bi-x-circle me-1"></i>Sin stock</p>
                        )}

                        <div className="d-flex align-items-center gap-3 mb-3">
                            <span className="text-muted">Cantidad:</span>
                            <div className="input-group" style={{ width: "140px" }}>
                                <button className="btn btn-outline-secondary" type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>-</button>
                                <input className="form-control text-center" value={cantidad} readOnly />
                                <button className="btn btn-outline-secondary" type="button" onClick={() => setCantidad((c) => Math.min(p.stock || 99, c + 1))}>+</button>
                            </div>
                        </div>

                        <div className="d-grid gap-2">
                            <button
                                type="button"
                                className="btn btn-contacto btn-lg"
                                disabled={p.stock === 0}
                                onClick={() => agregar(p.codigo, cantidad)}
                            >
                                <i className="bi bi-cart-plus me-2"></i>Añadir al carrito
                            </button>
                            <button
                                type="button"
                                className="btn btn-accent btn-lg"
                                disabled={p.stock === 0}
                                onClick={comprarAhora}
                            >
                                <i className="bi bi-bag-check me-2"></i>Comprar ahora
                            </button>
                        </div>

                        <div className="mt-4 p-3 bg-light rounded">
                            <h6 className="fw-bold mb-2">Información</h6>
                            <ul className="small mb-0 text-muted">
                                <li>Código: {p.codigo}</li>
                                <li>Categoría: {nombreCategoria(p.categoriaId)}</li>
                                <li>Compra segura y protegida</li>
                                <li>Cambios y devoluciones según política</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {relacionados.length > 0 && (
                <div className="mt-5">
                    <h3 className="fw-bold mb-4">Productos relacionados</h3>
                    <div className="row g-4">
                        {relacionados.map((p) => <TarjetaProducto key={p.codigo} producto={p} />)}
                    </div>
                </div>
            )}
        </section>
    );
}