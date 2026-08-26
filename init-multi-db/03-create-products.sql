\c products_db;

-- 1. ELIMINACIÓN
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
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    price       DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    category_id UUID REFERENCES categories(id),
    sku         VARCHAR(50) UNIQUE NOT NULL,
    imagen_url  VARCHAR(500),
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url        VARCHAR(500) NOT NULL,
    principal  BOOLEAN DEFAULT FALSE,
    orden      INT DEFAULT 0
);

-- 3. INSERCIÓN DE DATOS
INSERT INTO categories (name, description) VALUES
('Collares',    'Collares, gargantillas y cadenas'),
('Aros',        'Aros de acero, oro y plata'),
('Pulseras',    'Pulseras, bangals y brazaletes'),
('Anillos',     'Anillos de compromiso, alianzas y moda'),
('Tobilleras',  'Tobilleras delicadas y con dijes'),
('Broches',     'Broches, pasadores y horquillas');

INSERT INTO products (name, description, price, category_id, sku, imagen_url) VALUES
('Collar Estrella Plateado',       'Collar de plata 925 con dije de estrella',              19990,  (SELECT id FROM categories WHERE name = 'Collares'),   'COL-001', 'https://img.tienda/collar-estrella.jpg'),
('Collar Perlas Clásico',          'Collar de perlas cultivadas con cierre dorado',         34990,  (SELECT id FROM categories WHERE name = 'Collares'),   'COL-002', 'https://img.tienda/collar-perlas.jpg'),
('Collar Corazón Rosa',            'Collar baño de oro rosa con dije de corazón',           24990,  (SELECT id FROM categories WHERE name = 'Collares'),   'COL-003', 'https://img.tienda/collar-corazon.jpg'),
('Aros Aro Dorado Fino',           'Aros circulares baño de oro 18k, pair elegante',        14990,  (SELECT id FROM categories WHERE name = 'Aros'),       'ARO-001', 'https://img.tienda/aros-dorados.jpg'),
('Aros Cascada Cristal',           'Aros colgantes con cristales Swarovski',                22990,  (SELECT id FROM categories WHERE name = 'Aros'),       'ARO-002', 'https://img.tienda/aros-cascada.jpg'),
('Aros Perla Minimalista',         'Aros de perla sobre botón, estilo scandinavo',          12990,  (SELECT id FROM categories WHERE name = 'Aros'),       'ARO-003', 'https://img.tienda/aros-perla.jpg'),
('Pulsera Nudos Amor',            'Pulsera trenzada de hilo encerado con nudo',             9990,   (SELECT id FROM categories WHERE name = 'Pulseras'),   'PUL-001', 'https://img.tienda/pulsera-nudos.jpg'),
('Pulsera Cadena Eslabón',        'Pulsera de acero quirúrgico baño oro',                  17990,  (SELECT id FROM categories WHERE name = 'Pulseras'),   'PUL-002', 'https://img.tienda/pulsera-eslabon.jpg'),
('Pulsera Charm Mariposa',        'Pulsera con dije mariposa y cristales',                 19990,  (SELECT id FROM categories WHERE name = 'Pulseras'),   'PUL-003', 'https://img.tienda/pulsera-mariposa.jpg'),
('Anillo Solitario Plata',        'Anillo solitario plata 925 con circonia',               15990,  (SELECT id FROM categories WHERE name = 'Anillos'),    'ANI-001', 'https://img.tienda/anillo-solitario.jpg'),
('Anillo Ajustable Floral',       'Anillo ajustable con diseño de flores grabadas',         11990,  (SELECT id FROM categories WHERE name = 'Anillos'),    'ANI-002', 'https://img.tienda/anillo-floral.jpg'),
('Anillo Trio Dije',              'Anillo triple con dijes luna, estrella y sol',           21990,  (SELECT id FROM categories WHERE name = 'Anillos'),    'ANI-003', 'https://img.tienda/anillo-trio.jpg'),
('Tobillera Dije Corona',         'Tobillera delicada con pequeño dije de corona',         8990,   (SELECT id FROM categories WHERE name = 'Tobilleras'), 'TOB-001', 'https://img.tienda/tobillera-corona.jpg'),
('Tobillera Plata Concha',        'Tobillera de plata con dije concha marina',             10990,  (SELECT id FROM categories WHERE name = 'Tobilleras'), 'TOB-002', 'https://img.tienda/tobillera-concha.jpg'),
('Broche Floral Rosa Gold',       'Broche de rosa en baño de oro para cabello',            7990,   (SELECT id FROM categories WHERE name = 'Broches'),    'BRC-001', 'https://img.tienda/broche-rosa.jpg'),
('Horquilla Perla Juego',         'Juego de 4 horquillas con perla y cristal',             6990,   (SELECT id FROM categories WHERE name = 'Broches'),    'BRC-002', 'https://img.tienda/horquilla-perla.jpg'),
('Collar Lobo Plata',             'Collar capa doble plata 925 con dije lobo',             27990,  (SELECT id FROM categories WHERE name = 'Collares'),   'COL-004', 'https://img.tienda/collar-lobo.jpg'),
('Aros Crescent Luna',            'Aros media luna invertida baño oro rosa',               16990,  (SELECT id FROM categories WHERE name = 'Aros'),       'ARO-004', 'https://img.tienda/aros-luna.jpg'),
('Pulsera Manta Raya',            'Pulsera tejida a mano con cierre de plata',             7990,   (SELECT id FROM categories WHERE name = 'Pulseras'),   'PUL-004', 'https://img.tienda/pulsera-manta.jpg'),
('Anillo Midi Sol',               'Anillo midi baño oro con sol grabado',                  8990,   (SELECT id FROM categories WHERE name = 'Anillos'),    'ANI-004', 'https://img.tienda/anillo-midi.jpg');

INSERT INTO product_images (product_id, url, principal, orden) VALUES
((SELECT id FROM products WHERE sku = 'COL-001'), 'https://img.tienda/collar-estrella-1.jpg',  TRUE,  1),
((SELECT id FROM products WHERE sku = 'COL-001'), 'https://img.tienda/collar-estrella-2.jpg',  FALSE, 2),
((SELECT id FROM products WHERE sku = 'COL-002'), 'https://img.tienda/collar-perlas-1.jpg',    TRUE,  1),
((SELECT id FROM products WHERE sku = 'ARO-001'), 'https://img.tienda/aros-dorados-1.jpg',     TRUE,  1),
((SELECT id FROM products WHERE sku = 'ARO-002'), 'https://img.tienda/aros-cascada-1.jpg',     TRUE,  1),
((SELECT id FROM products WHERE sku = 'PUL-001'), 'https://img.tienda/pulsera-nudos-1.jpg',    TRUE,  1),
((SELECT id FROM products WHERE sku = 'ANI-001'), 'https://img.tienda/anillo-solitario-1.jpg', TRUE,  1),
((SELECT id FROM products WHERE sku = 'TOB-001'), 'https://img.tienda/tobillera-corona-1.jpg', TRUE,  1);
