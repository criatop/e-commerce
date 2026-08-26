\c shipping_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS shipments;

-- 2. TABLAS MAESTRAS
CREATE TABLE shipments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL,
    user_id             VARCHAR(100) NOT NULL,
    address             TEXT NOT NULL,
    city                VARCHAR(100) NOT NULL,
    postal_code         VARCHAR(20),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','IN_TRANSIT','DELIVERED','RETURNED')),
    tracking_number     VARCHAR(50) UNIQUE,
    carrier             VARCHAR(50),
    estimated_delivery  DATE,
    actual_delivery     DATE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO shipments (order_id, user_id, address, city, postal_code, status, tracking_number, carrier, estimated_delivery, actual_delivery) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cliente1@gmail.com',  'Av. Libertador 1234',      'Santiago',   '8320000', 'DELIVERED',  'SH-20240101-ABCD', 'Chilexpress', '2024-01-08', '2024-01-07'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'cliente2@hotmail.com', 'Calle Los Robles 567',     'Providencia','7500000', 'IN_TRANSIT', 'SH-20240102-EFGH', 'Starken',     '2024-01-12', NULL),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'cliente3@outlook.com', 'Pasaje El Sol 890',        'Las Condes', '7550000', 'PENDING',    'SH-20240103-IJKL', 'Correos',     '2024-01-15', NULL),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'cliente1@gmail.com',  'Av. Libertador 1234',      'Santiago',   '8320000', 'PENDING',    NULL,                NULL,          '2024-01-20', NULL);
