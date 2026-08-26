@echo off
echo ============================================
echo   E-Commerce - Creando bases de datos...
echo ============================================
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE auth_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE products_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE inventory_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE cart_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE order_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE payment_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE shipping_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE notification_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE review_db;" 2>nul
docker exec -i postgres-db psql -U postgres -c "CREATE DATABASE analytics_db;" 2>nul
echo ============================================
echo   Bases de datos creadas exitosamente!
echo ============================================
pause
