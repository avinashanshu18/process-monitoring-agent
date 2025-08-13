@echo off
setlocal enabledelayedexpansion

REM =========================
REM Detect Python
REM =========================
set "PYTHON_CMD="

for /f "delims=" %%i in ('where python 2^>nul') do (
    set "PYTHON_CMD=%%i"
    goto python_found
)

for /f "delims=" %%i in ('where py 2^>nul') do (
    set "PYTHON_CMD=%%i"
    goto python_found
)

echo Python not found in PATH.
set /p "PYTHON_CMD=Enter full path to python.exe: "
if not exist "!PYTHON_CMD!" (
    echo Invalid path. Please install Python and ensure path is correct.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:python_found
echo Using Python at: !PYTHON_CMD!
set PATH=%~dp0;%PATH%
set PATH=%PYTHON_CMD%;%PATH%

REM =========================
REM Load environment variables from .env
REM =========================
if exist backend\.env (
    for /f "usebackq tokens=1,2 delims==" %%i in (backend\.env) do (
        set %%i=%%j
    )
)

REM =========================
REM Create logs folder
REM =========================
if not exist logs mkdir logs

REM =========================
REM Setup backend virtual environment
REM =========================
if not exist backend\.venv (
    echo === Creating backend virtual environment ===
    "!PYTHON_CMD!" -m venv backend\.venv
)
call backend\.venv\Scripts\activate

REM =========================
REM Install backend requirements
REM =========================
echo === Installing backend Python packages ===
"!PYTHON_CMD!" -m pip install --upgrade pip
"!PYTHON_CMD!" -m pip install -r backend\requirements.txt

REM =========================
REM Apply migrations and collect static
REM =========================
echo === Applying Django migrations ===
"!PYTHON_CMD!" backend\manage.py migrate
echo === Collecting static files ===
"!PYTHON_CMD!" backend\manage.py collectstatic --noinput

REM =========================
REM Setup agent virtual environment
REM =========================
if not exist agent\.venv (
    echo === Creating agent virtual environment ===
    "!PYTHON_CMD!" -m venv agent\.venv
)
call agent\.venv\Scripts\activate

REM =========================
REM Install agent requirements
REM =========================
echo === Installing agent Python packages ===
"!PYTHON_CMD!" -m pip install --upgrade pip
"!PYTHON_CMD!" -m pip install -r agent\requirements.txt
"!PYTHON_CMD!" -m pip install pyinstaller requests psutil

REM =========================
REM Build agent executable
REM =========================
if not exist agent\dist\monitor.exe (
    echo === Building agent executable ===
    pushd agent
    pyinstaller --onefile --name monitor agent.py
    popd
)

REM Copy monitor.exe to Desktop
echo === Copying monitor.exe to Desktop ===
set "DESKTOP=%USERPROFILE%\Desktop"
if exist agent\dist\monitor.exe (
    copy /Y agent\dist\monitor.exe "%DESKTOP%\monitor.exe"
)

REM =========================
REM Download Redis if not installed
REM =========================
where redis-server >nul 2>&1
if %errorlevel% neq 0 (
    echo === Redis not found. Downloading Redis for Windows ===
    set "REDIS_URL=https://github.com/tporadowski/redis/releases/download/v7.0.11/redis-7.0.11.zip"
    set "REDIS_ZIP=%TEMP%\redis.zip"
    powershell -Command "Invoke-WebRequest -Uri '%REDIS_URL%' -OutFile '%REDIS_ZIP%'"
    powershell -Command "Expand-Archive -Path '%REDIS_ZIP%' -DestinationPath '%TEMP%\redis' -Force"
    set "REDIS_PATH=%TEMP%\redis\redis-7.0.11"
    echo === Starting Redis server ===
    start "Redis Server" "%REDIS_PATH%\redis-server.exe"
) else (
    echo === Redis is already installed ===
    start "Redis Server" redis-server
)

timeout /t 2

REM =========================
REM Start Django server
REM =========================
echo === Starting Django server ===
start "Django Server" cmd /k "!PYTHON_CMD! backend\manage.py runserver 0.0.0.0:8000"

REM =========================
REM Start agent
REM =========================
echo === Starting agent ===
start "Agent" cmd /k "agent\dist\monitor.exe"

REM =========================
REM Open frontend in default browser
REM =========================
echo === Opening frontend ===
start "" "%CD%\frontend\index.html"

echo === All services started successfully! Windows will remain open for errors. ===
pause
