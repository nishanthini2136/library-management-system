@echo off
echo Library Management System Setup
echo ================================

echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Running setup script...
python setup.py

echo.
echo Setup complete! 
echo.
echo To start the application:
echo python app.py
echo.
echo Then open your browser to: http://localhost:5000
echo.
pause
