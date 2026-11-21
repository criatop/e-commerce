\c order_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP SEQUENCE IF EXISTS order_folio_seq;

-- 2. SECUENCIA FOLIO
CREATE SEQUENCE order_folio_seq START 1;

-- 3. TABLAS MAESTRAS
CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio             VARCHAR(30) UNIQUE NOT NULL,
    user_id           VARCHAR(100) NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','CONFIRMED','PAID','SHIPPED','DELIVERED','CANCELLED')),
    total_amount      DECIMAL(12,2) NOT NULL,
    subtotal_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_address  TEXT NOT NULL,
    shipping_city     VARCHAR(100),
    shipping_postal   VARCHAR(20),
    recipient_name    VARCHAR(200),
    recipient_rut     VARCHAR(30),
    recipient_email   VARCHAR(200),
    recipient_phone   VARCHAR(50),
    notes             TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   UUID NOT NULL,
    sku          VARCHAR(50),
    product_name VARCHAR(200),
    unit_price   DECIMAL(12,2) NOT NULL,
    quantity     INT NOT NULL CHECK (quantity > 0),
    line_total   DECIMAL(12,2) NOT NULL
);

-- 4. DATOS DE PRUEBA (folio placeholder)
INSERT INTO orders (id, folio, user_id, status, total_amount, subtotal_amount, shipping_address, shipping_city, shipping_postal, recipient_name, recipient_email)
VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CH-20261118-000001', 'camila.rosa@gmail.com', 'DELIVERED', 54970, 54970, 'Av. Apoquindo 3420', 'Las Condes', '7550001', 'Camila Rosa', 'camila.rosa@gmail.com');

INSERT INTO order_items (order_id, product_id, sku, product_name, unit_price, quantity, line_total) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'COL-001', 'Collar Estrella Plateado', 19990, 1, 19990);
