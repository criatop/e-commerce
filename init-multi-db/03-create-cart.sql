\c cart_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;

-- 2. TABLAS MAESTRAS
CREATE TABLE carts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id      UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id   VARCHAR(50) NOT NULL,
    product_name VARCHAR(200),
    price        DECIMAL(12,2) NOT NULL,
    quantity     INT NOT NULL CHECK (quantity > 0)
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO carts (user_id) VALUES
('camila.rosa@gmail.com'),
('valentina.lopez@hotmail.com'),
('isidora.munoz@outlook.com');

INSERT INTO cart_items (cart_id, product_id, product_name, price, quantity) VALUES
-- Carrito de Camila
((SELECT id FROM carts WHERE user_id = 'camila.rosa@gmail.com'),     'COL-001', 'Collar Estrella Plateado',    19990, 1),
((SELECT id FROM carts WHERE user_id = 'camila.rosa@gmail.com'),     'ARO-001', 'Aros Aro Dorado Fino',        14990, 1),
((SELECT id FROM carts WHERE user_id = 'camila.rosa@gmail.com'),     'PUL-003', 'Pulsera Charm Mariposa',      19990, 2),
-- Carrito de Valentina
((SELECT id FROM carts WHERE user_id = 'valentina.lopez@hotmail.com'), 'COL-002', 'Collar Perlas Clásico',      34990, 1),
((SELECT id FROM carts WHERE user_id = 'valentina.lopez@hotmail.com'), 'ANI-001', 'Anillo Solitario Plata',     15990, 1),
-- Carrito de Isidora
((SELECT id FROM carts WHERE user_id = 'isidora.munoz@outlook.com'), 'ARO-002', 'Aros Cascada Cristal',        22990, 1),
((SELECT id FROM carts WHERE user_id = 'isidora.munoz@outlook.com'), 'TOB-001', 'Tobillera Dije Corona',        8990, 1),
((SELECT id FROM carts WHERE user_id = 'isidora.munoz@outlook.com'), 'BRC-002', 'Horquilla Perla Juego',        6990, 1);
