-- ES FUNDAMENTAL EJECUTAR ESTE SCRIPT QUE PERMITE CREAR LAS BASES DE DATOS
-- SOLO SI NO EXISTEN, PARA NO PERDER DATOS EXISTENTES

SELECT 'CREATE DATABASE auth_db OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db') \gexec

SELECT 'CREATE DATABASE products_db OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'products_db') \gexec

SELECT 'CREATE DATABASE cart_db OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cart_db') \gexec

SELECT 'CREATE DATABASE order_db OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'order_db') \gexec

SELECT 'CREATE DATABASE payment_db OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payment_db') \gexec

SELECT 'CREATE DATABASE shipping_db OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'shipping_db') \gexec

SELECT 'CREATE DATABASE content_db OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'content_db') \gexec
