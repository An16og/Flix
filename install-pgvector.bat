@echo off
echo ======================================================================
echo Installing pgvector v0.8.6 for PostgreSQL 18 (x64 Windows)
echo ======================================================================
echo.

:: Check for Administrative privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script requires Administrator privileges.
    echo Please right-click this file and select 'Run as administrator'.
    echo.
    pause
    exit /b 1
)

set "SOURCE_DIR=%~dp0pgvector-bin"
set "PG_LIB=C:\Program Files\PostgreSQL\18\lib"
set "PG_EXT=C:\Program Files\PostgreSQL\18\share\extension"

echo [1/3] Copying vector.dll to %PG_LIB%...
copy /Y "%SOURCE_DIR%\lib\vector.dll" "%PG_LIB%\"
if %errorlevel% neq 0 (
    echo Failed to copy vector.dll.
    pause
    exit /b 1
)

echo [2/3] Copying extension SQL and control files to %PG_EXT%...
copy /Y "%SOURCE_DIR%\share\extension\*" "%PG_EXT%\"
if %errorlevel% neq 0 (
    echo Failed to copy extension files.
    pause
    exit /b 1
)

echo [3/3] Enabling vector extension and initializing database tables...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" "postgresql://postgres:melonmesk1606@localhost:5432/movie_recc" -f "%~dp0schema_app.sql"

echo.
echo ======================================================================
echo pgvector successfully installed and database initialized!
echo ======================================================================
pause
