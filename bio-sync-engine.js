/**
 * BIO-SYNC ENGINE v24.0.5 - LOGIC EXPANSION
 * Features: Live Scan Sequence, Pulse Monitoring, Metadata Injection
 */

const BioSync = {
    async init() {
        this.updateStatus("INITIATING SCAN...");
        
        try {
            // Artificial delay to simulate "Deep Scanning" the repository
            await new Promise(resolve => setTimeout(resolve, 1200));

            const response = await fetch('protocols.json');
            if (!response.ok) throw new Error("Data Core Offline");
            
            const data = await response.json();
            this.renderProtocols(data.protocols);
            this.injectMetadata(data);
            this.startUptimeCounter();
            
            this.updateStatus("SYSTEM READY", "var(--success)");
        } catch (error) {
            this.updateStatus("SYNC ERROR", "#ff4444");
            console.error("Critical Logic Failure:", error);
        }
    },

    updateStatus(msg, color = "var(--accent)") {
        const statusEl = document.getElementById('sync-status');
        if (statusEl) {
            statusEl.innerText = msg;
            statusEl.style.color = color;
        }
    },

    injectMetadata(data) {
        // Inject total count and version into the UI
        if (document.getElementById('protocol-count')) {
            document.getElementById('protocol-count').innerText = data.protocols.length;
        }
        if (document.getElementById('system-version')) {
            document.getElementById('system-version').innerText = `v${data.version}`;
        }
        if (document.getElementById('last-update')) {
            document.getElementById('last-update').innerText = data.last_update;
        }
    },

    renderProtocols(protocols) {
        const grid = document.getElementById('protocol-grid');
        if (!grid) return;

        grid.innerHTML = protocols.map((p, index) => `
            <div class="glass-card" style="animation-delay: ${index * 0.1}s">
                <div class="card-tag">${p.category}</div>
                <h3>${p.title}</h3>
                <p>${p.description || 'Accessing encrypted data...'}</p>
                <div class="card-footer">
                    <span class="impact">IMPACT: ${p.impact}</span>
                    <a href="${p.link}" class="link-btn">RUN_FILE</a>
                </div>
            </div>
        `).join('');
    },

    startUptimeCounter() {
        const uptimeEl = document.getElementById('uptime-clock');
        if (!uptimeEl) return;
        
        setInterval(() => {
            const now = new Date();
            uptimeEl.innerText = now.toTimeString().split(' ')[0];
        }, 1000);
    }
};

document.addEventListener('DOMContentLoaded', () => BioSync.init());
