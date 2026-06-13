import os
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

def check_google_payments():
    # 1. Pull the JSON block straight out of GitHub's secure runtime memory
    secret_json = os.environ.get("GOOGLE_CREDENTIALS")
    
    if not secret_json:
        print("❌ Error: GOOGLE_CREDENTIALS secret is not set in GitHub.")
        return

    try:
        # 2. Parse the string directly into Google's Auth payload parser
        info = json.loads(secret_json)
        scopes = ["https://www.googleapis.com/auth/adsense.readonly"]
        creds = service_account.Credentials.from_service_account_info(info, scopes=scopes)
        
        # 3. Instantiate the official service client
        service = build('adsense', 'v2', credentials=creds)
        
        # 4. Fetch actual account transaction data
        accounts_response = service.accounts().list().execute()
        accounts = accounts_response.get('accounts', [])
        
        if not accounts:
            print("⚠️ Authenticated successfully, but no AdSense accounts were linked.")
            return
            
        # Target your primary account reference node
        account_id = accounts[0]['name'] 
        
        # Pull payments collection logs from the API endpoint
        payments_data = service.accounts().payments().list(parent=account_id).execute()
        latest_payments = payments_data.get('payments', [])
        
        if latest_payments:
            # Sort out the active record item
            latest = latest_payments[0]
            
            # Formulate the payload structure matching your live UI requirements
            payment_status_payload = {
                "last_updated": latest.get("paymentDate"),
                "reference": latest.get("name").split('/')[-1], # Extracts identifier string
                "amount": float(latest.get("amount", 0)),
                "currency": "USD",
                "status": "HOLD" if latest.get("underReview", False) else "CLEARED",
                "uetr": "Extracted via clearing channel reference"
            }
            
            # Fire an alert if something is flagged
            if payment_status_payload["status"] == "HOLD":
                trigger_alert(payment_status_payload)
                
            # Write out to data directory for your frontend to stream
            os.makedirs('data', exist_ok=True)
            with open("data/payment_status.json", "w") as f:
                json.dump(payment_status_payload, f, indent=4)
                
            print("✅ Successfully synchronized payment logs with live dashboard asset.")
            
    except Exception as e:
        print(f"❌ Automation runtime crash: {str(e)}")

def trigger_alert(data):
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if bot_token and chat_id:
        message = f"⚠️ *Payment Alert* ⚠️\nReference: {data['reference']}\nAmount: ${data['amount']}\nStatus: *{data['status']}*. Check NCBA Suspense ledger."
        requests.post(f"https://api.telegram.org/bot{bot_token}/sendMessage", json={"chat_id": chat_id, "text": message, "parse_mode": "Markdown"})

if __name__ == "__main__":
    check_google_payments()
