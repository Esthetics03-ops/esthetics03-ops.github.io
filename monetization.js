/**
 * Unblocking Script for Esthetics Hub
 */
const SYNC_CONFIG = {
    // Adding a timestamp (?t=) prevents the browser from loading "old" $0.00 data
    endpoint: `https://api.estheticshub.live/monetisation?t=${Date.now()}`,
    interval: 30000 
};

async function unblockAndSync() {
    try {
        const response = await fetch(SYNC_CONFIG.endpoint, {
            method: 'GET',
            mode: 'cors', // Explicitly request CORS mode
            cache: 'no-store' // Do not allow cached $0.00 values
        });

        if (!response.ok) throw new Error(`Server Status: ${response.status}`);

        const data = await response.json();
        
        // Update the UI
        document.getElementById('adsense-earnings').textContent = `$${data.adsense.toFixed(2)}`;
        document.getElementById('affiliate-earnings').textContent = `$${data.affiliate.toFixed(2)}`;
        document.getElementById('donation-earnings').textContent = `$${data.donations.toFixed(2)}`;
        document.getElementById('total-earnings').textContent = `$${data.total.toFixed(2)}`;
        
        console.log("✅ Data Synchronized Successfully");

    } catch (err) {
        console.error("❌ Sync Blocked:", err.message);
        // Alert the developer if the block is still active
        if (err.message.includes('fetch')) {
            console.warn("CORS Header missing on Server-side!");
        }
    }
}

// Start the sync
unblockAndSync();
setInterval(unblockAndSync, SYNC_CONFIG.interval);
