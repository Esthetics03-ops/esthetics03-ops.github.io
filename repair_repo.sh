#!/bin/bash
# Bio-Sync Workflow Recovery Script

echo "🔍 Starting diagnostic and repair..."

# 1. Update/Fix Dependencies (Common 'Audit' failure cause)
if [ -f "package.json" ]; then
    echo "📦 Re-syncing Node dependencies..."
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
    npm audit fix
fi

# 2. Check for YAML Syntax Errors
echo "🤖 Validating Workflow files..."
if command -v yamllint &> /dev/null; then
    yamllint .github/workflows/*.yml
else
    echo "⚠️ yamllint not installed. Checking file existence..."
    ls -l .github/workflows/bio-sync.yml .github/workflows/sync.yml
fi

# 3. Force-Sync local with remote main
echo "🔄 Ensuring local is clean and synced..."
git checkout main
git pull origin main

# 4. Git Housekeeping
echo "🧹 Cleaning up git objects..."
git gc --prune=now

echo "✅ Repair script finished."
echo "👉 ACTION REQUIRED: Check your GitHub 'Secrets' for expired tokens."
