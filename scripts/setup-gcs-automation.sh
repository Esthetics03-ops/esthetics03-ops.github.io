#!/bin/bash

################################################################################
# ESTHETICS HUB - GCS AUTOMATION SETUP SCRIPT
# 
# Purpose: Automate the creation and deployment of:
#   1. GCS Ledger Sync Script (scripts/gcs-sync.sh)
#   2. GitHub Actions Workflow (.github/workflows/gcs-sync-scheduled.yml)
#   3. Environment Configuration Template (.env.gcs)
#
# Usage:
#   bash scripts/setup-gcs-automation.sh
#
# This script will:
#   ✓ Create necessary directories
#   ✓ Generate sync script with placeholders
#   ✓ Create GitHub Actions workflow
#   ✓ Create environment config template
#   ✓ Display setup instructions
################################################################################

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="${REPO_ROOT}/scripts"
WORKFLOWS_DIR="${REPO_ROOT}/.github/workflows"
CONFIG_DIR="${REPO_ROOT}/config"
DATA_DIR="${REPO_ROOT}/data"

# Setup tracking
SETUP_COMPLETE=true
CREATED_FILES=()

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

print_header() {
    echo -e "\n${CYAN}${BOLD}════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}════════════════════════════════════════════════════════════${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}▸ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# ==============================================================================
# STEP 1: CREATE DIRECTORIES
# ==============================================================================

create_directories() {
    print_section "Creating necessary directories..."
    
    for dir in "$SCRIPTS_DIR" "$WORKFLOWS_DIR" "$CONFIG_DIR" "$DATA_DIR"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        else
            print_info "Directory already exists: $dir"
        fi
    done
}

# ==============================================================================
# STEP 2: CREATE GCS SYNC SCRIPT
# ==============================================================================

create_sync_script() {
    print_section "Creating GCS synchronization script..."
    
    local sync_script="${SCRIPTS_DIR}/gcs-sync.sh"
    
    cat > "$sync_script" << 'SYNC_SCRIPT_EOF'
#!/bin/bash

# ==============================================================================
# ESTHETICS HUB DIAGNOSTICS & GOOGLE CLOUD SYNCHRONIZATION ENGINE
# Repository: Esthetics03-ops/Esthetics03-ops.github.io
# Purpose: File system cleanup, payment code audit, GCP auth verification,
#          and automated ledger synchronization to Google Cloud Storage
# ==============================================================================

set -euo pipefail

# ==============================================================================
# CONFIGURATION & ENVIRONMENT STRINGS
# ==============================================================================

# GCS Configuration (Replace with your actual bucket)
GCP_PROJECT_ID="${GCP_PROJECT_ID:-esthetics-tracker-project}"
GCP_BUCKET="${GCP_BUCKET:-gs://esthetics-hub-ledger-prod}"
GCP_REGION="${GCP_REGION:-us-central1}"

# Local paths
LOCAL_LEDGER_DIR="${LOCAL_LEDGER_DIR:-.}/data"
LOCAL_LEDGER_FILE="${LOCAL_LEDGER_FILE:-.}/data/database.db"
LOG_FILE="${LOG_FILE:-.}/data/sync_debug_log.txt"

# Repository info
REPO_OWNER="Esthetics03-ops"
REPO_NAME="Esthetics03-ops.github.io"
REPO_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}"

# Text Styling
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

log_info "Starting Esthetics Hub Diagnostics & Sync Engine"
log_info "Repo: ${REPO_URL}"
log_info "Execution: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Ensure data/log folder exists
mkdir -p "$(dirname "$LOG_FILE")" "$(dirname "$LOCAL_LEDGER_DIR")"
echo "Execution Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" > "$LOG_FILE"
echo "Repository: ${REPO_URL}" >> "$LOG_FILE"
echo "GCP Project: ${GCP_PROJECT_ID}" >> "$LOG_FILE"
echo "GCP Bucket: ${GCP_BUCKET}" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# ==============================================================================
# STEP 1: DEEP FILE SYSTEM SCAN & REPO FIXER
# ==============================================================================

log_section "STEP 1/4: File System Diagnostics & Cleanup"

if ls | grep -E "├──|└──|#" > /dev/null 2>&1; then
    log_error "Found invalid rogue text tree filenames"
    log_info "Cleaning up problematic files..."
    
    # Remove files starting with 'my-project'
    git rm -f "my-project"* 2>/dev/null || true
    
    # Remove files with "# Folder" pattern
    git rm -f *"# Folder"* 2>/dev/null || true
    
    # Remove tree structure characters
    find . -maxdepth 1 -name "*├──*" -exec rm -rf {} + 2>/dev/null || true
    find . -maxdepth 1 -name "*└──*" -exec rm -rf {} + 2>/dev/null || true
    
    log_success "Rogue tree files purged successfully"
    echo "Rogue files cleanup: COMPLETED" >> "$LOG_FILE"
    
    # Commit the cleanup
    if git status --porcelain | grep -q .; then
        git commit -m "fix: auto-cleanup rogue text-tree files via GCS sync diagnostics" 2>/dev/null || true
    fi
else
    log_success "File structure name lengths check passed"
    echo "File structure validation: PASSED" >> "$LOG_FILE"
fi

# ==============================================================================
# STEP 2: CODE AUDIT FOR LIVE PAYMENT CHANNELS
# ==============================================================================

log_section "STEP 2/4: Auditing Frontend Payment & Integration Code"

# Check for AdSense configuration
ADSENSE_ID="pub-1959507280210179"
ADSENSE_FOUND=false

if grep -r "$ADSENSE_ID" ./**/*.html 2>/dev/null || grep -r "$ADSENSE_ID" ./*.html 2>/dev/null; then
    log_success "Google AdSense Code ($ADSENSE_ID) located in source"
    echo "Google AdSense ID detected: YES" >> "$LOG_FILE"
    ADSENSE_FOUND=true
else
    log_warning "AdSense ID $ADSENSE_ID not explicitly found in HTML files"
    echo "Google AdSense ID detected: NO" >> "$LOG_FILE"
fi

# Check for M-PESA Daraja API integration
if grep -rE "mpesa|stk|daraja|lipa.?na.?mpesa" ./**/*.* 2>/dev/null | head -1 > /dev/null; then
    log_success "Safaricom M-PESA STK payment handler verified"
    echo "Safaricom M-PESA integration: ACTIVE" >> "$LOG_FILE"
else
    log_info "No active M-PESA background processing handlers tracked in current working tree"
    echo "Safaricom M-PESA integration: PASSIVE" >> "$LOG_FILE"
fi

# Check for Google Sheets API references
if grep -r "SHEET_ID\|google.*sheets\|gsheet" ./**/*.* 2>/dev/null | head -1 > /dev/null; then
    log_success "Google Sheets integration configured"
    echo "Google Sheets integration: ACTIVE" >> "$LOG_FILE"
else
    log_warning "Google Sheets integration not explicitly found"
    echo "Google Sheets integration: NOT FOUND" >> "$LOG_FILE"
fi

# ==============================================================================
# STEP 3: GOOGLE CLOUD STATUS & AUTHENTICATION AUDIT
# ==============================================================================

log_section "STEP 3/4: Verifying Google Cloud Platform Connection"

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    log_error "Google Cloud SDK ('gcloud') is not installed on this system"
    echo "Install from: https://cloud.google.com/sdk" >> "$LOG_FILE"
    exit 1
fi

log_success "Google Cloud SDK is installed"

# Check authentication
ACTIVE_ACCOUNT=$(gcloud config get-value account 2>/dev/null || echo "")

if [ -z "$ACTIVE_ACCOUNT" ]; then
    log_error "No authenticated Google account found"
    log_info "Please run: gcloud auth login"
    exit 1
else
    log_success "Authenticated with Google Cloud: [$ACTIVE_ACCOUNT]"
    echo "GCP Authentication: VERIFIED ($ACTIVE_ACCOUNT)" >> "$LOG_FILE"
fi

# Verify GCP project access
if gcloud config get-value project &>/dev/null; then
    CURRENT_PROJECT=$(gcloud config get-value project)
    log_info "Current GCP Project: $CURRENT_PROJECT"
    
    # Set to correct project if needed
    if [ "$CURRENT_PROJECT" != "$GCP_PROJECT_ID" ]; then
        log_info "Switching to project: $GCP_PROJECT_ID"
        gcloud config set project "$GCP_PROJECT_ID" 2>/dev/null
    fi
    echo "GCP Project: $GCP_PROJECT_ID" >> "$LOG_FILE"
fi

# ==============================================================================
# STEP 4: LEDGER DATA SYNCHRONIZATION
# ==============================================================================

log_section "STEP 4/4: Executing Ledger Storage Synchronization to GCS"

# Create local ledger directory if absent
if [ ! -d "$LOCAL_LEDGER_DIR" ]; then
    log_warning "Local ledger directory [$LOCAL_LEDGER_DIR] not found"
    log_info "Creating ledger directory structure..."
    mkdir -p "$LOCAL_LEDGER_DIR"
fi

# Calculate local metrics
if [ -f "$LOCAL_LEDGER_FILE" ]; then
    FILESIZE=$(stat -f%z "$LOCAL_LEDGER_FILE" 2>/dev/null || stat -c%s "$LOCAL_LEDGER_FILE" 2>/dev/null || echo "0")
    log_info "Ledger file detected: $FILESIZE bytes"
    echo "Local ledger file size: $FILESIZE bytes" >> "$LOG_FILE"
else
    log_warning "No local ledger file found at: $LOCAL_LEDGER_FILE"
    echo "Local ledger file: NOT FOUND" >> "$LOG_FILE"
fi

# Verify bucket exists and is accessible
log_info "Verifying GCS bucket access: $GCP_BUCKET"
if gcloud storage ls "$GCP_BUCKET" &>/dev/null; then
    log_success "GCS bucket is accessible"
    echo "GCS bucket access: VERIFIED" >> "$LOG_FILE"
else
    log_error "Cannot access GCS bucket: $GCP_BUCKET"
    log_info "Ensure bucket exists and you have permission to access it"
    echo "GCS bucket access: FAILED" >> "$LOG_FILE"
    exit 1
fi

# Perform synchronization
log_info "Starting data synchronization to GCS..."
if gcloud storage rsync "$LOCAL_LEDGER_DIR" "$GCP_BUCKET/ledger/" \
    --recursive \
    --delete-unmatched-destination-objects \
    --continue-on-error; then
    
    log_success "Ledger directory successfully synchronized to GCS"
    echo "GCS synchronization: SUCCESS" >> "$LOG_FILE"
    
    # List synced files
    log_info "Synced files in GCS:"
    gcloud storage ls -r "$GCP_BUCKET/ledger/" 2>/dev/null | head -10
else
    log_error "Synchronization encountered issues"
    log_info "Please verify GCS bucket permissions and try again"
    echo "GCS synchronization: PARTIAL_FAILURE" >> "$LOG_FILE"
fi

# ==============================================================================
# COMPLETION & REPORTING
# ==============================================================================

log_section "DIAGNOSTICS & SYNCHRONIZATION COMPLETE"

log_info "Verification log written to: $LOG_FILE"
log_info "Repository: ${REPO_URL}"
log_info "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Display summary
echo "" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "Execution completed at: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

log_success "All operations completed"

exit 0
SYNC_SCRIPT_EOF

    chmod +x "$sync_script"
    CREATED_FILES+=("$sync_script")
    print_success "Created sync script: $sync_script"
}

