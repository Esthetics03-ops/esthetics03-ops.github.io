const { google } = require('googleapis');

/**
 * PROJECT SETTINGS
 */
const CONFIG = {
    clientId: '351002015975-2vqrggepkgohc9urhbbfbvqqsujjn5s3.apps.googleusercontent.com',
    clientSecret: 'YOUR_CLIENT_SECRET_HERE', // From Google Cloud Console
    redirectUri: 'https://esthetics03-ops.github.io/Bio-Sync-Master.html',
    testUser: 'gkutosi95@gmail.com'
};

const oauth2Client = new google.auth.OAuth2(
    CONFIG.clientId,
    CONFIG.clientSecret,
    CONFIG.redirectUri
);

// Define the scopes we need for Bio-Sync
const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
];

async function runDiagnostics() {
    console.log(`--- INITIALIZING HANDSHAKE FOR: ${CONFIG.testUser} ---`);

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent', // Forces the test user check
        login_hint: CONFIG.testUser
    });

    console.log('\n[1] STEP ONE: URL GENERATION');
    console.log('Target URL successfully generated. Copy this into your browser:');
    console.log('------------------------------------------------------------');
    console.log(authUrl);
    console.log('------------------------------------------------------------');

    console.log('\n[2] STEP TWO: EXPECTED OUTCOME');
    console.log(`If ${CONFIG.testUser} is an AUTHORIZED TEST USER:`);
    console.log('   - You will see the "Google hasn\'t verified this app" screen.');
    console.log('   - You click "Advanced" and it lets you proceed.');
    
    console.log(`\nIf ${CONFIG.testUser} is NOT authorized in Cloud Console:`);
    console.log('   - You will see "Error 403: access_denied" immediately.');
}

runDiagnostics();
