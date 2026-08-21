(() => {
  "use strict";

  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const first = (...values) => values.find(v => typeof v === "string" && v.trim());

  async function loadConfig() {
    try {
      const response = await fetch("/config.json", { cache: "no-store" });
      if (!response.ok) return {};
      return await response.json();
    } catch {
      return {};
    }
  }

  function getGAIds(config) {
    const raw = config.ga4MeasurementIds ||
      config.ga4_measurement_ids ||
      config.ga4MeasurementId ||
      config.ga4_measurement_id ||
      config.analytics?.measurementId ||
      config.analytics?.ga4MeasurementId ||
      config.analytics?.ga4_measurement_id;

    if (Array.isArray(raw)) return [...new Set(raw.filter(Boolean))];
    if (typeof raw === "string") return raw.split(",").map(x => x.trim()).filter(Boolean);
    return [];
  }

  async function init() {
    const config = await loadConfig();
    const gaIds = getGAIds(config);

    // GA4 is intentionally config-driven. No unrelated property is hard-coded here.
    if (gaIds.length) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
      window.gtag("js", new Date());

      await loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaIds[0]));

      gaIds.forEach(id => window.gtag("config", id, {
        anonymize_ip: true,
        transport_type: "beacon"
      }));

      window.__ESTHETICS_GA4_IDS__ = gaIds;
    }

    // AdSense is already loaded in <head> using the publisher ID from the current config.
    // This check records the configured ID without exposing any secret.
    if (config.adsenseId) window.__ESTHETICS_ADSENSE_ID__ = config.adsenseId;
  }

  init().catch(() => {});
})();