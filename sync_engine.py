import json
import os
import threading
import time
from datetime import datetime
from git import Repo
from googleapiclient.discovery import build
from oauth2client.file import Storage
from oauth2client.client import flow_from_clientsecrets
from oauth2client.tools import run_flow
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunRealtimeReportRequest, Metric
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# --- CONFIGURATION ---
JSON_PATH = "config.json"
REPO_PATH = "./"
ADSENSE_PUB = "pub-1959507280210179"
GA4_PROPERTY_ID = "319520471"
CLIENT_SECRETS = 'client_secrets.json' # OAuth2 File from Google Cloud
ADSENSE_SCOPE = ['https://www.googleapis.com/auth/adsense.readonly']

# Credentials for Telegram & Service Account
TOKEN = "YOUR_TELEGRAM_BOT_TOKEN" 
CHAT_ID = "YOUR_CHAT_ID"           
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "credentials.json"

# --- API HELPERS ---

def get_adsense_service():
    """Authenticates and returns the AdSense API service."""
    storage = Storage('adsense_auth_token.dat')
    credentials = storage.get()
    if not credentials or credentials.invalid:
        flow = flow_from_clientsecrets(CLIENT_SECRETS, scope=ADSENSE_SCOPE)
        credentials = run_flow(flow, storage)
    return build('adsense', 'v2', credentials=credentials)

def get_live_adsense_earnings():
    """Pulls ACTUAL estimated earnings for TODAY from AdSense."""
    try:
        service = get_adsense_service()
        result = service.accounts().reports().generate(
            account=f"accounts/{ADSENSE_PUB}",
            dateRange="TODAY",
            metrics=["ESTIMATED_EARNINGS"]
        ).execute()
        return float(result['totals']['cells'][0]['value']) if 'totals' in result else 0.00
    except Exception as e:
        print(f"⚠️ AdSense API Error: {e}")
        return 0.00

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

# --- CORE DATA LOGIC ---

def handle_monthly_turnover(config_data):
    current_month_name = datetime.now().strftime("%B %Y")
    last_entry = config_data["history"][-1]
    if last_entry["month"] != current_month_name:
        last_entry["status"] = "PENDING"
        new_month = {"month": current_month_name, "revenue": 0.00, "status": "ACTIVE", "method": "Electronic"}
        config_data["history"].append(new_month)
        if len(config_data["history"]) > 4: config_data["history"].pop(0)
        return True
    return False

def perform_sync():
    print(f"🔄 Sync Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    active_now = get_active_users()
    live_adsense = get_live_adsense_earnings()
    
    # Placeholder for Affiliate (replace with your scraper/API logic if needed)
    current_affiliate = 89.30 

    try:
        with open(JSON_PATH, "r") as f:
            config_data = json.load(f)

        handle_monthly_turnover(config_data)
        
        # Update current month revenue
        config_data["history"][-1]["revenue"] = live_adsense + current_affiliate
        total_gross = sum(item["revenue"] for item in config_data["history"])
        
        # Calculate RPM
        current_rpm = (live_adsense / active_now * 1000) if active_now > 0 else 0.00

        # Update Trackers Mapping
        id_map = {
            "stat-adsense": live_adsense,
            "stat-affiliate": current_affiliate,
            "stat-active": active_now,
            "stat-rpm": current_rpm,
            "stat-total-gross": total_gross
        }

        for tracker in config_data.get("trackers", []):
            if tracker["id"] in id_map:
                tracker["value"] = id_map[tracker["id"]]

        # Meta Updates
        config_data["project_info"]["last_audit"] = datetime.now().strftime("%Y-%m-%d %H:%M")
        config_data["chartData"]["labels"] = [i["month"][:3] for i in config_data["history"]]
        config_data["chartData"]["points"] = [i["revenue"] for i in config_data["history"]]

        with open(JSON_PATH, "w") as f:
            json.dump(config_data, f, indent=4)
        
        # Git Push
        repo = Repo(REPO_PATH)
        repo.git.add(JSON_PATH)
        if repo.is_dirty():
            repo.index.commit(f"⚡ Sync: ${total_gross:.2f} Gross | {active_now} Active | RPM: ${current_rpm:.2f}")
            repo.remote(name='origin').push()
            return True
        return False

    except Exception as e:
        print(f"❌ Master Sync Failure: {e}")
        return False

# --- TELEGRAM & SCHEDULER ---

async def sync_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🔄 *Manual Sync Triggered...*")
        if perform_sync():
            await update.message.reply_text("✅ *Dashboard Updated via GitHub.*")
        else:
            await update.message.reply_text("ℹ️ *Data synced (No changes to push).*")

def background_timer():
    while True:
        perform_sync()
        time.sleep(600) # Sync every 10 minutes

if __name__ == "__main__":
    print(f"🚀 Esthetics Hub Engine Online | Targeting: {GA4_PROPERTY_ID}")
    threading.Thread(target=background_timer, daemon=True).start()
    
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("sync", sync_command))
    app.run_polling()
