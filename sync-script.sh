#!/bin/bash

# Authenticate with Google Cloud
gcloud auth activate-service-account --key-file=esthetics03-ops-service-account-key.json

# Pull latest changes from GitHub
git pull origin main

# Build and deploy to GitHub Pages
npm run build && npm run deploy

# Sync with Google Cloud Storage
gsutil rsync -r ./public gs://esthetics-hub-bucket

# Sync with Google Cloud DNS
gcloud dns record-sets update esthetics03-ops.github.io --zone=esthetics-hub-zone --type=A --ttl=300 --add $(curl -s https://api.github.com/repos/esthetics03-ops/esthetics03-ops.github.io/pages | jq -r '.domains[0]')

# Update earnings report
node update-earnings-report.js >> earnings-report.log 2>&1


const fs = require('fs');
const axios = require('axios');

axios.get('https://api.esthetics03-ops.com/earnings-report', {
  headers: {
    'Authorization': 'Bearer esthetics03-ops-api-token',
    'Content-Type': 'application/json'
  },
  params: {
    'start_date': '2023-01-01',
    'end_date': '2023-12-31',
    'metric': 'earnings'
  }
})
.then(response => {
  const earningsData = response.data;
  fs.writeFileSync('earnings-report.json', JSON.stringify(earningsData));
})
.catch(error => {
  console.error(error);
  fs.appendFileSync('error.log', error.message + '\n');
});

