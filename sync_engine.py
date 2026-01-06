import json
import time
import requests
import threading
import os
from datetime import datetime
from git import Repo
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# --- CONFIGURATION ---
JSON_PATH = "config.json"
REPO_PATH = "./" 
TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"
CHAT_ID = "YOUR_CHAT_ID"

# --- SAFETY THRESHOLDS ---
REVENUE_MINIMUM = 50.00  # Notify if revenue falls below this
LATENCY_MAXIMUM = 100    # Notify if server latency exceeds 100ms

# 1. THE CORE SYNC LOGIC
def perform_sync():
    # Simulated metrics - Connect your real API or Scraper here
    metrics = {
        "revenue": 142.75, 
        "conversions": 485, 
        "latency": 20, 
        "ctr": 5.4
    }
    
    try:
        if not os.path.exists(JSON_PATH):
            print("❌ config.json missing.")
            return False

        with open(JSON_PATH, "r") as f:
            config_data = json.load(f)

        # SAFETY CHECK LOGIC
        alerts = []
        if metrics['revenue'] < REVENUE_MINIMUM:
            alerts.append(f"📉 *CRITICAL:* Revenue dropped to ${metrics['revenue']}")
        if metrics['latency'] > LATENCY_MAXIMUM:
            alerts.append(f"⚠️ *LATENCY:* High delay detected: {metrics['latency']}ms")
        
        if alerts:
            send_immediate_alert("\n".join(alerts))

        # UPDATE TRACKERS (Preserving Auth/Metadata)
        for tracker in config_data.get("trackers", []):
            tid = tracker["id"]
            if tid in ["stat-revenue", "stat-conv", "stat-latency", "stat-ctr"]:
                key = tid.replace("stat-", "")
                tracker["value"] = metrics[key]

        # UPDATE ROLLING CHART
        new_label = datetime.now().strftime("%H:%M")
        config_data["chartData"]["labels"].append(new_label)
        config_data["chartData"]["points"].append(metrics["revenue"])
        
        if len(config_data["chartData"]["labels"]) > 12: # Keep 1 hour of 5-min data
            config_data["chartData"]["labels"].pop(0)
            config_data["chartData"]["points"].pop(0)

        # WRITE AND PUSH
        with open(JSON_PATH, "w") as f:
            json.dump(config_data, f, indent=4)
        
        repo = Repo(REPO_PATH)
        repo.git.add(JSON_PATH)
        if repo.is_dirty():
            repo.index.commit(f"⚡ Bio-Sync Auto-Update: {new_label}")
            repo.remote(name='origin').push()
            return True
        return True

    except Exception as e:
        print(f"❌ Sync Error: {e}")
        return False

# 2. TELEGRAM TOOLS
def send_immediate_alert(text):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": CHAT_ID, "text": text, "parse_mode": "Markdown"})

async def sync_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🔄 *Manual Override Initiated...*", parse_mode='Markdown')
        if perform_sync():
            await update.message.reply_text("✅ *GitHub & Dashboard Synchronized.*", parse_mode='Markdown')
        else:
            await update.message.reply_text("❌ *Manual Sync Failed.*")

# 3. SERVICE THREADS
def background_timer():
    while True:
        perform_sync()
        time.sleep(300) 

if __name__ == "__main__":
    send_immediate_alert("🚀 *Bio-Sync Master Engine Online*")
    
    # Background Thread for Auto-Sync
    threading.Thread(target=background_timer, daemon=True).start()

    # Main Thread for Telegram Listener
    print("🤖 Dashboard Controller Active...")
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("sync", sync_command))
    app.run_polling()
