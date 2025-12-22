const CONFIG = {
    // UPDATED: Ensuring the path matches your Google Cloud / Server structure
    API_URL: "https://api.estheticshub.live/monetisation", 
    INTERVAL: 30000 
};

async function updateDashboard() {
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors'
        });

        if (!response.ok) throw new Error('API Offline');
        const data = await response.json();

        // FIX: Mapping API keys to your specific HTML IDs
        document.getElementById('adsense-earnings').textContent = `$${parseFloat(data.adsense || 0).toFixed(2)}`;
        document.getElementById('affiliate-earnings').textContent = `$${parseFloat(data.affiliate || 0).toFixed(2)}`;
        document.getElementById('donation-earnings').textContent = `$${parseFloat(data.donations || 0).toFixed(2)}`;
        document.getElementById('total-earnings').textContent = `$${parseFloat(data.total || 0).toFixed(2)}`;
        
        // Update "Last Updated" timestamp
        const timeEl = document.querySelector('.status-card p');
        if(timeEl) timeEl.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;

    } catch (error) {
        console.error('Dashboard Error:', error);
        // Fallback to $0.00 so users don't see "Loading..." forever
        ['adsense-earnings', 'affiliate-earnings', 'donation-earnings', 'total-earnings'].forEach(id => {
            const el = document.getElementById(id);
            if (el && el.textContent === 'Loading...') el.textContent = '$0.00';
        });
    }
}

document.addEventListener('DOMContentLoaded', updateDashboard);
setInterval(updateDashboard, CONFIG.INTERVAL);
