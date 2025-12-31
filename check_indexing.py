import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
import requests

# 1. Setup API Client
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
service_account_info = json.loads(os.environ['GCP_SERVICE_ACCOUNT_JSON'])
credentials = service_account.Credentials.from_service_account_info(service_account_info, scopes=SCOPES)
search_console = build('searchconsole', 'v1', credentials=credentials)

# 2. Site Configuration
SITE_URL = "https://esthetics03-ops.github.io/" # Must match Search Console property
REPO = os.environ['GITHUB_REPOSITORY']
TOKEN = os.environ['GITHUB_TOKEN']

def create_github_issue(title, body):
    url = f"https://api.github.com/repos/{REPO}/issues"
    headers = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}
    data = {"title": title, "body": body, "labels": ["SEO-Alert", "Indexing"]}
    requests.post(url, headers=headers, json=data)

def check_indexing():
    try:
        # Request a Search Console Inspection for the main page
        request = {
            'inspectionUrl': SITE_URL,
            'siteUrl': SITE_URL
        }
        res = search_console.urlInspection().index().inspect(body=request).execute()
        
        result = res.get('inspectionResult', {})
        index_status = result.get('indexStatusResult', {}).get('verdict', 'UNKNOWN')
        mobile_status = result.get('mobileUsabilityResult', {}).get('verdict', 'UNKNOWN')

        # If issues found, create an issue
        if index_status != "PASS" or mobile_status != "PASS":
            body = f"### 🚩 SEO Indexing Alert\n\n**URL:** {SITE_URL}\n"
            body += f"- **Index Status:** {index_status}\n"
            body += f"- **Mobile Usability:** {mobile_status}\n\n"
            body += "Please check Google Search Console for detailed crawl errors."
            
            create_github_issue(f"SEO Alert: Indexing Issue Detected", body)
            print("Issue created in GitHub.")
        else:
            print("Site is healthy and indexed.")

    except Exception as e:
        print(f"Error connecting to Search Console: {e}")

if __name__ == "__main__":
    check_indexing()
