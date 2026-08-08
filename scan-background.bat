@echo off
REM ============================================================
REM  Background job scanner for career-ops.
REM  Runs the zero-token portal scan and appends new C++/HFT
REM  roles to data/pipeline.md. Safe to run repeatedly -- the
REM  scanner dedupes against data/scan-history.tsv, so already
REM  seen roles are never added twice. No Claude, no cost.
REM
REM  Triggered by Windows Task Scheduler (task: CareerOpsJobScan).
REM  To scan India only, add  --location india  to the node line.
REM ============================================================

cd /d "C:\Users\abhik\OneDrive\Github_repos\JobSearch_multiAgent"

echo. >> "data\scan-cron.log"
echo ==================== %DATE% %TIME% ==================== >> "data\scan-cron.log"
"C:\Program Files\nodejs\node.exe" scan.mjs >> "data\scan-cron.log" 2>&1
echo (scan exit code %ERRORLEVEL%) >> "data\scan-cron.log"

REM Rebuild the browsable job portal so it always reflects the latest pipeline.
"C:\Program Files\nodejs\node.exe" build-portal.mjs >> "data\scan-cron.log" 2>&1
echo (portal exit code %ERRORLEVEL%) >> "data\scan-cron.log"
