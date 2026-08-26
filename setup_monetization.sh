#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="amiable-crane-465217-j9"
KEY_DISPLAY_NAME="production-web-client-key"
ALLOWED_DOMAINS="https://example.com/*,https://*.example.com/*"

echo "==> Setting active GCP project to ${PROJECT_ID}..."
gcloud config set project "${PROJECT_ID}"

echo "==> 1. Enabling API Management, Control, and Billing APIs..."
gcloud services enable \
  servicecontrol.googleapis.com \
  serviceusage.googleapis.com \
  cloudbilling.googleapis.com \
  servicemanagement.googleapis.com \
  endpoints.googleapis.com

echo "==> 2. Creating Domain-Restricted API Key..."
gcloud services api-keys create \
  --display-name="${KEY_DISPLAY_NAME}" \
  --allowed-referrers="${ALLOWED_DOMAINS}"

echo "==> Retrieving created API key details..."
gcloud services api-keys list \
  --filter="displayName='${KEY_DISPLAY_NAME}'" \
  --format="table(name,displayName,createTime)"

echo "==> Setup completed successfully."
