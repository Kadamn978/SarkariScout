@echo off
REM SarkariScout Production Startup (Windows, no Docker)
REM Requires: MySQL and Redis running via Laragon

echo ===================================
echo  SarkariScout Production Mode
echo ===================================

REM Start Redis if not running
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I "redis-server.exe" >NUL
if %ERRORLEVEL% NEQ 0 (
    echo Starting Redis...
    start "" "D:\Nilesh\laragon\bin\redis\redis-x64-5.0.14.1\redis-server.exe"
    timeout /t 2
)

REM Check MySQL
echo Checking MySQL...
"D:\Nilesh\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root -e "SELECT 1" >NUL 2>&1
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
