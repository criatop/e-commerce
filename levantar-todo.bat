@echo off
cd /d "%~dp0"

echo ========================================
echo   Arranque portable E-Commerce
echo ========================================
echo.

where docker >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Docker no esta instalado o no esta en el PATH.
  pause
  exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Docker Desktop no esta corriendo. Inicialo y vuelve a intentar.
  pause
  exit /b 1
)

java -version >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: JDK 21 no esta instalado o no esta en el PATH.
  pause
  exit /b 1
)

echo Compilando los JARs de los microservicios...
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 (
  echo ERROR: fallo la compilacion con Maven.
  pause
  exit /b 1
)

echo.
echo Levantando contenedores (sin borrar datos)...
docker compose up -d --build
if %errorlevel% neq 0 (
  echo ERROR: fallo docker compose up.
  pause
  exit /b 1
)

echo.
echo Estado de los contenedores:
docker compose ps
echo.
echo Listo. Abriendo http://localhost:5173
start "" http://localhost:5173
pause
