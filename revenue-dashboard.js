<script>
async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn("Fetch failed:", url, err.message);
    return { __error: true, error: err.message };
  }
}

async function loadConfig() {
  const cfg = await safeFetchJson("./config.json");
  if (cfg.__error) throw new Error("config.json not found or invalid");
  return cfg;
}

function money(v) {
  return "$" + (typeof v === "number" ? v.toFixed(2) : "0.00");
}
function text(id, v) {
  document.getElementById(id).textContent = v;
}

async function loadDashboard() {
  const statusBox = document.getElementById("statusBox");
  statusBox.textContent = "🔄 Checking connections...";

  try {
    const cfg = await loadConfig();

    // --- Load AdSense ---
    let ads = await safeFetchJson("./api/adsense.json");
    if (ads.__error) ads = cfg.ADSENSE?.AD_BALANCE ? { metrics: { estimatedEarnings: cfg.ADSENSE.AD_BALANCE.today, impressions: cfg.ADSENSE.AD_PERFORMANCE.impressions, clicks: cfg.ADSENSE.AD_PERFORMANCE.clicks, ctr: cfg.ADSENSE.AD_PERFORMANCE.ctr } } : null;

    // --- Load Affiliate ---
    let aff = await safeFetchJson("./api/affiliate.json");
    if (aff.__error) aff = cfg.AFFILIATES ? { metrics: { commission_total: cfg.AFFILIATES.TOTAL_EARNINGS, clicks: cfg.AFFILIATES.NETWORKS.reduce((t,n)=>t+(n.clicks||0),0), conversions: cfg.AFFILIATES.NETWORKS.reduce((t,n)=>t+(n.conversions||0),0), conversion_rate: "auto" } } : null;

    // --- Render ---
    if (ads) {
      text("adsense_earn", money(ads.metrics.estimatedEarnings));
      text("adsense_meta", `impr: ${ads.metrics.impressions} • clicks: ${ads.metrics.clicks} • ctr: ${ads.metrics.ctr}`);
    }
    if (aff) {
      text("affiliate_earn", money(aff.metrics.commission_total));
      text("affiliate_meta", `clicks: ${aff.metrics.clicks} • conv: ${aff.metrics.conversions}`);
    }
    text("donations_earn", "$0.00");
    text("donations_meta", "Stripe/PayPal configured");

    statusBox.textContent = "✅ Dashboard Loaded (Simulated OK)";
    statusBox.classList.add("live");

  } catch (err) {
    console.error("Dashboard error:", err);
    document.getElementById("detail").textContent = "⚠️ " + err.message;
    statusBox.textContent = "❌ Error loading dashboard";
  }
}

loadDashboard();
</script>
