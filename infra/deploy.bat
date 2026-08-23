@echo off
REM SarkariScout Deployment Script (Windows)
REM Usage: deploy.bat [dev|prod]

set ENV=%1
if "%ENV%"=="" set ENV=dev

echo ===================================
echo  SarkariScout Deploy - %ENV%
echo ===================================

if "%ENV%"=="dev" (
    echo Starting development environment...
    docker-compose -f docker-compose.yml up -d
    echo.
    echo Waiting for MySQL...
    timeout /t 10
    cd backend
    call npx prisma migrate dev
    call npx prisma db seed
    echo.
    echo Starting backend...
    call npm run start:dev
)

if "%ENV%"=="prod" (
    echo Building for production...
    cd frontend
    call npm run build
    cd ..

    echo Starting production environment...
    docker-compose -f infra/docker-compose.prod.yml up -d --build

    echo.
    echo Running migrations...
    docker exec sarkari-api npx prisma migrate deploy

    echo.
    echo Deployment complete!
    echo Frontend: http://localhost
    echo API: http://localhost/api/health
)

if "%ENV%"=="migrate" (
    echo Running database migration...
    docker exec sarkari-api npx prisma migrate deploy
)

if "%ENV%"=="seed" (
    echo Seeding database...
    docker exec sarkari-api npx prisma db seed
)

if "%ENV%"=="logs" (
    echo Showing API logs...
    docker logs -f sarkari-api
)

if "%ENV%"=="status" (
    echo Container status:
    docker ps --filter "name=sarkari" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
)

echo.
echo Done!
