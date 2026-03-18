import os
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# CONFIGURATION
TARGET_GOAL = 300.00
USER_NAME = "George Kutosi Ondimu"
NCBA_ACC = "1003791648"

# This variable would ideally be stored in a database (like Firebase or SQL)
current_total_spend = 0.0

@app.route('/mpesa-callback', methods=['POST'])
def mpesa_callback():
    global current_total_spend
    data = request.json
    
    # Extract data from Safaricom's JSON structure
    result_code = data['Body']['stkCallback']['ResultCode']
    
    if result_code == 0:  # Success
        items = data['Body']['stkCallback']['CallbackMetadata']['Item']
        amount = next(item['Value'] for item in items if item['Name'] == 'Amount')
        
        # Convert KES to USD (Approximate 2026 rate)
        usd_amount = amount / 135.0 
        current_total_spend += usd_amount
        
        print(f"Update: {USER_NAME} spent ${usd_amount:.2f} via M-PESA. Total: ${current_total_spend:.2f}")
        return jsonify({"status": "Success", "new_total": current_total_spend}), 200
    
    return jsonify({"status": "Failed", "message": "Transaction rejected"}), 400

@app.route('/get-ads-progress', methods=['GET'])
def get_progress():
    return jsonify({
        "current_spend": round(current_total_spend, 2),
        "remaining": round(max(0, TARGET_GOAL - current_total_spend), 2),
        "percent": round((current_total_spend / TARGET_GOAL) * 100, 1)
    })

if __name__ == '__main__':
    app.run(port=5000)
