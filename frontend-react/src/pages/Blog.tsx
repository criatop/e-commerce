import { Link } from "react-router-dom";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import type { Noticia } from "../types";
export default function Blog() {
    const { datos: noticias } = useColeccion<Noticia>(CHIC_KEYS.blog);
    return (
        <main className="container my-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold display-5 titulo-blog">Blog &amp; Novedades</h1>
                <p className="lead text-muted">
                    Descubre las últimas tendencias, tips de cuidado y noticias de Pink &amp; Pink.
                </p>
            </div>
            <div className="row g-4 justify-content-center">
                {noticias.map((n) => (
                    <div className="col-12 col-md-6 col-lg-5" key={n.id}>
                        <div className="card h-100 border-0 card-blog">
                            <div className="card-body p-4 d-flex flex-column">
                                <span className="badge rounded-pill mb-2 align-self-start badge-blog">
                                    {n.categoria}
                                </span>
                                <h3 className="card-title fw-bold h4 mb-3">{n.titulo}</h3>
                                <p className="card-text text-muted flex-grow-1">{n.resumen}</p>
                                <Link to={`/blog/${n.slug}`} className="btn btn-blog mt-3">
                                    Leer más
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}