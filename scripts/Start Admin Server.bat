@echo off
title Tridel Content Manager Server
echo.
echo =====================================================
echo   Starting Tridel Content Manager Server...
echo =====================================================
echo.
cd /d "%~dp0"
set PATH=%PATH%;C:\Program Files\nodejs
npm start
pause
