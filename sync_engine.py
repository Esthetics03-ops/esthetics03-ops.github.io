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
REVENUE_MINIMUM = 5.00  # Alert if AdSense drops below $5
ACTIVE_USER_MIN = 1     # Alert if site traffic hits 0

def perform_sync():
    # --- DATA ACQUISITION ---
    # Replace these simulated values with your actual API calls or scrapers
    metrics = {
        "adsense": 52.40,
        "affiliate": 88.10,
        "active": 24,
        "payout": 140.50, # Combined calculation
        "trending": [
            {"title": "Bio-Sync Survival Guide", "views": "2.4k"},
            {"title": "2026 Revenue Trends", "views": "1.8k"},
            {"title": "Affiliate Marketing Pro", "views": "950"}
        ]
    }
    
    try:
        if not os.path.exists(JSON_PATH):
            print("❌ config.json missing.")
            return False

        with open(JSON_PATH, "r") as f:
            config_data = json.load(f)

        # 1. SAFETY ALERTS
        alerts = []
        if metrics['adsense'] < REVENUE_MINIMUM:
            alerts.append(f"📉 *LOW REVENUE:* AdSense at ${metrics['adsense']}")
        if metrics['active'] < ACTIVE_USER_MIN:
            alerts.append(f"🚨 *TRAFFIC LOSS:* 0 Active Users detected.")
        
        if alerts:
            send_immediate_alert("\n".join(alerts))

        # 2. UPDATE TRACKERS (Matches the new Dashboard IDs)
        # Mapping metrics to specific HTML IDs
        id_map = {
            "stat-adsense": metrics["adsense"],
            "stat-affiliate": metrics["affiliate"],
            "stat-active": metrics["active"],
            "stat-payout": metrics["payout"]
        }

        for tracker in config_data.get("trackers", []):
            if tracker["id"] in id_map:
                tracker["value"] = id_map[tracker["id"]]

        # 3. UPDATE TRENDING ARTICLES
        config_data["trending_articles"] = metrics["trending"]

        # 4. UPDATE ROLLING CHART (Tracking Total Revenue)
        new_label = datetime.now().strftime("%H:%M")
        config_data["chartData"]["labels"].append(new_label)
        config_data["chartData"]["points"].append(metrics["payout"])
        
        if len(config_data["chartData"]["labels"]) > 12: 
            config_data["chartData"]["labels"].pop(0)
            config_data["chartData"]["points"].pop(0)

        # 5. SAVE AND PUSH
        with open(JSON_PATH, "w") as f:
            json.dump(config_data, f, indent=4)
        
        repo = Repo(REPO_PATH)
        repo.git.add(JSON_PATH)
        if repo.is_dirty():
            repo.index.commit(f"📊 Dashboard Auto-Sync: {new_label}")
            repo.remote(name='origin').push()
            print(f"✅ Push Successful: {new_label}")
            return True
        return True

    except Exception as e:
        print(f"❌ Sync Error: {e}")
        return False

# --- TELEGRAM SYSTEM ---
def send_immediate_alert(text):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    try:
        requests.post(url, json={"chat_id": CHAT_ID, "text": text, "parse_mode": "Markdown"})
    except:
        pass

async def sync_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🔄 *Force Syncing Repo...*", parse_mode='Markdown')
        if perform_sync():
            await update.message.reply_text("✅ *Sync Complete. Dashboard updated.*", parse_mode='Markdown')
        else:
            await update.message.reply_text("❌ *Sync Failed.*")

def background_timer():
    while True:
        perform_sync()
        time.sleep(300) # Every 5 mins

if __name__ == "__main__":
    print("🚀 Bio-Sync Master Engine Starting...")
    send_immediate_alert("🖥️ *Bio-Sync Node Online:* Monitoring AdSense & Traffic.")
    
    threading.Thread(target=background_timer, daemon=True).start()

    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("sync", sync_command))
    app.run_polling()
