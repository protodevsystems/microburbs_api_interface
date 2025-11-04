# Quick Start Guide for Microburbs Property Explorer

## ✅ Setup Complete!

Your virtual environment "microburbs" has been created and all dependencies are installed.

## 🚀 To Start Using the Application:

> **Note:** You'll need to run the backend server (port 5000). Optionally, you can also run a frontend server (port 8000) for better development experience.

### Step 1: Start the Backend Server

**Double-click `start_server.bat`** in Windows Explorer

This will open a new window showing the server logs. You should see:
```
============================================================
Starting Microburbs API Proxy Server
============================================================
Server will run on: http://localhost:5000
```

⚠️ **Keep this window open** while using the application!

### Step 2: Serve the Frontend

You have two options to open the frontend:

#### Option A: Serve via Local Server (Recommended)

Open a **new** Command Prompt or PowerShell window and run:

```bash
cd D:\Microburbs
microburbs\Scripts\activate
python -m http.server 8000 --bind 127.0.0.1
```

Then open your browser and navigate to: **http://127.0.0.1:8000**

⚠️ **Keep this window open** while using the application!

#### Option B: Direct File Opening (Alternative)

**Double-click `index.html`** to open it directly in your browser

> Note: Serving via local server (Option A) is recommended as it avoids potential CORS issues and provides better development experience.

### Step 3: Search for Properties

1. The search box will show "Belmont North" by default
2. Click the **Search** button
3. View the property data!

## 🔧 Manual Server Start (Alternative)

If the batch script doesn't work, open Command Prompt or PowerShell and run:

```bash
cd D:\Microburbs
microburbs\Scripts\activate
python server.py
```

## ❓ Troubleshooting

### "Connection Refused" Error
- Make sure `start_server.bat` is running (backend on port 5000)
- If using Option A, make sure the frontend server is running (port 8000)
- Check that the backend server window shows "Running on http://127.0.0.1:5000"
- Wait a few seconds after starting the servers before searching

### Server Won't Start
- Check that port 5000 (backend) and/or port 8000 (frontend) aren't already in use
- Try closing and reopening `start_server.bat`
- Check the server window for error messages

### Frontend Server Issues
- Make sure you're using the `microburbs` virtual environment
- Verify you're in the correct directory (`D:\Microburbs`)
- Try using a different port: `python -m http.server 8001 --bind 127.0.0.1`

### No Data Returned
- Verify your internet connection (needed to reach Microburbs API)
- Try a different suburb name
- Check the backend server logs for API errors

## 📝 Project Files

- `start_server.bat` - Click this to start the server
- `index.html` - Click this to open the web app
- `server.py` - Backend server code
- `app.js` - Frontend application code
- `styles.css` - Styling
- `README.md` - Full documentation

## 🎉 That's it!

Your Microburbs Property Explorer is ready to use!

