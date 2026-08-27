# setup-backup-tasks.ps1 — Run ONCE as Administrator to register scheduled tasks
# Creates Windows Task Scheduler jobs for hourly, daily DB backups and file backups

$ProjectRoot = "D:\Nilesh\laragon\www\New folder"

# Task 1: Hourly DB backup (every hour from 6 AM to 11 PM)
$HourlyAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ProjectRoot\backups\hourly-backup.ps1`""
$HourlyTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date.AddHours(6) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Hours 18)
Register-ScheduledTask -TaskName "SarkariScout_HourlyBackup" -Action $HourlyAction -Trigger $HourlyTrigger -Description "SarkariScout hourly MySQL backup" -RunLevel Highest -Force

# Task 2: Daily backup + cleanup (at 00:05 AM)
$DailyAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ProjectRoot\backups\daily-backup.ps1`""
$DailyTrigger = New-ScheduledTaskTrigger -Daily -At "00:05"
Register-ScheduledTask -TaskName "SarkariScout_DailyBackup" -Action $DailyAction -Trigger $DailyTrigger -Description "SarkariScout daily MySQL backup + hourly cleanup" -RunLevel Highest -Force

# Task 3: File backup (at 01:00 AM daily)
$FileAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ProjectRoot\backups\file-backup.ps1`""
$FileTrigger = New-ScheduledTaskTrigger -Daily -At "01:00"
Register-ScheduledTask -TaskName "SarkariScout_FileBackup" -Action $FileAction -Trigger $FileTrigger -Description "SarkariScout important files backup" -RunLevel Highest -Force

Write-Host "All backup tasks registered!" -ForegroundColor Green
Write-Host "  Hourly DB: Every hour 6AM-11PM (24h retention)"
Write-Host "  Daily DB:  00:05 AM (30 day retention)"
Write-Host "  File:      01:00 AM daily (30 day retention)"
