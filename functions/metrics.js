const fetch = require('node-fetch');
const config = require('../config.json');

// Example helper to fetch GA4 real-time data
async function fetchGA4(propertyId) {
  try {
    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`;
    const body = {
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "country" }]
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${config.GOOGLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    let activeUsers = 0;
    if (data.rows) {
      activeUsers = data.rows.reduce((sum, row) => sum + parseInt(row.metricValues[0].value), 0);
    }
    return activeUsers;
  } catch (err) {
    console.error("GA4 Error:", err);
    return 0;
  }
}

// Example helper to fetch AdSense earnings
async function fetchAdsense() {
  try {
    const url = `https://www.googleapis.com/adsense/v2/accounts/${config.ADSENSE_PUB_ID}/reports:generate?metric=EARNINGS&dateRange=TODAY`;
    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${config.GOOGLE_API_KEY}` }
    });
    const data = await res.json();
    const today = data.rows?.[0]?.[0] || 0;
    const month = today * 22;
    return { today: parseFloat(today).toFixed(2), month: parseFloat(month).toFixed(2) };
  } catch (err) {
    console.error("AdSense Error:", err);
    return { today: 0, month: 0 };
  }
}

// Example helper to fetch Affiliate earnings
async function fetchAffiliate() {
  try {
    const url = `${config.AFFILIATE_API_URL}?affiliateId=${config.AFFILIATE_ID}`;
    const res = await fetch(url);
    const data = await res.json();
    return parseFloat(data.total).toFixed(2);
  } catch (err) {
    console.error("Affiliate Error:", err);
    return 0;
  }
}

exports.handler = async function(event, context) {
  try {
    let totalActiveUsers = 0;
    let totalDailyVisits = 0;
    for (const property of config.GA4_PROPERTIES) {
      const users = await fetchGA4(property);
      totalActiveUsers += users;
      totalDailyVisits += users * 10; // example scaling
    }

    const adsense = await fetchAdsense();
    const affiliateTotal = await fetchAffiliate();

    return {
      statusCode: 200,
      body: JSON.stringify({
        ga4: { activeUsers: totalActiveUsers, dailyVisits: totalDailyVisits },
        adsense,
        affiliate: { total: affiliateTotal }
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
