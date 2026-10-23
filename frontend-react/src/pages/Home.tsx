import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TarjetaProducto from "../components/common/TarjetaProducto";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import { formatearPrecio } from "../utils/formato";
import type { Producto } from "../types";
const SLIDES = [
    {
        h1: "ACCESORIOS QUE",
        script: "hablan de ti",
        p: "Diseños únicos, hechos para brillar en cada momento. Descubre nuestra colección de accesorios femeninos.",
    },
    {
        h1: "TOQUES DE",
        script: "estilo para ti",
        p: "Collares, aros y pulseras pensados para darle carácter a cada look, con detalles que enamoran.",
    },
    {
        h1: "BRILLA EN TU",
        script: "día a día",
        p: "Encuentra el accesorio perfecto para cada ocasión. Envíos a todo Chile y calidad garantizada.",
    },
];
const COLECCIONES = [
    { id: 1, label: "COLLARES", glifo: "corazon" },
    { id: 2, label: "PULSERAS", glifo: "anillo" },
    { id: 3, label: "AROS", glifo: "aros" },
    { id: 5, label: "ACCESORIOS", glifo: "cuadro" },
];
function Glifo({ tipo }: { tipo: string }) {
    if (tipo === "anillo") {
        return (
            <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" />
            </svg>
        );
    }

    if (tipo === "aros") {
        return (
            <svg viewBox="0 0 24 24">
                <circle cx="9" cy="12" r="6" />
                <circle cx="16" cy="12" r="6" />
            </svg>
        );
    }
    if (tipo === "cuadro") {
        return (
            <svg viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="3" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24">
            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.5 0 5.5 3.5 3.5 7.5C15
16.65 12 21 12 21z" />
        </svg>
    );
}
export default function Home() {
    const [indice, setIndice] = useState(0);
    const { datos: productos } = useColeccion<Producto>(CHIC_KEYS.productos);
    useEffect(() => {
        const temporizador = setInterval(() => {
            setIndice((actual) => (actual + 1) % SLIDES.length);
        }, 4500);
        return () => clearInterval(temporizador);
    }, []);
    const slide = SLIDES[indice];
    return (
        <>
            <section className="hero">
                <button
                    type="button"
                    className="hero-arrow left"
                    onClick={() => setIndice((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">

                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div className="hero-text">
                    <h1>{slide.h1}</h1>
                    <span className="script">
                        {slide.script} <span>♡</span>
                    </span>
                    <p>{slide.p}</p>
                    <Link to="/productos" className="btn-cta">
                        VER COLECCIÓN
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.5 0 5.5 3.5

3.5 7.5C15 16.65 12 21 12 21z" />

                        </svg>
                    </Link>
                </div>
                <div className="hero-visual">
                    <div className="swatch" />
                    <div className="piece pendant">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.5 0 5.5 3.5

3.5 7.5C15 16.65 12 21 12 21z" />

                        </svg>
                    </div>
                    <div className="piece ring">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="8" />
                        </svg>
                    </div>
                    <div className="piece hoop-a">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="8" />
                        </svg>
                    </div>
                    <div className="piece hoop-b">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="8" />
                        </svg>
                    </div>
                    <div className="piece studs">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.5 0 5.5 3.5

3.5 7.5C15 16.65 12 21 12 21z" />

                        </svg>
                    </div>
                    <div className="hero-dots">
                        {SLIDES.map((_, i) => (
                            <span
                                key={i}
                                className={i === indice ? "active" : ""}
                                onClick={() => setIndice(i)}
                            />
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    className="hero-arrow right"
                    onClick={() => setIndice((i) => (i + 1) % SLIDES.length)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </section>
            <section className="features">
                <div className="feature">
                    <div className="icon">
                        <svg viewBox="0 0 24 24">
                            <rect x="1" y="7" width="14" height="10" rx="1" />
                            <path d="M15 10h3l4 4v3h-7" />
                            <circle cx="6" cy="19" r="1.6" />
                            <circle cx="18" cy="19" r="1.6" />
                        </svg>
                    </div>
                    <div>
                        <strong>ENVÍOS A TODO CHILE</strong>
                        <span>Rápidos y seguros</span>
                    </div>
                </div>
                <div className="feature">
                    <div className="icon">
                        <svg viewBox="0 0 24 24">
                            <rect x="2" y="5" width="20" height="14" rx="2" />

                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                    </div>
                    <div>
                        <strong>PAGA COMO QUIERAS</strong>
                        <span>Transferencia o tarjeta</span>
                    </div>
                </div>
                <div className="feature">
                    <div className="icon">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="6" />
                            <path d="M9 13.5 7 22l5-3 5 3-2-8.5" />
                        </svg>
                    </div>
                    <div>
                        <strong>CALIDAD GARANTIZADA</strong>
                        <span>Accesorios resistentes</span>
                    </div>
                </div>
                <div className="feature">
                    <div className="icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.5 0 5.5 3.5

3.5 7.5C15 16.65 12 21 12 21z" />

                        </svg>
                    </div>
                    <div>
                        <strong>HECHOS CON AMOR</strong>
                        <span>Detalles que enamoran</span>
                    </div>
                </div>
            </section>
            <section className="collections">
                <Link to="/productos" className="view-all">
                    VER TODAS
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </Link>
                <div className="heading">
                    <h2>COLECCIONES DESTACADAS</h2>

                </div>
                <div className="heart">♥</div>
                <div className="collection-grid">
                    {COLECCIONES.map((c) => (
                        <Link key={c.id} to={`/productos?categoria=${c.id}`} className="collection-card">
                            <div className="glyph">
                                <Glifo tipo={c.glifo} />
                            </div>
                            <div className="label">{c.label}</div>
                        </Link>
                    ))}
                    <Link to="/productos?oferta=1" className="collection-card sale">
                        <div className="label">SALE</div>
                    </Link>
                </div>
            </section>
            <section className="container-section">
                <h1 className="section-title">Productos destacados</h1>
                <div className="row g-4">
                    {productos.slice(0, 4).map((p) => (
                        <TarjetaProducto key={p.codigo} producto={p} />
                    ))}
                </div>
            </section>
            <section className="container-section text-center py-5">
                <h2 className="section-title mb-3">Blog &amp; Novedades</h2>
                <p className="text-muted mb-4">
                    Descubre las últimas tendencias, tips de cuidado y consejos de estilo que tenemos
                    para ti.
                </p>
                <Link to="/blog" className="btn btn-contacto px-5 py-3 fw-semibold rounded-pill shadow-sm">
                    <i className="bi bi-journal-text me-2" /> VER NOVEDADES
                </Link>
            </section>
        </>
    );
}
