import os
import sqlite3
import json
import asyncio
import pandas as pd
from datetime import datetime
from telegram import Bot
from google.oauth2 import service_account
from googleapiclient.discovery import build

# --- Core Logic ---

async def send_telegram_update(message):
    """Sends a secure update to your admin Telegram chat."""
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if token and chat_id:
        bot = Bot(token=token)
        await bot.send_message(chat_id=chat_id, text=message, parse_mode='Markdown')

def get_gspread_client():
    creds_json = json.loads(os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON'))
    scopes = ['https://www.googleapis.com/auth/spreadsheets']
    creds = service_account.Credentials.from_service_account_info(creds_json, scopes=scopes)
    return build('sheets', 'v4', credentials=creds)

async def archive_and_sync():
    start_time = datetime.now()
    try:
        # 1. Extraction
        db_path = os.getenv('DB_DATABASE', 'database/hub_storage.sqlite')
        conn = sqlite3.connect(db_path)
        query = "SELECT created_at, amount, mpesa_receipt FROM mpesa_payments WHERE status = 'Completed'"
        df = pd.read_sql_query(query, conn)
        conn.close()

        if df.empty:
            await send_telegram_update("📊 *Sunday Sync:* No new M-PESA transactions found this week.")
            return

        # 2. Transform (Mapping to your Esthetics Hub Dashboard schema)
        df['Page'] = 'Payment_Gateway'
        df['AdSense_Earnings_USD'] = 0.0
        # Convert KES to USD (Estimate: 128)
        df['Affiliate_Earnings_USD'] = df['amount'] / 128 
        values = df[['created_at', 'Page', 'amount', 'AdSense_Earnings_USD', 'Affiliate_Earnings_USD']].values.tolist()

        # 3. Load to Sheets
        service = get_gspread_client()
        spreadsheet_id = os.getenv('SHEET_ID')
        range_name = 'RawData!A:E'
        
        body = {'values': values}
        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id, range=range_name,
            valueInputOption='USER_ENTERED', body=body).execute()

        # 4. Final Success Notification
        duration = (datetime.now() - start_time).total_seconds()
        msg = (f"✅ *Sync Successful: Bio-Sync Hub v18.0*\n"
               f"💰 Transactions: {len(df)}\n"
               f"🕒 Duration: {duration:.2f}s\n"
               f"🔗 [View Dashboard](https://docs.google.com/spreadsheets/d/{spreadsheet_id})")
        await send_telegram_update(msg)

    except Exception as e:
        await send_telegram_update(f"❌ *Sync Failed:* {str(e)}")

if __name__ == "__main__":
    asyncio.run(archive_and_sync())