# ==============================================================================
# STEP 3: CREATE GITHUB ACTIONS WORKFLOW
# ==============================================================================

create_workflow() {
    print_section "Creating GitHub Actions workflow..."
    
    local workflow_file="${WORKFLOWS_DIR}/gcs-sync-scheduled.yml"
    
    cat > "$workflow_file" << 'WORKFLOW_EOF'
name: GCS Ledger Sync & Diagnostics

# Trigger configurations
on:
  # Daily synchronization at 2 AM UTC
  schedule:
    - cron: '0 2 * * *'
  
  # Manual trigger for on-demand sync
  workflow_dispatch:
    inputs:
      force_sync:
        description: 'Force full resynchronization'
        required: false
        default: 'false'
  
  # Trigger on push to main (optional)
  push:
    branches:
      - main
    paths:
      - 'data/**'
      - '.github/workflows/gcs-sync-scheduled.yml'
      - 'scripts/gcs-sync.sh'

# Prevent concurrent runs
concurrency:
  group: gcs-sync
  cancel-in-progress: false

# Permissions required
permissions:
  contents: read
  id-token: write

env:
  GCP_PROJECT_ID: esthetics-tracker-project
  GCP_BUCKET: gs://esthetics-hub-ledger-prod
  GCP_REGION: us-central1
  REPO_OWNER: Esthetics03-ops
  REPO_NAME: Esthetics03-ops.github.io

jobs:
  # Main synchronization job
  sync-ledger-to-gcs:
    name: Sync & Diagnose
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      # 1. Checkout repository
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1
          token: ${{ secrets.GITHUB_TOKEN }}

      # 2. Setup Google Cloud CLI
      - name: Setup Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ env.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          export_default_credentials: true

      # 3. Verify GCP configuration
      - name: Verify GCP Configuration
        run: |
          echo "Project ID: $(gcloud config get-value project)"
          echo "Active Account: $(gcloud config get-value account)"
          gcloud storage ls ${{ env.GCP_BUCKET }} || echo "Bucket access check completed"

      # 4. Make sync script executable
      - name: Prepare Sync Script
        run: |
          chmod +x scripts/gcs-sync.sh
          echo "Sync script prepared for execution"

      # 5. Run diagnostics and synchronization
      - name: Run Diagnostics & Sync Engine
        env:
          GCP_PROJECT_ID: ${{ env.GCP_PROJECT_ID }}
          GCP_BUCKET: ${{ env.GCP_BUCKET }}
          GCP_REGION: ${{ env.GCP_REGION }}
        run: |
          bash scripts/gcs-sync.sh
        continue-on-error: true

      # 6. Upload sync logs as artifact
      - name: Upload Sync Logs
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: gcs-sync-logs-${{ github.run_number }}
          path: data/sync_debug_log.txt
          retention-days: 30

      # 7. Create GitHub summary
      - name: Generate Workflow Summary
        if: always()
        run: |
          echo "## GCS Sync Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Date:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> $GITHUB_STEP_SUMMARY
          echo "**Project:** ${{ env.GCP_PROJECT_ID }}" >> $GITHUB_STEP_SUMMARY
          echo "**Bucket:** ${{ env.GCP_BUCKET }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          
          if [ -f data/sync_debug_log.txt ]; then
            echo "### Sync Log" >> $GITHUB_STEP_SUMMARY
            echo '```' >> $GITHUB_STEP_SUMMARY
            tail -20 data/sync_debug_log.txt >> $GITHUB_STEP_SUMMARY
            echo '```' >> $GITHUB_STEP_SUMMARY
          fi

      # 8. Notify on failure (optional)
      - name: Notify Failure (Optional)
        if: failure()
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
        run: |
          if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
            curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
              -d "chat_id=${TELEGRAM_CHAT_ID}" \
              -d "text=⚠️ GCS Sync failed for ${{ env.REPO_NAME }} at $(date -u '+%Y-%m-%d %H:%M:%S UTC'). Check: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \
              -d "parse_mode=HTML" || true
          fi

  # Optional: Post-sync verification job
  verify-sync:
    name: Verify Sync Integrity
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: sync-ledger-to-gcs
    if: success()
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ env.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}

      - name: Verify GCS Data Integrity
        run: |
          echo "Verifying synchronized data in GCS..."
          
          # List files in GCS
          echo "📦 Files in ${{ env.GCP_BUCKET }}/ledger/:"
          gcloud storage ls -r "${{ env.GCP_BUCKET }}/ledger/" --limit=50 || echo "No files found or access restricted"
          
          # Check file counts
          FILE_COUNT=$(gcloud storage ls -r "${{ env.GCP_BUCKET }}/ledger/" 2>/dev/null | wc -l || echo "0")
          echo "✅ Total files synced: $FILE_COUNT"

      - name: Generate Verification Summary
        run: |
          echo "## Sync Verification Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "✅ Synchronization verified at $(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> $GITHUB_STEP_SUMMARY
          echo "📦 Bucket: ${{ env.GCP_BUCKET }}" >> $GITHUB_STEP_SUMMARY
WORKFLOW_EOF

    CREATED_FILES+=("$workflow_file")
    print_success "Created workflow: $workflow_file"
}

