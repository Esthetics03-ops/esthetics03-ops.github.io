import os
import json
import gspread
from datetime import datetime
from oauth2client.service_account import ServiceAccountCredentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunRealtimeReportRequest, Metric

# --- CONFIGURATION ---
PROPERTY_ID = "319520471"
SPREADSHEET_ID = "14lde3IpR7th4DyYATejALuOHswor-QD0xdREE7FNpIo"
JSON_PATH = "config.json"

def update_bio_sync():
    # 1. Initialize Clients
    creds_dict = json.loads(os.getenv("GOOGLE_API_KEY"))
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    gc = gspread.authorize(creds)
    analytics = BetaAnalyticsDataClient.from_service_account_info(creds_dict)

    # 2. Get Live Analytics
    request = RunRealtimeReportRequest(property=f"properties/{PROPERTY_ID}", metrics=[Metric(name="activeUsers")])
    response = analytics.run_realtime_report(request)
    active_now = int(response.rows[0].metric_values[0].value) if response.rows else 0

    # 3. Pull Spreadsheet Context
    doc = gc.open_by_key(SPREADSHEET_ID)
    settings = doc.worksheet("Settings")
    kes_rate = float(settings.acell('B3').value)
    
    dashboard = doc.worksheet("Dashboard")
    total_gross = dashboard.acell('B6').value  # Should pull 884.53

    # 4. Update RawData (Fixing #REF! Errors)
    # We append a clean row; Google Sheets handles the KES calculation automatically
    raw_sheet = doc.worksheet("RawData")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # New Row Format: [Date, Page, Pageviews, AdSense_USD, AdSense_KES (Calculated), Clicks, Affiliate_USD, Affiliate_KES (Calculated)]
    new_row = [timestamp, "Live_Audit", active_now, 0, "", 0, 0, ""]
    raw_sheet.append_row(new_row, value_input_option='USER_ENTERED')

    # 5. Update config.json for Bio-Sync Site
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, "r") as f:
            data = json.load(f)
        
        # Syncing trackers with actuals from Dashboard
        for t in data["trackers"]:
            if t["id"] == "stat-active": t["value"] = active_now
            if t["id"] == "stat-total-gross": t["value"] = float(total_gross.replace('$', '').replace(',', ''))
            
        data["project_info"]["last_audit"] = timestamp
        with open(JSON_PATH, "w") as f:
            json.dump(data, f, indent=2)

    print(f"✅ Sync Successful: {active_now} Users | Total Gross: {total_gross}")

if __name__ == "__main__":
    update_bio_sync()
