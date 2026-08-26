@echo off
echo ============================================
echo   E-Commerce - Instalando PostgreSQL...
echo ============================================
docker run --name postgres-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=123 -e POSTGRES_DB=postgres -p 5433:5432 -d postgres:15-alpine
echo.
echo ============================================
echo   PostgreSQL instalado en puerto 5433
echo ============================================
pause
