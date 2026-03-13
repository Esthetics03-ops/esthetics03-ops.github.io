# 🌿 The Esthetics Hub | Bio-Sync Core v18.0

[![Lighthouse Audit](https://github.com/esthetics03-ops/esthetics03-ops.github.io/actions/workflows/bio-sync-orchestrator.yml/badge.svg)](https://github.com/esthetics03-ops/esthetics03-ops.github.io/actions)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/esthetics03-ops/esthetics03-ops.github.io/graphs/commit-activity)

**The Esthetics Hub** is a Nairobi-based biohacking platform specializing in metabolic health, nervous system regulation, and sleep optimization. This repository houses the frontend architecture and the **Bio-Sync Core** automation engine.

---

## 🚀 System Architecture

The Hub operates on a high-performance, zero-cost infrastructure:

* **Frontend:** Glassmorphism-styled static site hosted on **GitHub Pages**.
* **Database:** Local **SQLite** store for M-PESA transaction telemetry.
* **Automation:** **GitHub Actions** orchestrating daily performance audits and Sunday data archival.
* **Data Lake:** **Google Sheets** acts as the primary analytical dashboard for revenue and traffic metrics.
* **Reporting:** Automated **Google Docs** generation and **Telegram** bot notifications.



## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python 3.12, PHP 8.2 (Composer) |
| **Data** | SQLite, Pandas, Google Sheets API |
| **DevOps** | GitHub Actions, Lighthouse CI |
| **Fintech** | Safaricom Daraja API (Lipa Na M-PESA) |
| **Monitoring** | Telegram Bot API, Glassmorphism Telemetry UI |

---

## 📂 Project Structure

```text
├── .github/workflows/       # CI/CD Orchestration (Lighthouse + Sync)
├── auth/                    # Encrypted credentials (Local only)
├── database/                # Local SQLite storage
├── scripts/                 # Core Python & PHP automation logic
│   ├── sunday_archive.py    # Weekly data sync to Google
│   └── generate_report.py   # Weekly Google Doc generation
├── status.html              # Real-time system pulse dashboard
├── 404.html                 # Branded error recovery page
└── index.html               # Main Wellness Hub entry point
