const CONFIG = {
    // Optimization: Added a cache-buster to ensure you get real-time revenue
    URL: "https://api.estheticshub.live/monetisation?cache=" + Date.now(),
    TIMEOUT: 5000 // 5 seconds
};

async function syncDashboard() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
        const response = await fetch(CONFIG.URL, { 
            signal: controller.signal,
            mode: 'cors' 
        });

        if (!response.ok) throw new Error("Server Unreachable");

        const data = await response.json();
        updateUI(data);
    } catch (err) {
        console.warn("Sync blocked/timeout. Falling back to 0.00 stats.");
        setFallbackValues();
    }
}

function updateUI(data) {
    // Map API keys to your Dashboard IDs
    const mappings = {
        'adsense-earnings': data.adsense,
        'affiliate-earnings': data.affiliate,
        'donation-earnings': data.donations,
        'total-earnings': data.total
    };

    Object.entries(mappings).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.innerText = `$${parseFloat(val || 0).toFixed(2)}`;
    });
}

function setFallbackValues() {
    ['adsense-earnings', 'affiliate-earnings', 'donation-earnings', 'total-earnings'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = "$0.00";
    });
}

document.addEventListener('DOMContentLoaded', syncDashboard);
