@echo off
echo ============================================
echo   E-Commerce - Eliminando contenedor...
echo ============================================
docker rm -f postgres-db
echo.
echo ============================================
echo   Contenedor eliminado.
echo ============================================
pause
