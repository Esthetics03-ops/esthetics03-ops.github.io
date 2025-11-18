// server.js
import express from "express";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static("./"));

// Serve config.json
app.get("/config.json", (req, res) => {
  const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
  res.json(config);
});

// Metrics endpoint for dashboard
app.get("/metrics", async (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
    const { GOOGLE_API_KEY, GA4_PROPERTIES, ADSENSE_PUB_ID } = config;

    // --- GA4 Metrics ---
    let totalActiveUsers = 0;
    for (const propertyId of GA4_PROPERTIES) {
      try {
        // Replace with real GA4 API call
        const activeUsers = Math.floor(Math.random() * 100); // placeholder
        totalActiveUsers += activeUsers;
      } catch (e) { console.error(e); }
    }

    // --- AdSense Metrics ---
    let adsenseToday = 0;
    try {
      // Replace with real AdSense API call
      adsenseToday = (Math.random() * 25).toFixed(2);
    } catch(e){ adsenseToday = 0; }

    // --- Affiliate Earnings ---
    const affiliateEarnings = (Math.random() * 200).toFixed(2);

    res.json({
      ga4: { totalActiveUsers },
      adsense: {
        today: parseFloat(adsenseToday),
        month: parseFloat(adsenseToday) * 22
      },
      affiliate: { total: parseFloat(affiliateEarnings) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
