import functions_framework
import json
import os
import requests
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

# --- CONFIGURATION ---
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')
SPREADSHEET_ID = os.environ.get('SPREADSHEET_ID')
RANGE_NAME = 'Transactions!A:E'

def send_telegram_alert(amount, receipt, phone):
    message = (
        f"⚡️ *Bio-Sync Master: Payment Received*\n"
        f"━━━━━━━━━━━━━━━\n"
        f"💰 *Amount:* {amount} KES\n"
        f"🧾 *Receipt:* `{receipt}`\n"
        f"📞 *Source:* {phone}\n"
        f"📍 *Node:* Nairobi HQ\n"
        f"━━━━━━━━━━━━━━━\n"
        f"✅ _Revenue Scale Updated_"
    )
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    requests.post(url, json=payload)

def update_google_sheet(amount, receipt, phone):
    info = json.loads(os.environ.get('SERVICE_ACCOUNT_JSON'))
    creds = service_account.Credentials.from_service_account_info(info)
    service = build('sheets', 'v4', credentials=creds)
    
    values = [[datetime.now().strftime("%Y-%m-%d %H:%M:%S"), receipt, phone, amount, "SUCCESS"]]
    body = {'values': values}
    
    service.spreadsheets().values().append(
        spreadsheetId=SPREADSHEET_ID, range=RANGE_NAME,
        valueInputOption="RAW", body=body
    ).execute()

@functions_framework.http
def mpesa_callback(request):
    callback_data = request.get_json()
    if not callback_data or 'Body' not in callback_data:
        return ('Invalid Data', 400)

    stk_callback = callback_data['Body']['stkCallback']
    if stk_callback['ResultCode'] == 0:
        meta = stk_callback['CallbackMetadata']['Item']
        amount = next(i for i in meta if i["Name"] == "Amount")["Value"]
        receipt = next(i for i in meta if i["Name"] == "MpesaReceiptNumber")["Value"]
        phone = next(i for i in meta if i["Name"] == "PhoneNumber")["Value"]

        # Dual-Action: Log to Sheet + Alert Phone
        update_google_sheet(amount, receipt, phone)
        send_telegram_alert(amount, receipt, phone)
        
        return ('Success', 200)
    
    return ('Processed', 200)
