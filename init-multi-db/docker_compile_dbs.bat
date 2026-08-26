@echo off
echo ============================================
echo   E-Commerce - Creando bases de datos...
echo ============================================
docker exec -i postgres-db psql -U postgres -d postgres < 01-create-databases.sql
echo.
echo ============================================
echo   Bases de datos creadas exitosamente!
echo ============================================
pause
