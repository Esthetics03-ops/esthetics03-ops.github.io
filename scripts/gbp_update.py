import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

def get_gbp_service():
    # FIX 1: Align environment variable name with your GitHub Actions configuration
    creds_raw = os.getenv('GOOGLE_CREDENTIALS_JSON')
    if not creds_raw:
        raise ValueError("Error: GOOGLE_CREDENTIALS_JSON environment variable is missing.")
        
    creds_json = json.loads(creds_raw)
    
    # FIX 2: Explicitly inject the business management scope (required for Service Accounts)
    SCOPES = ['https://www.googleapis.com/auth/business.manage']
    creds = service_account.Credentials.from_service_account_info(creds_json, scopes=SCOPES)
    
    # FIX 3: Point to the business updates engine for creating timeline updates/posts
    return build('mybusinessbusinessupdates', 'v1', credentials=creds)

def update_business_status(location_id, post_content):
    """
    Automatically posts a 'Wellness Update' to your Google Business Profile.
    """
    if not location_id or "YOUR_LOCATION_ID" in location_id:
        print("::warning :: GBP Location ID not configured correctly. Skipping API push.")
        return

    service = get_gbp_service()
    
    post_body = {
        "languageCode": "en-US",
        "summary": post_content,
        "callToAction": {
            "actionType": "LEARN_MORE",
            "url": "https://esthetics03-ops.github.io"
        }
    }
    
    print(f"Syncing protocol update to Google Business Profile for location: {location_id}...")
    
    try:
        # FIX 4: Corrected execution endpoint path for modern Google business posts
        response = service.locations().localPosts().create(
            parent=location_id, 
            body=post_body
        ).execute()
        print("⚡ Success! Status synchronized to Google Business Profile Dashboard.")
        return response
    except Exception as e:
        print(f"Error executing GBP API Post: {e}")
        raise e

if __name__ == "__main__":
    # FIX 5: Dynamically capture the Location ID passed by the GitHub Runner environment
    env_location_id = os.getenv('LOCATION_ID')
    
    if env_location_id:
        target_location = env_location_id
    else:
        # Fallback placeholder string
        target_location = "locations/YOUR_LOCATION_ID"
        
    update_text = "New Bio-Sync Protocol v18.0 is now live. Check our real-time status dashboard!"
    update_business_status(target_location, update_text)
