import { Link, useParams } from "react-router-dom";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import type { Noticia } from "../types";

export default function BlogDetalle() {
    const { slug } = useParams();
    const { datos: noticias } = useColeccion<Noticia>(CHIC_KEYS.blog);
    const noticia = noticias.find((n) => n.slug === slug);

    if (!noticia) {
        return (
            <main className="container my-5 text-center">
                <h1 className="fw-bold display-6 titulo-blog mb-3">Artículo no encontrado</h1>
                <p className="text-muted mb-4">La noticia que buscas no existe o fue eliminada.</p>
                <Link to="/blog" className="btn btn-blog">
                    Volver al blog
                </Link>
            </main>
        );
    }

    // Obtener la misma imagen dinámica usada en el listado
    const imagenBanner = noticia.titulo.toLowerCase().includes("cuidar")
        ? "https://i.pinimg.com/1200x/eb/f0/bb/ebf0bb7abc570a437239de7bef26352d.jpg"
        : noticia.imagen && noticia.imagen.startsWith("http")
            ? noticia.imagen
            : "https://i.pinimg.com/736x/2b/ac/61/2bac61c55d72899ee7a502918a64f661.jpg";

    return (
        <main className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <Link to="/blog" className="btn btn-outline-secondary mb-4 btn-sm rounded-pill px-3">
                        <i className="bi bi-arrow-left me-1" /> Volver al blog
                    </Link>

                    <article className="caja-detalle-blog overflow-hidden shadow-sm rounded-4 bg-white">
                        {/* 1. Imagen Principal del Artículo */}
                        <div className="position-relative" style={{ height: "350px", overflow: "hidden" }}>
                            <img
                                src={imagenBanner}
                                alt={noticia.titulo}
                                className="w-100 h-100"
                                style={{ objectFit: "cover", objectPosition: "center" }}
                            />
                            <span className="badge rounded-pill badge-blog position-absolute top-0 start-0 m-4 shadow-sm">
                                {noticia.categoria}
                            </span>
                        </div>

                        <div className="p-4 p-md-5">
                            {/* 2. Cabecera con Título y Meta datos */}
                            <h1 className="fw-bold display-6 titulo-blog mb-3">{noticia.titulo}</h1>

                            <div className="d-flex align-items-center gap-3 text-muted small mb-4 pb-3 border-bottom">
                                <span><i className="bi bi-person me-1" /> Por <strong>{noticia.autor}</strong></span>
                                {noticia.fecha && <span>• <i className="bi bi-calendar3 ms-1 me-1" /> {noticia.fecha}</span>}
                                <span>• <i className="bi bi-clock ms-1 me-1" /> Lectura de 3 min</span>
                            </div>

                            {/* 3. Parrafos del contenido */}
                            {noticia.parrafos.map((texto, i) => (
                                <p key={i} className={i === 0 ? "text-dark lead mb-4 fw-normal" : "text-secondary mb-3"} style={{ lineHeight: "1.8" }}>
                                    {texto}
                                </p>
                            ))}

                            {/* 4. Bloque destacado / Cita de la marca */}
                            <blockquote className="blockquote p-4 my-4 rounded-3 border-start border-4 border-accent" style={{ backgroundColor: "#fff5f8" }}>
                                <p className="mb-0 text-dark italic small">
                                    "Los accesorios correctos no solo completan un outfit, cuentan quién eres sin decir una sola palabra."
                                </p>
                            </blockquote>

                            {/* 5. Llamado a la acción (CTA) comercial */}
                            <div className="p-4 mt-5 rounded-4 text-center" style={{ backgroundColor: "#fafafa", border: "1px dashed var(--accent, #e83e8c)" }}>
                                <h5 className="fw-bold mb-2">¿Te inspiró este artículo?</h5>
                                <p className="text-muted small mb-3">Encuentra las piezas perfectas para combinar con este estilo en nuestra tienda.</p>
                                <Link to="/productos" className="btn btn-blog px-4">
                                    Explorar Colección
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </main>
    );
}