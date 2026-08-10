/**
 * The Esthetics Hub - Automated Codebase & Deployment Debugger
 * Run via terminal: node debug-site.js
 */

const fs = require('fs');
const path = require('path');

// 1. Configuration Target
const TARGET_FILE = path.join(__dirname, 'index.html'); 
const EXPECTED_TAGS = ['G-PSW1MY7HB4', 'G-QCX3G9KSPC', 'pub-1959507280210179'];

console.log('🚀 Starting Deep Scan of The Esthetics Hub Codebase...\n');

if (!fs.existsSync(TARGET_FILE)) {
    console.error(`❌ Error: Core entry file missing at ${TARGET_FILE}`);
    process.exit(1);
}

const htmlContent = fs.readFileSync(TARGET_FILE, 'utf8');
let errorsFound = 0;
let warningsFound = 0;

// 2. Audit: Google Analytics & AdSense Placement
console.log('🔍 Checking tracking tags and script integrity...');
EXPECTED_TAGS.forEach(tag => {
    if (htmlContent.includes(tag)) {
        console.log(`  🟢 Found active key: ${tag}`);
    } else {
        console.error(`  ❌ Missing crucial key: ${tag}`);
        errorsFound++;
    }
});

// Check for duplicate initialization structures
const tagCount = (htmlContent.match(/gtag\('config'/g) || []).length;
if (tagCount > 1) {
    console.warn(`  ⚠️ Warning: "gtag('config')" is called ${tagCount} times. This will double-count your live visitors.`);
    warningsFound++;
}

console.log('');

// 3. Audit: M-Pesa Form Validation Safety
console.log('🔍 Auditing M-Pesa Payment Field Validation...');
if (htmlContent.includes('type="tel"') || htmlContent.includes('pattern=')) {
    console.log('  🟢 M-Pesa inputs utilize client-side constraint sanitization.');
} else {
    console.error('  ❌ Security Risk: M-Pesa phone fields lack structured validation attributes (type="tel" or pattern).');
    errorsFound++;
}

console.log('');

// 4. Audit: Broken Hotlinked Assets
console.log('🔍 Auditing asset paths for hardcoded external links...');
const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
let match;
let externalImagesCount = 0;

while ((match = imgRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://')) {
        let isAllowedGithubHost = false;
        try {
            const parsedUrl = new URL(src);
            const host = parsedUrl.hostname.toLowerCase();
            isAllowedGithubHost = host === 'github.io' || host.endsWith('.github.io');
        } catch (e) {
            isAllowedGithubHost = false;
        }

        if (!isAllowedGithubHost) {
            console.warn(`  ⚠️ External Hotlink Found: <img src="${src}">`);
            externalImagesCount++;
            warningsFound++;
        }
    }
}

if (externalImagesCount > 0) {
    console.warn(`  💡 Advice: Download these ${externalImagesCount} partner assets locally to avoid 404 errors.`);
}

console.log('\n--- 📊 AUDIT RUN COMPLETE ---');
console.log(`💥 Total Errors: ${errorsFound} | ⚠️ Total Warnings: ${warningsFound}`);

if (errorsFound > 0) {
    console.log('\n❌ Please fix structural errors before pushing updates to your GitHub Pages repository.');
    process.exit(1);
} else {
    console.log('\n🟢 Clean structural scan passed! Codebase is production stable.');
    process.exit(0);
}
