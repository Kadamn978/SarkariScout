# hourly-backup.ps1 — Run every hour via Windows Task Scheduler
# Creates hourly MySQL backup, keeps for 24 hours then deletes

$MySQLBin = "D:\Nilesh\laragon\bin\mysql\mysql-8.4.3-winx64\bin"
$BackupDir = "D:\Nilesh\laragon\www\New folder\backups\db-hourly"
$LogFile = "D:\Nilesh\laragon\www\New folder\backups\backup.log"
$RetentionHours = 24

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$BackupFile = Join-Path $BackupDir "sarkariscout_hourly_$Timestamp.sql"

try {
    & "$MySQLBin\mysqldump.exe" -u root --single-transaction --routines --triggers sarkariscout > $BackupFile 2>$null
    
    if (Test-Path $BackupFile) {
        $Size = [math]::Round((Get-Item $BackupFile).Length / 1KB, 1)
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | OK | Hourly | $Size KB | $BackupFile" | Out-File $LogFile -Append
    } else {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | FAIL | Hourly | mysqldump returned nothing" | Out-File $LogFile -Append
    }
} catch {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | ERROR | Hourly | $($_.Exception.Message)" | Out-File $LogFile -Append
}

# Cleanup: delete hourly backups older than 24 hours
$Cutoff = (Get-Date).AddHours(-$RetentionHours)
Get-ChildItem $BackupDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $Cutoff } | ForEach-Object {
    Remove-Item $_.FullName -Force
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | CLEANUP | Deleted $($_.Name)" | Out-File $LogFile -Append
}
