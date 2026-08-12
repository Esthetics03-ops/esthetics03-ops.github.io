# 🌿 The Esthetics Hub | Bio-Sync Enterprise v24.0

[![Live Site Status](https://img.shields.io/website?url=https%3A%2F%2Festhetics03-ops.github.io&label=production%20site&logo=github)](https://esthetics03-ops.github.io)
[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-95+-success)](https://esthetics03-ops.github.io)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/esthetics03-ops/esthetics03-ops.github.io/graphs/commit-activity)

**The Esthetics Hub** is a science-backed biohacking platform from Nairobi delivering metabolic health optimization, nervous system regulation protocols, and longevity research—powered by a serverless architecture combining **GitHub Pages** (frontend), **Google Cloud Run** (backend), **GitHub Actions** (automation), and **Google Sheets** (data ops).

**🚀 Live:** https://esthetics03-ops.github.io

---

## Quick Start

### Local Development
```bash
git clone https://github.com/Esthetics03-ops/Esthetics03-ops.github.io.git
cd Esthetics03-ops.github.io

# Install dependencies
pip install -r requirements.txt
npm install

# Start local server
python -m http.server 8000
# Visit http://localhost:8000
```

### Environment Setup
```bash
cp .env.example .env
# Add your API keys:
# - GOOGLE_SHEETS_API_KEY
# - SAFARICOM_CONSUMER_KEY & CONSUMER_SECRET
# - M_PESA_SHORTCODE
```

---

## Architecture

### 🌐 Frontend (GitHub Pages)
- **85KB optimized HTML** with glassmorphism design
- Responsive **Bootstrap 5.3** + AOS animations
- Structured data (JSON-LD) for SEO & schema validation
- Lighthouse score: **95+**

### 🔧 Backend (Google Cloud Run)
- **PHP 8.3** microservices handling Safaricom M-PESA Daraja API callbacks
- **Python 3.12** async workers for data sync & analytics
- Real-time payment validation & ledger updates

### ⚙️ Automation (GitHub Actions)
- **Daily Lighthouse audits** → email alerts
- **Weekly data archival** → Google Sheets sync
- **Hourly indexing checks** → Search Console API
- SEO health monitoring & uptime tracking

### 📊 Data Layer
- **SQLite** local database (dev)
- **Google Sheets API** for revenue telemetry & metabolic tracking
- **JSON** protocol definitions & business configurations

---

## Project Structure

```
.github/workflows/              # CI/CD: bio-sync-orchestrator.yml, audit.yml, search-sync.yml
assets/                         # Fonts, WebP/AVIF images, optimized CSS
scripts/                        # Python automation: drive_sync.py, audit.py, check_links.py
esthetics-AI/                  # AI tools for beauty & wellness automation
backend/                        # PHP microservices (M-PESA, payments)
functions/                      # Google Cloud Functions
api/                           # REST endpoints
protocols/                     # Wellness protocol JSON schemas
index.html                     # Homepage (83KB, performance-optimized)
bio-sync-master.html          # Metabolic reset dashboard
revenue-dashboard.html        # Business analytics
package.json                  # Node dependencies
composer.json                 # PHP dependencies
requirements.txt              # Python dependencies
```

---

## Key Features

### 🧬 **Bio-Sync Protocols**
- Chrononutrition meal timing optimization
- Vagus nerve reset (3-minute nervous system rebalancing)
- Cognitive optimization workflows
- Sleep-tech integration (Oura Ring compatibility)

### 💰 **Payment Processing**
- **M-PESA** (Safaricom Daraja API)
- **PayPal** & Stripe (fallback)
- Real-time transaction validation & ledger sync
- Email receipts & WhatsApp notifications

### 📈 **Analytics & Monitoring**
- **Google Analytics 4** + GTM containers
- **Plausible** privacy-first analytics
- **Google Ads** tracking (AW-18006354803)
- Custom revenue dashboard with real-time metrics

### 🔐 **Security**
- `.env` secrets management (not in repo)
- HTTPS enforced (GitHub Pages + Cloudflare)
- M-PESA callback signature validation
- CORS headers configured for Cross-origin access

---

## Deployment

### **Frontend (GitHub Pages)**
Automatically deployed on push to `main`:
```bash
git push origin main
# Site goes live at: https://esthetics03-ops.github.io
```

### **Backend (Google Cloud Run)**
```bash
gcloud auth login
gcloud config set project esthetics03-biohacking
gcloud run deploy bio-sync-api --source backend/ --platform managed --region us-central1
```

### **Scheduled Workflows**
Edit `.github/workflows/*.yml` to change automation schedules (default: daily 6 AM UTC).

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payment/initiate` | POST | Initiate M-PESA STK push |
| `/api/payment/callback` | POST | Handle Daraja payment callbacks |
| `/api/sheets/sync` | GET | Sync data to Google Sheets |
| `/api/audit/lighthouse` | GET | Trigger Lighthouse audit |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add cool feature"`
4. Push & open a PR
5. CI checks must pass (Lighthouse, link validation, indexing)

---

## Troubleshooting

**Site not deploying?**
- Check `.github/workflows/` logs in the Actions tab
- Verify `CNAME` points to GitHub Pages

**M-PESA payments timing out?**
- Test API credentials in `.env`
- Check Cloud Run logs: `gcloud run logs bio-sync-api`

**Low Lighthouse scores?**
- Run: `npm run audit`
- Optimize images: `npm run images:compress`
- Check CLS issues in browser DevTools

---

## License & Attribution

- **Founder:** George Kutosi Ondimu (@Esthetics03-ops)
- **Location:** Nairobi, Kenya
- **License:** CC BY-NC-SA 4.0 (commercial use with permission)

---

## Contact & Support

📧 **Email:** esthetics03@gmail.com  
📱 **WhatsApp:** +254 113 379 488  
🏢 **HQ:** Nairobi, Kenya  
🌐 **Web:** https://esthetics03-ops.github.io
