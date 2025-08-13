@echo off
setlocal enabledelayedexpansion

REM ===========================
REM Load environment variables from .env
REM ===========================
if exist .env (
    for /f "usebackq tokens=1,* delims==" %%i in (.env) do (
        set %%i=%%j
    )
) else (
    echo .env file not found!
)

REM ===========================
REM Create logs folder
REM ===========================
if not exist logs mkdir logs

REM ===========================
REM Detect Python
REM ===========================
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found in PATH! Please install Python 3.12+ and add it to PATH.
    pause
    exit /b
) else (
    echo Python found.
)

REM ===========================
REM Activate backend virtual environment
REM ===========================
if exist backend\.venv\Scripts\activate (
    call backend\.venv\Scripts\activate
) else (
    echo Creating backend virtual environment...
    python -m venv backend\.venv
    call backend\.venv\Scripts\activate
    pip install --upgrade pip
    pip install -r backend\requirements.txt
)

REM ===========================
REM Apply Django migrations
REM ===========================
echo Applying migrations...
python backend\manage.py migrate

REM ===========================
REM Collect static files
REM ===========================
echo Collecting static files...
python backend\manage.py collectstatic --noinput

REM ===========================
REM Start Redis if REDIS_URL is set
REM ===========================
if defined REDIS_URL (
    where redis-server >nul 2>&1
    if %errorlevel% neq 0 (
        echo Redis server not found! Skipping Redis. WebSockets will use in-memory.
    ) else (
        echo Starting Redis server...
        start "" redis-server
        timeout /t 2
    )
) else (
    echo REDIS_URL not set. Using in-memory channel layer.
)

REM ===========================
REM Start Django server
REM ===========================
echo Starting Django server...
start "" python backend\manage.py runserver 0.0.0.0:8000 > logs\django.log 2>&1

REM ===========================
REM Activate agent virtual environment
REM ===========================
if exist agent\.venv\Scripts\activate (
    call agent\.venv\Scripts\activate
) else (
    echo Creating agent virtual environment...
    python -m venv agent\.venv
    call agent\.venv\Scripts\activate
    pip install --upgrade pip
    pip install -r agent\requirements.txt
)

REM ===========================
REM Start agent
REM ===========================
echo Starting Agent...
start "" python agent\agent.py > logs\agent.log 2>&1

echo ===========================
echo All services started successfully!
pause
