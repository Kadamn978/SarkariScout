@echo off
REM ─────────────────────────────────────────────────
REM  SarkariScout — Automated DB Backup Script
REM  Run daily via Task Scheduler or cron
REM ─────────────────────────────────────────────────

setlocal

REM ── Config ──
set MYSQL_BIN="D:\Nilesh\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe"
set MYSQLDUMP_BIN="D:\Nilesh\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqldump.exe"
set DB_NAME=sarkariscout
set DB_USER=root
set DB_PASS=
set BACKUP_DIR=D:\Nilesh\laragon\www\New folder\backups
set KEEP_DAYS=30

REM ── Create backup directory ──
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM ── Generate timestamp ──
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set TIMESTAMP=%dt:~0,4%%dt:~4,2%%dt:~6,2_%dt:~8,2%%dt:~10,2%%dt:~12,2%

REM ── Backup ──
echo [%date% %time%] Starting backup...
"%MYSQLDUMP_BIN%" -u %DB_USER% %DB_PASS% --single-transaction --routines --triggers %DB_NAME% > "%BACKUP_DIR%\sarkariscout_%TIMESTAMP%.sql"

if %ERRORLEVEL% equ 0 (
    echo [%date% %time%] Backup successful: sarkariscout_%TIMESTAMP%.sql
    
    REM ── Compress ──
    powershell -command "Compress-Archive -Path '%BACKUP_DIR%\sarkariscout_%TIMESTAMP%.sql' -DestinationPath '%BACKUP_DIR%\sarkariscout_%TIMESTAMP%.zip' -Force"
    del "%BACKUP_DIR%\sarkariscout_%TIMESTAMP%.sql"
    echo [%date% %time%] Compressed to sarkariscout_%TIMESTAMP%.zip
) else (
    echo [%date% %time%] ERROR: Backup failed!
    exit /b 1
)

REM ── Clean old backups ──
echo [%date% %time%] Cleaning backups older than %KEEP_DAYS% days...
forfiles /p "%BACKUP_DIR%" /m *.zip /d -%KEEP_DAYS% /c "cmd /c del @path" 2>nul

REM ── Summary ──
set COUNT=0
for %%f in ("%BACKUP_DIR%\*.zip") do set /a COUNT+=1
echo [%date% %time%] Total backups: %COUNT%

echo [%date% %time%] Backup complete!
