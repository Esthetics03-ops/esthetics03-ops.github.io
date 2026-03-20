/**
 * BIO-SYNC AUTO-RELOADER v18.5
 * Runs a background sync every 60 minutes.
 */

const SYNC_INTERVAL = 60 * 60 * 1000; // 60 Minutes in milliseconds

function startAutoSync() {
    console.log("Auto-Sync Initialized: Next update in 60m");
    
    // Recursive loop to prevent overlapping requests
    async function syncLoop() {
        try {
            // Reuses your existing connection check logic
            await reloadDashboardAssets(); 
            console.log(`Auto-Sync Success: ${new Date().toLocaleTimeString()}`);
        } catch (err) {
            console.warn("Auto-Sync skipped due to connection error. Retrying next hour.");
        }
        
        // Schedule the next run
        setTimeout(syncLoop, SYNC_INTERVAL);
    }

    // Initial delay to avoid slowing down the first page load
    setTimeout(syncLoop, SYNC_INTERVAL);
}

// Start the timer once the DOM is fully ready
document.addEventListener('DOMContentLoaded', startAutoSync);

/**
 * THE BIO-SYNC ASSET LOADER
 * Automatically synchronizes UI components on reload.
 */

async function syncPremiumAssets() {
    const dataSource = './data.json'; // Can be a local path or a Google Sheets API URL

    try {
        const response = await fetch(dataSource);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();

        // 1. Update Hero Section
        if(document.getElementById('hero-title')) {
            document.getElementById('hero-title').innerText = data.hero.title;
        }

        // 2. Inject Ads Assets into UI for Review
        const assetContainer = document.getElementById('asset-list');
        if(assetContainer) {
            assetContainer.innerHTML = data.adsAssets.map(asset => `
                <div class="asset-item" style="border-left: 4px solid ${data.config.mpesaBorder}">
                    <strong>${asset.type}:</strong> ${asset.text}
                </div>
            `).join('');
        }

        // 3. Log Sync Success
        console.log(`%c Bio-Sync v${data.siteVersion} Active `, 'background: #4FB32A; color: white; border-radius: 4px;');

    } catch (error) {
        console.error('Bio-Sync failed to load assets:', error);
    }
}

// Execute on every page reload
window.addEventListener('DOMContentLoaded', syncPremiumAssets);
