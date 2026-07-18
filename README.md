## 🌿 The Esthetics Hub | Bio-Sync Enterprise v23.0

[![Live Site Status](https://img.shields.io/website?url=https%3A%2F%2Festhetics03-ops.github.io&label=production%20site&logo=github)](https://esthetics03-ops.github.io)
[![Lighthouse Audit](https://github.com/esthetics03-ops/esthetics03-ops.github.io/actions/workflows/bio-sync-orchestrator.yml/badge.svg)](https://github.com/esthetics03-ops/esthetics03-ops.github.io/actions)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/esthetics03-ops/esthetics03-ops.github.io/graphs/commit-activity)

**The Esthetics Hub** is a Nairobi-based biohacking platform specializing in metabolic health, nervous system regulation, and longevity research. 

* **Production URL:** [https://esthetics03-ops.github.io](https://esthetics03-ops.github.io)
* **Repository Role:** Houses the core frontend responsive web architecture and the **Bio-Sync Enterprise** automation engine.

---

## 🚀 System Architecture

The Hub operates on a high-performance, serverless-first infrastructure:

* **Frontend:** Glassmorphism-styled static site hosted on **GitHub Pages**.
* **Backend:** Secure **Google Cloud Run (PHP 8.3)** micro-services handling M-PESA Daraja API callbacks.
* **Automation:** **GitHub Actions** orchestrating daily performance audits and automated data archival.
* **Data Lake:** **Google Sheets** integrated via GCP for revenue and metabolic health telemetry.
* **Intelligence:** AI-driven diagnostic workflows for personalized wellness protocols.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | PHP 8.3, Python 3.12 (GCP Cloud Run) |
| **Data** | SQLite, Pandas, Google Sheets API |
| **DevOps** | GitHub Actions, Google Cloud Build |
| **Fintech** | Safaricom Daraja API (Lipa Na M-PESA) |
| **Monitoring** | Google Cloud Logging, Telegram Bot API |

---

## 📂 Project Structure

The repository contains frontend assets, automation workflows, and deployment configuration for the Hub's ecosystem:

```text
├── .github/workflows/       # Automated CI/CD pipelines (Bio-Sync, Audit, Search Sync)
├── assets/                  # CSS, icons, and WebP compressed media assets
├── scripts/                 # Python/Node analytics & external data-sync scripts
├── index.html               # Main glassmorphism frontend user portal
└── README.md                # Enterprise repository documentation