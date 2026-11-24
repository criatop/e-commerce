@echo off
cd /d "%~dp0"

echo ========================================
echo   Parada portable E-Commerce
echo ========================================
echo.

echo Deteniendo contenedores (los datos se conservan)...
docker compose down
if %errorlevel% neq 0 (
  echo ERROR: fallo docker compose down.
  pause
  exit /b 1
)

echo.
echo Estado de los contenedores:
docker compose ps
echo.
pause
