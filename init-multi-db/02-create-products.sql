\c products_db;

-- 1. ELIMINACIÓN
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- 2. TABLAS MAESTRAS
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    activa      BOOLEAN DEFAULT TRUE
);

CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    price               DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    category_id         UUID REFERENCES categories(id),
    sku                 VARCHAR(50) UNIQUE NOT NULL,
    imagen_url          VARCHAR(500),
    activo              BOOLEAN DEFAULT TRUE,
    stock_quantity      INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserved_quantity   INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_reserved_le_stock CHECK (reserved_quantity <= stock_quantity)
);

CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url        VARCHAR(500) NOT NULL,
    principal  BOOLEAN DEFAULT FALSE,
    orden      INT DEFAULT 0
);


CREATE TABLE favorites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    VARCHAR(100) NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_favorites_user_product UNIQUE (user_id, product_id)
);
-- 3. INSERCIÓN DE DATOS
INSERT INTO categories (name, description) VALUES
('Collares',    'Collares, gargantillas y cadenas'),
('Aros',        'Aros de acero, oro y plata'),
('Pulseras',    'Pulseras, bangals y brazaletes'),
('Anillos',     'Anillos de compromiso, alianzas y moda'),
('Tobilleras',  'Tobilleras delicadas y con dijes'),
('Broches',     'Broches, pasadores y horquillas');

INSERT INTO products (name, description, price, category_id, sku, imagen_url, stock_quantity) VALUES
('Collar Estrella Plateado',       'Collar de plata 925 con dije de estrella',              19990,  (SELECT id FROM categories WHERE name = 'Collares'),   'COL-001', '/img/productos/collar1.jpg', 25),
('Collar Perlas Clásico',          'Collar de perlas cultivadas con cierre dorado',         34990,  (SELECT id FROM categories WHERE name = 'Collares'),   'COL-002', '/img/productos/collar2.jpg',   12),
('Collar Corazón Rosa',            'Collar baño de oro rosa con dije de corazón',           24990,  (SELECT id FROM categories WHERE name = 'Collares'),   'COL-003', '/img/productos/collar3.jpg',  3),
('Aros Aro Dorado Fino',           'Aros circulares baño de oro 18k, pair elegante',        14990,  (SELECT id FROM categories WHERE name = 'Aros'),       'ARO-001', '/img/productos/aros1.jpg',    40),
('Aros Cascada Cristal',           'Aros colgantes con cristales Swarovski',                22990,  (SELECT id FROM categories WHERE name = 'Aros'),       'ARO-002', '/img/productos/diadema5.jpg',    0),
('Aros Perla Minimalista',         'Aros de perla sobre botón, estilo scandinavo',          12990,  (SELECT id FROM categories WHERE name = 'Aros'),       'ARO-003', '/img/productos/collar2.jpg',      8),
('Pulsera Nudos Amor',            'Pulsera trenzada de hilo encerado con nudo',             9990,   (SELECT id FROM categories WHERE name = 'Pulseras'),   'PUL-001', '/img/productos/pulsera.jpg',   15),
('Pulsera Cadena Eslabón',        'Pulsera de acero quirúrgico baño oro',                  17990,  (SELECT id FROM categories WHERE name = 'Pulseras'),   'PUL-002', '/img/productos/pulsera2.jpg', 6),
('Pulsera Charm Mariposa',        'Pulsera con dije mariposa y cristales',                 19990,  (SELECT id FROM categories WHERE name = 'Pulseras'),   'PUL-003', '/img/productos/pulsera3.jpg', 2),
('Anillo Solitario Plata',        'Anillo solitario plata 925 con circonia',               15990,  (SELECT id FROM categories WHERE name = 'Anillos'),    'ANI-001', '/img/productos/collar4.jpg', 9),
('Anillo Ajustable Floral',       'Anillo ajustable con diseño de flores grabadas',         11990,  (SELECT id FROM categories WHERE name = 'Anillos'),    'ANI-002', '/img/productos/aros1.jpg',   20),
('Anillo Trio Dije',              'Anillo triple con dijes luna, estrella y sol',           21990,  (SELECT id FROM categories WHERE name = 'Anillos'),    'ANI-003', '/img/productos/collar3.jpg',      4),
('Tobillera Dije Corona',         'Tobillera delicada con pequeño dije de corona',         8990,   (SELECT id FROM categories WHERE name = 'Tobilleras'), 'TOB-001', '/img/productos/pulsera5.jpg', 11),
('Tobillera Plata Concha',        'Tobillera de plata con dije concha marina',             10990,  (SELECT id FROM categories WHERE name = 'Tobilleras'), 'TOB-002', '/img/productos/llavero1.jpg', 1),
('Broche Floral Rosa Gold',       'Broche de rosa en baño de oro para cabello',            7990,   (SELECT id FROM categories WHERE name = 'Broches'),    'BRC-001', '/img/productos/diadema2.jpeg',      18),
('Horquilla Perla Juego',         'Juego de 4 horquillas con perla y cristal',             6990,   (SELECT id FROM categories WHERE name = 'Broches'),    'BRC-002', '/img/productos/diadema4.jpeg',  30),
('Collar Lobo Plata',             'Collar capa doble plata 925 con dije lobo',             27990,  (SELECT id FROM categories WHERE name = 'Collares'),   'COL-004', '/img/productos/collar4.jpg',       5),
('Aros Crescent Luna',            'Aros media luna invertida baño oro rosa',               16990,  (SELECT id FROM categories WHERE name = 'Aros'),       'ARO-004', '/img/productos/pulsera4.jpg',         7),
('Pulsera Manta Raya',            'Pulsera tejida a mano con cierre de plata',             7990,   (SELECT id FROM categories WHERE name = 'Pulseras'),   'PUL-004', '/img/productos/pulsera4.jpg',     2),
('Anillo Midi Sol',               'Anillo midi baño oro con sol grabado',                  8990,   (SELECT id FROM categories WHERE name = 'Anillos'),    'ANI-004', '/img/productos/pulsera2.jpg',       14);

INSERT INTO product_images (product_id, url, principal, orden) VALUES
((SELECT id FROM products WHERE sku = 'COL-001'), '/img/productos/collar1.jpg',  TRUE,  1),
((SELECT id FROM products WHERE sku = 'COL-001'), '/img/productos/collar1.jpg',  FALSE, 2),
((SELECT id FROM products WHERE sku = 'COL-002'), '/img/productos/collar1.jpg',    TRUE,  1),
((SELECT id FROM products WHERE sku = 'ARO-001'), '/img/productos/collar1.jpg',     TRUE,  1),
((SELECT id FROM products WHERE sku = 'ARO-002'), '/img/productos/collar1.jpg',     TRUE,  1),
((SELECT id FROM products WHERE sku = 'PUL-001'), '/img/productos/collar1.jpg',    TRUE,  1),
((SELECT id FROM products WHERE sku = 'ANI-001'), '/img/productos/collar1.jpg', TRUE,  1),
((SELECT id FROM products WHERE sku = 'TOB-001'), '/img/productos/collar1.jpg', TRUE,  1);
