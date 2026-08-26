@echo off
echo ============================================
echo   Deteniendo todos los servicios...
echo ============================================
taskkill /FI "WINDOWTITLE eq Eureka Server*" /F 2>nul
taskkill /FI "WINDOWTITLE eq API Gateway*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Auth*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Product*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Inventory*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Cart*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Order*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Payment*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Shipping*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Notification*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Review*" /F 2>nul
taskkill /FI "WINDOWTITLE eq MS Analytics*" /F 2>nul
echo.
echo ============================================
echo   Todos los servicios detenidos.
echo ============================================
pause
