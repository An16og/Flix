@echo off
echo Starting Flix Frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo [INFO] First-time setup: Installing frontend dependencies...
    call npm install
)
npm run dev
