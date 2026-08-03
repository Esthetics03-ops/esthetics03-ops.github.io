import json
from datetime import datetime

def run_audit(ledger_path='ledger.json'):
    try:
        with open(ledger_path, 'r') as f:
            data = json.load(f)
            transactions = data.get('transactions', [])
        
        # Aggregate totals
        total_revenue = sum(t.get('amount', 0) for t in transactions)
        count = len(transactions)
        
        print(f"--- SYSTEM AUDIT REPORT | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
        print(f"Total Transactions Found: {count}")
        print(f"Total Revenue Aggregated: ${total_revenue:,.2f}")
        print("-" * 50)
        
        # Print last 5 transactions
        print("Last 5 Transactions:")
        for t in transactions[-5:]:
            print(f"[{t['timestamp'][:10]}] {t['type']}: ${t['amount']:.2f} | ID: {t['id']}")
            
    except FileNotFoundError:
        print("Error: ledger.json not found. Ensure script is in the same directory.")

if __name__ == "__main__":
    run_audit()
