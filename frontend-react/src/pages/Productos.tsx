import { useSearchParams } from "react-router-dom";
import TarjetaProducto from "../components/common/TarjetaProducto";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import { formatearPrecio } from "../utils/formato";
import type { Producto } from "../types";
export default function Productos() {
    const [parametros, setParametros] = useSearchParams();
    const { datos: productos } = useColeccion<Producto>(CHIC_KEYS.productos);
    const { datos: categorias } = useColeccion<{ id: number; nombre: string }>(CHIC_KEYS.categorias);
    const texto = parametros.get("q") ?? "";
    const categoria = parametros.get("categoria") ?? "";
    const orden = parametros.get("orden") ?? "relevancia";
    const oferta = parametros.get("oferta") === "1";
    function filtrar(nuevoTexto: string, nuevaCategoria: string, nuevoOrden: string) {
        const siguiente = new URLSearchParams();
        if (nuevoTexto.trim()) siguiente.set("q", nuevoTexto);
        if (nuevaCategoria) siguiente.set("categoria", nuevaCategoria);
        if (nuevoOrden && nuevoOrden !== "relevancia") siguiente.set("orden", nuevoOrden);
        if (oferta) siguiente.set("oferta", "1");
        setParametros(siguiente);
    }
    if (oferta) {
        const seleccionados: Producto[] = [];
        for (let catId = 1; catId <= 5; catId++) {
            const prod = productos.find((p) => p.categoriaId === catId && p.estado !== "Inactivo");
            if (prod) seleccionados.push(prod);
        }
        return (
            <section className="container-section">
                <h1 className="section-title">SALE</h1>
                <div className="row g-4">
                    {seleccionados.map((prod) => {
                        const precioOferta = Math.round(prod.precio * 0.9);
                        return (
                            <div key={prod.codigo} className="col-12 col-sm-6 col-lg-3">
                                <a href={`/producto-detalle?codigo=${encodeURIComponent(prod.codigo)}`} className="card-nexo-hover text-decoration-none text-dark h-100 d-block position-relative">
                                    <span className="badge bg-danger position-absolute" style={{top:'10px',left:'10px'}}>SALE -10%</span>
                                    <div className="p-2 text-center">
                                        <img src={prod.imagen.startsWith('data:')||prod.imagen.startsWith('/')||prod.imagen.startsWith('http')?prod.imagen:`/img/${prod.imagen}`} alt={prod.nombre} style={{height:'200px',objectFit:'contain',maxWidth:'100%'}} />
                                    </div>
                                    <div className="p-3">
                                        <h6 className="fw-bold mb-1 text-truncate">{prod.nombre}</h6>
                                        <div>
                                            <span className="text-muted text-decoration-line-through me-2">{formatearPrecio(prod.precio)}</span>
                                            <span className="text-accent fw-bold">{formatearPrecio(precioOferta)}</span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        );
                    })}
                </div>
            </section>
        );
    }
    let visibles = productos.filter((p) => {
        if (categoria && p.categoriaId !== Number(categoria)) return false;
        if (texto.trim() && !p.nombre.toLowerCase().includes(texto.trim().toLowerCase())) return false;
        if (p.estado === "Inactivo") return false;
        return true;
    });
    if (orden === "precio-asc") visibles = [...visibles].sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") visibles = [...visibles].sort((a, b) => b.precio - a.precio);
    if (orden === "nombre") visibles = [...visibles].sort((a, b) => a.nombre.localeCompare(b.nombre));
    return (
        <section className="container-section">
            <h1 className="section-title">Catálogo de Accesorios</h1>
            <div className="row g-3 mb-4 bg-pink-panel p-3 rounded-4 shadow-sm">
                <div className="col-md-5">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-0">
                            <i className="bi bi-search text-muted" />
                        </span>
                        <input
                            type="text"
                            className="form-control border-0"
                            placeholder="Buscar accesorio por nombre..."
                            value={texto}
                            onChange={(e) => filtrar(e.target.value, categoria, orden)}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select border-0"
                        value={categoria}
                        onChange={(e) => filtrar(texto, e.target.value, orden)}
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <select
                        className="form-select border-0"
                        value={orden}
                        onChange={(e) => filtrar(texto, categoria, e.target.value)}
                    >
                        <option value="relevancia">Ordenar por: Más relevantes</option>
                        <option value="precio-asc">Precio: menor a mayor</option>
                        <option value="precio-desc">Precio: mayor a menor</option>
                        <option value="nombre">Nombre: A - Z</option>
                    </select>
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="mb-0 text-muted">{visibles.length} productos encontrados</p>
            </div>
            <div className="row g-4">
                {visibles.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted fs-5">No se encontraron accesorios en esta categoría.</p>
                    </div>
                ) : (
                    visibles.map((p) => <TarjetaProducto key={p.codigo} producto={p} />)
                )}
            </div>
        </section>
    );
}