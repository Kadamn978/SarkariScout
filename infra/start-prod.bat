@echo off
REM RozgarScout Production Startup (Windows, no Docker)
REM Requires: MySQL and Redis running via Laragon

echo ===================================
echo  RozgarScout Production Mode
echo ===================================

REM Start Redis if not running
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I "redis-server.exe" >NUL
if %ERRORLEVEL% NEQ 0 (
    echo Starting Redis...
    where redis-server.exe >NUL 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: redis-server.exe not found in PATH. Install Redis or add to PATH.
        pause
        exit /b 1
    )
    start "" redis-server.exe
    timeout /t 2
)

REM Check MySQL
echo Checking MySQL...
where mysql.exe >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: mysql.exe not found in PATH. Start MySQL via Laragon or add to PATH.
    pause
    exit /b 1
)
mysql.exe -u root -e "SELECT 1" >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MySQL not running. Start via Laragon.
    pause
    exit /b 1
)

REM Build
echo Building...
cd backend
call npx prisma generate
call node node_modules\.\bin\tsc
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

REM Migrate
echo Migrating database...
call npx prisma migrate deploy

REM Seed (first run only)
if "%1"=="--seed" (
    echo Seeding database...
    call npx prisma db seed
)

REM Start
echo.
echo Starting server on port 3000...
set NODE_ENV=production
node dist/main.js
