'use strict';

// revenue-dashboard.js
// Improved and configured version of the dashboard script
// - Removed enclosing <script> tags (this is a standalone .js file)
// - Resilient fetch with timeout
// - Global override via window.REVENUE_DASHBOARD_CONFIG
// - Cleaner defaults and configurable base path / locale

(function () {
  const DEFAULT_CONFIG = {
    BASE_PATH: '.', // used to resolve ./api/* and ./config.json
    LOCALE: undefined, // pass through to Intl (undefined -> browser default)
    TIMEOUT_MS: 7000,
    ADSENSE: {},
    AFFILIATES: { NETWORKS: [] },
    STRINGS: {
      initializing: '🔄 Initializing dashboard...',
      sync_ok: '✅ Sync OK',
      connection_failed: '❌ Connection Failed',
      config_missing: 'Config.json missing, using internal defaults.'
    }
  };

  // Helper for resilient JSON fetching with timeout
  async function safeFetchJson(url, timeout = DEFAULT_CONFIG.TIMEOUT_MS) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, { cache: 'no-cache', signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      // Suppress console spam for expected missing API files
      return { __error: true, message: err && err.message ? err.message : String(err) };
    }
  }

  // Load configuration from ./config.json with sensible defaults
  async function loadConfig() {
    // Allow a global override to configure the dashboard without touching files
    const globalCfg = (typeof window !== 'undefined' && window.REVENUE_DASHBOARD_CONFIG) || {};

    const cfgUrl = (globalCfg.BASE_PATH || DEFAULT_CONFIG.BASE_PATH) + '/config.json';
    const cfgRes = await safeFetchJson(cfgUrl);
    if (cfgRes.__error) {
      console.warn(DEFAULT_CONFIG.STRINGS.config_missing, cfgRes.message);
      return Object.assign({}, DEFAULT_CONFIG, globalCfg);
    }

    return Object.assign({}, DEFAULT_CONFIG, cfgRes, globalCfg);
  }

  // Formatter for Currency
  function money(v, locale) {
    const num = parseFloat(v);
    const safe = isNaN(num) ? 0 : num;
    try {
      return new Intl.NumberFormat(locale || undefined, { style: 'currency', currency: 'USD' }).format(safe);
    } catch (e) {
      // Fallback to simple formatting
      return '$' + safe.toFixed(2);
    }
  }

  // Safe Text Renderer
  function text(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  async function loadDashboard() {
    const statusBox = document.getElementById('statusBox');
    const detailBox = document.getElementById('detail');

    if (statusBox) statusBox.textContent = DEFAULT_CONFIG.STRINGS.initializing;

    try {
      const cfg = await loadConfig();
      const base = cfg.BASE_PATH || '.';

      // --- 1. Load AdSense Data ---
      let ads = await safeFetchJson(base + '/api/adsense.json', cfg.TIMEOUT_MS);
      // Fallback to config.json if API file is missing
      if (ads.__error && cfg.ADSENSE && cfg.ADSENSE.AD_BALANCE) {
        ads = {
          metrics: {
            estimatedEarnings: cfg.ADSENSE.AD_BALANCE.today || 0,
            impressions: cfg.ADSENSE.AD_PERFORMANCE?.impressions || 0,
            clicks: cfg.ADSENSE.AD_PERFORMANCE?.clicks || 0,
            ctr: cfg.ADSENSE.AD_PERFORMANCE?.ctr || '0%'
          }
        };
      }

      // --- 2. Load Affiliate Data ---
      let aff = await safeFetchJson(base + '/api/affiliate.json', cfg.TIMEOUT_MS);
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
        text('adsense_earn', money(ads.metrics.estimatedEarnings || 0, cfg.LOCALE));
        text('adsense_meta', `impr: ${ads.metrics.impressions || 0} • clicks: ${ads.metrics.clicks || 0} • ctr: ${ads.metrics.ctr || '0%'}`);
      } else {
        text('adsense_earn', money(0, cfg.LOCALE));
        text('adsense_meta', 'Waiting for AdSense sync...');
      }

      // --- 4. Render Affiliate ---
      if (aff && aff.metrics) {
        text('affiliate_earn', money(aff.metrics.commission_total || 0, cfg.LOCALE));
        text('affiliate_meta', `clicks: ${aff.metrics.clicks || 0} • conv: ${aff.metrics.conversions || 0}`);
      } else {
        text('affiliate_earn', money(0, cfg.LOCALE));
        text('affiliate_meta', 'No affiliate data found');
      }

      // --- 5. Render Extras ---
      text('donations_earn', money(0, cfg.LOCALE));
      text('donations_meta', 'Stripe/PayPal: Ready');

      if (statusBox) {
        statusBox.textContent = cfg.STRINGS.sync_ok || DEFAULT_CONFIG.STRINGS.sync_ok;
        statusBox.classList && statusBox.classList.add('live');
      }

    } catch (err) {
      console.error('Critical Dashboard Error:', err);
      if (detailBox) detailBox.textContent = '⚠️ Error: ' + (err && err.message ? err.message : String(err));
      if (statusBox) statusBox.textContent = DEFAULT_CONFIG.STRINGS.connection_failed;
    }
  }

  // Expose init for manual use and auto-run on DOM ready
  window.RevenueDashboard = window.RevenueDashboard || {};
  window.RevenueDashboard.init = loadDashboard;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', loadDashboard);
  }
})();
