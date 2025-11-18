// metrics.js

export async function handler(event, context) {
  try {
    // Load config.json
    const fs = require("fs");
    const path = require("path");
    const configPath = path.resolve("./config.json");
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }

    // Simulate GA4 metrics
    const GA4_PROPERTIES = config.GA4_PROPERTIES || [];
    let totalActiveUsers = 0;
    GA4_PROPERTIES.forEach(() => {
      totalActiveUsers += Math.floor(Math.random() * 100); // random active users
    });

    // Simulate AdSense metrics
    const adsenseToday = parseFloat((Math.random() * 25).toFixed(2));
    const adsenseMonth = parseFloat((adsenseToday * 22).toFixed(2));

    // Simulate Affiliate earnings
    const affiliateTotal = parseFloat((Math.random() * 200).toFixed(2));

    // Response
    return {
      statusCode: 200,
      body: JSON.stringify({
        ga4: {
          totalActiveUsers,
          dailyVisits: totalActiveUsers * 12
        },
        adsense: {
          today: adsenseToday,
          month: adsenseMonth
        },
        affiliate: {
          total: affiliateTotal
        }
      })
    };
  } catch (err) {
    console.error("Metrics function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch metrics" })
    };
  }
}
