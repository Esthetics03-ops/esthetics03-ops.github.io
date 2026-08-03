import json
import os
from datetime import datetime

JSON_PATH = "config.json"

def reconcile_bank_transfer():
    if not os.path.exists(JSON_PATH):
        return

    with open(JSON_PATH, "r") as f:
        data = json.load(f)

    today = datetime.now()
    updated = False

    # 1. Detect Payout Day (The 21st of January)
    if today.day >= 21:
        for entry in data["history"]:
            # If December is still in TRANSIT, move it to PAID
            if entry["month"] == "December 2025" and entry["status"] == "TRANSIT":
                entry["status"] = "PAID"
                entry["note"] = f"Bank Deposit Confirmed on {today.strftime('%Y-%m-%d')}"
                updated = True
                print("💰 ALERT: December Funds have been SETTLED to your bank account!")

    # 2. Check for Month-End Rollover (Preparing for February)
    if today.day == 1:
        # Check if February already exists, if not, create it
        months = [item["month"] for item in data["history"]]
        current_month_name = today.strftime("%B %Y")
        
        if current_month_name not in months:
            # Move last month to TRANSIT
            for entry in data["history"]:
                if entry["status"] == "ACTIVE":
                    entry["status"] = "TRANSIT"
            
            # Create New Month
            new_entry = {
                "month": current_month_name,
                "revenue": 0.00,
                "status": "ACTIVE",
                "note": "New month initialized."
            }
            data["history"].append(new_entry)
            updated = True
            print(f"📅 MONTHLY ROLLOVER: {current_month_name} is now ACTIVE.")

    if updated:
        with open(JSON_PATH, "w") as f:
            json.dump(data, f, indent=2)
        return True
    return False

if __name__ == "__main__":
    reconcile_bank_transfer()
