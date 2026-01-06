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

# --- PRODUCTION CONFIGURATION ---
JSON_PATH = "config.json"
REPO_PATH = "./"
TOKEN = "YOUR_TELEGRAM_BOT_TOKEN" # Replace with your @BotFather token
CHAT_ID = "YOUR_CHAT_ID"           # Replace with your numeric Chat ID

# Mapped Numeric Property ID for G-QCX3G9KSPC
GA4_PROPERTY_ID = "319520471" 
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "credentials.json"

# --- CORE LOGIC FUNCTIONS ---

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

def handle_monthly_turnover(config_data):
    """Detects month change and updates the history log."""
    current_month_name = datetime.now().strftime("%B %Y")
    last_entry = config_data["history"][-1]
    
    if last_entry["month"] != current_month_name:
        last_entry["status"] = "PENDING"  # Close previous month for payout cycle
        new_month = {
            "month": current_month_name,
            "revenue": 0.00,
            "status": "ACTIVE",
            "method": "Electronic"
        }
        config_data["history"].append(new_month)
        if len(config_data["history"]) > 4: 
            config_data["history"].pop(0)
        return True, config_data
    return False, config_data

def update_audit_logic(config_data, current_total):
    """Calculates rolling 3-month totals and future projections."""
    config_data["history"][-1]["revenue"] = current_total
    total_gross = sum(item["revenue"] for item in config_data["history"])
    avg_monthly = total_gross / len(config_data["history"])
    
    # Update Chart Data
    config_data["chartData"]["labels"] = [item["month"].split()[0] for item in config_data["history"]]
    config_data["chartData"]["points"] = [item["revenue"] for item in config_data["history"]]
    
    # Add trend projection
    config_data["chartData"]["labels"].append("Proj.")
    config_data["chartData"]["points"].append(avg_monthly * 1.10)
    
    return total_gross, avg_monthly

def perform_sync():
    active_now = get_active_users()
    
    # Production IDs for The Esthetics Hub
    ADSENSE_PUB = "pub-1959507280210179"
    AFFILIATE_ID = "esthetics-hub-affiliate"
    
    # Simulated current month earnings (Replace with your scraper/API data)
    current_adsense = 156.45 
    current_affiliate = 89.30
    total_current = current_adsense + current_affiliate

    try:
        with open(JSON_PATH, "r") as f:
            config_data = json.load(f)

        handle_monthly_turnover(config_data)
        total_gross, avg_monthly = update_audit_logic(config_data, total_current)

        # Update Trackers
        id_map = {
            "stat-adsense": current_adsense,
            "stat-affiliate": current_affiliate,
            "stat-payout": total_gross,
            "stat-active": active_now
        }

        for tracker in config_data.get("trackers", []):
            if tracker["id"] in id_map:
                tracker["value"] = id_map[tracker["id"]]

        config_data["project_info"]["last_audit"] = datetime.now().strftime("%Y-%m-%d %H:%M")

        with open(JSON_PATH, "w") as f:
            json.dump(config_data, f, indent=4)
        
        repo = Repo(REPO_PATH)
        repo.git.add(JSON_PATH)
        if repo.is_dirty():
            repo.index.commit(f"⚡ Esthetics Hub Sync: {total_gross:.2f} Gross | {active_now} Live")
            repo.remote(name='origin').push()
            return True
        return True

    except Exception as e:
        print(f"Master Sync Failure: {e}")
        return False

# --- TELEGRAM & BACKGROUND ENGINE ---

async def sync_command(update, context):
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🔄 *Syncing Esthetics Hub GA4 & AdSense...*", parse_mode='Markdown')
        if perform_sync():
            await update.message.reply_text("✅ *Sync Complete.* Dashboard updated.")

def background_timer():
    while True:
        perform_sync()
        time.sleep(300)

if __name__ == "__main__":
    print(f"🚀 Master Engine Online | Targeting: {GA4_PROPERTY_ID}")
    threading.Thread(target=background_timer, daemon=True).start()
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("sync", sync_command))
    app.run_polling()
