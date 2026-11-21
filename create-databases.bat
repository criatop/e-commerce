@echo off
echo ============================================
echo   E-Commerce - Creando bases de datos...
echo ============================================
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE auth_db OWNER postgres;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE products_db OWNER postgres;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE cart_db OWNER postgres;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE order_db OWNER postgres;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE payment_db OWNER postgres;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE shipping_db OWNER postgres;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE content_db OWNER postgres;" 2>nul
echo ============================================
echo   Bases de datos creadas exitosamente!
echo ============================================
pause
