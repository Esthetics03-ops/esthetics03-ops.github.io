const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Bio-Sync Master Enterprise",
    icon: path.join(__dirname, 'icon.ico'), // Add an icon file if you have one
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
  // Remove the menu bar for a clean look
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/**
 * BIO-SYNC MASTER UNIFIED AUTOMATION v22.0
 * Project: amiable-crane-465217-j9
 * Localization: Africa/Nairobi
 * * INSTRUCTIONS:
 * 1. Open Google Sheets > Extensions > Apps Script.
 * 2. Delete everything and paste this code.
 * 3. Click the 'Save' icon.
 * 4. Run 'setupAllTriggers' ONCE to activate the ecosystem.
 */

// --- CONFIGURATION ---
const CONFIG = {
  SHEET_ID: '1qMFHW7YLLILLhscgOwhzUA2NkmEGOV2V',
  PAYOUT_THRESHOLD: 1000.00,
  TIMEZONE: "Africa/Nairobi",
  REPORT_RECIPIENT: Session.getActiveUser().getEmail(),
  PUB_ID: "pub-1959507280210179"
};

/**
 * 1. HOURLY PULSE (Layer 1)
 * Logs system health and prevents the cloud node from going dormant.
 */
function hourlyPulseSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName('RawData') || ss.insertSheet('RawData');
  const now = new Date();
  
  try {
    rawSheet.appendRow([now, "Cloud_Node_Pulse", "ACTIVE", "0.00", "Healthy"]);
    console.log(`Pulse recorded at ${now} in ${CONFIG.TIMEZONE}`);
  } catch (e) {
    console.error("Pulse Failed: " + e.message);
  }
}

/**
 * 2. THRESHOLD WATCHDOG (Layer 2)
 * Monitors cell B7 for the $1,000 payout goal.
 */
function checkPayoutMilestone() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName('Dashboard');
  const currentTotal = parseFloat(dashSheet.getRange("B7").getValue().toString().replace(/[^0-9.-]+/g,""));

  if (currentTotal >= CONFIG.PAYOUT_THRESHOLD) {
    MailApp.sendEmail({
      to: CONFIG.REPORT_RECIPIENT,
      subject: "🚀 BIO-SYNC ALERT: $1,000 Threshold Reached!",
      body: `Congratulations! Your total combined revenue has reached $${currentTotal.toFixed(2)}.\n\n` +
           `Account: ${CONFIG.PUB_ID}\n` +
           `Status: Payout Ready.`
    });
    console.log("Milestone alert dispatched.");
  }
}

/**
 * 3. SUNDAY ARCHIVE (Layer 3)
 * Moves RawData to Archive tab every Sunday to keep the sheet fast.
 */
function sundayArchiveCleanup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName('RawData');
  let arcSheet = ss.getSheetByName('Archive') || ss.insertSheet('Archive');
  
  const lastRow = rawSheet.getLastRow();
  if (lastRow <= 1) return;

  const data = rawSheet.getRange(2, 1, lastRow - 1, 5).getValues();
  arcSheet.getRange(arcSheet.getLastRow() + 1, 1, data.length, 5).setValues(data);
  rawSheet.deleteRows(2, lastRow - 1);
  console.log(`Archived ${data.length} rows.`);
}

/**
 * 4. MONTHLY PROFIT PDF (Layer 4)
 * Generates and emails a PDF report on the 1st of every month.
 */
function generateMonthlyProfitPDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName('Dashboard');
  const dateStr = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  
  const ads = dash.getRange("B4").getDisplayValue();
  const aff = dash.getRange("B5").getDisplayValue();
  const total = dash.getRange("B7").getDisplayValue();

  const html = `
    <div style="font-family: sans-serif; padding: 30px;">
      <h2 style="color: #10b981;">Monthly Bio-Sync Report</h2>
      <p>Period: ${dateStr}</p><hr>
      <p>AdSense: <b>${ads}</b></p>
      <p>Affiliate: <b>${aff}</b></p>
      <h3 style="color: #3b82f6;">Total: ${total}</h3>
    </div>`;

  const pdf = Utilities.newBlob(html, 'text/html', 'Report.html').getAs('application/pdf');
  MailApp.sendEmail({
    to: CONFIG.REPORT_RECIPIENT,
    subject: `📊 Bio-Sync Monthly Report: ${dateStr}`,
    body: "Please find your automated monthly profit report attached.",
    attachments: [pdf.setName(`BioSync_Report_${dateStr}.pdf`)]
  });
}

/**
 * TRIGGER INITIALIZER
 * Run this function ONCE to set up all automated timings.
 */
function setupAllTriggers() {
  // Clear existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // 1. Hourly Pulse
  ScriptApp.newTrigger('hourlyPulseSync').timeBased().everyHours(1).create();
  
  // 2. Daily Milestone Check
  ScriptApp.newTrigger('checkPayoutMilestone').timeBased().everyDays(1).atHour(9).create();
  
  // 3. Weekly Sunday Archive
  ScriptApp.newTrigger('sundayArchiveCleanup').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(0).create();
  
  // 4. Monthly PDF Report (Runs every 1st of the month)
  ScriptApp.newTrigger('generateMonthlyProfitPDF').timeBased().onMonthDay(1).atHour(8).create();
  
  console.log("SUCCESS: All 4 automation layers activated for Africa/Nairobi node.");
}
// Add this to your main.js
window.addEventListener('load', () => {
    // Only show pop-up after 10 seconds or 50% scroll
    setTimeout(() => {
        if(!localStorage.getItem('popupShown')) {
            document.getElementById('travel-popup').style.display = 'block';
            localStorage.setItem('popupShown', 'true');
        }
    }, 10000); 
});
