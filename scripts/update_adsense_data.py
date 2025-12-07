import os
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def get_adsense_service():
    creds = Credentials(
        None,
        refresh_token=os.environ["ADSENSE_REFRESH_TOKEN"],
        client_id=os.environ["ADSENSE_CLIENT_ID"],
        client_secret=os.environ["ADSENSE_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/adsense.readonly"]
    )
    return build("adsense", "v2", credentials=creds)

def fetch_report():
    service = get_adsense_service()
    # CHANGE THIS to your own publisher id!
    account_id = "accounts/pub-XXXXXXX"
    report = service.accounts().reports().generate(
        account=account_id,
        dateRange='LAST_7_DAYS',
        metrics=['ESTIMATED_EARNINGS', 'IMPRESSIONS'],
        dimensions=['DATE']
    ).execute()
    os.makedirs("dashboard", exist_ok=True)
    with open("dashboard/adsense_report.json", "w") as f:
        import json
        json.dump(report, f, indent=2)

if __name__ == "__main__":
    fetch_report()
