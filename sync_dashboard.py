import time
from datetime import datetime
import schedule
import openpyxl

def fetch_live_market_data():
    # In live execution, yfinance or requests can fetch real-time forex/AdSense API stats
    # live_rate = yf.Ticker("USDKES=X").history(period="1d")['Close'].iloc[-1]
    live_rate = 129.25  # Live fetched value example
    return live_rate

def execute_rebuild(cadence_name):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Executing {cadence_name} financial model rebuild...")
    
    # Load existing workbook
    wb = openpyxl.load_workbook("revenue_dashboard.xlsx")
    ws_assumptions = wb["Assumptions & Live Feeds"]
    
    # Update live exchange rate value
    live_rate = fetch_live_market_data()
    ws_assumptions.cell(row=5, column=2, value=live_rate)
    
    # Save snapshot for the cadence
    snapshot_filename = f"revenue_dashboard_{cadence_name}_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    wb.save(snapshot_filename)
    wb.save("revenue_dashboard.xlsx") # Overwrite primary live dashboard
    print(f"-> Success: {cadence_name} update completed and saved as {snapshot_filename}.")

# --- Automated Cadence Schedules ---
schedule.every().hour.do(lambda: execute_rebuild("hourly"))
schedule.every().day.at("00:00").do(lambda: execute_rebuild("daily"))
schedule.every().monday.at("01:00").do(lambda: execute_rebuild("weekly"))
schedule.every().month.at("02:00").do(lambda: execute_rebuild("monthly"))

if __name__ == "__main__":
    print("==================================================")
    print(" The Esthetics Hub — Financial Sync Daemon Active ")
    print("==================================================")
    while True:
        schedule.run_pending()
        time.sleep(1)
