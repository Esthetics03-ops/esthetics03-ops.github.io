const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Define your connected Google Sheet IDs from your logs
const SHEET_IDS = {
  revenueDashboard: '16BKFp_fLvbslNnoyKIzsmidxAfu2zUQ_',
  trafficMetrics: '1xAgKqtj_dw3UbM0HOZE8HfIuvx9RC6DDSZQcSFLBIq8',
  bioSyncConfig: '1PWxlwOerEhiz1Yq0B17hmCs-U-vJnEg8BxLZg5aDVAQ',
  adsenseTracker: '1qMFHW7YLLILLhscgOwhzUA2NkmEGOV2V',
  businessSettings: '1n6mNEqShB9RgxjPR9i5E67jVX5Fliyi2kxBCZrpRDlY',
  auditLogs: '1a4WxjzzVWzMM-DfaGUWrvreHxP_qDusF'
};

async function authenticateGoogle() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function fetchSheetData(sheets, spreadsheetId, range = 'Sheet1!A1:Z100') {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error(`Error fetching sheet ID ${spreadsheetId}:`, error.message);
    return [];
  }
}

async function runPipeline() {
  console.log('Starting automated sheet data sync pipeline...');
  const sheets = await authenticateGoogle();
  const aggregatedData = {};

  for [key, id] of Object.entries(SHEET_IDS)) {
    console.log(`Pulling data for: ${key} (${id})`);
    const data = await fetchSheetData(sheets, id);
    aggregatedData[key] = data;
  }

  // Ensure output directory exists
  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Write compiled state to JSON for your static pages / Bio-Sync Master Dashboard
  const outputPath = path.join(outputDir, 'master-metrics.json');
  fs.writeFileSync(outputPath, JSON.stringify(aggregatedData, null, 2));
  console.log(`Pipeline complete! Metrics successfully saved to ${outputPath}`);
}

runPipeline().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
