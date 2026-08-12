import pandas as pd
from datetime import datetime, timedelta

def update_dashboard():
    file_path = "Esthetics_Revenue_Dashboard.xlsx"
    
    # Load existing workbook or sheets
    try:
        df_summary = pd.read_excel(file_path, sheet_name="Dashboard Summary")
        df_ads = pd.read_excel(file_path, sheet_name="AdSense Data")
        df_aff = pd.read_excel(file_path, sheet_name="Affiliate Data")
    except Exception as e:
        print(f"Error loading sheets: {e}")
        return

    # Add your data ingestion logic here (e.g., fetching from an API or database)
    # Example: Appending a new row for the current day dynamically
    
    # Save back to Excel
    with pd.ExcelWriter(file_path, engine='openpyxl', mode='w') as writer:
        df_summary.to_excel(writer, sheet_name="Dashboard Summary", index=False)
        df_ads.to_excel(writer, sheet_name="AdSense Data", index=False)
        df_aff.to_excel(writer, sheet_name="Affiliate Data", index=False)
        
    print("Dashboard successfully updated and saved.")

if __name__ == "__main__":
    update_dashboard()
