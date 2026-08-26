#!/usr/bin/env python3
"""Verifies active Cloud Billing configuration and tracks real-time API traffic consumption."""

import datetime
from google.cloud import billing_v1
from google.cloud import monitoring_v3


PROJECT_ID = "amiable-crane-465217-j9"


def verify_project_billing(project_id: str):
    """Verifies that billing is enabled for the specified project."""
    client = billing_v1.CloudBillingClient()
    project_name = f"projects/{project_id}"

    billing_info = client.get_project_billing_info(name=project_name)
    print(f"--- Project Billing Status for {project_id} ---")
    print(f"Billing Enabled: {billing_info.billing_enabled}")
    print(f"Billing Account Name: {billing_info.billing_account_name}")
    return billing_info.billing_enabled


def query_api_traffic_metrics(project_id: str):
    """Queries real-time API call counts from Cloud Monitoring over the past hour."""
    client = monitoring_v3.MetricServiceClient()
    project_name = f"projects/{project_id}"

    now = datetime.datetime.now(datetime.timezone.utc)
    one_hour_ago = now - datetime.timedelta(hours=1)

    interval = monitoring_v3.TimeInterval(
        {
            "end_timeHere is the architectural implementation and automation setup for API monetization, quota enforcement, secure key management, and consumption tracking for project **`amiable-crane-465217-j9`**.

---

### 1. Automation Script: Enable APIs & Generate Restricted API Keys

#### `setup_api_monetization.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="amiable-crane-465217-j9"
ALLOWED_DOMAINS="https://api.example.com/*,https://app.example.com/*"

echo "==> Configuring Project: ${PROJECT_ID}"
gcloud config set project "${PROJECT_ID}"

echo "==> 1. Enabling Monetization, Billing, and Management APIs..."
gcloud services enable \
  servicecontrol.googleapis.com \
  serviceusage.googleapis.com \
  cloudbilling.googleapis.com \
  endpoints.googleapis.com \
  servicemanagement.googleapis.com

echo "==> 2. Creating Domain-Restricted API Key for Monetized Web Clients..."
# Generates an API key restricted strictly to specified HTTP referrers / domains
gcloud services api-keys create \
  --display-name="Production Web Client Key - Tier 1" \
  --allowed-referrers="${ALLOWED_DOMAINS}"

echo "==> API Key generated and domain restrictions applied."
