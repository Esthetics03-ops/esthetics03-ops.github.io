import json
import time
import os
from datetime import datetime
from git import Repo

# --- CONFIGURATION ---
JSON_PATH = "config.json"
REPO_PATH = "./"  # The path to your local git repository
COMMIT_MESSAGE = "🤖 Bio-Sync: Live Data Update"

def fetch_live_metrics():
    # Insert your actual data logic here
    return {
        "revenue": 12850.75,
        "conversions": 425,
        "latency": 21,
        "ctr": 4.5
    }

def push_to_github():
    try:
        repo = Repo(REPO_PATH)
        repo.git.add(JSON_PATH)
        # Only commit if there are changes
        if repo.is_dirty(untracked_files=True):
            repo.index.commit(COMMIT_MESSAGE)
            origin = repo.remote(name='origin')
            origin.push()
            print(f"✅ Successfully pushed to Repository at {datetime.now()}")
        else:
            print("px No data changes detected. Skipping push.")
    except Exception as e:
        print(f"❌ Git Error: {e}")

def update_config():
    metrics = fetch_live_metrics()
    
    config_data = {
        "trackers": [
            {"id": "stat-revenue", "value": metrics['revenue'], "prefix": "$", "suffix": ""},
            {"id": "stat-conv", "value": metrics['conversions'], "prefix": "", "suffix": ""},
            {"id": "stat-latency", "value": metrics['latency'], "prefix": "", "suffix": "ms"},
            {"id": "stat-ctr", "value": metrics['ctr'], "prefix": "", "suffix": "%"}
        ],
        "chartData": {
            "labels": ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", datetime.now().strftime("%H:%M")],
            "points": [80, 85, 82, 90, 88, 95, 99]
        },
        "forecast": metrics['revenue'] * 1.15,
        "goal": 20000
    }

    with open(JSON_PATH, "w") as f:
        json.dump(config_data, f, indent=4)
    
    # Auto-Push to GitHub
    push_to_github()

if __name__ == "__main__":
    print("🚀 Bio-Sync Auto-Deploy Engine Active...")
    while True:
        update_config()
        # Sleep for 5 minutes (300s) to avoid hitting GitHub rate limits
        time.sleep(300)
