\c auth_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- 2. TABLAS MAESTRAS
CREATE TABLE roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL CHECK (name IN ('ADMIN', 'SELLER', 'CUSTOMER'))
);

CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    nombre     VARCHAR(100) NOT NULL,
    role_id    INT REFERENCES roles(id),
    activo     BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
    id         SERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(id),
    accion     VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO roles (name) VALUES ('ADMIN'), ('SELLER'), ('CUSTOMER');

INSERT INTO users (email, password, nombre, role_id) VALUES
('admin@accesorioschic.cl',    '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Francisca Admin',       1),
('vendedora1@accesorioschic.cl','$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Javiera Ventas',        2),
('vendedora2@accesorioschic.cl','$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Constanza Comercio',    2),
('camila.rosa@gmail.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Camila Rosales',        3),
('valentina.lopez@hotmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Valentina López',       3),
('isidora.munoz@outlook.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Isidora Muñoz',         3),
('fernanda.diaz@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Fernanda Díaz',         3),
('catalina.reyes@gmail.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Catalina Reyes',        3),
('cdcc@accesorioschic.cl',      '$2a$10$m6yuUQQUFF2Y/awkEv3dEeYwVXipgt5fBOXU3K6B.YOhjeQOFj.ba', 'Admin CDC',            1),
('cliente1@accesorioschic.cl',  '$2a$10$P.SptCP3wHbJopS/S0qN2OzN58UTGWskmw3/SWtE4HvyP694EGqVK', 'Cliente Prueba',       3);

INSERT INTO audit_log (user_id, accion, ip_address) VALUES
(1, 'LOGIN',           '192.168.1.10'),
(4, 'LOGIN',           '192.168.1.20'),
(4, 'CREATE_ORDER',    '192.168.1.20'),
(5, 'LOGIN',           '10.0.0.5'),
(2, 'UPDATE_PRODUCT',  '172.16.0.1'),
(6, 'LOGIN',           '10.0.0.15'),
(7, 'ADD_TO_CART',     '192.168.1.30'),
(3, 'LOGIN',           '172.16.0.2');
