@echo off
REM SilkRoad Backend - Environment Sync Script for Windows
REM This script helps sync Python environment for team members

echo ========================================
echo SilkRoad Backend Environment Sync
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.13 or higher from https://www.python.org/
    pause
    exit /b 1
)

REM Display Python version
echo [INFO] Checking Python version...
python --version

REM Check Python version is 3.13 or higher
python -c "import sys; exit(0 if sys.version_info >= (3, 13) else 1)" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Python 3.13 or higher is recommended for this project
    echo Current Python version may cause compatibility issues
    echo.
)

echo.
echo [INFO] Choose installation method:
echo   1. Using uv (recommended, faster)
echo   2. Using pip (traditional method)
echo.
choice /c 12 /n /m "Enter your choice (1 or 2): "

if %errorlevel% equ 1 goto USE_UV
if %errorlevel% equ 2 goto USE_PIP

:USE_UV
echo.
echo [INFO] Checking for uv...
uv --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] uv is not installed. Installing uv...
    echo.
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install uv
        echo Please install manually from https://github.com/astral-sh/uv
        pause
        exit /b 1
    )

    echo [INFO] uv installed successfully
    echo [INFO] Please restart your terminal and run this script again
    pause
    exit /b 0
)

echo [INFO] Syncing environment with uv...
uv sync

if %errorlevel% neq 0 (
    echo [ERROR] Failed to sync environment with uv
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Environment synced successfully with uv!
echo.
echo To activate the environment and run the app:
echo   uv run src/app.py
echo.
echo To run tests:
echo   uv run pytest
echo.
goto END

:USE_PIP
echo.
echo [INFO] Setting up virtual environment with pip...

REM Check if virtual environment exists
if exist .venv\ (
    echo [INFO] Virtual environment already exists
) else (
    echo [INFO] Creating virtual environment...
    python -m venv .venv

    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )

    echo [INFO] Virtual environment created
)

echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat

if %errorlevel% neq 0 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)

echo [INFO] Installing dependencies...
pip install -e .

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Environment synced successfully with pip!
echo.
echo The virtual environment is now activated.
echo.
echo To run the app:
echo   python src/app.py
echo   or
echo   flask run
echo.
echo To run tests:
echo   pytest
echo.
echo To activate the environment in the future:
echo   .venv\Scripts\activate
echo.
goto END

:END
echo ========================================
echo Environment sync complete!
echo ========================================
echo.
echo Next steps:
echo   1. Make sure you have a .env file with DATABASE_URL configured
echo   2. Create the database in MySQL if not already done
echo   3. Run the application following the instructions above
echo.
pause
