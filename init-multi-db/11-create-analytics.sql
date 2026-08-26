\c analytics_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS user_activities;
DROP TABLE IF EXISTS sales_records;

-- 2. TABLAS MAESTRAS
CREATE TABLE sales_records (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL,
    user_id       VARCHAR(100) NOT NULL,
    product_id    VARCHAR(50) NOT NULL,
    product_name  VARCHAR(200),
    category      VARCHAR(100),
    quantity      INT NOT NULL,
    amount        DECIMAL(12,2) NOT NULL,
    recorded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_activities (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       VARCHAR(100) NOT NULL,
    action        VARCHAR(30) NOT NULL CHECK (action IN ('VIEW','ADD_TO_CART','PURCHASE','REVIEW')),
    product_id    VARCHAR(50),
    details       TEXT,
    recorded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO sales_records (order_id, user_id, product_id, product_name, category, quantity, amount, recorded_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'camila.rosa@gmail.com',       'COL-001', 'Collar Estrella Plateado',   'Collares',   1, 19990, '2024-01-01 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'camila.rosa@gmail.com',       'ARO-001', 'Aros Aro Dorado Fino',       'Aros',       1, 14990, '2024-01-01 10:00:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'camila.rosa@gmail.com',       'PUL-003', 'Pulsera Charm Mariposa',     'Pulseras',   1, 19990, '2024-01-01 10:00:00'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'valentina.lopez@hotmail.com',  'COL-002', 'Collar Perlas Clasico',      'Collares',   1, 34990, '2024-01-02 09:15:00'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'valentina.lopez@hotmail.com',  'ANI-001', 'Anillo Solitario Plata',     'Anillos',    1, 15990, '2024-01-02 09:15:00'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'isidora.munoz@outlook.com',    'ARO-002', 'Aros Cascada Cristal',       'Aros',       1, 22990, '2024-01-03 11:30:00'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'isidora.munoz@outlook.com',    'TOB-001', 'Tobillera Dije Corona',      'Tobilleras', 1,  8990, '2024-01-03 11:30:00'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'isidora.munoz@outlook.com',    'BRC-002', 'Horquilla Perla Juego',      'Broches',    1,  6990, '2024-01-03 11:30:00');

INSERT INTO user_activities (user_id, action, product_id, details, recorded_at) VALUES
('camila.rosa@gmail.com',       'VIEW',        'COL-001', 'Vio collar estrella plateado',               '2024-01-01 09:00:00'),
('camila.rosa@gmail.com',       'ADD_TO_CART', 'COL-001', 'Agrego collar estrella al carrito',          '2024-01-01 09:05:00'),
('camila.rosa@gmail.com',       'PURCHASE',    'COL-001', 'Compro collar estrella plateado',            '2024-01-01 10:00:00'),
('camila.rosa@gmail.com',       'REVIEW',      'COL-001', 'Dejo resena 5 estrellas al collar',          '2024-01-08 15:00:00'),
('valentina.lopez@hotmail.com', 'VIEW',        'COL-002', 'Vio collar perlas clasico',                  '2024-01-02 08:00:00'),
('valentina.lopez@hotmail.com', 'ADD_TO_CART', 'COL-002', 'Agrego collar perlas al carrito',            '2024-01-02 08:30:00'),
('valentina.lopez@hotmail.com', 'PURCHASE',    'COL-002', 'Compro collar perlas clasico',               '2024-01-02 09:15:00'),
('isidora.munoz@outlook.com',   'VIEW',        'ARO-002', 'Vio aros cascada cristal',                   '2024-01-03 10:00:00'),
('isidora.munoz@outlook.com',   'PURCHASE',    'ARO-002', 'Compro aros cascada cristal',                '2024-01-03 11:30:00'),
('fernanda.diaz@gmail.com',     'VIEW',        'PUL-003', 'Vio pulsera charm mariposa',                 '2024-01-04 12:00:00'),
('fernanda.diaz@gmail.com',     'ADD_TO_CART', 'PUL-003', 'Agrego pulsera mariposa al carrito',         '2024-01-04 12:15:00'),
('catalina.reyes@gmail.com',    'VIEW',        'ARO-003', 'Vio aros perla minimalista',                 '2024-01-05 14:00:00');