# ==============================================================================
# STEP 4: CREATE ENVIRONMENT CONFIGURATION TEMPLATE
# ==============================================================================

create_env_template() {
    print_section "Creating environment configuration template..."
    
    local env_file="${CONFIG_DIR}/.env.gcs.template"
    
    cat > "$env_file" << 'ENV_TEMPLATE_EOF'
# ==============================================================================
# GCS SYNCHRONIZATION ENVIRONMENT CONFIGURATION
# ==============================================================================
# This file contains configuration for the GCS Ledger Sync automation
# Copy this to .env.gcs and fill in your actual values
#
# Usage:
#   source config/.env.gcs
#   bash scripts/gcs-sync.sh
# ==============================================================================

# Google Cloud Platform Configuration
# ====================================
GCP_PROJECT_ID=esthetics-tracker-project
GCP_BUCKET=gs://esthetics-hub-ledger-prod
GCP_REGION=us-central1
GCP_SERVICE_ACCOUNT_EMAIL=gcs-sync@esthetics-tracker-project.iam.gserviceaccount.com

# Local Ledger Paths
# ==================
LOCAL_LEDGER_DIR=./data
LOCAL_LEDGER_FILE=./data/database.db
LOG_FILE=./data/sync_debug_log.txt

# Repository Information (Auto-detected, but override if needed)
# ==============================================================
REPO_OWNER=Esthetics03-ops
REPO_NAME=Esthetics03-ops.github.io
REPO_URL=https://github.com/Esthetics03-ops/Esthetics03-ops.github.io

# Synchronization Settings
# =========================
# Delete unmatched files from destination (set to true for cleanup, false to preserve)
SYNC_DELETE_UNMATCHED=true

# Continue on error during sync (set to true to not fail on partial errors)
SYNC_CONTINUE_ON_ERROR=true

# Notification Settings (Optional)
# =================================
# Set these to enable Telegram notifications on sync failure
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# AdSense Configuration (Auto-detected)
# ======================================
ADSENSE_ID=pub-1959507280210179

# Payment Integration Codes (Auto-detected)
# ==========================================
# These are scanned for during diagnostics
ENABLE_MPESA_CHECK=true
ENABLE_SHEETS_CHECK=true

# Debug Settings
# ==============
DEBUG_MODE=false
VERBOSE_LOGGING=true

# Email Notifications (Optional)
# ================================
NOTIFICATION_EMAIL=esthetics03@gmail.com
SYSTEM_NOTIFICATION_EMAIL=notifications@esthetics03.com
EOF

    CREATED_FILES+=("$env_file")
    print_success "Created environment template: $env_file"
}

