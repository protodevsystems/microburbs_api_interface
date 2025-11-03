# Quick Start Guide for Microburbs Property Explorer

## ✅ Setup Complete!

Your virtual environment "microburbs" has been created and all dependencies are installed.

## 🚀 To Start Using the Application:

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

### Step 2: Open the Frontend

**Double-click `index.html`** to open it in your browser

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
- Make sure `start_server.bat` is running
- Check that the server window shows "Running on http://127.0.0.1:5000"
- Wait a few seconds after starting the server before searching

### Server Won't Start
- Check that port 5000 isn't already in use
- Try closing and reopening `start_server.bat`
- Check the server window for error messages

### No Data Returned
- Verify your internet connection (needed to reach Microburbs API)
- Try a different suburb name
- Check the server logs for API errors

## 📝 Project Files

- `start_server.bat` - Click this to start the server
- `index.html` - Click this to open the web app
- `server.py` - Backend server code
- `app.js` - Frontend application code
- `styles.css` - Styling
- `README.md` - Full documentation

## 🎉 That's it!

Your Microburbs Property Explorer is ready to use!

