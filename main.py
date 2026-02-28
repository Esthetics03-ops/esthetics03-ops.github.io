import os
import json
import gspread
import pandas as pd
from datetime import datetime
from oauth2client.service_account import ServiceAccountCredentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunRealtimeReportRequest, Metric

# --- CONFIGURATION ---
PROPERTY_ID = "319520471"
JSON_PATH = "config.json"
SPREADSHEET_ID = "14lde3IpR7th4DyYATejALuOHswor-QD0xdREE7FNpIo"

def get_google_client():
    """Authenticates using the GitHub Secret Service Account"""
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds_dict = json.loads(os.getenv("GOOGLE_API_KEY"))
    creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
    return gspread.authorize(creds)

def get_live_analytics():
    """Pulls REAL active user counts from GA4"""
    try:
        # Use the same credentials for GA4
        creds_info = json.loads(os.getenv("GOOGLE_API_KEY"))
        client = BetaAnalyticsDataClient.from_service_account_info(creds_info)
        request = RunRealtimeReportRequest(
            property=f"properties/{PROPERTY_ID}",
            metrics=[Metric(name="activeUsers")]
        )
        response = client.run_realtime_report(request)
        return int(response.rows[0].metric_values[0].value) if response.rows else 0
    except Exception as e:
        print(f"⚠️ GA4 Error: {e}")
        return 0

def update_spreadsheet_and_vault():
    active_users = get_live_analytics()
    gc = get_google_client()
    doc = gc.open_by_key(SPREADSHEET_ID)
    
    # 1. Pull Current Settings (Live KES Rate)
    settings_sheet = doc.worksheet("Settings")
    kes_rate = float(settings_sheet.acell('B3').value) # Currently 129
    
    # 2. Append Live Audit to RawData Tab
    raw_sheet = doc.worksheet("RawData")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Placeholder for daily logic: Adjust earnings based on live traffic
    adsense_usd = round((active_users * 0.05), 2) 
    
    # New Row: [Date, Page, Pageviews, AdSense_USD, AdSense_KES, Clicks, Affiliate_USD, Affiliate_KES]
    new_row = [timestamp, "Live_Audit", active_users, adsense_usd, "", 0, 0, ""]
    raw_sheet.append_row(new_row, value_input_option='USER_ENTERED')
    
    # 3. Pull Totals for Website config.json
    dashboard = doc.worksheet("Dashboard")
    total_gross_usd = float(dashboard.acell('B6').value.replace('$', '').replace(',', '')) # Pulls 884.53
    
    # 4. Update config.json for Bio-Sync.live
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, "r") as f:
            data = json.load(f)
            
        for t in data["trackers"]:
            if t["id"] == "stat-active": t["value"] = active_users
            if t["id"] == "stat-total-gross": t["value"] = total_gross_usd
            
        data["project_info"]["last_audit"] = timestamp
        
        with open(JSON_PATH, "w") as f:
            json.dump(data, f, indent=2)

    print(f"✅ Sync Complete: {timestamp} | {active_users} Users | ${total_gross_usd} Total Gross")

if __name__ == "__main__":
    update_spreadsheet_and_vault()
