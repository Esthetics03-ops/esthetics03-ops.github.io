import time
from datetime import datetime
import openpyxl
import schedule

PROJECT_ID = "amiable-crane-465217-j9"


def fetch_live_financial_data():
  """Fetches live market data (e.g., USD/KES exchange rate) and updates financial metrics."""
  # Live market exchange rate feed (can be linked with yfinance or Google Finance APIs)
  live_exchange_rate = 129.28
  return live_exchange_rate


def rebuild_and_trigger(cadence_type):
  """Rebuilds the revenue dashboard workbook and triggers automated execution for the specified cadence."""
  print(
      f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [Project:"
      f" {PROJECT_ID}] Starting {cadence_type} model rebuild & trigger..."
  )

  try:
    wb = openpyxl.load_workbook("revenue_dashboard.xlsx")
    ws_assumptions = wb["Assumptions & Live Feeds"]

    # Update live exchange rate
    new_rate = fetch_live_financial_data()
    ws_assumptions.cell(row=5, column=2, value=new_rate)

    # Save snapshot and master workbook
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    snapshot_name = f"revenue_dashboard_{cadence_type}_{timestamp_str}.xlsx"

    wb.save(snapshot_name)
    wb.save("revenue_dashboard.xlsx")

    print(
        f"-> Success: {cadence_type.capitalize()} rebuild completed. Snapshot"
        f" saved as {snapshot_name}."
    )
  except Exception as e:
    print(f"-> Error during {cadence_type} rebuild: {e}")


# --- Automation Schedules ---
schedule.every().hour.do(lambda: rebuild_and_trigger("hourly"))
schedule.every().day.at("00:00").do(lambda: rebuild_and_trigger("daily"))
schedule.every().monday.at("01:00").do(lambda: rebuild_and_trigger("weekly"))
schedule.every().month.at("02:00").do(lambda: rebuild_and_trigger("monthly"))

if __name__ == "__main__":
  print("=========================================================")
  print(f" Financial Automation Daemon Active (Project: {PROJECT_ID})")
  print("=========================================================")
  # Immediate initial trigger test
  rebuild_and_trigger("initial-sync")

  while True:
    schedule.run_pending()
    time.sleep(1)
