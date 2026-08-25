@echo off
REM safe-push.bat — Pull before push, handle conflicts safely
REM Run this instead of manual git push

echo.
echo === SarkariScout Safe Push ===
echo.

echo [1/4] Checking for uncommitted changes...
git status --short
echo.

echo [2/4] Pulling latest from origin/pre-dev...
git pull origin pre-dev --no-edit
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Pull failed. Resolve conflicts first.
    echo     1. Open conflicted files
    echo     2. Fix <<<<<<< markers
    echo     3. Run: git add .
    echo     4. Run: git commit
    echo     5. Run this script again
    pause
    exit /b 1
)

echo.
echo [3/4] Staging all changes...
git add .

echo.
echo [4/4] Committing and pushing...
git status --short
echo.
set /p MSG="Enter commit message: "
if "%MSG%"=="" set MSG="update: parallel session changes"
git commit -m "%MSG%"
git push origin pre-dev

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Pushed successfully!
) else (
    echo.
    echo [!] Push failed. Try again.
)
pause
