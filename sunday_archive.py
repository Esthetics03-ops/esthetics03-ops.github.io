import os
import sqlite3
import pandas as pd
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

def get_gspread_client():
    # Load credentials from the environment variable (JSON string from GitHub Secrets)
    creds_json = json.loads(os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON'))
    scopes = ['https://www.googleapis.com/auth/spreadsheets']
    creds = service_account.Credentials.from_service_account_info(creds_json, scopes=scopes)
    return build('sheets', 'v4', credentials=creds)

def archive_and_sync():
    # 1. Extract from SQLite
    db_path = os.getenv('DB_DATABASE', 'database/hub_storage.sqlite')
    conn = sqlite3.connect(db_path)
    
    # Query M-PESA transactions that happened in the last 7 days
    query = """
        SELECT created_at as Date, 'M-PESA' as Source, amount as Earnings, mpesa_receipt as Reference 
        FROM mpesa_payments 
        WHERE status = 'Completed'
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    if df.empty:
        print("No new transactions to archive this week.")
        return

    # 2. Format for RawData tab (Matching your Esthetics Hub schema)
    # Mapping to your columns: Date, Page, Pageviews, AdSense_Earnings_USD, etc.
    df['Page'] = 'Payment_Gateway'
    df['Pageviews'] = 0
    df['AdSense_Earnings_USD'] = 0.0
    df['Affiliate_Earnings_USD'] = df['Earnings'] # Mapping M-PESA as internal affiliate revenue
    
    # Prepare data for Google Sheets (List of lists)
    values = df[['Date', 'Page', 'Pageviews', 'AdSense_Earnings_USD', 'Affiliate_Earnings_USD']].values.tolist()

    # 3. Upload to Google Sheets
    service = get_gspread_client()
    spreadsheet_id = os.getenv('SHEET_ID')
    range_name = 'RawData!A:E' # Appends to the bottom of these columns

    body = {'values': values}
    result = service.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id, range=range_name,
        valueInputOption='USER_ENTERED', body=body).execute()

    print(f"Success: {result.get('updates').get('updatedCells')} cells appended to Bio-Sync Hub.")

if __name__ == "__main__":
    archive_and_sync()
