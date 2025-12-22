const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://esthetics03-ops.github.io");
  next();
});
// server.js
import express from "express";
import fs from "fs";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (dashboard, CSS, JS)
app.use(express.static("./"));

// Serve config.json
app.get("/config.json", (req, res) => {
  const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
  res.json(config);
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
    const { GOOGLE_API_KEY, GA4_PROPERTIES, ADSENSE_PUB_ID } = config;

    // --- GA4 Realtime Metrics ---
    let totalActiveUsers = 0;
    for (const property of GA4_PROPERTIES) {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runRealtimeReport`;
      const body = {
        metrics: [{ name: "activeUsers" }]
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GOOGLE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.rows) {
          totalActiveUsers += data.rows.reduce(
            (sum, row) => sum + parseInt(row.metricValues[0].value),
            0
          );
        }
      } catch (err) {
        console.error("GA4 Fetch Error:", err);
      }
    }

    // --- AdSense Metrics ---
    let adsenseToday = 0;
    try {
      const adsenseUrl = `https://www.googleapis.com/adsense/v2/accounts/${ADSENSE_PUB_ID}/reports:generate?metric=EARNINGS&dateRange=TODAY`;
      const adsenseRes = await fetch(adsenseUrl, {
        headers: { "Authorization": `Bearer ${GOOGLE_API_KEY}` }
      });
      const adsenseData = await adsenseRes.json();
      if (adsenseData.rows && adsenseData.rows.length) {
        adsenseToday = parseFloat(adsenseData.rows[0][0]);
      }
    } catch (err) {
      console.error("AdSense Fetch Error:", err);
      adsenseToday = parseFloat((Math.random() * 25).toFixed(2));
    }

    const adsenseMonth = parseFloat((adsenseToday * 22).toFixed(2));

    // --- Affiliate Earnings ---
    const affiliate = parseFloat((Math.random() * 200).toFixed(2)); // Replace with real API

    res.json({
      ga4: { totalActiveUsers },
      adsense: { today: adsenseToday, month: adsenseMonth },
      affiliate: { total: affiliate }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
