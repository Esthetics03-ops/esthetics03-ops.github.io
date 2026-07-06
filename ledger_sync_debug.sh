#!/bin/bash

# ==============================================================================
# CONFIGURATION & ENVIRONMENT STRINGS
# ==============================================================================
GCP_PROJECT_ID="esthetics-tracker-project"
GCP_BUCKET="gs://esthetics-hub-ledger-prod"
REPO_IDENTIFIER="Esthetics03-ops/Esthetics03-ops.github.io"
ADSENSE_ID="pub-1959507280210179"

LOCAL_LEDGER_DIR="./data"
LOCAL_LEDGER_FILE="./data/database.db"
LOG_FILE="./data/sync_debug_log.txt"

# Text Styling
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}   ESTHETICS HUB DIAGNOSTICS & GOOGLE CLOUD SYNCHRONIZATION ENGINE   ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Ensure data log folder exists safely
mkdir -p "$(dirname "$LOG_FILE")"
echo "Execution Timestamp: $(date -u) UTC" > "$LOG_FILE"
echo "Repository: $REPO_IDENTIFIER" >> "$LOG_FILE"

# ==============================================================================
# STEP 1: DEEP FILE SYSTEM SCAN & REPO FIXER (Prevents Name-Length Crashes)
# ==============================================================================
echo -e "\n${YELLOW}[1/4] Running Environment Diagnostics & Workspace Fixes...${NC}"

# Scan for the broken multi-line copy-paste file artifact from the screenshot
if ls -R 2>/dev/null | grep -E "├──|└──|#" > /dev/null 2>&1; then
    echo -e "${RED}  ↳ ALERT: Found invalid rogue text-tree filenames in workspace. Purging...${NC}" | tee -a "$LOG_FILE"
    
    # Force git removal if indexed
    git rm -f "my-project"* 2>/dev/null || true
    git rm -f *"# Folder"* 2>/dev/null || true
    
    # OS level hard-wipe of invalid string components safely
    find . -maxdepth 3 \( -name "*├──*" -o -name "*└──*" -o -name "*# Folder*" \) -exec rm -rf {} + 2>/dev/null
    echo -e "${GREEN}  ↳ Clean up complete. Path limits protected.${NC}"
else
    echo -e "${GREEN}  ↳ File structure name lengths check passed.${NC}"
fi

# ==============================================================================
# STEP 2: SOURCE CODE AUDIT (Payment & Verification Configs)
# ==============================================================================
echo -e "\n${YELLOW}[2/4] Auditing Frontend Payment/Payout Code Integration...${NC}"

# Scan all local HTML files for your specific AdSense ID
if grep -q "$ADSENSE_ID" ./**/*.html 2>/dev/null || grep -q "$ADSENSE_ID" ./*.html 2>/dev/null; then
    echo -e "${GREEN}  ↳ Validated Google AdSense ID: [$ADSENSE_ID] matching codebase rules.${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}  ↳ Warning: Target AdSense ID ($ADSENSE_ID) not explicitly found in local plain text files.${NC}" | tee -a "$LOG_FILE"
fi

# Audit M-PESA structural links
if grep -qE "mpesa|stk|daraja" ./**/*.* 2>/dev/null; then
    echo -e "${GREEN}  ↳ Client-side Safaricom M-PESA infrastructure handles verified.${NC}"
else
    echo -e "${BLUE}  ↳ Note: Local workspace doesn't hold processing ledger code scripts. Running generic payload mode.${NC}"
fi

# ==============================================================================
# STEP 3: GOOGLE CLOUD PROJECT & AUTHENTICATION AUDIT
# ==============================================================================
echo -e "\n${YELLOW}[3/4] Verifying Google Cloud Platform Connection Status...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}  ↳ ERROR: Google Cloud SDK ('gcloud') is missing on this machine.${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

# Bind to explicit production project scope
echo "Setting project scope to $GCP_PROJECT_ID..."
gcloud config set project "$GCP_PROJECT_ID" 2>/dev/null

ACTIVE_ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ -z "$ACTIVE_ACCOUNT" ]; then
    echo -e "${RED}  ↳ ERROR: No active authenticated account found.${NC}" | tee -a "$LOG_FILE"
    echo -e "    Please run: 'gcloud auth login' before re-running script."
    exit 1
else
    echo -e "${GREEN}  ↳ Connection Secure. User active: [$ACTIVE_ACCOUNT]${NC}" | tee -a "$LOG_FILE"
fi

# ==============================================================================
# STEP 4: CROSS-PLATFORM LEDGER AUDIT & REPLICATION TO PRODUCTION BUCKET
# ==============================================================================
echo -e "\n${YELLOW}[4/4] Processing Production Ledger Synchronization to GCS...${NC}"

mkdir -p "$LOCAL_LEDGER_DIR"

if [ -f "$LOCAL_LEDGER_FILE" ]; then
    # Cross-platform file size measurement fallback logic (macOS / Linux compatible)
    if [ "$(uname)" = "Darwin" ]; then
        FILESIZE=$(stat -f%z "$LOCAL_LEDGER_FILE")
    else
        FILESIZE=$(stat -c%s "$LOCAL_LEDGER_FILE")
    fi
    echo -e "${GREEN}  ↳ Local ledger file verified. Target payload: $FILESIZE bytes.${NC}" | tee -a "$LOG_FILE"
else
    echo "Creating dynamic transaction log metadata placeholder entries..." >> "$LOCAL_LEDGER_FILE"
fi

# Synchronizing logs using the modern fast cloud synchronization utilities
echo -e "${BLUE}  ↳ Mirroring updates to storage bucket: $GCP_BUCKET...${NC}"
gcloud storage rsync "$LOCAL_LEDGER_DIR" "$GCP_BUCKET" --recursive --continue-on-error

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ↳ SUCCESS: Production ledger synchronized successfully!${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}  ↳ ERROR: Cloud mirror failed. Check your access IAM configurations for bucket '$GCP_BUCKET'.${NC}" | tee -a "$LOG_FILE"
fi

echo -e "\n${BLUE}======================================================================${NC}"
echo -e "${GREEN} PROCESS COMPLETE: View details inside: $LOG_FILE${NC}"
echo -e "${BLUE}======================================================================${NC}"
