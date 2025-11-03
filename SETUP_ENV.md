# 🔑 Setting Up Your Environment Variables

## Quick Setup (Do This Now!)

Since you just pulled this code, you need to set up your `.env` file:

### Step 1: Create `.env` file

```bash
# In the project root directory (D:\Microburbs), run:
copy env.example .env
```

### Step 2: Add Your API Key

Open `.env` in any text editor and replace:

```
OPENAI_API_KEY=your-openai-api-key-here
```

with your actual OpenAI API key (starts with `sk-...`)

**Example:**
```
OPENAI_API_KEY=sk-proj-abc123xyz...your-actual-key-here
```

### Step 3: Verify `.env` is in `.gitignore`

The `.env` file should already be listed in `.gitignore`:

```
.env
```

This ensures your API key is NEVER committed to git.

### Step 4: Install New Dependency

The server now uses `python-dotenv` to load environment variables:

```bash
# Activate your virtual environment
microburbs\Scripts\activate

# Install the new package
pip install -r requirements.txt
```

### Step 5: Restart the Server

```bash
# Simply run:
start_server.bat
```

The script will:
- Activate the virtual environment
- Install/update dependencies automatically
- Load API keys from `.env`
- Start the server

---

## ✅ Verification

When the server starts, you should see:

```
Starting Flask server on http://localhost:5000
NOTE: API keys are loaded from .env file
```

**No warnings about missing API keys!**

---

## 🔒 Security Benefits

| Before | After |
|--------|-------|
| ❌ API key in `start_server.bat` | ✅ API key in `.env` (gitignored) |
| ❌ Can't commit without exposing key | ✅ Safe to commit all files |
| ❌ Manual env variable setup | ✅ Automatic loading from `.env` |
| ❌ Key visible in process list | ✅ Key loaded internally |

---

## 📄 Files to Commit (Safe!)

✅ `server.py` (no hardcoded keys)  
✅ `start_server.bat` (no hardcoded keys)  
✅ `env.example` (template only)  
✅ `requirements.txt` (includes python-dotenv)  
✅ `.gitignore` (ensures .env is excluded)  

❌ `.env` (NEVER commit this!)

---

## 🆘 Troubleshooting

### Server shows API key warning?

```
⚠️ WARNING: OPENAI_API_KEY not found!
```

**Fix:**
1. Verify `.env` file exists in project root
2. Check it contains: `OPENAI_API_KEY=sk-...`
3. Restart the server

### AI Vision still gets 500 errors?

1. Check server console for detailed error messages
2. Verify API key is valid: https://platform.openai.com/api-keys
3. Test with curl (see README)

---

## 🎯 You're All Set!

Once `.env` is configured, you can:
- ✅ Commit and push all code safely
- ✅ Share the repo publicly (key stays local)
- ✅ Run AI Vision Analysis without issues
- ✅ Collaborate with others (they create their own `.env`)

**Happy coding! 🚀**

