<#
FinEvents P6 - register the daily runner with Windows Task Scheduler.

One user-level task, no stored credentials: it runs with the interactive
token, so the machine must be on with the user logged in when it fires.
StartWhenAvailable catches up a missed 11:00 (laptop asleep) at the next
chance; seal-once makes any double-fire a byte-identical no-op.

  .\scripts\register_daily_task.ps1                        # daily at 12:45, from today
  .\scripts\register_daily_task.ps1 -StartDate 2026-08-18  # first fire that day

The hour matters for ONE input: GDELT publishes yesterday's event file at
07:00 GMT sharp (measured 2026-08-17), so the run must fire after that -
12:45 IST is 07:15 GMT. It stays two hours before the target CBR fix is
struck (London AM ~09:30 GMT), so no knowledge-time question arises. For
prices the hour is convenience: the runner forecasts from the last available
print, so WHEN it fires only decides which date gets sealed. Re-running is
safe; -Force re-registers over an existing task of the same name.
#>
param(
    [string]$At = "12:45",
    [string]$StartDate = (Get-Date -Format "yyyy-MM-dd"),
    [string]$TaskName = "FinEventsDailyRunner"
)

$root = Split-Path -Parent $PSScriptRoot
$wrapper = Join-Path $PSScriptRoot "run_daily_scheduled.cmd"
if (-not (Test-Path $wrapper)) { throw "wrapper not found: $wrapper" }

$action = New-ScheduledTaskAction -Execute "cmd.exe" `
    -Argument ('/c "' + $wrapper + '"') -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$trigger.StartBoundary = "{0}T{1}:00" -f $StartDate, $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
    -Settings $settings -Force -Description (
    "FinEvents POC daily runner: fetch, mature, remember, seal (docs/Execution.md P6). " +
    "Logs to data\runner_logs\<date>.log in the repo."
) | Out-Null

$info = Get-ScheduledTaskInfo -TaskName $TaskName
Write-Output "registered '$TaskName'"
Write-Output "  first/next run : $($info.NextRunTime)"
Write-Output "  log            : data\runner_logs\<date>.log"
Write-Output "  run now (test) : schtasks /run /tn $TaskName"
Write-Output "  remove         : Unregister-ScheduledTask -TaskName $TaskName"
