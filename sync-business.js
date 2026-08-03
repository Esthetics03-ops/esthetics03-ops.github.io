/**
 * Esthetics Hub - External Business & Domain Configuration Sync Script
 * Integrates Google Business Profile data with GitHub Pages repository updates.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Configuration Constants
const REPO_NAME = 'Esthetics03-ops/Esthetics03-ops.github.io';
const DOMAIN_URL = 'https://esthetics03-ops.github.io';
const CONFIG_OUTPUT = path.join(__dirname, 'business-config.json');

async function syncGoogleBusinessData() {
    console.log('🔄 Initializing Google Business Account connection...');

    // Authentication via service account credentials stored in environment variables
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/business.manage']
    });

    const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
        version: 'v1',
        auth
    });

    try {
        // Fetch accounts associated with the verified Google Business profile
        const accountsRes = await mybusinessaccountmanagement.accounts.list();
        const accounts = accountsRes.data.accounts;

        if (!accounts || accounts.length === 0) {
            throw new Error('No verified Google Business accounts found for these credentials.');
        }

        const accountId = accounts[0].name;
        console.log(`✅ Connected to Account: ${accounts[0].accountName || accountId}`);

        // Construct payload updates
        const syncData = {
            domain: DOMAIN_URL,
            lastSynced: new Date().toISOString(),
            businessAccount: accountId,
            status: 'Verified & Active'
        };

        // Write configuration payload locally
        fs.writeFileSync(CONFIG_OUTPUT, JSON.stringify(syncData, null, 2));
        console.log(`📁 Configuration successfully compiled to ${CONFIG_OUTPUT}`);

    } catch (error) {
        console.error('❌ Error synchronizing Google Business Profile:', error.message);
        process.exit(1);
    }
}

syncGoogleBusinessData();
