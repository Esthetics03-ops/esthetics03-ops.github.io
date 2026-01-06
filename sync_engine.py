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
GA4_PROPERTY_ID = "G-QCX3G9KSPC" # Primary ID from your config
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
    """Checks if a new month has started and creates a new history entry."""
    current_month_name = datetime.now().strftime("%B %Y")
    last_entry = config_data["history"][-1]
    
    if last_entry["month"] != current_month_name:
        last_entry["status"] = "PENDING"  # Close previous month
        new_month = {
            "month": current_month_name,
            "revenue": 0.00,
            "status": "ACTIVE",
            "method": "Electronic"
        }
        config_data["history"].append(new_month)
        if len(config_data["history"]) > 4: # Keep rolling 4-month window
            config_data["history"].pop(0)
        return True, config_data
    return False, config_data

def update_audit_logic(config_data, current_total):
    """Calculates rolling totals and trend projections."""
    # Update latest month in history with current live data
    config_data["history"][-1]["revenue"] = current_total
    
    total_gross = sum(item["revenue"] for item in config_data["history"])
    avg_monthly = total_gross / len(config_data["history"])
    
    # Sync Chart to 3-Month View
    config_data["chartData"]["labels"] = [item["month"] for item in config_data["history"]]
    config_data["chartData"]["points"] = [item["revenue"] for item in config_data["history"]]
    
    # Add trend projection
    config_data["chartData"]["labels"].append("Projected")
    config_data["chartData"]["points"].append(avg_monthly * 1.05)
    
    return total_gross, avg_monthly

def perform_sync():
    """The master execution loop."""
    active_now = get_active_users()
    
    # Simulated Financial Pull - Replace with your API/Scraper logic
    current_adsense = 156.45 
    current_affiliate = 89.30
    total_current = current_adsense + current_affiliate

    try:
        with open(JSON_PATH, "r") as f:
            config_data = json.load(f)

        # 1. Check for Month Change
        _, config_data = handle_monthly_turnover(config_data)

        # 2. Run Audit & Calculation
        total_gross, avg_monthly = update_audit_logic(config_data, total_current)

        # 3. Map to Dashboard IDs
        id_map = {
            "stat-adsense": current_adsense,
            "stat-payout": total_gross,
            "stat-active": active_now,
            "stat-affiliate": current_affiliate
        }

        for tracker in config_data.get("trackers", []):
            if tracker["id"] in id_map:
                tracker["value"] = id_map[tracker["id"]]

        # 4. Meta Updates
        config_data["project_info"]["last_audit"] = datetime.now().strftime("%Y-%m-%d")

        # 5. Save and Push to GitHub
        with open(JSON_PATH, "w") as f:
            json.dump(config_data, f, indent=4)
        
        repo = Repo(REPO_PATH)
        repo.git.add(JSON_PATH)
        if repo.is_dirty():
            repo.index.commit(f"📊 Audit Update: {datetime.now().strftime('%H:%M')} | Users: {active_now}")
            repo.remote(name='origin').push()
            return True
        return True

    except Exception as e:
        print(f"Master Sync Failure: {e}")
        return False

# --- TELEGRAM INTERFACE ---

async def sync_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🔄 *Manual Audit Triggered...*", parse_mode='Markdown')
        if perform_sync():
            await update.message.reply_text("✅ *Audit Complete.* Data pushed to GitHub Pages.")
        else:
            await update.message.reply_text("❌ *Sync Failed.* Check local console.")

# --- SERVICE INITIALIZATION ---

def background_timer():
    while True:
        perform_sync()
        time.sleep(300) # Run every 5 minutes

if __name__ == "__main__":
    print("🚀 Bio-Sync Master Engine v2.2.0 Online")
    
    # Start the 5-minute background loop
    threading.Thread(target=background_timer, daemon=True).start()

    # Start Telegram Bot
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("sync", sync_command))
    app.run_polling()
