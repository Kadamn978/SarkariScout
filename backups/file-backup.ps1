# file-backup.ps1 — Run daily via Windows Task Scheduler
# Backs up important files with timestamps

$ProjectRoot = "D:\Nilesh\laragon\www\New folder"
$BackupDir = "D:\Nilesh\laragon\www\New folder\backups\files"
$LogFile = "D:\Nilesh\laragon\www\New folder\backups\backup.log"
$RetentionDays = 30

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$DayDir = Join-Path $BackupDir (Get-Date -Format "yyyy-MM-dd")
New-Item -ItemType Directory -Force -Path $DayDir | Out-Null

# Important files to backup
$FilesToBackup = @(
    "backend\prisma\schema.prisma",
    "backend\.env",
    "frontend\.env",
    "PROGRESS.md",
    "README.md",
    "docs\01-brd.md",
    "docs\07-revenue-plan.md",
    "docs\08-roadmap.md"
)

$BackedUp = 0
foreach ($File in $FilesToBackup) {
    $Source = Join-Path $ProjectRoot $File
    if (Test-Path $Source) {
        $FileName = [System.IO.Path]::GetFileName($File)
        $BaseName = [System.IO.Path]::GetFileNameWithoutExtension($File)
        $Ext = [System.IO.Path]::GetExtension($File)
        $Dest = Join-Path $DayDir "${BaseName}_${Timestamp}${Ext}"
        Copy-Item $Source $Dest -Force
        $BackedUp++
    }
}

"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | FILES | Backed up $BackedUp files to $DayDir" | Out-File $LogFile -Append

# Cleanup old file backups
$Cutoff = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem $BackupDir -Directory | Where-Object { $_.CreationTime -lt $Cutoff } | ForEach-Object {
    Remove-Item $_.FullName -Recurse -Force
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | CLEANUP | Deleted old file backup: $($_.Name)" | Out-File $LogFile -Append
}
