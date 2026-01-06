import json
import time
import requests
import threading
from datetime import datetime
from git import Repo
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# --- CONFIGURATION ---
JSON_PATH = "config.json"
REPO_PATH = "./" 
TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"
CHAT_ID = "YOUR_CHAT_ID"

# 1. THE CORE SYNC LOGIC
def perform_sync():
    metrics = {"revenue": 13450.00, "conversions": 462, "latency": 18, "ctr": 5.1}
    
    config_data = {
        "trackers": [
            {"id": "stat-revenue", "value": metrics['revenue'], "prefix": "$", "suffix": ""},
            {"id": "stat-conv", "value": metrics['conversions'], "prefix": "", "suffix": ""},
            {"id": "stat-latency", "value": metrics['latency'], "prefix": "", "suffix": "ms"},
            {"id": "stat-ctr", "value": metrics['ctr'], "prefix": "", "suffix": "%"}
        ],
        "chartData": {
            "labels": ["20:00", "21:00", "22:00", "23:00", "00:00", datetime.now().strftime("%H:%M")],
            "points": [90, 95, 105, 110, 108, 115]
        },
        "forecast": metrics['revenue'] * 1.15,
        "goal": 20000
    }

    with open(JSON_PATH, "w") as f:
        json.dump(config_data, f, indent=4)
    
    try:
        repo = Repo(REPO_PATH)
        repo.git.add(JSON_PATH)
        if repo.is_dirty():
            repo.index.commit(f"⚡ Remote Force Update: {datetime.now().strftime('%H:%M')}")
            repo.remote(name='origin').push()
            return True
    except Exception as e:
        print(f"Git Error: {e}")
    return False

# 2. TELEGRAM COMMAND HANDLER
async def sync_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Security: Only respond if the message is from YOU
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🚀 *Sync Triggered Remotely...*", parse_mode='Markdown')
        success = perform_sync()
        if success:
            await update.message.reply_text("✅ *Dashboard Updated & Pushed to GitHub.*", parse_mode='Markdown')
        else:
            await update.message.reply_text("❌ *Sync Failed. Check local logs.*")

# 3. BACKGROUND TIMER THREAD
def background_timer():
    while True:
        perform_sync()
        time.sleep(300) # Auto-sync every 5 mins

# 4. MAIN EXECUTION
if __name__ == "__main__":
    # Start the 5-minute timer in a separate background thread
    timer_thread = threading.Thread(target=background_timer, daemon=True)
    timer_thread.start()

    # Start the Telegram Listener
    print("🤖 Remote Control Bot Active. Send /sync on Telegram.")
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("sync", sync_command))
    app.run_polling()
