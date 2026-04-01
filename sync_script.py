import os
import requests
import json
import sys

# --- 1. CONFIGURATION ---
CLIENT_ID = os.environ.get('ZOHO_CLIENT_ID')
CLIENT_SECRET = os.environ.get('ZOHO_CLIENT_SECRET')
REFRESH_TOKEN = os.environ.get('ZOHO_REFRESH_TOKEN')
TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token"
CRM_BASE_URL = "https://www.zohoapis.com/crm/v2"

# --- 2. DATA LOADING ---
def load_local_data():
    """Reads stats from a local file in the repo (e.g., stats.json)."""
    file_path = 'stats.json' # Ensure this file exists in your repo
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            return json.load(f)
    return {"clicks": 0, "last_update": "Unknown"}

# --- 3. CORE FUNCTIONS ---
def get_access_token():
    payload = {
        "refresh_token": REFRESH_TOKEN,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "refresh_token"
    }
    response = requests.post(TOKEN_URL, params=payload)
    return response.json().get("access_token")

def update_crm_with_stats(access_token, stats):
    url = f"{CRM_BASE_URL}/Leads" # Or your custom module
    headers = {
        "Authorization": f"Zoho-oauthtoken {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "data": [
            {
                "Website": "https://esthetics03-ops.github.io",
                "Description": f"Clicks: {stats.get('clicks')} | Updated: {stats.get('last_update')}",
                "Lead_Status": "Active_Nairobi_HQ",
                # Example: Map custom Zoho fields to your data
                "Total_Clicks": stats.get('clicks'), 
                "Project_Version": "Bio-Sync 23.1"
            }
        ]
    }

    print(f"🚀 Syncing {stats.get('clicks')} clicks to Zoho CRM...")
    response = requests.put(url, headers=headers, data=json.dumps(payload))
    print(response.json())

# --- 4. EXECUTION ---
if __name__ == "__main__":
    if not all([CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN]):
        print("❌ Missing ZOHO secrets.")
        sys.exit(1)

    current_stats = load_local_data()
    token = get_access_token()
    if token:
        update_crm_with_stats(token, current_stats)