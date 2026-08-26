@echo off
echo ============================================
echo   Compilando proyecto padre...
echo ============================================
call mvnw clean install -DskipTests
echo.
echo ============================================
echo   Levantando Eureka Server...
echo ============================================
start "Eureka Server" cmd /c "cd eureka && ..\mvnw spring-boot:run"
timeout /t 30 /nobreak >nul
echo.
echo ============================================
echo   Levantando API Gateway...
echo ============================================
start "API Gateway" cmd /c "cd api-gateway && ..\mvnw spring-boot:run"
timeout /t 10 /nobreak >nul
echo.
echo ============================================
echo   Levantando microservicios...
echo ============================================
start "MS Auth" cmd /c "cd ms-auth && ..\mvnw spring-boot:run"
start "MS Product" cmd /c "cd ms-product && ..\mvnw spring-boot:run"
start "MS Inventory" cmd /c "cd ms-inventory && ..\mvnw spring-boot:run"
start "MS Cart" cmd /c "cd ms-cart && ..\mvnw spring-boot:run"
start "MS Order" cmd /c "cd ms-order && ..\mvnw spring-boot:run"
start "MS Payment" cmd /c "cd ms-payment && ..\mvnw spring-boot:run"
start "MS Shipping" cmd /c "cd ms-shipping && ..\mvnw spring-boot:run"
start "MS Notification" cmd /c "cd ms-notification && ..\mvnw spring-boot:run"
start "MS Review" cmd /c "cd ms-review && ..\mvnw spring-boot:run"
start "MS Analytics" cmd /c "cd ms-analytics && ..\mvnw spring-boot:run"
echo.
echo ============================================
echo   Todos los servicios iniciados!
echo   Eureka: http://localhost:8761
echo   Gateway: http://localhost:9000
echo ============================================
pause
