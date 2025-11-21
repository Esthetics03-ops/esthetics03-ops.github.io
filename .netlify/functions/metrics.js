// functions/metrics.js
// Run on Netlify Functions (Node.js)

exports.handler = async function(event, context) {
  try {
    // === Configuration ===
    const GOOGLE_API_KEY = "AIzaSyD-EXAMPLE-LIVE-KEY12345";
    const GA4_PROPERTIES = ["G-QCX3G9KSPC","G-PSW1MY7HB4"];
    const ADSENSE_PUB_ID = "pub-1959507280210179";
    const AFFILIATE_ID = "esthetics-hub-affiliate";

    // === Simulated GA4 Metrics ===
    let totalActiveUsers = 0;
    let dailyVisits = 0;

    for (let property of GA4_PROPERTIES) {
      const activeUsers = Math.floor(Math.random() * 100); // Simulate GA4 active users
      totalActiveUsers += activeUsers;
    }
    dailyVisits = totalActiveUsers * 12; // example scaling

    // === Simulated AdSense Metrics ===
    const adsenseToday = parseFloat((Math.random() * 25).toFixed(2));
    const adsenseMonth = parseFloat((adsenseToday * 22).toFixed(2));

    // === Simulated Affiliate Metrics ===
    const affiliateTotal = parseFloat((Math.random() * 200).toFixed(2));

    // === Return JSON Response ===
    const response = {
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

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    };

  } catch (error) {
    console.error("Metrics function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch metrics" })
    };
  }
};
