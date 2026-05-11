/**
 * BIO-SYNC MASTER ENGINE v24.0
 * Deep Scan & Auto-Link Protocol
 */

const BioSync = {
    async init() {
        console.log("Initializing Bio-Sync Deep Scan...");
        try {
            const response = await fetch('protocols.json');
            if (!response.ok) throw new Error("Data Core unreachable.");
            
            const data = await response.json();
            
            // Validation Logic
            if (data.system_status !== "synced") {
                this.triggerAlert("Sync Mismatch Detected");
                return;
            }

            this.renderDashboard(data.protocols);
            console.log("System Status: 100% Optimized. 0 Errors.");
        } catch (error) {
            console.error("Critical System Error:", error.message);
        }
    },

    renderDashboard(protocols) {
        const grid = document.getElementById('protocol-grid');
        if (!grid) return;

        grid.innerHTML = protocols.map(p => `
            <div class="glass-card">
                <div class="status-tag">${p.status}</div>
                <h3>${p.title}</h3>
                <p>${p.description}</p>
                <div class="tag-container">
                    ${p.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${p.impact}"></div>
                </div>
                <a href="${p.link}" class="launch-link">Initialize Protocol →</a>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => BioSync.init());
