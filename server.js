// server.js
const express = require('express');
const fetch = require('node-fetch');
const { google } = require('googleapis');
const app = express();
const port = 3000;

const config = require('./config.json');
const credentials = require('./service-account.json'); // GA4 & AdSense service account

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Google Analytics Data API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly']
});
const analyticsData = google.analyticsdata('v1beta');

async function fetchGA4Metrics(propertyId) {
  try {
    const client = await auth.getClient();
    const request = {
      property: `properties/${propertyId}`,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'country' }]
      },
      auth: client
    };
    const response = await analyticsData.properties.runRealtimeReport(request);
    let activeUsers = 0;
    if (response.data.rows) {
      activeUsers = response.data.rows.reduce(
        (sum, row) => sum + parseInt(row.metricValues[0].value),
        0
      );
    }
    return activeUsers;
  } catch (err) {
    console.error('GA4 Error:', err);
    return 0;
  }
}

// AdSense earnings (via service account)
async function fetchAdsenseMetrics() {
  try {
    const token = await auth.getAccessToken();
    const url = `https://www.googleapis.com/adsense/v2/accounts/${config.ADSENSE_PUB_ID}/reports:generate?metric=EARNINGS&dateRange=TODAY`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const earningsToday = data.rows?.[0]?.[0] || 0;
    const earningsMonth = earningsToday * 22;
    return { today: parseFloat(earningsToday).toFixed(2), month: parseFloat(earningsMonth).toFixed(2) };
  } catch (err) {
    console.error('AdSense Error:', err);
    return { today: 0, month: 0 };
  }
}

// Affiliate earnings
async function fetchAffiliateEarnings() {
  try {
    const res = await fetch(`${config.AFFILIATE_API_URL}?affiliateId=${config.AFFILIATE_ID}`);
    const data = await res.json();
    return parseFloat(data.total).toFixed(2);
  } catch (err) {
    console.error('Affiliate Error:', err);
    return 0;
  }
}

// Proxy endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    let totalActiveUsers = 0;
    for (const propertyId of config.GA4_PROPERTIES) {
      totalActiveUsers += await fetchGA4Metrics(propertyId);
    }
    const adsense = await fetchAdsenseMetrics();
    const affiliate = await fetchAffiliateEarnings();
    res.json({
      ga4: { activeUsers: totalActiveUsers, dailyVisits: totalActiveUsers * 10 },
      adsense,
      affiliate: { total: affiliate }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.listen(port, () => console.log(`Proxy running at http://localhost:${port}`));
