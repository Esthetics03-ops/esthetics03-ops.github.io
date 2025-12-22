/**
 * Esthetics Hub - Diagnostic Sync Script
 */
const API_URL = "https://api.estheticshub.live/monetisation";

async function runDiagnostics() {
    const statusText = document.querySelector('.section-subtitle');
    
    try {
        statusText.textContent = "🔍 Checking connection to Google Cloud...";
        
        const response = await fetch(API_URL, {
            method: 'GET',
            mode: 'cors'
        });

        if (response.ok) {
            const data = await response.json();
            statusText.textContent = "✅ Synchronization Active";
            statusText.style.color = "#48bb78"; // Success Green
            updateUI(data);
        } else {
            throw new Error(`Server Error: ${response.status}`);
        }

    } catch (error) {
        statusText.style.color = "#f56565"; // Error Red
        
        if (error.message.includes('fetch')) {
            statusText.textContent = "❌ Blocked by CORS: Check server.js headers";
        } else if (error.message.includes('404')) {
            statusText.textContent = "❌ API URL Not Found: Check Google Cloud path";
        } else {
            statusText.textContent = `❌ Error: ${error.message}`;
        }
        
        // Zero out the display so it doesn't stay on "Loading..."
        setZeroDisplay();
    }
}

function updateUI(data) {
    document.getElementById('adsense-earnings').textContent = `$${data.adsense.toFixed(2)}`;
    document.getElementById('affiliate-earnings').textContent = `$${data.affiliate.toFixed(2)}`;
    document.getElementById('donation-earnings').textContent = `$${data.donations.toFixed(2)}`;
    document.getElementById('total-earnings').textContent = `$${data.total.toFixed(2)}`;
}

function setZeroDisplay() {
    const ids = ['adsense-earnings', 'affiliate-earnings', 'donation-earnings', 'total-earnings'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "$0.00";
    });
}

document.addEventListener('DOMContentLoaded', runDiagnostics);