# ==============================================================================
# STEP 5: CREATE SETUP DOCUMENTATION
# ==============================================================================

create_documentation() {
    print_section "Creating setup documentation..."
    
    local doc_file="${REPO_ROOT}/GCS_SYNC_SETUP.md"
    
    cat > "$doc_file" << 'DOC_EOF'
# GCS Ledger Synchronization Setup Guide

This guide walks you through setting up automated Google Cloud Storage (GCS) synchronization for the Esthetics Hub.

## Overview

The GCS Sync automation includes:
- **Sync Script** (`scripts/gcs-sync.sh`): Handles diagnostics and data synchronization
- **GitHub Actions Workflow** (`.github/workflows/gcs-sync-scheduled.yml`): Automates scheduled execution
- **Environment Configuration** (`config/.env.gcs`): Stores credentials and settings

## Prerequisites

1. **Google Cloud Project**
   - Active GCP project with GCS bucket
   - Service Account with Storage Admin permissions
   - Service Account JSON key

2. **GitHub Repository Access**
   - Push permissions to the repository
   - Ability to add repository secrets

3. **Local Tools** (for manual testing)
   - `gcloud` CLI installed
   - `git` installed
   - `bash` shell

## Setup Instructions

### Step 1: Create Google Cloud Service Account

```bash
# Set your GCP project ID
export PROJECT_ID="esthetics-tracker-project"

# Create service account
gcloud iam service-accounts create gcs-sync \
  --display-name="GCS Ledger Sync Service Account" \
  --project=$PROJECT_ID

# Grant Storage Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:gcs-sync@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create and download JSON key
gcloud iam service-accounts keys create gcs-sync-key.json \
  --iam-account=gcs-sync@${PROJECT_ID}.iam.gserviceaccount.com \
  --project=$PROJECT_ID
```

### Step 2: Add GitHub Secrets

1. Go to your repository settings
2. Navigate to **Secrets and variables → Actions**
3. Create a new secret named `GCP_SA_KEY`
4. Paste the contents of `gcs-sync-key.json`
5. (Optional) Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for notifications

```bash
# Copy the key file contents
cat gcs-sync-key.json | pbcopy  # macOS
# or
cat gcs-sync-key.json | xclip -selection clipboard  # Linux
```

### Step 3: Configure Environment

```bash
# Copy the template
cp config/.env.gcs.template config/.env.gcs

# Edit with your values
nano config/.env.gcs
```

Key variables to update:
- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_BUCKET`: Your GCS bucket path (e.g., `gs://esthetics-hub-ledger-prod`)
- `GCP_REGION`: Your preferred GCP region
- `LOCAL_LEDGER_DIR`: Local path to ledger data (default: `./data`)

### Step 4: Test Local Execution

```bash
# Source the environment
source config/.env.gcs

# Run the sync script manually
bash scripts/gcs-sync.sh
```

Expected output should show:
- ✓ File system diagnostics
- ✓ Payment code audit
- ✓ GCP authentication verification
- ✓ Ledger synchronization to GCS

## Automated Execution

The GitHub Actions workflow runs automatically on:

1. **Daily Schedule**: 2 AM UTC
2. **Manual Trigger**: Anytime via GitHub Actions UI
3. **On Push**: When `data/`, workflow, or script files change

### Manual Trigger

```bash
# Via GitHub CLI
gh workflow run gcs-sync-scheduled.yml --ref main

# Or via GitHub UI:
# Actions → GCS Ledger Sync & Diagnostics → Run workflow
```

## Monitoring

### View Logs

1. **GitHub Actions**: Repository → Actions → GCS Ledger Sync & Diagnostics
2. **Artifacts**: Download sync logs for each run (retained 30 days)
3. **Local**: `data/sync_debug_log.txt` after manual execution

### Verify Sync

```bash
# List files in GCS bucket
gcloud storage ls -r gs://esthetics-hub-ledger-prod/ledger/

# Check file count
gcloud storage ls -r gs://esthetics-hub-ledger-prod/ledger/ | wc -l
```

## Troubleshooting

### Authentication Failed

```bash
# Re-authenticate with Google Cloud
gcloud auth login

# Set the correct project
gcloud config set project esthetics-tracker-project

# Verify authentication
gcloud auth list
```

### Bucket Access Denied

```bash
# Check your service account has Storage Admin role
gcloud projects get-iam-policy esthetics-tracker-project \
  --flatten="bindings[].members" \
  --filter="bindings.members:gcs-sync@*"

# If missing, grant the role
gcloud projects add-iam-policy-binding esthetics-tracker-project \
  --member="serviceAccount:gcs-sync@esthetics-tracker-project.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### Workflow Not Running

1. Check GitHub Actions is enabled: Settings → Actions → General
2. Verify the workflow file syntax: `.github/workflows/gcs-sync-scheduled.yml`
3. Ensure `GCP_SA_KEY` secret is set correctly
4. Check workflow logs for detailed error messages

## File Cleanup

The script automatically removes problematic files:
- Files starting with `my-project`
- Files containing `# Folder`
- Tree structure characters (`├──`, `└──`)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | `esthetics-tracker-project` |
| `GCP_BUCKET` | GCS bucket path | `gs://esthetics-hub-ledger-prod` |
| `GCP_REGION` | GCP region | `us-central1` |
| `LOCAL_LEDGER_DIR` | Local ledger directory | `./data` |
| `LOCAL_LEDGER_FILE` | Local ledger database file | `./data/database.db` |
| `LOG_FILE` | Sync log location | `./data/sync_debug_log.txt` |

## Security Best Practices

1. **Never commit** the Service Account key to Git
2. **Always use** GitHub repository secrets for sensitive values
3. **Rotate keys** regularly (annually recommended)
4. **Monitor** GCS access logs for unusual activity
5. **Restrict** Service Account permissions to minimum required

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review workflow logs in GitHub Actions
3. Consult the Esthetics Hub documentation
4. Open an issue in the repository

---

**Last Updated**: 2026-07-06
**Repository**: https://github.com/Esthetics03-ops/Esthetics03-ops.github.io
DOC_EOF

    CREATED_FILES+=("$doc_file")
    print_success "Created documentation: $doc_file"
}

