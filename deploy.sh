#!/bin/bash

# --- Deployment Script for The Esthetics Hub ---
# Purpose: Deploy Esthetics Tracker v2
# Based on project: amiable-crane-465217-j9
# Reference: Screenshot_20260608-173308.png (GitHub Dashboard Context)

PROJECT_ID="amiable-crane-465217-j9"
SERVICE_NAME="mpesa-callback"
REGION="europe-west2"
SECRET_NAME="mpesa-callback-secret"
SERVICE_ACCOUNT="amiable-crane-465217-j9-compute@developer.gserviceaccount.com"

echo "Deploying Esthetics Tracker v2..."
echo "Starting deployment for $PROJECT_ID..."

# 1. Set the project
gcloud config set project $PROJECT_ID

# 2. Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --project=$PROJECT_ID \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --runtime php83 \
  --set-secrets CALLBACK_SECRET=$SECRET_NAME:latest \
  --service-account=$SERVICE_ACCOUNT

echo "Deployment initiated. Check your terminal output for the Service URL."
