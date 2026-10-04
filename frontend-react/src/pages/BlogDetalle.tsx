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

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Link to="/blog" className="btn btn-outline-secondary mb-4 btn-sm">
            <i className="bi bi-arrow-left me-1" /> Volver al blog
          </Link>
          <article className="p-4 p-md-5 caja-detalle-blog">
            <span className="badge rounded-pill mb-3 badge-blog">{noticia.categoria}</span>
            <h1 className="fw-bold display-6 titulo-blog mb-3">{noticia.titulo}</h1>
            <p className="text-muted small mb-4">
              Publicado por <strong>{noticia.autor}</strong>
            </p>

            {noticia.parrafos.map((texto, i) => (
              <p key={i} className={i === 0 ? "text-secondary lead" : "text-secondary"}>
                {texto}
              </p>
            ))}
          </article>
        </div>
      </div>
    </main>
  );
}
