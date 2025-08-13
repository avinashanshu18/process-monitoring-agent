@echo off
setlocal enabledelayedexpansion

REM ===========================
REM Load environment variables from .env
REM ===========================
if not exist ".env" (
    echo ERROR: .env file not found in root directory!
    pause
    exit /b 1
)
for /f "usebackq tokens=1,2 delims==" %%i in (.env) do (
    set %%i=%%j
)

REM ===========================
REM Create logs folder
REM ===========================
if not exist logs mkdir logs

REM ===========================
REM Backend setup
REM ===========================
echo === Setting up Backend ===
if not exist backend\.venv (
    echo Creating backend virtual environment...
    python -m venv backend\.venv
)
call backend\.venv\Scripts\activate

echo Installing backend dependencies...
pip install --upgrade pip
pip install -r backend\requirements.txt

echo Applying Django migrations...
python backend\manage.py migrate

echo Collecting static files...
python backend\manage.py collectstatic --noinput

REM ===========================
REM Redis (optional)
REM ===========================
if defined REDIS_URL (
    echo Starting Redis server...
    start "" redis-server
    timeout /t 2
)

REM ===========================
REM Start Django server
REM ===========================
echo Starting Django server...
start "" python backend\manage.py runserver 0.0.0.0:8000 > logs\django.log 2>&1

REM ===========================
REM Agent setup
REM ===========================
echo === Setting up Agent ===
if not exist agent\.venv (
    echo Creating agent virtual environment...
    python -m venv agent\.venv
)
call agent\.venv\Scripts\activate

echo Installing agent dependencies...
pip install --upgrade pip
pip install -r agent\requirements.txt

echo Starting Agent...
start "" python agent\agent.py > logs\agent.log 2>&1

REM ===========================
REM Open frontend in default browser
REM ===========================
echo Opening frontend...
start "" frontend\index.html

echo === All services started successfully! Logs in logs\ folder ===
pause
