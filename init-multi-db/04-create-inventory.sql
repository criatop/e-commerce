\c inventory_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS inventory_reservations;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS inventory_items;

-- 2. TABLAS MAESTRAS
CREATE TABLE inventory_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          VARCHAR(50) UNIQUE NOT NULL,
    product_name        VARCHAR(200) NOT NULL,
    quantity            INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity   INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 10,
    warehouse_location  VARCHAR(100),
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_reservations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    VARCHAR(100) NOT NULL,
    product_id  VARCHAR(50) NOT NULL,
    quantity    INT NOT NULL DEFAULT 0,
    status      VARCHAR(20) NOT NULL DEFAULT 'RESERVED'
                CHECK (status IN ('RESERVED', 'CONSUMED', 'RELEASED')),
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at  TIMESTAMP
);

CREATE TABLE stock_movements (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id   UUID REFERENCES inventory_items(id),
    tipo           VARCHAR(20) NOT NULL CHECK (tipo IN ('IN', 'OUT', 'RESERVE', 'RELEASE')),
    quantity       INT NOT NULL,
    reference      VARCHAR(100),
    motivo         VARCHAR(200),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO inventory_items (product_id, product_name, quantity, reserved_quantity, low_stock_threshold, warehouse_location) VALUES
('COL-001', 'Collar Estrella Plateado',       80,   0,  10, 'Bodega A - Fila 1'),
('COL-002', 'Collar Perlas Clásico',          35,   0,   5, 'Bodega A - Fila 1'),
('COL-003', 'Collar Corazón Rosa',            60,   0,  10, 'Bodega A - Fila 1'),
('COL-004', 'Collar Lobo Plata',              45,   0,   5, 'Bodega A - Fila 1'),
('ARO-001', 'Aros Aro Dorado Fino',          120,   0,  15, 'Bodega A - Fila 2'),
('ARO-002', 'Aros Cascada Cristal',           50,   0,  10, 'Bodega A - Fila 2'),
('ARO-003', 'Aros Perla Minimalista',         90,   0,  10, 'Bodega A - Fila 2'),
('ARO-004', 'Aros Crescent Luna',             70,   0,  10, 'Bodega A - Fila 2'),
('PUL-001', 'Pulsera Nudos Amor',            150,   0,  15, 'Bodega B - Fila 1'),
('PUL-002', 'Pulsera Cadena Eslabón',         65,   0,  10, 'Bodega B - Fila 1'),
('PUL-003', 'Pulsera Charm Mariposa',         40,   0,   5, 'Bodega B - Fila 1'),
('PUL-004', 'Pulsera Manta Raya',            100,   0,  10, 'Bodega B - Fila 1'),
('ANI-001', 'Anillo Solitario Plata',         55,   0,  10, 'Bodega B - Fila 2'),
('ANI-002', 'Anillo Ajustable Floral',        85,   0,  10, 'Bodega B - Fila 2'),
('ANI-003', 'Anillo Trio Dije',               30,   0,   5, 'Bodega B - Fila 2'),
('ANI-004', 'Anillo Midi Sol',                75,   0,  10, 'Bodega B - Fila 2'),
('TOB-001', 'Tobillera Dije Corona',         110,   0,  15, 'Bodega C - Fila 1'),
('TOB-002', 'Tobillera Plata Concha',         60,   0,  10, 'Bodega C - Fila 1'),
('BRC-001', 'Broche Floral Rosa Gold',        95,   0,  10, 'Bodega C - Fila 2'),
('BRC-002', 'Horquilla Perla Juego',         200,   0,  20, 'Bodega C - Fila 2');

INSERT INTO stock_movements (inventory_id, tipo, quantity, reference, motivo) VALUES
((SELECT id FROM inventory_items WHERE product_id = 'COL-001'), 'IN',      100, 'COMPRA-001',  'Compra inicial collares estrella'),
((SELECT id FROM inventory_items WHERE product_id = 'COL-001'), 'OUT',     20,  'ORDER-1001',  'Despacho pedido #1001'),
((SELECT id FROM inventory_items WHERE product_id = 'ARO-001'), 'IN',      150, 'COMPRA-002',  'Restock aros dorados'),
((SELECT id FROM inventory_items WHERE product_id = 'PUL-001'), 'RESERVE', 3,   'ORDER-1002',  'Reserva pulseras para pedido #1002'),
((SELECT id FROM inventory_items WHERE product_id = 'COL-002'), 'OUT',     5,   'ORDER-1003',  'Despacho collar perlas'),
((SELECT id FROM inventory_items WHERE product_id = 'ANI-001'), 'IN',      80,  'COMPRA-003',  'Compra anillos solitario'),
((SELECT id FROM inventory_items WHERE product_id = 'TOB-001'), 'OUT',     10,  'ORDER-1004',  'Despacho tobilleras corona'),
((SELECT id FROM inventory_items WHERE product_id = 'BRC-002'), 'RELEASE', 2,   'ORDER-1005',  'Liberación por cancelación');
