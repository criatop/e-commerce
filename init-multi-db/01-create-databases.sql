-- ES FUNDAMENTAL EJECUTAR ESTE SCRIPT QUE PERMITE CREAR LAS BASES DE DATOS
-- SOLO SI NO EXISTEN, PARA NO PERDER DATOS EXISTENTES

SELECT 'CREATE DATABASE auth_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db') \gexec

SELECT 'CREATE DATABASE products_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'products_db') \gexec

SELECT 'CREATE DATABASE inventory_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inventory_db') \gexec

SELECT 'CREATE DATABASE cart_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cart_db') \gexec

SELECT 'CREATE DATABASE order_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'order_db') \gexec

SELECT 'CREATE DATABASE payment_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payment_db') \gexec

SELECT 'CREATE DATABASE shipping_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'shipping_db') \gexec

SELECT 'CREATE DATABASE notification_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notification_db') \gexec

SELECT 'CREATE DATABASE review_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'review_db') \gexec

SELECT 'CREATE DATABASE analytics_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'analytics_db') \gexec
