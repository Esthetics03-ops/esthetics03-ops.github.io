import json
import time
import os
import threading
from datetime import datetime
from git import Repo
import requests
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunRealtimeReportRequest, Metric
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# --- CONFIGURATION ---
JSON_PATH = "config.json"
REPO_PATH = "./"
TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"
CHAT_ID = "YOUR_CHAT_ID"
GA4_PROPERTY_ID = "YOUR_GA4_PROPERTY_ID" # Found in GA4 Admin > Property Settings
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "credentials.json"



def get_active_users():
    """Fetches real-time active users from GA4."""
    try:
        client = BetaAnalyticsDataClient()
        request = RunRealtimeReportRequest(
            property=f"properties/{GA4_PROPERTY_ID}",
            metrics=[Metric(name="activeUsers")],
        )
        response = client.run_realtime_report(request)
        return int(response.rows[0].metric_values[0].value) if response.rows else 0
    except Exception as e:
        print(f"GA4 Error: {e}")
        return 0

def perform_sync():
    # --- DATA ACQUISITION ---
    active_now = get_active_users()
    
    # Replace these with your actual financial scrapers/APIs
    metrics = {
        "adsense": 54.20,
        "affiliate": 89.30,
        "active": active_now,
        "payout": 143.50,
        "trending": [
            {"title": "Bio-Sync Survival Guide", "views": "2.4k"},
            {"title": "2026 Revenue Trends", "views": "1.8k"},
            {"title": "Affiliate Marketing Pro", "views": "950"}
        ]
    }
    
    try:
        with open(JSON_PATH, "r") as f:
            config_data = json.load(f)

        # Update Trackers
        id_map = {
            "stat-adsense": metrics["adsense"],
            "stat-affiliate": metrics["affiliate"],
            "stat-active": metrics["active"],
            "stat-payout": metrics["payout"]
        }

        for tracker in config_data.get("trackers", []):
            if tracker["id"] in id_map:
                tracker["value"] = id_map[tracker["id"]]

        config_data["trending_articles"] = metrics["trending"]

        # Chart Logic
        new_label = datetime.now().strftime("%H:%M")
        config_data["chartData"]["labels"].append(new_label)
        config_data["chartData"]["points"].append(metrics["payout"])
        
        if len(config_data["chartData"]["labels"]) > 12: 
            config_data["chartData"]["labels"].pop(0)
            config_data["chartData"]["points"].pop(0)

        with open(JSON_PATH, "w") as f:
            json.dump(config_data, f, indent=4)
        
        # Git Push
        repo = Repo(REPO_PATH)
        repo.git.add(JSON_PATH)
        if repo.is_dirty():
            repo.index.commit(f"📊 Live Sync: {active_now} users @ {new_label}")
            repo.remote(name='origin').push()
            return True
        return True

    except Exception as e:
        print(f"Sync Failure: {e}")
        return False

# --- TELEGRAM & THREADING (Same as previous) ---
def background_timer():
    while True:
        perform_sync()
        time.sleep(300)

async def sync_command(update, context):
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🔄 *Syncing GA4 + Finances...*")
        perform_sync()
        await update.message.reply_text("✅ *Dashboard Updated.*")

if __name__ == "__main__":
    threading.Thread(target=background_timer, daemon=True).start()
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("sync", sync_command))
    app.run_polling()
