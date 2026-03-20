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
