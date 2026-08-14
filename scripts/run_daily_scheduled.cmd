@echo off
rem FinEvents P6 - what Windows Task Scheduler runs every day (docs/Execution.md).
rem
rem No arguments, no machine-specific paths: the repo root derives from this
rem file's own location, so the same script works from any clone. Output goes
rem to data\runner_logs\<date>.log - under data\, so gitignored like all
rem acquired/working data. Failures are visible there, never swallowed.
cd /d "%~dp0.."
set "LOGDIR=%CD%\data\runner_logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set "TODAY=%%i"
rem Scheduled contexts sometimes miss user PATH additions; fall back to uv's
rem default install location rather than failing silently at 11:00.
set "UV=uv"
where uv >nul 2>&1 || set "UV=%USERPROFILE%\.local\bin\uv.exe"
echo ==== run started %DATE% %TIME% ====>> "%LOGDIR%\%TODAY%.log"
"%UV%" run python scripts\run_poc_daily.py >> "%LOGDIR%\%TODAY%.log" 2>&1
echo ==== exit %ERRORLEVEL% ====>> "%LOGDIR%\%TODAY%.log"
