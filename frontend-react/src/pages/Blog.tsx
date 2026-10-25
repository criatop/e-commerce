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
                        <div className="card h-100 border-0 card-blog overflow-hidden shadow-sm">
                            {/* Contenedor de la Imagen */}
                            <div className="position-relative" style={{ height: "320px", overflow: "hidden" }}>
                                <img
                                    src={
                                        n.titulo.toLowerCase().includes("cuidar")
                                            ? "https://amajoyas.cl/cdn/shop/collections/Co-creado-imagen-AmaJoyas.jpg?v=1759946272&width=3840"
                                            : n.imagen && n.imagen.startsWith("http")
                                                ? n.imagen
                                                : "https://asset.swarovski.com/images/c_crop,g_xy_center,w_2186,h_2736,x_2396,y_3166/dpr_auto,f_auto,q_auto,c_lfill,w_759,h_950/swa-cms/STYLING_BAN-ECOM-DAYWEAR_769-4800x4800_RGB_232769_2276209/.jpg"
                                    }
                                    alt={n.titulo}
                                    className="w-100 h-100"
                                    style={{ objectFit: "cover", objectPosition: "center" }}
                                />
                                <span className="badge rounded-pill badge-blog position-absolute top-0 start-0 m-3 shadow-sm">
                                    {n.categoria}
                                </span>
                            </div>

                            <div className="card-body p-4 d-flex flex-column">
                                {/* Meta datos (Fecha opcional) */}
                                {n.fecha && (
                                    <span className="text-muted small mb-2">
                                        <i className="bi bi-calendar3 me-1" /> {n.fecha}
                                    </span>
                                )}

                                <h3 className="card-title fw-bold h4 mb-3">{n.titulo}</h3>
                                <p className="card-text text-muted flex-grow-1">{n.resumen}</p>
                                <Link to={`/blog/${n.slug}`} className="btn btn-blog mt-3 w-100">
                                    Leer más <i className="bi bi-arrow-right ms-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}