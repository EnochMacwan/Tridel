@echo off
cd /d "%~dp0"
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "Content-Manager-GUI.ps1"
if %errorlevel% neq 0 (
    echo.
    echo ERROR: The Content Manager failed to open.
    echo Please verify you have PowerShell installed and check the error above.
    echo.
    pause
)

