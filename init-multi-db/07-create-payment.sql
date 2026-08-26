\c payment_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS payments;

-- 2. TABLAS MAESTRAS
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL,
    user_id         VARCHAR(100) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    method          VARCHAR(20) NOT NULL CHECK (method IN ('CREDIT_CARD','DEBIT_CARD','PAYPAL','TRANSFER','WEBPAY')),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','COMPLETED','FAILED','REFUNDED')),
    transaction_id  VARCHAR(100),
    card_last_four  VARCHAR(4),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO payments (order_id, user_id, amount, method, status, transaction_id, card_last_four) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cliente1@gmail.com',  1459970, 'CREDIT_CARD', 'COMPLETED', 'TXN-20240101-001', '4532'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'cliente2@hotmail.com', 188960, 'DEBIT_CARD',  'COMPLETED', 'TXN-20240102-002', '8721'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'cliente3@outlook.com', 1499990, 'PAYPAL',      'COMPLETED', 'TXN-20240103-003', NULL),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'cliente1@gmail.com',    29990, 'TRANSFER',    'COMPLETED', 'TXN-20240104-004', NULL),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'cliente2@hotmail.com', 899990, 'CREDIT_CARD', 'PENDING',   NULL,                '3345');
