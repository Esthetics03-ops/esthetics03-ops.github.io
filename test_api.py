import os
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunRealtimeReportRequest, Metric

# YOUR ACTUAL IDENTITY
API_KEY = "AIzaSyDadhQvQJsezb0Jj8LkaA6NPHvZ6b3guuY"
PROPERTY_ID = "319520471"

def run_actual_test():
    print(f"--- 📡 CONNECTING TO GOOGLE REALTIME API ---")
    try:
        # Initialize the client with your key
        client = BetaAnalyticsDataClient(client_options={"api_key": API_KEY})
        
        request = RunRealtimeReportRequest(
            property=f"properties/{PROPERTY_ID}",
            metrics=[Metric(name="activeUsers")]
        )
        
        response = client.run_realtime_report(request)
        
        if response.rows:
            # This is the ACTUAL number from your site right now
            actual_users = response.rows[0].metric_values[0].value
            print(f"✅ SUCCESS: Connection Established.")
            print(f"📊 ACTUAL LIVE VISITORS: {actual_users}")
        else:
            print(f"✅ SUCCESS: Connection Established, but 0 users are active right now.")
            
    except Exception as e:
        print(f"❌ CONNECTION FAILED")
        print(f"Error Details: {e}")

if __name__ == "__main__":
    run_actual_test()
