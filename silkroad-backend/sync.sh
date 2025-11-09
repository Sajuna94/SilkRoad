#!/bin/bash
# SilkRoad Backend - Environment Sync Script for Unix-like systems

echo "========================================"
echo "SilkRoad Backend Environment Sync"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python is not installed or not in PATH"
    echo "Please install Python 3.13 or higher"
    exit 1
fi

# Display Python version
echo "[INFO] Checking Python version..."
python3 --version

# Check Python version is 3.13 or higher
if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 13) else 1)" 2>/dev/null; then
    echo "[WARNING] Python 3.13 or higher is recommended for this project"
    echo "Current Python version may cause compatibility issues"
    echo ""
fi

echo ""
echo "[INFO] Setting up virtual environment with pip..."

# Check if virtual environment exists
if [ -d ".venv" ]; then
    echo "[INFO] Virtual environment already exists"
else
    echo "[INFO] Creating virtual environment..."
    python3 -m venv .venv
    
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to create virtual environment"
        exit 1
    fi
    
    echo "[INFO] Virtual environment created"
fi

echo "[INFO] Activating virtual environment..."
source .venv/bin/activate

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to activate virtual environment"
    exit 1
fi

echo "[INFO] Installing dependencies..."
pip install -e .

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi

echo ""
echo "[SUCCESS] Environment synced successfully with pip!"
echo ""
echo "The virtual environment is now activated."
echo ""
# basic teaching
echo "================Teaching================"
echo "To run the app:"
echo "  python src/app.py"
echo "  or"
echo "  flask run"
echo ""
echo "To run tests:"
echo "  pytest"
echo ""
echo "To activate the environment in the future:"
echo "  source .venv/bin/activate"
echo ""
echo "========================================"
echo "Environment sync complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Make sure you have a .env file with DATABASE_URL configured"
echo "  2. Create the database in MySQL if not already done"
echo "  3. Run the application following the instructions above"
echo ""