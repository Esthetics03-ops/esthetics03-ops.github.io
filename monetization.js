/**
 * Esthetics Hub - Live Monetization Dashboard
 * Handles real-time revenue fetching from api.estheticshub.live
 */

const CONFIG = {
    API_URL: "https://api.estheticshub.live/monetisation?refresh=true",
    INTERVAL: 60000, // Refresh every 60 seconds
    FALLBACK_VALUE: "0.00"
};

async function fetchRevenue() {
    const dashboard = document.getElementById('monetization-dashboard');
    console.log("Syncing with Esthetics Hub API...");

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'GET',
            mode: 'cors', // Required for cross-domain requests
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        updateDisplay(data);

    } catch (error) {
        console.error("Dashboard Sync Failed:", error.message);
        setFallbackDisplay();
    }
}

function updateDisplay(data) {
    const fields = {
        'adsense-earnings': data.adsense,
        'affiliate-earnings': data.affiliate,
        'donation-earnings': data.donations,
        'total-earnings': data.total
    };

    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) {
            // Force conversion to number and format to 2 decimal places
            const amount = parseFloat(value) || 0;
            el.textContent = `$${amount.toFixed(2)}`;
            
            // Optional: Visual pulse effect on update
            el.classList.add('data-updated');
            setTimeout(() => el.classList.remove('data-updated'), 1000);
        }
    }
}

function setFallbackDisplay() {
    const ids = ['adsense-earnings', 'affiliate-earnings', 'donation-earnings', 'total-earnings'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && (el.textContent === "" || el.textContent.includes("Loading"))) {
            el.textContent = `$${CONFIG.FALLBACK_VALUE}`;
        }
    });
}

// Initialise on Page Load
document.addEventListener("DOMContentLoaded", () => {
    fetchRevenue();
    setInterval(fetchRevenue, CONFIG.INTERVAL);
});
