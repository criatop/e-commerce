function mostrarNoticias(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const noticias = [
        {
            categoria: "Tendencias",
            titulo: "Guía de Tendencias: Accesorios de Primavera",
            resumen: "Conoce los tonos y materiales que marcarán la temporada. Desde piezas minimalistas hasta combinaciones audaces.",
            enlace: "/blog"
        },
        {
            categoria: "Tips & Cuidado",
            titulo: "Cómo Cuidar tus Joyas para que Cuenten Historias",
            resumen: "Consejos prácticos para limpiar y almacenar tus accesorios favoritos evitando el desgaste del día a día.",
            enlace: "/blog"
        }
    ];

    let html = "";
    for (let i = 0; i < noticias.length; i++) {
        const item = noticias[i];
        html += '<div class="col-12 col-md-6 mb-4">' +
            '<div class="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column justify-content-between">' +
                '<div class="card-body p-0 d-flex flex-column">' +
                    '<div class="mb-2">' +
                        '<span class="badge rounded-pill px-3 py-2 fw-semibold" style="background-color: #fce4ec; color: #d81b60;">' + item.categoria + '</span>' +
                    '</div>' +
                    '<h4 class="card-title fw-bold text-dark mt-2 mb-3 fs-5">' + item.titulo + '</h4>' +
                    '<p class="card-text text-muted mb-4 small">' + item.resumen + '</p>' +
                '</div>' +
                '<div>' +
                    '<a href="' + item.enlace + '" class="btn w-100 py-2 rounded-3 text-white fw-semibold" style="background-color: #e91e63;">Leer más</a>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    contenedor.innerHTML = html;
}