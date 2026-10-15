import { useSearchParams } from "react-router-dom";
import TarjetaProducto from "../components/common/TarjetaProducto";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import type { Producto } from "../types";
export default function Productos() {
    const [parametros, setParametros] = useSearchParams();
    const { datos: productos } = useColeccion<Producto>(CHIC_KEYS.productos);
    const { datos: categorias } = useColeccion<{ id: number; nombre: string }>(CHIC_KEYS.categorias);
    const texto = parametros.get("q") ?? "";
    const categoria = parametros.get("categoria") ?? "";
    function filtrar(nuevoTexto: string, nuevaCategoria: string) {
        const siguiente = new URLSearchParams();
        if (nuevoTexto.trim()) siguiente.set("q", nuevoTexto);
        if (nuevaCategoria) siguiente.set("categoria", nuevaCategoria);
        setParametros(siguiente);
    }
    const visibles = productos.filter((p) => {
        if (categoria && p.categoriaId !== Number(categoria)) return false;
        if (texto.trim() && !p.nombre.toLowerCase().includes(texto.trim().toLowerCase())) return false;
        return true;
    });
    return (
        <section className="container-section">
            <h1 className="section-title">Catálogo de Accesorios</h1>
            <div className="row g-3 mb-4 bg-pink-panel p-3 rounded-4 shadow-sm">
                <div className="col-md-8">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-0">
                            <i className="bi bi-search text-muted" />
                        </span>
                        <input
                            type="text"
                            className="form-control border-0"
                            placeholder="Buscar accesorio por nombre..."

                            value={texto}
                            onChange={(e) => filtrar(e.target.value, categoria)}
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <select
                        className="form-select border-0"
                        value={categoria}
                        onChange={(e) => filtrar(texto, e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                </div>
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