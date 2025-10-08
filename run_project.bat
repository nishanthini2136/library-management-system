@echo off
echo Library Management System - Project Runner
echo ==========================================

echo.
echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Python is not installed or not in PATH!
    echo.
    echo Please install Python first:
    echo 1. Open Microsoft Store and search for "Python 3.11"
    echo 2. Or download from https://python.org/downloads/
    echo 3. Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Initializing database...
python init_db.py
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database initialization failed!
    echo Please check your MySQL configuration in .env file
    pause
    exit /b 1
)

echo.
echo Starting the application...
echo.
echo The application will be available at: http://localhost:5000
echo.
echo Default login credentials:
echo Admin: admin / admin123
echo Student: student@university.edu / student123
echo.
python app.py
