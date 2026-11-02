@echo off
echo ========================================================
echo Launching Flix Recommendation Engine & Web Application
echo ========================================================
echo.
echo [1/2] Starting Spring Boot Backend (Port 8081)...
start "Flix Backend" cmd /k "%~dp0run-backend.bat"

echo [2/2] Waiting 5 seconds for backend initialization...
timeout /t 5 /nobreak >nul

echo Starting Vite React Frontend (Port 5173)...
start "Flix Frontend" cmd /k "%~dp0run-frontend.bat"

echo.
echo ========================================================
echo Both services are running:
echo - Backend:  http://localhost:8081/api
echo - Frontend: http://localhost:5173
echo ========================================================
