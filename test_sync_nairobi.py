import requests
import json

# Your actual deployed Google Cloud Function URL
URL = "https://europe-west1-biotics-sync-master.cloudfunctions.net/mpesa_callback"

# Mock Data: Simulating a 1,500 KES payment from a Nairobi node
mock_payload = {
    "Body": {
        "stkCallback": {
            "MerchantRequestID": "29115-34624531-1",
            "CheckoutRequestID": "ws_CO_191220231020326337",
            "ResultCode": 0,
            "ResultDesc": "The service request is processed successfully.",
            "CallbackMetadata": {
                "Item": [
                    {"Name": "Amount", "Value": 1500.00},
                    {"Name": "MpesaReceiptNumber", "Value": "RQK7YHT92P"},
                    {"Name": "TransactionDate", "Value": 20260320174500},
                    {"Name": "PhoneNumber", "Value": 254712345678}
                ]
            }
        }
    }
}

print(f"--- [BIO-SYNC MASTER v23.1] Initiating Mock Handshake ---")
print(f"Targeting Node: {URL}")

try:
    # We use a 10-second timeout to account for international routing to Europe-West1
    response = requests.post(URL, json=mock_payload, timeout=10)
    
    print(f"Status Code: {response.status_code}")
    print(f"Server Response: {response.text}")
    
    if response.status_code == 200:
        print("\n[SUCCESS] Handshake Verified.")
        print("ACTION: Open your Google Sheet 'Transactions' tab to see the 1,500 KES entry.")
    else:
        print(f"\n[FAILED] Server returned error: {response.status_code}")
        print("ACTION: Check GCF Logs for 'SERVICE_ACCOUNT_JSON' formatting errors.")
        
except requests.exceptions.Timeout:
    print("\n[TIMEOUT] The Nairobi-to-Europe handshake took too long. Check GCF cold start status.")
except Exception as e:
    print(f"\n[CONNECTION ERR] {e}")
