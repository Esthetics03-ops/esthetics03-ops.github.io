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
GITHUB_MODE = "GOOGLE_CREDENTIALS_JSON" in os.environ

if GITHUB_MODE:
    print("🌐 GitHub Actions Environment Detected")
    with open("credentials.json", "w") as f:
        f.write(os.environ["GOOGLE_CREDENTIALS_JSON"])
    with open("adsense_auth_token.dat", "w") as f:
        f.write(os.environ["ADSENSE_TOKEN_DAT"])
else:
    print("💻 Local Environment Detected")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "credentials.json"

# --- 2. CONFIGURATION ---
JSON_PATH = "config.json"
REPO_PATH = "./"
ADSENSE_PUB = "pub-1959507280210179"
GA4_PROPERTY_ID = "319520471"
CLIENT_SECRETS = 'client_secrets.json' 
ADSENSE_SCOPE = ['https://www.googleapis.com/auth/adsense.readonly']

# Use os.getenv to prevent crashes if keys are missing
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN") 
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "YOUR_CHAT_ID")           

# --- 3. API HELPERS ---

def get_adsense_service():
    storage = Storage('adsense_auth_token.dat')
    credentials = storage.get()
    
    if not credentials or credentials.invalid:
        if GITHUB_MODE:
            # Critical: Actions cannot open a browser to re-auth
            raise Exception("❌ ADSENSE_TOKEN_DAT expired or missing in GitHub Secrets.")
        
        if not os.path.exists(CLIENT_SECRETS):
            raise FileNotFoundError(f"❌ Missing {CLIENT_SECRETS} for local authentication.")
            
        flow = flow_from_clientsecrets(CLIENT_SECRETS, scope=ADSENSE_SCOPE)
        credentials = run_flow(flow, storage)
        
    return build('adsense', 'v2', credentials=credentials, cache_discovery=False)

def get_live_adsense_earnings():
    try:
        service = get_adsense_service()
        # Fetching TODAY's estimated earnings
        result = service.accounts().reports().generate(
            account=f"accounts/{ADSENSE_PUB}",
            dateRange="TODAY",
            metrics=["ESTIMATED_EARNINGS"]
        ).execute()
        
        val = result.get('totals', {}).get('cells', [{}])[0].get('value', 0.00)
        return float(val)
    except Exception as e:
        print(f"⚠️ AdSense API Error: {e}")
        return 0.00

def get_active_users():
    try:
        client = BetaAnalyticsDataClient()
        request = RunRealtimeReportRequest(
            property=f"properties/{GA4_PROPERTY_ID}",
            metrics=[Metric(name="activeUsers")],
        )
        response = client.run_realtime_report(request)
        return int(response.rows[0].metric_values[0].value) if response.rows else 0
    except Exception as e:
        print(f"⚠️ GA4 Error: {e}")
        return 0

# --- 4. CORE DATA LOGIC ---

def perform_sync():
    print(f"🔄 Syncing APIs: {datetime.now().strftime('%H:%M:%S')}")
    active_now = get_active_users()
    live_adsense = get_live_adsense_earnings()
    
    # Static fallback for affiliate until API is connected
    current_affiliate = 89.30 

    try:
        if not os.path.exists(JSON_PATH):
            print(f"❌ Error: {JSON_PATH} not found.")
            return False

        with open(JSON_PATH, "r") as f:
            data = json.load(f)

        # Update Month History
        current_month_name = datetime.now().strftime("%B %Y")
        if data["history"][-1]["month"] != current_month_name:
            data["history"][-1]["status"] = "PENDING"
            data["history"].append({
                "month": current_month_name,
                "revenue": 0.00,
                "status": "ACTIVE",
                "method": "Electronic"
            })
            if len(data["history"]) > 4: data["history"].pop(0)

        # Update Current Month Revenue (Live AdSense + Affiliate)
        data["history"][-1]["revenue"] = live_adsense + current_affiliate
        total_gross = sum(item["revenue"] for item in data["history"])
        
        # Calculate RPM (Earnings / Users * 1000)
        current_rpm = (live_adsense / active_now * 1000) if active_now > 0 else 0.00

        # Mapping to config.json trackers
        id_map = {
            "stat-adsense": live_adsense,
            "stat-affiliate": current_affiliate,
            "stat-active": active_now,
            "stat-rpm": current_rpm,
            "stat-total-gross": total_gross
        }

        for tracker in data.get("trackers", []):
            if tracker["id"] in id_map:
                tracker["value"] = id_map[tracker["id"]]

        # Meta & Chart Updates
        data["project_info"]["last_audit"] = datetime.now().strftime("%Y-%m-%d %H:%M")
        data["chartData"]["labels"] = [m["month"][:3] for m in data["history"]]
        data["chartData"]["points"] = [m["revenue"] for m in data["history"]]

        with open(JSON_PATH, "w") as f:
            json.dump(data, f, indent=4)
        
        # Git Push Logic (Only if Local)
        if not GITHUB_MODE:
            repo = Repo(REPO_PATH)
            repo.git.add(JSON_PATH)
            if repo.is_dirty():
                repo.index.commit(f"⚡ Live Audit: ${total_gross:.2f} | {active_now} Users")
                repo.remote(name='origin').push()
                print("✅ GitHub Updated.")
        
        return True
    except Exception as e:
        print(f"❌ Sync Failure: {e}")
        return False

# --- 5. EXECUTION ---

async def sync_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if str(update.effective_chat.id) == CHAT_ID:
        await update.message.reply_text("🔎 *Performing Live Audit...*")
        if perform_sync():
            await update.message.reply_text("✅ *Dashboard Synchronized.*")

def background_loop():
    while True:
        perform_sync()
        time.sleep(600) # 10 Minutes

if __name__ == "__main__":
    if GITHUB_MODE:
        perform_sync()
    else:
        # Start Local Services
        threading.Thread(target=background_loop, daemon=True).start()
        print(f"🚀 Master Engine Online | Traffic Property: {GA4_PROPERTY_ID}")
        
        # Start Telegram Bot if Token is valid
        if "YOUR_TELEGRAM" not in TOKEN:
            app = ApplicationBuilder().token(TOKEN).build()
            app.add_handler(CommandHandler("sync", sync_command))
            app.run_polling()
        else:
            print("⚠️ Telegram Token not configured. Running in timer mode only.")
            while True: time.sleep(1)
