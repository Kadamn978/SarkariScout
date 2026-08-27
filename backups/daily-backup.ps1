# daily-backup.ps1 — Run at 00:05 AM via Windows Task Scheduler
# Creates daily MySQL backup, deletes all hourly backups from previous day

$MySQLBin = "D:\Nilesh\laragon\bin\mysql\mysql-8.4.3-winx64\bin"
$HourlyDir = "D:\Nilesh\laragon\www\New folder\backups\db-hourly"
$DailyDir = "D:\Nilesh\laragon\www\New folder\backups\db-daily"
$LogFile = "D:\Nilesh\laragon\www\New folder\backups\backup.log"
$RetentionDays = 30

$Yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
$Timestamp = Get-Date -Format "yyyy-MM-dd_00-05"
$BackupFile = Join-Path $DailyDir "sarkariscout_daily_$Yesterday.sql"

# Step 1: Create daily backup
try {
    & "$MySQLBin\mysqldump.exe" -u root --single-transaction --routines --triggers sarkariscout > $BackupFile 2>$null
    
    if (Test-Path $BackupFile) {
        $Size = [math]::Round((Get-Item $BackupFile).Length / 1KB, 1)
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | OK | Daily | $Size KB | $BackupFile" | Out-File $LogFile -Append
    } else {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | FAIL | Daily | mysqldump returned nothing" | Out-File $LogFile -Append
    }
} catch {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | ERROR | Daily | $($_.Exception.Message)" | Out-File $LogFile -Append
}

# Step 2: Delete ALL hourly backups (day is over, daily backup captured everything)
$DeletedCount = 0
Get-ChildItem $HourlyDir -Filter "*.sql" | ForEach-Object {
    Remove-Item $_.FullName -Force
    $DeletedCount++
}
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | CLEANUP | Deleted $DeletedCount hourly backups for $Yesterday" | Out-File $LogFile -Append

# Step 3: Cleanup daily backups older than 30 days
$Cutoff = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem $DailyDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $Cutoff } | ForEach-Object {
    Remove-Item $_.FullName -Force
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | CLEANUP | Deleted old daily: $($_.Name)" | Out-File $LogFile -Append
}
