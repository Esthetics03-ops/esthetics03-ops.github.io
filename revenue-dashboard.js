<script>
// Helper for resilient JSON fetching
async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (err) {
    // Suppress console spam for expected missing API files
    return { __error: true, message: err.message };
  }
}

async function loadConfig() {
  const cfg = await safeFetchJson("./config.json");
  // If config fails, we use a default object to prevent total system crash
  if (cfg.__error) {
    console.warn("Config.json missing, using internal defaults.");
    return { ADSENSE: {}, AFFILIATES: { NETWORKS: [] } };
  }
  return cfg;
}

// Formatter for Currency
function money(v) {
  const num = parseFloat(v);
  return "$" + (isNaN(num) ? "0.00" : num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
}

// Safe Text Renderer
function text(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

async function loadDashboard() {
  const statusBox = document.getElementById("statusBox");
  const detailBox = document.getElementById("detail");
  
  if (statusBox) statusBox.textContent = "🔄 Initializing Bio-Sync Hub...";

  try {
    const cfg = await loadConfig();

    // --- 1. Load AdSense Data ---
    let ads = await safeFetchJson("./api/adsense.json");
    // Fallback to config.json if API file is missing
    if (ads.__error && cfg.ADSENSE?.AD_BALANCE) {
      ads = {
        metrics: {
          estimatedEarnings: cfg.ADSENSE.AD_BALANCE.today || 0,
          impressions: cfg.ADSENSE.AD_PERFORMANCE?.impressions || 0,
          clicks: cfg.ADSENSE.AD_PERFORMANCE?.clicks || 0,
          ctr: cfg.ADSENSE.AD_PERFORMANCE?.ctr || "0%"
        }
      };
    }

    // --- 2. Load Affiliate Data ---
    let aff = await safeFetchJson("./api/affiliate.json");
    // Fallback to config.json with safe reduction logic
    if (aff.__error && cfg.AFFILIATES) {
      const networks = cfg.AFFILIATES.NETWORKS || [];
      aff = {
        metrics: {
          commission_total: cfg.AFFILIATES.TOTAL_EARNINGS || 0,
          clicks: networks.reduce((t, n) => t + (n.clicks || 0), 0),
          conversions: networks.reduce((t, n) => t + (n.conversions || 0), 0)
        }
      };
    }

    // --- 3. Render AdSense ---
    if (ads && ads.metrics) {
      text("adsense_earn", money(ads.metrics.estimatedEarnings));
      text("adsense_meta", `impr: ${ads.metrics.impressions} • clicks: ${ads.metrics.clicks} • ctr: ${ads.metrics.ctr}`);
    } else {
      text("adsense_earn", "$0.00");
      text("adsense_meta", "Waiting for AdSense sync...");
    }

    // --- 4. Render Affiliate ---
    if (aff && aff.metrics) {
      text("affiliate_earn", money(aff.metrics.commission_total));
      text("affiliate_meta", `clicks: ${aff.metrics.clicks} • conv: ${aff.metrics.conversions}`);
    } else {
      text("affiliate_earn", "$0.00");
      text("affiliate_meta", "No affiliate data found");
    }

    // --- 5. Render Extras ---
    text("donations_earn", "$0.00");
    text("donations_meta", "Stripe/PayPal: Ready");

    if (statusBox) {
      statusBox.textContent = "✅ Node Healthy: Africa/Nairobi Sync OK";
      statusBox.classList.add("live");
    }

  } catch (err) {
    console.error("Critical Dashboard Error:", err);
    if (detailBox) detailBox.textContent = "⚠️ Error: " + err.message;
    if (statusBox) statusBox.textContent = "❌ Connection Failed";
  }
}

// Trigger load on DOM Content Ready
document.addEventListener("DOMContentLoaded", loadDashboard);
</script>
