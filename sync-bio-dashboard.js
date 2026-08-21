const { google } = require('googleapis');
const fs = require('fs');

async function syncLiveMetrics() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '16BKFp_fLvbslNnoyKIzsmidxAfu2zUQ_';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Dashboard!B4:B7',
    });

    const rows = response.data.values;
    const liveMetrics = {
      adsense_net: rows ? rows[0][0] : "0.00",
      affiliate_net: rows ? rows[1][0] : "0.00",
      total_combined: rows ? rows[3][0] : "0.00",
      last_updated: new Date().toISOString()
    };

    fs.writeFileSync('metrics.json', JSON.stringify(liveMetrics, null, 2));
    console.log("Successfully synced live metrics from Google Sheets:", liveMetrics);
  } catch (error) {
    console.error("Error syncing Google Sheets metrics:", error.message);
  }
}

syncLiveMetrics();
