#!/bin/bash

# Authenticate with Google Cloud
gcloud auth activate-service-account --key-file=/path/to/service-account-key.json

# Sync with Google Cloud Storage
gsutil rsync -r ./public gs://esthetics-hub-bucket

# Sync with Google Cloud DNS
gcloud dns record-sets update esthetics03-ops.github.io --zone=esthetics-hub-zone --type=A --ttl=300 --add $(curl -s https://api.github.com/repos/esthetics03-ops/esthetics03-ops.github.io/pages | jq -r '.domains[0]')

