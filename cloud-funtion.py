import functions_framework
from google.ads.googleads.client import GoogleAdsClient

# Replace with your actual IDs
CUSTOMER_ID = 'YOUR_GOOGLE_ADS_CUSTOMER_ID'
BUSINESS_PROFILE_ID = '2440185579889306379'

@functions_framework.http
def get_campaign_status(request):
    # Initialize the Google Ads Client (requires a google-ads.yaml file)
    client = GoogleAdsClient.load_from_storage()
    ga_service = client.get_service("GoogleAdsService")

    # Query to fetch status for the campaign linked to your Business Profile
    query = f"""
        SELECT campaign.id, campaign.name, campaign.status, campaign.primary_status 
        FROM campaign 
        WHERE campaign.status != 'REMOVED'
    """
    
    try:
        response = ga_service.search(customer_id=CUSTOMER_ID, query=query)
        results = []
        for row in response:
            results.append({
                "name": row.campaign.name,
                "status": row.campaign.status.name,
                "primary_status": row.campaign.primary_status.name
            })
        
        return ({"business_id": BUSINESS_PROFILE_ID, "campaigns": results}, 200, 
                {'Access-Control-Allow-Origin': '*'})
    except Exception as e:
        return ({"error": str(e)}, 500, {'Access-Control-Allow-Origin': '*'})
