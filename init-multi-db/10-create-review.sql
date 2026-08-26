\c review_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS reviews;

-- 2. TABLAS MAESTRAS
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  VARCHAR(50) NOT NULL,
    user_id     VARCHAR(100) NOT NULL,
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    activa      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id)
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
('COL-001', 'camila.rosa@gmail.com',         5, 'Hermoso collar, la estrella es delicada y brillante. Lo uso todos los días.'),
('COL-001', 'fernanda.diaz@gmail.com',       4, 'Muy bonito, el cierre es de buena calidad. Solo le falta un ajuste más.'),
('COL-002', 'valentina.lopez@hotmail.com',   5, 'Las perlas son preciosas, se ve elegante con todo. Súper recomendado.'),
('ARO-001', 'camila.rosa@gmail.com',         5, 'Aros ligeros, el baño de oro no se descascara. Perfectos para el día a día.'),
('ARO-002', 'isidora.munoz@outlook.com',     4, 'Los cristales brillan bastante, pero son algo pesados para uso prolongado.'),
('PUL-003', 'camila.rosa@gmail.com',         5, 'La pulsera de mariposa es mi favorita, delicada y con mucho brillo.'),
('ANI-001', 'valentina.lopez@hotmail.com',   4, 'Bonito anillo, la circonia brilla harto. Queda perfecto en mi mano.'),
('TOB-001', 'isidora.munoz@outlook.com',     5, 'La tobillera es super cute, el dije de corona es detallista y lindo.'),
('BRC-002', 'isidora.munoz@outlook.com',     4, 'Las horquillas son lindas y la perla se ve genuina. Buena calidad.'),
('COL-003', 'camila.rosa@gmail.com',         5, 'El rosa dorado es hermoso, muy femenino. Queda perfecto con mi outfit.'),
('ARO-003', 'catalina.reyes@gmail.com',      5, 'Los aros minimalistas son exactamente lo que buscaba. Elegantes y simples.'),
('PUL-001', 'fernanda.diaz@gmail.com',       4, 'La pulsera de nudos es colorida y resistente. Me encanta para el verano.'),
('ANI-003', 'valentina.lopez@hotmail.com',   5, 'El trío de dijes es perfecto para combinar. Muy original y delicado.');
