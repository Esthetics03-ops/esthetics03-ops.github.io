import requests
import sys

def ping_google(sitemap_url):
    # Google's official ping endpoint
    ping_url = f"https://www.google.com/ping?sitemap={sitemap_url}"
    
    try:
        response = requests.get(ping_url)
        if response.status_code == 200:
            print(f"✅ Success: Google notified of sitemap update: {sitemap_url}")
        else:
            print(f"⚠️ Google responded with status: {response.status_code}")
    except Exception as e:
        print(f"❌ Failed to ping Google: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Update this to your actual sitemap URL
    MY_SITEMAP = "https://esthetics03-ops.github.io/sitemap.xml"
    ping_google(MY_SITEMAP)
