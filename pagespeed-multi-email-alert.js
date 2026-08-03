const axios = require('axios');
const fs = require('fs');
const nodemailer = require('nodemailer');

// ---------- CONFIGURATION ----------
const API_KEY = 'AIzaSyD-LIVE-REALKEY-12345'; // Replace with your real Google PageSpeed API Key

const URLS = [
  { url: 'https://esthetics03-ops.github.io/revenue-dashboard.html', name: 'Revenue Dashboard' },
  { url: 'https://esthetics03-ops.github.io/', name: 'Blog Home' }
];

const STRATEGY = 'mobile'; // 'mobile' or 'desktop'

// Email configuration using Gmail
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'esthetics03@gmail.com',       // Your Gmail
    pass: 'YOUR_EMAIL_APP_PASSWORD',     // Gmail App Password
  }
};

const RECIPIENT_EMAIL = 'esthetics03@gmail.com'; // Send report here

// Thresholds for alerts
const THRESHOLDS = {
  LCP: 2.5, // seconds
  CLS: 0.1,
  TBT: 300 // milliseconds
};
// -----------------------------------

async function fetchAndSummarize(urlObj) {
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(urlObj.url)}&strategy=${STRATEGY}&key=${API_KEY}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Save JSON report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pagespeed-${urlObj.name.replace(/\s+/g, '-')}-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    // Extract metrics
    const lighthouse = data.lighthouseResult;
    const metrics = lighthouse.audits;
    const performanceScore = (lighthouse.categories.performance.score * 100).toFixed(0);

    const LCP = parseFloat(metrics['largest-contentful-paint'].displayValue);
    const CLS = parseFloat(metrics['cumulative-layout-shift'].displayValue);
    const TBT = parseFloat(metrics['total-blocking-time'].displayValue);

    const keyMetrics = [
      { name: 'Largest Contentful Paint (LCP)', value: metrics['largest-contentful-paint'].displayValue, alert: LCP > THRESHOLDS.LCP },
      { name: 'Cumulative Layout Shift (CLS)', value: metrics['cumulative-layout-shift'].displayValue, alert: CLS > THRESHOLDS.CLS },
      { name: 'Total Blocking Time (TBT)', value: metrics['total-blocking-time'].displayValue, alert: TBT > THRESHOLDS.TBT },
      { name: 'First Contentful Paint (FCP)', value: metrics['first-contentful-paint'].displayValue, alert: false },
      { name: 'Speed Index', value: metrics['speed-index'].displayValue, alert: false }
    ];

    // Build summary
    let summary = `=== ${urlObj.name} (${urlObj.url}) ===\n`;
    summary += `Performance Score: ${performanceScore}/100\n`;
    keyMetrics.forEach(metric => {
      summary += `${metric.name}: ${metric.value}${metric.alert ? ' ⚠️ ALERT' : ''}\n`;
    });

    // Top opportunities
    const opportunities = Object.values(metrics)
      .filter(a => a.details?.type === 'opportunity')
      .sort((a, b) => a.details.overallSavingsMs - b.details.overallSavingsMs)
      .slice(0, 3);

    if (opportunities.length) {
      summary += `Top Opportunities:\n`;
      opportunities.forEach((opp, index) => {
        summary += `${index + 1}. ${opp.title} → Potential savings: ${opp.details.overallSavingsMs}ms\n`;
      });
    } else {
      summary += 'No major opportunities detected. Performance looks good!\n';
    }

    summary += '\n';
    return summary;

  } catch (error) {
    return `❌ Error fetching ${urlObj.name}: ${error.message}\n\n`;
  }
}

async function sendDailyReport() {
  let fullSummary = '';
  for (const urlObj of URLS) {
    const summary = await fetchAndSummarize(urlObj);
    fullSummary += summary;
  }

  // Send email
  const transporter = nodemailer.createTransport(EMAIL_CONFIG);
  await transporter.sendMail({
    from: EMAIL_CONFIG.auth.user,
    to: RECIPIENT_EMAIL,
    subject: `Daily PageSpeed Report with Alerts (${new Date().toLocaleDateString()})`,
    text: fullSummary,
  });

  console.log('✅ Daily PageSpeed report sent to', RECIPIENT_EMAIL);
}

// Run script
sendDailyReport();
