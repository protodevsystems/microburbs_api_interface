@echo off
echo ============================================================
echo Starting Microburbs API Proxy Server
echo ============================================================
echo.
echo Activating virtual environment...
call microburbs\Scripts\activate.bat
echo.
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo ============================================================
echo.
python server.py
pause

