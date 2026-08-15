# The Esthetics Hub - Setup & Configuration Guide

## Overview
This guide walks you through obtaining and configuring all required API keys and credentials for **The Esthetics Hub Bio-Sync** platform.

---

## 1. Application Core Configuration

### APP_NAME
- **Current Value:** `The Esthetics Hub`
- **Description:** Application display name
- **Action Required:** No change needed (unless rebranding)

### APP_ENV
- **Current Value:** `production`
- **Options:** `production`, `staging`, `development`
- **Description:** Sets the application environment
- **Action Required:** Keep as `production` for live deployment

### APP_DEBUG
- **Current Value:** `false`
- **Description:** Enable/disable debug mode (should be `false` in production)
- **Action Required:** Keep as `false`

### APP_URL
- **Current Value:** `https://esthetics03-ops.github.io`
- **Description:** Your application's public URL
- **Action Required:** Verify this matches your deployment URL

### TIMEZONE
- **Current Value:** `Africa/Nairobi`
- **Description:** Server timezone for date/time operations
- **Action Required:** Change if operating from a different timezone

---

## 2. Safaricom M-PESA (Daraja API) Configuration

### MPESA_ENVIRONMENT
- **Current Value:** `live`
- **Options:** `sandbox`, `live`
- **Description:** M-PESA API environment
- **Action Required:** 
  - Use `sandbox` for testing
  - Switch to `live` for production payments

### MPESA_CONSUMER_KEY & MPESA_CONSUMER_SECRET
- **Description:** OAuth credentials for M-PESA Daraja API
- **How to Obtain:**
  1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke)
  2. Sign up or log in to your account
  3. Create a new application or use existing one
  4. Navigate to the **Keys** section
  5. Copy your **Consumer Key** and **Consumer Secret**
- **Action Required:** 
  ```bash
  MPESA_CONSUMER_KEY=your_consumer_key_here
  MPESA_CONSUMER_SECRET=your_consumer_secret_here
  ```

### MPESA_SHORTCODE
- **Description:** Your M-PESA Business Shortcode (Paybill or Till Number)
- **How to Obtain:**
  1. Get from Safaricom business account documentation
  2. Usually provided in your M-PESA business registration email
  3. Format: 6-digit number (e.g., `123456`)
- **Action Required:**
  ```bash
  MPESA_SHORTCODE=123456
  ```

