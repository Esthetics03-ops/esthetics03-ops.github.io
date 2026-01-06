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

# --- 1. ENVIRONMENT & CREDENTIALS CHECK ---
# This block handles the "Secrets" if running on GitHub Actions
if "GOOGLE_CREDENTIALS_JSON" in os.environ:
    print("🌐 GitHub Actions Environment Detected")
    with open("credentials.json", "w") as f:
        f.write(os.environ["GOOGLE_CREDENTIALS_JSON"])
    with open("adsense_auth_token.dat", "w") as f:
        f.write(os.environ["ADSENSE_TOKEN_DAT"])
else:
    print("💻 Local Environment Detected")

# Set the path for GA4 Auth
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "credentials.json"

# --- 2. CONFIGURATION ---
JSON_PATH = "config.json"
REPO_PATH = "./"
ADSENSE_PUB = "pub-1959507280210179"
GA4_PROPERTY_ID = "319520471"
CLIENT_SECRETS = 'client_secrets.json' 
ADSENSE_SCOPE = ['https://www.googleapis.com/auth/adsense.readonly']

# Telegram Config (Should also be moved to secrets if running on GitHub)
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN") 
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "YOUR_CHAT_ID")           

# --- 3. API HELPERS ---

def get_adsense_service():
    """Authenticates and returns the AdSense API service."""
    storage = Storage('adsense_auth_token.dat')
    credentials = storage.get()
    
    # Run Flow only if local; GitHub Actions must rely on the provided token
    if not credentials or credentials.invalid:
        if "GOOGLE_CREDENTIALS_JSON" in os.environ:
            raise Exception("AdSense Token expired in GitHub Actions. Re-auth locally first.")
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

# --- 4. CORE DATA LOGIC ---

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
    
    # Placeholder for Affiliate (Or integrate an API if available)
    current_affiliate = 89.30 

    try:
        with open(JSON_PATH, "r") as f:
            config_data = json.load(f)

        handle_monthly_turnover(config_data)
        
        # Update current month revenue logic
        config_data["history"][-1]["revenue"] = live_adsense + current_affiliate
        total_gross = sum(item["revenue"] for item in config_data["history"])
        
        # RPM Calculation
        current_rpm = (live_adsense / active_now * 1000) if active_now > 0 else 0.00

        # Sync values to config.json structure
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

        # Dashboard Metadata
        config_data["project_info"]["last_audit"] = datetime.now().strftime("%Y-%m-%d %H:%M")
        config_data["chartData"]["labels"] = [i["month"][:3] for i in config_data["history"]]
        config_data["chartData"]["points"] = [i["revenue"] for i in config_data["history"]]

        with open(JSON_PATH, "w") as f:
            json.dump(config_data, f, indent=4)
        
        # Handle Git Push ONLY if running locally. 
        # (GitHub Actions handles the push via the .yml file)
        if "GOOGLE_CREDENTIALS_JSON" not in os.environ:
            repo = Repo(REPO_PATH)
            repo.git.add(JSON_PATH)
            if repo.is_dirty():
                repo.index.commit(f"⚡ Sync: ${total_gross:.2f} | {active_now} Users")
                repo.remote(name='origin').push()
                print("✅ Local push successful")
        
        return True

    except Exception as e:
        print(f"❌ Master Sync Failure: {e}")
        return False

# --- 5. EXECUTION ---

async def sync_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🔄 *Syncing Live APIs...*")
        if perform_sync():
            await update.message.reply_text("✅ *Dashboard Sync Complete.*")

def background_timer():
    while True:
        perform_sync()
        time.sleep(600) # 10 minute intervals

if __name__ == "__main__":
    # If on GitHub Actions, just run once and exit
    if "GOOGLE_CREDENTIALS_JSON" in os.environ:
        perform_sync()
    else:
        # If local, run the background loop and Telegram bot
        threading.Thread(target=background_timer, daemon=True).start()
        app = ApplicationBuilder().token(TOKEN).build()
        app.add_handler(CommandHandler("sync", sync_command))
        print(f"🚀 Master Engine Running | Targeting Property: {GA4_PROPERTY_ID}")
        app.run_polling()
