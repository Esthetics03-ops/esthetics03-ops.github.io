README.md
## Google AdSense Dashboard Automation

This repository automatically fetches AdSense metrics using the AdSense Management API and updates a dashboard file via GitHub Actions.

### Setup Steps

1. **Enable AdSense API** in Google Cloud Console and get OAuth credentials.
2. **Add secrets** to your repo:
   - `ADSENSE_CLIENT_ID`
   - `ADSENSE_CLIENT_SECRET`
   - `ADSENSE_REFRESH_TOKEN`
3. **Edit `scripts/update_adsense_data.py` to set your real publisher id**.
4. The workflow will run daily, updating `dashboard/adsense_report.json`.
5. Build or update your dashboard frontend for GitHub Pages to visualize the data!
6.