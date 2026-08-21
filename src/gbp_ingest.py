import os
import json
from googleapiclient.discovery import build
from google.oauth2 import service_account

# Setup credentials from the environment variable (GCP Service Account JSON)
def get_gbp_service():
    # Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your GitHub environment
    return build('mybusinessbusinessinformation', 'v1')

def fetch_performance_metrics(location_name):
    """
    Fetches performance metrics for the given location.
    """
    service = get_gbp_service()
    
    try:
        # Example: Fetching performance metrics
        # Note: You may need to use the 'mybusinessreporting' API 
        # depending on your specific GCP project setup.
        response = service.accounts().locations().get(name=location_name).execute()
        return response
    except Exception as e:
        print(f"Error fetching GBP metrics: {e}")
        return None

if __name__ == "__main__":
    # The location name retrieved from your profile
    location = "locations/2440185579889306379"
    
    metrics = fetch_performance_metrics(location)
    
    if metrics:
        # Save as JSON for BigQuery ingestion
        with open('gbp_data.json', 'w') as f:
            json.dump(metrics, f)
        print("Successfully fetched and saved GBP metrics.")
    else:
        exit(1) # Exit with error code to trigger GitHub Actions failure alert
