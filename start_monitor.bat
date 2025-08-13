@echo off
setlocal enabledelayedexpansion

REM -----------------------------
REM 1. Detect Python
REM -----------------------------
echo === Checking for Python ===
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python not found in PATH.
    echo Attempting to use py launcher...
    where py >nul 2>nul
    if %errorlevel% neq 0 (
        echo Python is not installed. Please install Python 3.10+ and ensure it is added to PATH.
        pause
        exit /b
    ) else (
        set PYTHON_CMD=py
    )
) else (
    set PYTHON_CMD=python
)

echo Using Python command: %PYTHON_CMD%

REM -----------------------------
REM 2. Create virtual environments
REM -----------------------------
if not exist backend\.venv (
    echo === Creating backend virtual environment ===
    %PYTHON_CMD% -m venv backend\.venv
)

if not exist agent\.venv (
    echo === Creating agent virtual environment ===
    %PYTHON_CMD% -m venv agent\.venv
)

REM -----------------------------
REM 3. Activate backend and install packages
REM -----------------------------
echo === Activating backend venv ===
call backend\.venv\Scripts\activate

echo === Installing backend requirements ===
pip install --upgrade pip
pip install -r backend\requirements.txt

echo === Applying migrations ===
python backend\manage.py migrate

echo === Collecting static files ===
python backend\manage.py collectstatic --noinput

REM -----------------------------
REM 4. Start Redis if installed
REM -----------------------------
where redis-server >nul 2>nul
if %errorlevel% eq 0 (
    echo === Starting Redis server ===
    start "" redis-server
    timeout /t 2
) else (
    echo Redis not found. WebSocket will use in-memory layer.
)

REM -----------------------------
REM 5. Start Django server
REM -----------------------------
echo === Starting Django server ===
start "" %PYTHON_CMD% backend\manage.py runserver 0.0.0.0:8000

REM -----------------------------
REM 6. Start agent
REM -----------------------------
echo === Activating agent venv ===
call agent\.venv\Scripts\activate
echo === Starting agent ===
start "" %PYTHON_CMD% agent\agent.py

REM -----------------------------
REM 7. Open frontend in default browser
REM -----------------------------
echo === Opening frontend in browser ===
start "" "http://127.0.0.1:8000/static/index.html"

echo === All services started successfully! ===
pause
