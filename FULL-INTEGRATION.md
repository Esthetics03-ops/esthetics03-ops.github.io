# Full GA4 + AdSense + Revenue integration

Both the redesigned homepage and `revenue-dashboard.html` use the same root `config.json`.

Add the real Esthetics Hub GA4 Measurement ID to the existing config:

```json
{
  "lastSynced": "2026-08-21T00:00:00.000Z",
  "targetDomain": "esthetics03-ops.github.io",
  "adsenseId": "pub-1959507280210179",
  "ga4MeasurementId": "G-XXXXXXXXXX",
  "adsenseTarget": 100,
  "monetisationApi": "https://api.estheticshub.live/monetisation?refresh=TRUE",
  "currency": "USD"
}
```

The dashboard calls the monetisation API first and falls back to config data when unavailable. It refreshes every 60 seconds.

Do not put private AdSense API credentials, service-account keys, PayPal secrets, M-Pesa credentials, Amazon keys, or Booking.com private credentials in config.json.

Deploy:
```bash
git checkout -b feature/esthetics-full-analytics-revenue
git add index.html revenue-dashboard.html assets/esthetics-homepage ads.txt
git commit -m "feat: integrate GA4 AdSense and revenue dashboard"
git push -u origin feature/esthetics-full-analytics-revenue
```

Verify `/ads.txt`, GA4 Realtime/Tag Assistant, the monetisation endpoint, and the 60-second dashboard refresh.
