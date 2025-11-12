# SilkRoad Backend - Environment Sync Script for Windows (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SilkRoad Backend Environment Sync" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[INFO] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.13 or higher from https://www.python.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Python version
$versionCheck = python -c "import sys; exit(0 if sys.version_info >= (3, 13) else 1)" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Python 3.13 or higher is recommended" -ForegroundColor Yellow
    Write-Host ""
}

# PIP method
Write-Host ""
Write-Host "[INFO] Setting up virtual environment with pip..." -ForegroundColor Cyan

if (Test-Path ".venv") {
    Write-Host "[INFO] Virtual environment already exists" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Creating virtual environment..." -ForegroundColor Cyan
    python -m venv .venv
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create virtual environment" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "[INFO] Virtual environment created" -ForegroundColor Green
}

Write-Host "[INFO] Activating virtual environment..." -ForegroundColor Cyan
& .\.venv\Scripts\Activate.ps1

Write-Host "[INFO] Installing dependencies..." -ForegroundColor Cyan
pip install -e .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Environment synced successfully with pip!" -ForegroundColor Green
Write-Host ""
Write-Host "The virtual environment is now activated." -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the app:" -ForegroundColor Cyan
Write-Host "  python src/app.py"
Write-Host "  or"
Write-Host "  flask run"
Write-Host ""
Write-Host "To run tests:" -ForegroundColor Cyan
Write-Host "  pytest"
Write-Host ""
Write-Host "To activate the environment in the future:" -ForegroundColor Cyan
Write-Host "  .\.venv\Scripts\Activate.ps1"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment sync complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure you have a .env file with DATABASE_URL configured"
Write-Host "  2. Create the database in MySQL if not already done"
Write-Host "  3. Run the application following the instructions above"
Write-Host ""

Read-Host "Press Enter to exit"
