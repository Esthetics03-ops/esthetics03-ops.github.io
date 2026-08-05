/**
 * Bio-Sync Master Dashboard Automation Script
 * Pulls metrics from Google Sheets, verifies domain states, 
 * and outputs a live JSON data cache for the dashboard page.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const axios = require('axios');

// Configurations
const TARGET_DOMAIN = 'https://esthetics03-ops.github.io';
const DASHBOARD_ENDPOINT = `${TARGET_DOMAIN}/bio-sync-master.html`;
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '16BKFp_fLvbslNnoyKIzsmidxAfu2zUQ_';
const RANGE_NAME = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A1:D10';

async function fetchGoogleSheetsData() {
    try {
        console.log('Authenticating with Google APIs...');
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE_NAME,
        });

        console.log('Successfully fetched rows from Google Sheets.');
        return response.data.values || [];
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error.message);
        return null;
    }
}

async function verifyDomainHealth() {
    try {
        console.log(`Checking domain health for: ${DASHBOARD_ENDPOINT}`);
        const response = await axios.get(DASHBOARD_ENDPOINT, { timeout: 10000 });
        return {
            status: response.status === 200 ? 'ONLINE' : 'DEGRADED',
            statusCode: response.status,
            checkedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Domain health check failed:', error.message);
        return {
            status: 'OFFLINE',
            error: error.message,
            checkedAt: new Date().toISOString()
        };
    }
}

async function runAutomation() {
    console.log('=== Starting Bio-Sync Master Data Pipeline ===');
    
    const sheetValues = await fetchGoogleSheetsData();
    const domainHealth = await verifyDomainHealth();

    // Compile dashboard payload state
    const compiledData = {
        masterNode: 'Esthetics-Ops-v23.1',
        hq: 'Nairobi HQ (KE-NBO)',
        domain: TARGET_DOMAIN,
        health: domainHealth,
        metricsSource: {
            spreadsheetId: SPREADSHEET_ID,
            rows: sheetValues
        },
        lastSynced: new Date().toISOString()
    };

    // Output compiled configuration to a local JSON cache file used by the page
    const outputPath = path.join(__dirname, 'bio-sync-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(compiledData, null, 2));
    
    console.log(`Pipeline complete! Data cached successfully to ${outputPath}`);
}

runAutomation();
