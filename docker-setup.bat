@echo off
echo ============================================
echo   E-Commerce - Limpiando contenedores...
echo ============================================
docker-compose down -v
echo.
echo ============================================
echo   E-Commerce - Levantando infraestructura...
echo ============================================
docker-compose up -d
echo.
echo ============================================
echo   Esperando a que PostgreSQL este listo...
echo ============================================
timeout /t 15 /nobreak >nul
echo.
echo ============================================
echo   Creando bases de datos...
echo ============================================
call create-databases.bat
echo.
echo ============================================
echo   Infraestructura lista!
echo ============================================
pause