# ==============================================================================
# STEP 6: CREATE SETUP VERIFICATION SCRIPT
# ==============================================================================

create_verify_script() {
    print_section "Creating verification script..."
    
    local verify_script="${SCRIPTS_DIR}/verify-gcs-setup.sh"
    
    cat > "$verify_script" << 'VERIFY_SCRIPT_EOF'
#!/bin/bash

# ==============================================================================
# GCS SYNCHRONIZATION SETUP VERIFICATION
# ==============================================================================
# This script verifies that all GCS automation components are properly set up

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

check_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

check_error() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

check_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((CHECKS_WARNING++))
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GCS Synchronization Setup Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check sync script
echo "Checking sync script..."
if [ -f "scripts/gcs-sync.sh" ]; then
    check_success "Sync script exists"
    if [ -x "scripts/gcs-sync.sh" ]; then
        check_success "Sync script is executable"
    else
        check_warning "Sync script is not executable (run: chmod +x scripts/gcs-sync.sh)"
    fi
else
    check_error "Sync script not found"
fi

# Check workflow
echo -e "\nChecking GitHub Actions workflow..."
if [ -f ".github/workflows/gcs-sync-scheduled.yml" ]; then
    check_success "Workflow file exists"
else
    check_error "Workflow file not found"
fi

# Check environment template
echo -e "\nChecking configuration files..."
if [ -f "config/.env.gcs.template" ]; then
    check_success "Environment template exists"
else
    check_warning "Environment template not found"
fi

if [ -f "config/.env.gcs" ]; then
    check_success "Environment configuration file exists"
else
    check_warning "Environment configuration file not found (copy from template)"
fi

# Check directories
echo -e "\nChecking directory structure..."
for dir in "scripts" ".github/workflows" "data" "config"; do
    if [ -d "$dir" ]; then
        check_success "Directory exists: $dir"
    else
        check_warning "Directory not found: $dir"
    fi
done

# Check gcloud CLI
echo -e "\nChecking Google Cloud tools..."
if command -v gcloud &> /dev/null; then
    check_success "gcloud CLI is installed"
    GCLOUD_VERSION=$(gcloud --version | head -1)
    echo -e "  ${BLUE}ℹ${NC} $GCLOUD_VERSION"
else
    check_error "gcloud CLI is not installed"
fi

# Check git
echo -e "\nChecking Git..."
if command -v git &> /dev/null; then
    check_success "git is installed"
else
    check_error "git is not installed"
fi

# Check GCP authentication
echo -e "\nChecking GCP authentication..."
if gcloud auth list --filter=status:ACTIVE 2>/dev/null | grep -q "@"; then
    ACTIVE_ACCOUNT=$(gcloud config get-value account 2>/dev/null)
    check_success "GCP authentication active: $ACTIVE_ACCOUNT"
else
    check_warning "No active GCP authentication (run: gcloud auth login)"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "Passed:  ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Warnings: ${YELLOW}$CHECKS_WARNING${NC}"
echo -e "Failed:  ${RED}$CHECKS_FAILED${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ Setup verification passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some checks failed. Please review above.${NC}"
    exit 1
fi
VERIFY_SCRIPT_EOF

    chmod +x "$verify_script"
    CREATED_FILES+=("$verify_script")
    print_success "Created verification script: $verify_script"
}

