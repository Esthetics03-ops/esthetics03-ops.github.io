const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const { parseGA4, parseAdSense } = require('./utils');

const app = express();
app.use(cors());
app.use(express.json());

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const GA4_PROPERTY_ID = config.ga4PropertyId;
const ADSENSE_ACCOUNT_ID = config.adsenseAccountId;

// OAuth2
const auth = new google.auth.GoogleAuth({
  keyFile: './backend/oauth-credentials.json',
  scopes: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/adsense.readonly'
  ]
});

// GA4 Realtime
app.get('/api/ga4', async (req, res) => {
  try {
    const client = await auth.getClient();
    const analyticsData = google.analyticsdata('v1beta');

    const response = await analyticsData.properties.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' }
        ]
      },
      auth: client
    });

    res.json(parseGA4(response.data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// AdSense Real-Time
app.get('/api/adsense', async (req, res) => {
  try {
    const client = await auth.getClient();
    const adsense = google.adsense({ version: 'v2', auth: client });

    const response = await adsense.accounts.reports.generate({
      account: `accounts/${ADSENSE_ACCOUNT_ID}`,
      dateRange: { startDate: 'today', endDate: 'today' },
      metrics: ['EARNINGS', 'IMPRESSIONS', 'CLICKS']
    });

    res.json(parseAdSense(response.data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Real-time backend running on port ${PORT}`));
