@echo off
echo ============================================================
echo Starting Microburbs API Proxy Server
echo ============================================================
echo.
echo Activating virtual environment...
call microburbs\Scripts\activate.bat
echo.
echo Installing/updating dependencies...
pip install -r requirements.txt --quiet
echo.
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo ============================================================
echo.
echo NOTE: API keys are loaded from .env file
echo If you haven't set up .env yet, copy env.example to .env
echo ============================================================
echo.
python server.py
pause

