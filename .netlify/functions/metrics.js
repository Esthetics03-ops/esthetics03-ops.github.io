// .netlify/functions/metrics.js
// Netlify Function (Node.js)
// - Uses environment variables when available instead of hard-coded keys.
// - Returns simulated metrics when real API credentials are not provided.
// - Adds simple in-memory caching to reduce repeated work on warm instances.

exports.handler = async function(event, context) {
  try {
    // === Configuration (from environment when possible) ===
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || null;
    const GA4_PROPERTIES = (process.env.GA4_PROPERTIES && process.env.GA4_PROPERTIES.split(",").map(p => p.trim()).filter(Boolean)) || ["G-QCX3G9KSPC","G-PSW1MY7HB4"];
    const ADSENSE_PUB_ID = process.env.ADSENSE_PUB_ID || "pub-1959507280210179";
    const AFFILIATE_ID = process.env.AFFILIATE_ID || "esthetics-hub-affiliate";

    // === Simple in-memory cache (warm instances only) ===
    // TTL can be configured via METRICS_CACHE_TTL (seconds)
    const TTL_SECONDS = parseInt(process.env.METRICS_CACHE_TTL || "60", 10);
    if (!global.__metricsCache) global.__metricsCache = { expiresAt: 0, data: null };

    const now = Date.now();
    const forceRefresh = event && event.queryStringParameters && event.queryStringParameters.force === "true";

    if (!forceRefresh && global.__metricsCache.data && global.__metricsCache.expiresAt > now) {
      // Mark as cached when served from cache
      const cachedData = { ...global.__metricsCache.data, meta: { ...global.__metricsCache.data.meta, cached: true } };
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${Math.max(TTL_SECONDS, 0)}`,
          "Access-Control-Allow-Origin": "*",
          "X-Cached": "true"
        }
      };
    }

    // === Metrics generation ===
    // If GOOGLE_API_KEY and a GA4_PROPERTIES list are provided, you could implement
    // real calls to the GA4 or Ads APIs here. For now, this function will fall back
    // to safe simulated metrics to avoid exposing credentials or depending on OAuth flows.

    // Simulated GA4 metrics
    let totalActiveUsers = 0;
    for (let property of GA4_PROPERTIES) {
      const activeUsers = Math.floor(Math.random() * 100); // Simulate GA4 active users per property
      totalActiveUsers += activeUsers;
    }
    const dailyVisits = totalActiveUsers * 12; // example scaling

    // Simulated AdSense metrics
    const adsenseToday = parseFloat((Math.random() * 25).toFixed(2));
    const adsenseMonth = parseFloat((adsenseToday * 22).toFixed(2));

    // Simulated Affiliate metrics
    const affiliateTotal = parseFloat((Math.random() * 200).toFixed(2));

    const response = {
      meta: {
        source: GOOGLE_API_KEY ? "simulated (real API integration not implemented)" : "simulated",
        ga4_properties: GA4_PROPERTIES,
        adsense_pub_id: ADSENSE_PUB_ID ? "configured" : "not-configured",
        affiliate_id: AFFILIATE_ID ? "configured" : "not-configured",
        cached: false,
        timestamp: new Date().toISOString()
      },
      ga4: {
        totalActiveUsers,
        dailyVisits
      },
      adsense: {
        today: adsenseToday,
        month: adsenseMonth
      },
      affiliate: {
        total: affiliateTotal
      }
    };

    // Store in cache
    global.__metricsCache = {
      data: response,
      expiresAt: now + TTL_SECONDS * 1000
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `max-age=${Math.max(TTL_SECONDS, 0)}`,
        "Access-Control-Allow-Origin": "*",
        "X-Cached": "false"
      }
    };

  } catch (error) {
    console.error("Metrics function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch metrics" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }
};
