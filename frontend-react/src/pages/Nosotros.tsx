import { Link } from "react-router-dom";

export default function Nosotros() {
    return (
        <main className="container my-5 nosotros-container">
            {/* 1. Header principal */}
            <div className="text-center mb-5">
                <h1 className="fw-bold display-5 titulo-nosotros">Sobre Nosotros</h1>
                <p className="lead text-muted col-lg-8 mx-auto">
                    Conoce la historia, los valores y la pasión que le dan vida a Pink &amp; Pink.
                </p>
            </div>

            {/* 2. Sección Historia con imagen o Banner */}
            <div className="row align-items-center justify-content-center mb-5 g-4">
                <div className="col-lg-6">
                    <div className="p-4 p-md-5 rounded-4 shadow-sm caja-historia bg-white h-100">
                        <span className="badge rounded-pill badge-blog mb-3">Nuestra Esencia</span>
                        <h2 className="fw-bold mb-3 subtitulo-nosotros">Nuestra Historia</h2>
                        <p className="text-secondary fs-5 mb-3" style={{ lineHeight: "1.7" }}>
                            Pink &amp; Pink nació de la pasión por los accesorios únicos y con estilo. Nos
                            dedicamos a seleccionar y diseñar piezas que resalten la personalidad de cada
                            persona, combinando elegancia, tendencia y la mejor calidad.
                        </p>
                        <p className="text-secondary mb-0" style={{ lineHeight: "1.7" }}>
                            Creemos firmemente que cada detalle cuenta y que el accesorio correcto tiene el poder de
                            elevar tu confianza y transformar por completo tu look diario.
                        </p>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="rounded-4 overflow-hidden shadow-sm" style={{ height: "340px" }}>
                        <img
                            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop"
                            alt="Accesorios Pink & Pink"
                            className="w-100 h-100 object-fit-cover"
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Pilares / Por qué elegirnos */}
            <div className="my-5 py-4">
                <div className="text-center mb-4">
                    <h2 className="fw-bold subtitulo-nosotros">¿Por qué elegirnos?</h2>
                    <p className="text-muted">Lo que define cada una de nuestras piezas</p>
                </div>
                <div className="row g-4 text-center">
                    <div className="col-md-4">
                        <div className="p-4 rounded-4 bg-white shadow-sm h-100 border-0">
                            <i className="bi bi-gem display-5 text-pink mb-3 d-inline-block" style={{ color: "#e83e8c" }} />
                            <h5 className="fw-bold">Calidad Seleccionada</h5>
                            <p className="text-muted small mb-0">Elegimos cuidadosamente materiales duraderos y acabados impecables para cada accesorio.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-4 rounded-4 bg-white shadow-sm h-100 border-0">
                            <i className="bi bi-heart-fill display-5 mb-3 d-inline-block" style={{ color: "#e83e8c" }} />
                            <h5 className="fw-bold">Hecho con Amor</h5>
                            <p className="text-muted small mb-0">Cada pedido es empacado de forma especial para brindarte una experiencia de unboxing única.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-4 rounded-4 bg-white shadow-sm h-100 border-0">
                            <i className="bi bi-truck display-5 mb-3 d-inline-block" style={{ color: "#e83e8c" }} />
                            <h5 className="fw-bold">Envíos a todo Chile</h5>
                            <p className="text-muted small mb-0">Llegamos a la puerta de tu casa con empaques seguros para que disfrutes tus joyas de inmediato.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Fundadora */}
            <div className="text-center my-5">
                <h2 className="fw-bold subtitulo-nosotros">Fundadora &amp; Creadora</h2>
                <p className="text-muted">La mente creativa detrás del concepto de Pink &amp; Pink.</p>
            </div>

            <div className="row justify-content-center mb-5">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card border-0 shadow-sm text-center p-4 card-equipo rounded-4">
                        <div className="card-body">
                            <div className="mb-3 mx-auto" style={{ width: "110px", height: "110px" }}>
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
                                    alt="Jhaimar Altuve"
                                    className="w-100 h-100 rounded-circle object-fit-cover shadow-sm"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                            <h4 className="card-title fw-bold mb-1">Jhaimar Altuve</h4>
                            <span className="badge rounded-pill mb-3 badge-rol px-3 py-2">
                                Fundadora &amp; Diseñadora
                            </span>
                            <p className="card-text text-muted">
                                Apasionada por la moda y los detalles únicos. Encargada de la curaduría de
                                productos, la visión de marca y asegurar la mejor experiencia para cada cliente en Pink &amp; Pink.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Banner Final de Conversión */}
            <div className="p-5 text-center rounded-4 shadow-sm" style={{ backgroundColor: "#fff0f5", border: "1px solid #f8d7da" }}>
                <h3 className="fw-bold mb-2">¿Lista para resaltar tu estilo?</h3>
                <p className="text-muted mb-4">Descubre todas nuestras colecciones de aros, collares y pulseras.</p>
                <Link to="/productos" className="btn btn-blog px-4 py-2 fw-semibold">
                    Ver Colección Completa
                </Link>
            </div>
        </main>
    );
}