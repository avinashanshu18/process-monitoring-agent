@echo off
setlocal enabledelayedexpansion

REM Load environment variables from .env
for /f "usebackq tokens=1,2 delims==" %%i in (.env) do (
    set %%i=%%j
)

REM Create logs folder
if not exist logs mkdir logs

echo === Activating backend virtual environment ===
call backend\.venv\Scripts\activate

echo === Installing Python packages ===
pip install -r backend\requirements.txt

echo === Applying Django migrations ===
python backend\manage.py migrate

echo === Collecting static files ===
python backend\manage.py collectstatic --noinput

REM Start Redis if REDIS_URL set (assuming installed)
if defined REDIS_URL (
    echo === Starting Redis server ===
    start redis-server
    timeout /t 2
)

echo === Starting Django server ===
REM Logs go to logs\django.log
start python backend\manage.py runserver 0.0.0.0:8000 > logs\django.log 2>&1

echo === Starting agent ===
call agent\.venv\Scripts\activate
start python agent\agent.py > logs\agent.log 2>&1

echo === All services started successfully! ===
pause