### MPESA_PASSKEY
- **Description:** Lipa Na M-PESA Online Passkey for STK push
- **How to Obtain:**
  1. Log into [Safaricom Developer Portal](https://developer.safaricom.co.ke)
  2. Go to your app > **API keys** > **Lipa Na M-PESA Online**
  3. Copy the passkey (usually 32 characters)
- **Action Required:**
  ```bash
  MPESA_PASSKEY=your_lipa_na_mpesa_passkey_here
  ```

### MPESA_CALLBACK_URL
- **Description:** URL where M-PESA sends payment callbacks
- **How to Obtain:**
  1. Should be your backend API endpoint for handling M-PESA responses
  2. Example: `https://your-api.com/api/v1/mpesa/callback`
- **Action Required:**
  ```bash
  MPESA_CALLBACK_URL=https://your-api-endpoint.com/v1/mpesa/callback
  ```

---

## 3. Google Cloud & Analytics Configuration

### GCP_PROJECT_ID
- **Current Value:** `esthetics-tracker-project`
- **Description:** Your Google Cloud Project ID
- **How to Obtain:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Create a new project or select existing one
  3. Copy the **Project ID** from the project selector
- **Action Required:**
  ```bash
  GCP_PROJECT_ID=your-gcp-project-id
  ```

### GOOGLE_APPLICATION_CREDENTIALS
- **Current Value:** `auth/credentials.json`
- **Description:** Path to your Google Cloud service account JSON key file
- **How to Obtain:**
  1. In [Google Cloud Console](https://console.cloud.google.com)
  2. Go to **Service Accounts** > Create Service Account
  3. Grant roles: `Editor` (or minimal required permissions)
  4. Create a JSON key and download it
  5. Place the file in the `auth/` directory
- **Action Required:**
  1. Create `auth/` directory if it doesn't exist
  2. Download credentials.json from Google Cloud
  3. Keep path as `auth/credentials.json`
  ```bash
  mkdir -p auth
  # Place your downloaded credentials.json in the auth/ directory
  ```

### GOOGLE_DRIVE_FOLDER_ID
- **Description:** Google Drive folder ID where files will be stored
- **How to Obtain:**
  1. Create a folder in Google Drive
  2. Open the folder in your browser
  3. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`
- **Action Required:**
  ```bash
  GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id_here
  ```

### GA4_PROPERTY_ID
- **Description:** Google Analytics 4 Property ID for tracking
- **How to Obtain:**
  1. Go to [Google Analytics](https://analytics.google.com)
  2. Select your property
  3. Go to **Admin** > **Property Settings**
  4. Copy the **Property ID**
- **Action Required:**
  ```bash
  GA4_PROPERTY_ID=your_ga4_property_id
  ```

### GS_SEARCH_CONSOLE_SITE_URL
- **Current Value:** `https://esthetics03-ops.github.io`
- **Description:** Your site URL for Google Search Console
- **How to Obtain:**
  1. Go to [Google Search Console](https://search.google.com/search-console)
  2. Verify your domain
  3. Confirm the property URL matches
- **Action Required:** Ensure it matches your live URL

---

## 4. Google Sheets & Data Archival

### SHEET_ID
- **Description:** Main Bio-Sync Master Hub Sheet ID (Google Sheets)
- **How to Obtain:**
  1. Create a Google Sheet for data storage
  2. Open the sheet in your browser
  3. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
- **Action Required:**
  ```bash
  SHEET_ID=your_sheet_id_here
  ```

### ARCHIVE_SHEET_ID
- **Description:** Separate sheet for Sunday archival backups
- **How to Obtain:**
  1. Create another Google Sheet for archives
  2. Copy its Sheet ID from the URL
- **Action Required:**
  ```bash
  ARCHIVE_SHEET_ID=your_archive_sheet_id_here
  ```

### RAW_DATA_TAB_NAME
- **Current Value:** `RawData`
- **Description:** Name of the tab/sheet within your Google Sheet where raw data is stored
- **Action Required:** Match the actual tab name in your Google Sheet

---

## 5. Messaging & Telegram Bot Configuration

### TELEGRAM_BOT_TOKEN
- **Description:** Token for your Telegram bot (for notifications)
- **How to Obtain:**
  1. Open Telegram and search for **@BotFather**
  2. Send `/newbot` command
  3. Follow the prompts to create a bot
  4. Copy the token provided (format: `123456789:ABCdefGHIjklmNOpqrsTUVwxyz`)
- **Action Required:**
  ```bash
  TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmNOpqrsTUVwxyz
  ```

### TELEGRAM_CHAT_ID
- **Description:** Your personal/admin Telegram Chat ID for admin notifications
- **How to Obtain:**
  1. Start a chat with your bot
  2. Send any message
  3. Visit `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
  4. Find your Chat ID in the response
- **Action Required:**
  ```bash
  TELEGRAM_CHAT_ID=123456789
  ```

---

## 6. Administrative Configuration

### ADMIN_EMAIL
- **Current Value:** `esthetics03@gmail.com`
- **Description:** Primary admin email for system communications
- **Action Required:** Update with your actual admin email

### SYSTEM_NOTIFICATION_EMAIL
- **Current Value:** `notifications@esthetics03.com`
- **Description:** Email for system notifications and alerts
- **Action Required:** Update with your notification email address

---

## 7. Database Configuration

### DB_CONNECTION
- **Current Value:** `sqlite`
- **Description:** Database connection type
- **Action Required:** Keep as `sqlite` for local storage, or change to `mysql`/`postgres` if using a remote database

### DB_DATABASE
- **Current Value:** `database/hub_storage.sqlite`
- **Description:** Path to SQLite database file
- **Action Required:** Ensure the `database/` directory exists:
  ```bash
  mkdir -p database
  ```

---

## Complete Setup Checklist

- [ ] M-PESA Daraja API credentials obtained
- [ ] Google Cloud Project created with service account
- [ ] Google Sheets created for master data and archives
- [ ] Google Analytics 4 property set up
- [ ] Google Search Console verified
- [ ] Google Drive folder created for file storage
- [ ] Telegram bot created and Chat ID obtained
- [ ] Admin and notification emails configured
- [ ] Database directory created
- [ ] `.env` file filled with all actual values
- [ ] `.env` file added to `.gitignore` (already done)

---

## Quick Setup Script

Run this to create the necessary directories:

```bash
# Create required directories
mkdir -p auth database

# Copy .env.example to .env (if not already done)
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

---

## Security Best Practices

1. **Never commit `.env` to version control** - It's already in `.gitignore`
2. **Use environment-specific credentials** - Different keys for sandbox vs. production
3. **Rotate API keys regularly** - Update credentials every 90 days
4. **Restrict API key permissions** - Grant minimum required access in each service
5. **Store backup credentials securely** - Use a password manager or secure vault
6. **Monitor API usage** - Check Safaricom and Google Cloud dashboards for unusual activity

---

## Troubleshooting

### M-PESA Connection Issues
- Verify shortcode format (6 digits)
- Confirm passkey is correct and not expired
- Check callback URL is publicly accessible
- Test with sandbox environment first

### Google Sheets Authorization
- Ensure service account has Editor access to sheets
- Verify credentials.json hasn't expired
- Check that Sheet IDs are correctly copied (no extra spaces)

### Telegram Bot Not Sending Messages
- Verify bot token is correct
- Confirm Chat ID is correct (numbers only)
- Ensure bot has been started with `/start`

---

## Support & Resources

- [Safaricom Developer Docs](https://developer.safaricom.co.ke)
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Google Sheets API Guide](https://developers.google.com/sheets/api)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

**Last Updated:** August 15, 2026  
**Maintained By:** The Esthetics Hub Operations Team
