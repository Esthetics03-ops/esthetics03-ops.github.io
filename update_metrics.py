import json
import os
from datetime import datetime

# In a real setup, you'd call: service.accounts().reports().generate(...)
def fetch_adsense_earnings():
    # Placeholder for API Logic
    return 145.20 

def fetch_ga4_metrics():
    # Placeholder for API Logic
    return {"conv": 32, "ctr": 5.1}

def update_json():
    # 1. Load current file
    with open('config.json', 'r') as f:
        config = json.load(f)

    # 2. Update values with live API data
    config['metadata']['last_sync'] = datetime.utcnow().isoformat() + "Z"
    
    for tracker in config['trackers']:
        if tracker['id'] == 'stat-revenue':
            tracker['value'] = fetch_adsense_earnings()
        if tracker['id'] == 'stat-conv':
            tracker['value'] = fetch_ga4_metrics()['conv']
        if tracker['id'] == 'stat-ctr':
            tracker['value'] = fetch_ga4_metrics()['ctr']

    # 3. Save back to file
    with open('config.json', 'w') as f:
        json.dump(config, f, indent=2)

if __name__ == "__main__":
    update_json()
