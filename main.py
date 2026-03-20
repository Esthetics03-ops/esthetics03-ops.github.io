import functions_framework
import json
import os
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

# --- CONFIGURATION ---
SPREADSHEET_ID = os.environ.get('SPREADSHEET_ID', 'YOUR_ID_HERE')
RANGE_NAME = 'Transactions!A:E'

def update_google_sheet(amount, receipt, phone):
    # Retrieve service account info from Environment Variable
    # In GCF, you'll save the JSON content as an Env Var named SERVICE_ACCOUNT_JSON
    info = json.loads(os.environ.get('SERVICE_ACCOUNT_JSON'))
    creds = service_account.Credentials.from_service_account_info(info)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    values = [[
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
        receipt, 
        phone, 
        amount, 
        "SUCCESS"
    ]]
    body = {'values': values}
    
    result = sheet.values().append(
        spreadsheetId=SPREADSHEET_ID, 
        range=RANGE_NAME,
        valueInputOption="RAW", 
        body=body
    ).execute()
    return result

@functions_framework.http
def mpesa_callback(request):
    callback_data = request.get_json()
    
    # Validation: Ensure it's a valid Safaricom callback
    if not callback_data or 'Body' not in callback_data:
        return ('Invalid Data', 400)

    stk_callback = callback_data['Body']['stkCallback']
    res_code = stk_callback['ResultCode']

    if res_code == 0:
        meta = stk_callback['CallbackMetadata']['Item']
        
        # Safely extract values from the metadata list
        amount = next(i for i in meta if i["Name"] == "Amount")["Value"]
        receipt = next(i for i in meta if i["Name"] == "MpesaReceiptNumber")["Value"]
        phone = next(i for i in meta if i["Name"] == "PhoneNumber")["Value"]

        update_google_sheet(amount, receipt, phone)
        print(f"Bio-Sync Success: Receipt {receipt}")
        return ('Success', 200)
    
    print(f"Bio-Sync: Transaction {stk_callback.get('MerchantRequestID')} was not successful.")
    return ('Processed', 200)