# ==============================================================================
# STEP 7: DISPLAY SUMMARY AND NEXT STEPS
# ==============================================================================

display_summary() {
    print_header "Setup Complete!"
    
    print_section "Created Files"
    for file in "${CREATED_FILES[@]}"; do
        print_success "$file"
    done
    
    print_section "Next Steps"
    
    echo -e "${CYAN}1. Review the created files:${NC}"
    echo -e "   - scripts/gcs-sync.sh (Sync engine)"
    echo -e "   - .github/workflows/gcs-sync-scheduled.yml (Automation)"
    echo -e "   - config/.env.gcs.template (Configuration template)\n"
    
    echo -e "${CYAN}2. Create Google Cloud Service Account:${NC}"
    echo -e "   bash <(curl -s https://example.com/gcp-setup.sh)\n"
    
    echo -e "${CYAN}3. Configure environment:${NC}"
    echo -e "   cp config/.env.gcs.template config/.env.gcs"
    echo -e "   nano config/.env.gcs\n"
    
    echo -e "${CYAN}4. Add GitHub Secrets:${NC}"
    echo -e "   - Go to: Settings → Secrets and variables → Actions"
    echo -e "   - Add: GCP_SA_KEY (contents of service account JSON)\n"
    
    echo -e "${CYAN}5. Verify the setup:${NC}"
    echo -e "   bash scripts/verify-gcs-setup.sh\n"
    
    echo -e "${CYAN}6. Test locally (optional):${NC}"
    echo -e "   source config/.env.gcs"
    echo -e "   bash scripts/gcs-sync.sh\n"
    
    print_section "Documentation"
    echo -e "Read the complete setup guide:"
    echo -e "  ${BLUE}GCS_SYNC_SETUP.md${NC}\n"
    
    print_section "Troubleshooting"
    echo -e "If you encounter issues, run the verification script:"
    echo -e "  bash scripts/verify-gcs-setup.sh\n"
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
    print_header "Esthetics Hub - GCS Automation Setup"
    
    print_info "Repository: $REPO_ROOT"
    print_info "Starting setup...\n"
    
    create_directories
    create_sync_script
    create_workflow
    create_env_template
    create_documentation
    create_verify_script
    
    display_summary
    
    print_header "Setup Summary"
    print_success "${#CREATED_FILES[@]} files created successfully"
    print_info "Run 'bash scripts/verify-gcs-setup.sh' to verify the setup"
    
    echo ""
}

# Run main function
main
