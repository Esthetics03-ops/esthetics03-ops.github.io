// The Esthetics Hub — Live Proxy (Configured Placeholders)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    // --------------------------
    // CONFIGURATION
    // --------------------------
    const GA4_PROPERTY_ID = "G-QCX3G9KSPC";        // Main GA4 Property
    const SERVICE_ACCOUNT_TOKEN = "<SERVICE_ACCOUNT_KEY>"; // Replace with your Google service account token
    const ADSENSE_PROPERTY_ID = GA4_PROPERTY_ID;   // Same property ID for AdSense reporting

    // Affiliate & Donations placeholders (can replace with real endpoints later)
    const affiliateData = { earnings: 26.55, clicks: 97, conversions: 8, conversion_rate: "8.25%", nextPayout: "2025-12-10" };
    const donationsData = { total: 0 };

    // --------------------------
    // FETCH GA4 Realtime
    // --------------------------
    let ga4Data = { activeUsers: 0, pageviews: 0 };
    try {
      const ga4Res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runRealtimeReport`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SERVICE_ACCOUNT_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ metrics: [{ name: "activeUsers" }] })
        }
      );
      const ga4Json = await ga4Res.json();
      ga4Data.activeUsers = parseInt(ga4Json.rows?.[0]?.metricValues?.[0]?.value) || 0;
      ga4Data.pageviews = ga4Data.activeUsers; // approximation
    } catch(e) { console.warn("GA4 fetch failed:", e); }

    // --------------------------
    // FETCH AdSense Report
    // --------------------------
    let adsenseData = { earnings: 0, impressions: 0, clicks: 0 };
    try {
      const adsRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${ADSENSE_PROPERTY_ID}:runReport`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SERVICE_ACCOUNT_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            metrics: [{ name: "estimatedRevenue" }],
            dateRanges: [{ startDate: "2025-11-01", endDate: "2025-11-16" }]
          })
        }
      );
      const adsJson = await adsRes.json();
      adsenseData.earnings = adsJson.rows?.reduce((sum,row)=>sum+parseFloat(row.metricValues[0].value),0) || 0;
    } catch(e){ console.warn("AdSense fetch failed:", e); }

    // --------------------------
    // Response JSON
    // --------------------------
    const responseData = {
      GA4: [{ id: GA4_PROPERTY_ID, desc: "Main", activeUsers: ga4Data.activeUsers, pageviews: ga4Data.pageviews }],
      ADSENSE: adsenseData,
      AFFILIATE: affiliateData,
      DONATIONS: donationsData,
      TOP_ARTICLES: [
        { title: "5 Ways to Boost Wellness", pageviews: 312, revenue: 5.20, avgDuration: "3m 15s" },
        { title: "Nutrition Tips for Longevity", pageviews: 268, revenue: 4.75, avgDuration: "2m 58s" }
      ]
    };

    return new Response(JSON.stringify(responseData), { headers });

  } catch(err) {
    return new Response(JSON.stringify({ error: err.message, message:"Proxy failed" }), { headers });
  }
    }
