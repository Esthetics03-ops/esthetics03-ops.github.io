import os
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

def get_docs_service():
    creds_json = json.loads(os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON'))
    creds = service_account.Credentials.from_service_account_info(
        creds_json, scopes=['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive']
    )
    return build('docs', 'v1', credentials=creds)

def create_weekly_report(stats):
    service = get_docs_service()
    title = f"Esthetics Hub Weekly Report: {datetime.now().strftime('%Y-%m-%d')}"
    
    # 1. Create a new document
    doc = service.documents().create(body={'title': title}).execute()
    doc_id = doc.get('documentId')

    # 2. Build report content
    requests = [
        {'insertText': {'location': {'index': 1}, 'text': f"{title}\n\n"}},
        {'insertText': {'location': {'index': len(title) + 3}, 'text': 
            f"Operational Status: ACTIVE\n"
            f"Total M-PESA Transactions: {stats['count']}\n"
            f"Total Earnings (USD): ${stats['total_usd']:.2f}\n"
            f"Lighthouse Performance: {stats['performance']}%\n\n"
            f"Notes: This report was generated automatically by Bio-Sync Core v18.0."
        }}
    ]

    service.documents().batchUpdate(documentId=doc_id, body={'requests': requests}).execute()
    return f"https://docs.google.com/document/d/{doc_id}"

# Example integration into your sync script
if __name__ == "__main__":
    # In a real run, these values would come from your sync logic
    sample_stats = {
        'count': 12,
        'total_usd': 156.50,
        'performance': 94
    }
    report_url = create_weekly_report(sample_stats)
    print(f"Report generated: {report_url}")
