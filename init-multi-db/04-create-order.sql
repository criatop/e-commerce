\c order_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

-- 2. TABLAS MAESTRAS
CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           VARCHAR(100) NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','CONFIRMED','PAID','SHIPPED','DELIVERED','CANCELLED')),
    total_amount      DECIMAL(12,2) NOT NULL,
    shipping_address  TEXT NOT NULL,
    shipping_city     VARCHAR(100),
    shipping_postal   VARCHAR(20),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   VARCHAR(50) NOT NULL,
    product_name VARCHAR(200),
    price        DECIMAL(12,2) NOT NULL,
    quantity     INT NOT NULL CHECK (quantity > 0)
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO orders (id, user_id, status, total_amount, shipping_address, shipping_city, shipping_postal) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'camila.rosa@gmail.com',       'DELIVERED',  54970, 'Av. Apoquindo 3420',         'Las Condes', '7550001'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'valentina.lopez@hotmail.com',  'SHIPPED',    50980, 'Calle Santa María 1234',      'Providencia','7500002'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'isidora.munoz@outlook.com',    'PAID',       38970, 'Pasaje Los Aromos 567',       'Ñuñoa',     '7700003'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'camila.rosa@gmail.com',       'CONFIRMED',  24990, 'Av. Apoquindo 3420',         'Las Condes', '7550001'),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'valentina.lopez@hotmail.com',  'PENDING',    34990, 'Calle Santa María 1234',      'Providencia','7500002');

INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'COL-001', 'Collar Estrella Plateado',    19990, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ARO-001', 'Aros Aro Dorado Fino',        14990, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PUL-003', 'Pulsera Charm Mariposa',      19990, 1),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'COL-002', 'Collar Perlas Clásico',       34990, 1),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'ANI-001', 'Anillo Solitario Plata',      15990, 1),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'ARO-002', 'Aros Cascada Cristal',        22990, 1),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'TOB-001', 'Tobillera Dije Corona',        8990, 1),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'BRC-002', 'Horquilla Perla Juego',        6990, 1),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'COL-003', 'Collar Corazón Rosa',         24990, 1),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'COL-002', 'Collar Perlas Clásico',       34990, 1);
