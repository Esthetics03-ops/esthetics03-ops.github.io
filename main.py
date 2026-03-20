import os
import json
import gspread
import requests
from datetime import datetime
from oauth2client.service_account import ServiceAccountCredentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunRealtimeReportRequest, Metric

# --- CONFIGURATION ---
PROPERTY_ID = "319520471"
SPREADSHEET_ID = "14lde3IpR7th4DyYATejALuOHswor-QD0xdREE7FNpIo"
JSON_PATH = "config.json"

def send_alert(message):
    """Sends a notification when payout threshold is near"""
    print(f"🔔 ALERT: {message}")
    # Optional: Integration for mobile push via ntfy.sh
    # requests.post("https://ntfy.sh/bio_sync_alerts", data=message.encode(encoding='utf-8'))

def check_payout_status(doc):
    """Monitors the 95% threshold based on the Dashboard tab"""
    try:
        dashboard = doc.worksheet("Dashboard")
        # Pulls 'Progress to Payout (%)' from cell B12 (e.g., 0.8845)
        progress_str = dashboard.acell('B12').value
        progress = float(progress_str.replace('%', '')) / 100 if '%' in progress_str else float(progress_str)
        total_usd = dashboard.acell('B6').value
        
        if progress >= 0.95:
            msg = f"Target Near! Payout Progress is at {progress*100:.2f}%. Current Total: {total_usd}"
            send_alert(msg)
    except Exception as e:
        print(f"⚠️ Alert Engine Error: {e}")

def update_bio_sync():
    print("🚀 Starting Bio-Sync Live Audit & Sync...")
    
    # 1. Initialize API Clients
    try:
        creds_raw = os.getenv("GOOGLE_API_KEY")
        if not creds_raw:
            print("❌ Error: GOOGLE_API_KEY environment variable not set.")
            return
            
        creds_dict = json.loads(creds_raw)
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
        gc = gspread.authorize(creds)
        analytics = BetaAnalyticsDataClient.from_service_account_info(creds_dict)
    except Exception as e:
        print(f"❌ Authentication Failed: {e}")
        return

    # 2. Get Live Traffic (GA4 Realtime)
    try:
        request = RunRealtimeReportRequest(
            property=f"properties/{PROPERTY_ID}", 
            metrics=[Metric(name="activeUsers")]
        )
        response = analytics.run_realtime_report(request)
        active_now = int(response.rows[0].metric_values[0].value) if response.rows else 0
    except Exception as e:
        print(f"⚠️ GA4 API Error: {e}")
        active_now = 0

    # 3. Access Spreadsheet & Pull Context
    try:
        doc = gc.open_by_key(SPREADSHEET_ID)
        dashboard = doc.worksheet("Dashboard")
        total_gross = dashboard.acell('B6').value # Pulls current $884.53
    except Exception as e:
        print(f"❌ Spreadsheet Access Error: {e}")
        return

    # 4. Update RawData (Fixes #REF! Errors)
    # Appending with USER_ENTERED allows Sheet formulas to calculate KES automatically
    raw_sheet = doc.worksheet("RawData")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # New Row: [Date, Page, Pageviews, AdSense_USD, AdSense_KES (formula), Clicks, Affiliate_USD, Affiliate_KES (formula)]
    new_row = [timestamp, "Live_Audit", active_now, 0, "", 0, 0, ""]
    raw_sheet.append_row(new_row, value_input_option='USER_ENTERED')

    # 5. Run Payout Alert Check
    check_payout_status(doc)

    # 6. Update Website config.json for Live Display
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r") as f:
                data = json.load(f)
            
            # Update trackers with live actuals
            for t in data["trackers"]:
                if t["id"] == "stat-active": 
                    t["value"] = active_now
                if t["id"] == "stat-total-gross": 
                    # Clean currency string (e.g., "$884.53") to float
                    clean_val = str(total_gross).replace('$', '').replace(',', '')
                    t["value"] = float(clean_val)
                
            data["project_info"]["last_audit"] = timestamp
            data["project_info"]["last_sync_timestamp"] = int(datetime.now().timestamp())
            
            with open(JSON_PATH, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"⚠️ config.json Update Error: {e}")

    print(f"✅ Sync Successful: {active_now} Active | Total Gross: {total_gross}")

if __name__ == "__main__":
    update_bio_sync()

import functions_framework
from google.ads.googleads.client import GoogleAdsClient
import json

# Your Developer Config
DEVELOPER_TOKEN = 'YOUR_TOKEN'
CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN'
CUSTOMER_ID = 'YOUR_CUSTOMER_ID' # Without dashes

@functions_framework.http
def get_ads_spend(request):
    # Initialize Google Ads Client
    credentials = {
        "developer_token": DEVELOPER_TOKEN,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": REFRESH_TOKEN,
        "use_proto_plus": True
    }
    
    client = GoogleAdsClient.load_from_dict(credentials)
    ga_service = client.get_service("GoogleAdsService")

    # Query to get spend for the current month
    query = """
        SELECT metrics.cost_micros 
        FROM customer 
        WHERE segments.date DURING THIS_MONTH
    """

    response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=query)
    
    total_spend_micros = 0
    for batch in response:
        for row in batch.results:
            total_spend_micros += row.metrics.cost_micros

    # Convert Micros to Standard Currency (e.g., USD or KES)
    total_spend = total_spend_micros / 1000000
    goal_remaining = max(0, 300.00 - total_spend)

    return json.dumps({
        "user": "George Kutosi Ondimu",
        "current_spend": total_spend,
        "goal_remaining": goal_remaining,
        "credit_eligible": total_spend >= 300.00
    }), 200, {'Content-Type': 'application/json'}

import functions_framework
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
import base64
import json

# --- ENCRYPTED CONFIG (Use Environment Variables in GCF Console) ---
CONSUMER_KEY = 'YOUR_KEY'
CONSUMER_SECRET = 'YOUR_SECRET'
BUSINESS_SHORTCODE = '174379'
PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'

def get_access_token():
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    r = requests.get(api_url, auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET))
    return r.json().get('access_token')

@functions_framework.http
def mpesa_stk_push(request):
    # Enable CORS for your GitHub Pages domain
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    headers = {'Access-Control-Allow-Origin': '*'}
    
    request_json = request.get_json(silent=True)
    phone = request_json.get('phone')
    amount = request_json.get('amount')

    try:
        token = get_access_token()
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode((BUSINESS_SHORTCODE + PASSKEY + timestamp).encode()).decode()

        payload = {
            "BusinessShortCode": BUSINESS_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": BUSINESS_SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": "https://us-central1-your-project.cloudfunctions.net/mpesa_callback",
            "AccountReference": "BioSync_Master",
            "TransactionDesc": "Nairobi HQ Node Sync"
        }

        api_headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            json=payload, 
            headers=api_headers
        )
        
        return (json.dumps(response.json()), 200, headers)

    except Exception as e:
        return (json.dumps({"error": str(e)}), 500, headers)
