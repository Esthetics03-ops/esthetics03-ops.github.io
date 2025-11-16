// The Esthetics Hub — Serverless Proxy (Configured with actual placeholders)
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
    // CONFIGURATION (User Provided)
    // --------------------------
    const GOOGLE_API_KEY = "AIzaSyD-EXAMPLE-LIVE-KEY12345";
    const GA4_PROPERTIES = ["G-QCX3G9KSPC","G-PSW1MY7HB4"];
    const ADSENSE_PUB_ID = "pub-1959507280210179";
    const AFFILIATE_ID = "esthetics-hub-affiliate";

    // Affiliate & Donations placeholders
    const affiliateData = { earnings: 26.55, clicks: 97, conversions: 8, conversion_rate: "8.25%", nextPayout: "2025-12-10", id: AFFILIATE_ID };
    const donationsData = { total: 0 };

    // --------------------------
    // Fetch GA4 Realtime Data
    // --------------------------
    let ga4Data = GA4_PROPERTIES.map(id => ({ id, desc: id, activeUsers: 0, pageviews: 0 }));

    try {
      await Promise.all(GA4_PROPERTIES.map(async (prop, i) => {
        const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${prop}:runRealtimeReport`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GOOGLE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ metrics: [{ name: "activeUsers" }] })
        });
        const json = await res.json();
        ga4Data[i].activeUsers = parseInt(json.rows?.[0]?.metricValues?.[0]?.value) || 0;
        ga4Data[i].pageviews = ga4Data[i].activeUsers; // approximate
      }));
    } catch(e){ console.warn("GA4 fetch failed:", e); }

    // --------------------------
    // Fetch AdSense Data
    // --------------------------
    let adsenseData = { earnings: 0, impressions: 0, clicks: 0, pubId: ADSENSE_PUB_ID };
    try {
      const adsRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTIES[0]}:runReport`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${GOOGLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: [{ name: "estimatedRevenue" }],
          dateRanges: [{ startDate: "2025-11-01", endDate: "2025-11-16" }]
        })
      });
      const adsJson = await adsRes.json();
      adsenseData.earnings = adsJson.rows?.reduce((sum,row)=>sum+parseFloat(row.metricValues[0].value),0) || 0;
    } catch(e){ console.warn("AdSense fetch failed:", e); }

    // --------------------------
    // Assemble Response JSON
    // --------------------------
    const responseData = {
      GA4: ga4Data,
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
