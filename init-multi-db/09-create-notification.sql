\c notification_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS notifications;

-- 2. TABLAS MAESTRAS
CREATE TABLE notifications (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo             VARCHAR(20) NOT NULL CHECK (tipo IN ('EMAIL','SMS','PUSH')),
    recipient_email  VARCHAR(150) NOT NULL,
    subject          VARCHAR(200) NOT NULL,
    body             TEXT NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','SENT','FAILED')),
    sent_at          TIMESTAMP,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO notifications (tipo, recipient_email, subject, body, status, sent_at) VALUES
('EMAIL', 'camila.rosa@gmail.com',       'Pedido confirmado #a1b2',          'Tu pedido de accesorios ha sido confirmado.',                                'SENT',     '2024-01-01 10:00:00'),
('EMAIL', 'camila.rosa@gmail.com',       'Pedido enviado #a1b2',             'Tu pedido va en camino con tracking SH-20240101-ABCD.',                       'SENT',     '2024-01-03 14:30:00'),
('EMAIL', 'camila.rosa@gmail.com',       'Pedido entregado #a1b2',           'Tu pedido ha sido entregado exitosamente.',                                   'SENT',     '2024-01-07 16:00:00'),
('EMAIL', 'valentina.lopez@hotmail.com', 'Pedido confirmado #b2c3',           'Tu pedido ha sido confirmado y esta en preparacion.',                         'SENT',     '2024-01-02 09:15:00'),
('SMS',   'valentina.lopez@hotmail.com', 'Codigo de verificacion',            'Tu codigo es: 4829. Valido por 5 minutos.',                                  'SENT',     '2024-01-02 09:10:00'),
('EMAIL', 'vendedora1@accesorioschic.cl','Stock bajo: Collar Perlas Clasico', 'El collar perlas esta bajo el umbral minimo de stock.',                       'SENT',     '2024-01-05 11:00:00'),
('PUSH',  'isidora.munoz@outlook.com',   'Nueva coleccion disponible!',       'Descubre nuestra nueva linea de aros de cristal.',                            'PENDING',  NULL),
('EMAIL', 'admin@accesorioschic.cl',     'Reporte diario de ventas',          'Resumen del dia: $169.910 en 5 pedidos de accesorios.',                      'SENT',     '2024-01-05 23:00:00'),
('EMAIL', 'fernanda.diaz@gmail.com',     'Bienvenida a Accesorios Chic!',    'Registrate y obtiene 10% de descuento en tu primera compra.',                'SENT',     '2024-01-06 08:00:00');
