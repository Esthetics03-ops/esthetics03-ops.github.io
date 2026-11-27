# Esthetics Hub Finance & Analytics Automation — Phase 1

## Included
- `scripts/finance-sync.js`: read-only GA4 and Search Console data collector
- `.github/workflows/daily-finance-sync.yml`: daily scheduled workflow at 06:15 EAT plus manual run
- Daily JSON report uploaded as a GitHub Actions artifact with 90-day retention

## Setup in your repository
Copy these files into the repository at the matching paths.

In GitHub: Settings → Secrets and variables → Actions

### Secret
- `GOOGLE_SERVICE_ACCOUNT_JSON`: JSON credentials for a Google service account (paste the complete JSON as the secret value). Never commit this JSON.

### Variables
- `GA4_PROPERTY_ID`: numeric GA4 property ID (not the `G-...` measurement ID)
- `SEARCH_CONSOLE_SITE_URL`: exact Search Console property value, e.g. URL-prefix property or `sc-domain:example.com`

Grant the service account read access to the GA4 property and Search Console property.

## Run
Actions → Daily Finance and Analytics Sync → Run workflow.
Scheduled run is daily at 03:15 UTC (06:15 EAT).

## Scope / limitations
- Only real GA4 and Search Console metrics are collected; missing values default to zero.
- Reports are uploaded as private workflow artifacts and are not committed into the public website repo.
- This phase does not yet collect AdSense, affiliate commissions, Stripe, expense records, payouts, or FX normalization.
- This phase does not yet feed the dashboard UI or persistent database. Do not label dashboard values live until a backend is connected.
- Rotate any credentials that have been exposed in a public `.env` file. Removing a file from the current branch does not erase secrets from Git history.
