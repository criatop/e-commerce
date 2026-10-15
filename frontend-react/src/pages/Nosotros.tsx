export default function Nosotros() {
    return (
        <main className="container my-5 nosotros-container">
            <div className="text-center mb-5">
                <h1 className="fw-bold display-5 titulo-nosotros">Sobre Nosotros</h1>
                <p className="lead text-muted">
                    Conoce la historia y el corazón detrás de Pink &amp; Pink.
                </p>
            </div>
            <div className="row justify-content-center mb-5">
                <div className="col-lg-8 text-center p-4 rounded shadow-sm caja-historia">
                    <h2 className="fw-bold mb-3 subtitulo-nosotros">Nuestra Historia</h2>
                    <p className="text-secondary fs-5 mb-3">
                        Pink &amp; Pink nació de la pasión por los accesorios únicos y con estilo. Nos
                        dedicamos a seleccionar y diseñar piezas que resalten la personalidad de cada
                        persona, combinando elegancia, tendencia y la mejor calidad.
                    </p>
                    <p className="text-secondary fs-6 mb-0">
                        Creemos que cada detalle cuenta y que un buen accesorio tiene el poder de
                        transformar por completo tu día y tu estilo.
                    </p>
                </div>
            </div>
            <div className="text-center my-4">
                <h2 className="fw-bold subtitulo-nosotros">Fundadora &amp; Creadora</h2>
                <p className="text-muted">
                    La mente creativa detrás del catálogo y el concepto de la marca.
                </p>
            </div>
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="card border-0 shadow-sm text-center p-4 card-equipo">
                        <div className="card-body">
                            <div className="mb-3">
                                <i className="bi bi-person-heart display-2 icon-equipo" />
                            </div>
                            <h4 className="card-title fw-bold">Creadora de la Empresa</h4>
                            <span className="badge rounded-pill mb-3 badge-rol">

                                Fundadora &amp; Diseñadora
                            </span>
                            <p className="card-text text-muted">
                                Apasionada por la moda y los detalles únicos. Encargada de la selección de
                                productos, la visión de marca y la experiencia de los clientes en Pink &amp;
                                Pink.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}