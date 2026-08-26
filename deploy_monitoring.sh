#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="amiable-crane-465217-j9"
TARGET_HOST="example.com" # Replace with your production domain / endpoint
ALERT_EMAIL="devops-alerts@example.com" # Replace with your alert recipient

echo "==> Setting active project to ${PROJECT_ID}..."
gcloud config set project "${PROJECT_ID}"

echo "==> 1. Enabling Cloud Monitoring and Cloud Logging APIs..."
gcloud services enable \
  monitoring.googleapis.com \
  logging.googleapis.com

echo "==> 2. Creating Custom Dashboard..."
gcloud monitoring dashboards create \
  --config-from-file=dashboard.json

echo "==> 3. Creating Email Notification Channel..."
CHANNEL_NAME=$(gcloud beta monitoring channels create \
  --display-name="Production Alerts Email" \
  --description="Notification channel for live production uptime alerts" \
  --type="email" \
  --channel-labels="email_address=${ALERT_EMAIL}" \
  --format="value(name)")

echo "Created Notification Channel: ${CHANNEL_NAME}"

echo "==> 4. Creating Automated HTTPS Uptime Check..."
gcloud monitoring uptime create "Production-Web-Uptime-Check" \
  --resource-type="uptime-url" \
  --resource-labels="host=${TARGET_HOST},project_id=${PROJECT_ID}" \
  --protocol="https" \
  --path="/" \
  --period=1 \
  --timeout=10 \
  --validate-ssl=true \
  --status-classes="2xx"

echo "==> 5. Creating Alert Policy for Uptime Check..."
gcloud monitoring policies create \
  --display-name="Alert: Production Endpoint Uptime Failure" \
  --combiner="OR" \
  --condition-display-name="Uptime check failure percentage > 20%" \
  --condition-filter="metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" resource.type=\"uptime_url\" metric.label.check_id=\"Production-Web-Uptime-Check\"" \
  --duration="60s" \
  --if="< 0.8" \
  --aggregation='{"alignmentPeriod":"60s","perSeriesAligner":"ALIGN_FRACTION_TRUE","crossSeriesReducer":"REDUCE_MEAN"}' \
  --notification-channels="${CHANNEL_NAME}" \
  --documentation="Production endpoint ${TARGET_HOST} failed uptime checks across probing regions. Please investigate immediately."

echo "==> Monitoring infrastructure deployed successfully."
