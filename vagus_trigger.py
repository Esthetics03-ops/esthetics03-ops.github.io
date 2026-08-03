import functions_framework
import os
import requests
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# --- CONFIGURATION ---
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')
SPREADSHEET_ID = os.environ.get('SPREADSHEET_ID')

def get_current_revenue():
    # Authenticate and fetch total from your 'Transactions' sheet
    info = json.loads(os.environ.get('SERVICE_ACCOUNT_JSON'))
    creds = service_account.Credentials.from_service_account_info(info)
    service = build('sheets', 'v4', credentials=creds)
    
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID, range='Transactions!D:D'
    ).execute()
    
    values = result.get('values', [])
    total = sum(float(row[0]) for row in values[1:] if row) # Skip header
    return total

@functions_framework.http
def daily_vagus_reset(request):
    revenue = get_current_revenue()
    target = 1000
    percent = round((revenue / target) * 100, 1)

    message = (
        f"🌅 *GOOD MORNING, MASTER NODE*\n"
        f"━━━━━━━━━━━━━━━\n"
        f"🧠 *Vagus Reset Protocol:* Active\n"
        f"🧘 *Action:* 2-min Box Breathing\n"
        f"💧 *Hydration:* Electrolyte Sync Required\n"
        f"━━━━━━━━━━━━━━━\n"
        f"📈 *BIO-SYNC STATUS:*\n"
        f"• Revenue: {revenue} KES\n"
        f"• Scale: {percent}% of Target\n"
        f"• Ads Identity: [Pending Review]\n"
        f"━━━━━━━━━━━━━━━\n"
        f"🚀 _Execute your 4-hour Deep Work block._"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"})
    
    return ("Briefing Sent", 200)
