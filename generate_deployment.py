# ==============================================================================
# The Esthetics Hub - Complete Production Deployment Generation Script
# Target Frontend Environment: https://esthetics03-ops.github.io
# Execution Strategy: Run this script inside your repository folder to generate all required structural assets.
# ==============================================================================

import os

def build_deployment():
    print("[*] Initiating build pipeline generation for The Esthetics Hub...")
    
    # 1. Base Web Asset Map
    files = {
        "index.html": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Esthetics Hub | Science-Backed Wellness & Biohacking Nairobi</title>
    <meta name="description" content="Premium data-driven protocols for circadian rhythm alignment, Vagus nerve stimulation, and longevity. Tailored from Nairobi, Kenya.">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --bg-dark: #0a0f1d;
            --card-bg: #131a30;
            --accent-gold: #d4af37;
            --text-light: #f1f5f9;
            --text-muted: #94a3b8;
            --success-green: #10b981;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-light);
            margin: 0;
            padding: 0;
        }
        header {
            border-bottom: 1px solid #1e293b;
            padding: 1.5rem;
            text-align: center;
        }
        .banner {
            display: none;
            background-color: rgba(16, 185, 129, 0.15);
            border: 1px solid var(--success-green);
            color: #34d399;
            padding: 1rem;
            border-radius: 8px;
            margin: 1.5rem auto;
            max-width: 800px;
            text-align: center;
            font-weight: bold;
        }
        .container {
            max-width: 1100px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .card {
            background: var(--card-bg);
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 1.5rem;
            transition: transform 0.2s, border-color 0.2s;
        }
        .card:hover {
            transform: translateY(-2px);
            border-color: var(--accent-gold);
        }
        .btn {
            background-color: var(--accent-gold);
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
            margin-top: 1rem;
        }
        .btn:disabled {
            background-color: var(--text-muted);
            cursor: not-allowed;
        }
        footer {
            margin-top: 5rem;
            padding: 2rem;
            border-top: 1px solid #1e293b;
            text-align: center;
            font-size: 0.875rem;
            color: var(--text-muted);
        }
        footer a { color: var(--text-light); text-decoration: none; margin: 0 0.75rem; }
    </style>
</head>
<body>
    <header>
        <h1>The Esthetics Hub</h1>
        <p><i class="fas fa-map-marker-alt"></i> Nairobi HQ, Kenya</p>
    </header>

    <div class="container">
        <div id="unlock-banner" class="banner">
            ✨ Protocol Unlocked! Thank you for your payment. Your 2026 Wellness Guide is now available below.
        </div>

        <section style="background: #1e293b; padding: 2rem; border-radius: 12px; margin-bottom: 3rem; text-align: center;">
            <h2>Unlock Premium 2026 Core Protocols</h2>
            <p>Access the 14-Day Bio-Sync Reset framework instantly via Safaricom M-PESA.</p>
            <div style="max-width: 400px; margin: 1rem auto;">
                <input type="tel" id="phone-number" placeholder="e.g. 0712345678" style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; font-size: 1rem; text-align: center;">
                <button id="pay-button" class="btn" onclick="initiateProtocolPurchase()">Unlock Protocols (KES 500)</button>
            </div>
        </section>

        <h2>The 14-Day Bio-Sync Reset Matrix</h2>
        <div class="grid">
            <div class="card">
                <h3><i class="fas fa-bolt" style="color: var(--accent-gold);"></i> Metabolism</h3>
                <p>Circadian timing engine adjustments for metabolic optimization.</p>
            </div>
            <div class="card">
                <h3><i class="fas fa-brain" style="color: #60a5fa;"></i> Vagus Reset</h3>
                <p>Nervous system down-regulation, thermal pairing, and tone recovery protocols.</p>
            </div>
            <div class="card">
                <h3><i class="fas fa-moon" style="color: #a78bfa;"></i> Sleep Lab</h3>
                <p>Deep-wave architecture blueprints and custom validation routines.</p>
            </div>
        </div>

        <h2 style="margin-top: 4rem;">Deep-Dive Protocols & Research Pathways</h2>
        <div class="grid">
            <div class="card"><a href="/cognitive-optimization.html" style="text-decoration:none; color:inherit;"><h3>Cognitive Optimization</h3><p>Read updated framework pathways &rarr;</p></a></div>
            <div class="card"><h3>Longevity 2026</h3><p>Advanced cell-repair tracking and target guidelines.</p></div>
            <div class="card"><h3>Sleep Tech Review</h3><p>Biometric sensor evaluations and tracker sync matrices.</p></div>
            <div class="card"><h3>Bio-Sync Timing</h3><p>Optimized meal, sunlight, and movement scheduling algorithms.</p></div>
            <div class="card"><h3>Natural Remedies</h3><p>Botanical and adaptogenic stacks mapped by neurochemistry.</p></div>
            <div class="card"><h3>The Fate of Humanity</h3><p>Macro philosophical analysis on evolutionary bio-adaptation.</p></div>
        </div>
    </div>

    <footer>
        <p>&copy; 2026 The Esthetics Hub. All rights reserved.</p>
        <p style="margin-top: 1rem;">
            <a href="/about.html">About Us</a> | 
            <a href="/privacy.html">Privacy Policy</a> | 
            <a href="/terms.html">Terms of Service</a> | 
            <a href="/disclaimer.html">Affiliate Disclaimer</a> | 
            <a href="mailto:esthetics03@gmail.com">Contact</a>
        </p>
    </footer>

    <script>
        const CONFIG = {
            STK_PUSH_URL: 'https://us-central1-YOUR_GCP_PROJECT_ID.cloudfunctions.net/initiateStkPush',
            POLL_STATUS_URL: 'https://us-central1-YOUR_GCP_PROJECT_ID.cloudfunctions.net/checkPaymentStatus'
        };

        async function initiateProtocolPurchase() {
            const phoneInput = document.getElementById('phone-number').value.trim();
            const payButton = document.getElementById('pay-button');
            
            if (!phoneInput) { alert('Please enter a valid M-PESA phone number.'); return; }
            
            payButton.disabled = true;
            payButton.innerText = 'Sending STK Push Request...';

            try {
                const response = await fetch(CONFIG.STK_PUSH_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phoneInput, amount: 500 })
                });
                const data = await response.json();
                
                if (data.CheckoutRequestID) {
                    payButton.innerText = 'Check phone for M-PESA Pin prompt...';
                    pollPaymentStatus(data.CheckoutRequestID);
                } else {
                    alert('STK Push initialization failed. Verify phone format.');
                    payButton.disabled = false;
                    payButton.innerText = 'Unlock Protocols (KES 500)';
                }
            } catch (error) {
                console.error('Payment initialization failure:', error);
                payButton.disabled = false;
                payButton.innerText = 'Unlock Protocols (KES 500)';
            }
        }

        function pollPaymentStatus(checkoutRequestID) {
            let iterations = 0;
            const maxIterations = 12;
            const pollInterval = setInterval(async () => {
                iterations++;
                if (iterations > maxIterations) {
                    clearInterval(pollInterval);
                    document.getElementById('pay-button').disabled = false;
                    document.getElementById('pay-button').innerText = 'Verify Payment Manually';
                    alert('Verification timeout. If complete, access upgrades within 5 minutes.');
                    return;
                }
                try {
                    const res = await fetch(`${CONFIG.POLL_STATUS_URL}?checkoutRequestID=${checkoutRequestID}`);
                    const statusData = await res.json();
                    if (statusData.status === 'SUCCESS') {
                        clearInterval(pollInterval);
                        document.getElementById('unlock-banner').style.display = 'block';
                        document.getElementById('pay-button').innerText = 'Protocol Access Active';
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                } catch (err) {
                    console.error('Error validation sequence iteration:', err);
                }
            }, 10000);
        }
    </script>
</body>
</html>""",

        "cognitive-optimization.html": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cognitive Optimization Protocol | The Esthetics Hub</title>
    <style>
        body { font-family: sans-serif; background: #0a0f1d; color: #f1f5f9; padding: 2rem; line-height: 1.6; }
        .wrapper { max-width: 800px; margin: 0 auto; }
        a { color: #d4af37; text-decoration: none; }
        .back-nav { margin-bottom: 2rem; display: inline-block; }
    </style>
</head>
<body>
    <div class="wrapper">
        <a href="/index.html" class="back-nav">&larr; Return to Master Hub</a>
        <h1>Cognitive Optimization Protocol (v22.0)</h1>
        <hr style="border-color: #1e293b;">
        <p>This module outlines neurochemical mapping models designed to prevent mid-day neurotransmitter depletion profiles through targeted circadian alignment protocols.</p>
        <h3>Core Intervention Vectors:</h3>
        <ul>
            <li>Adenosine clearance maximization techniques via delayed caffeine gating parameters.</li>
            <li>Dopaminergic baseline tracking arrays during focused work sprints.</li>
            <li>Blue light wavelengths shielding implementations relative to natural solar timelines.</li>
        </ul>
    </div>
</body>
</html>""",

        "ads.txt": "google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n"
    }
    
    # 2. Write Root Files Safely
    for filename, content in files.items():
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)
        print(f" [+] Generated web asset file: ./{filename}")
        
    # 3. Create Isolated Automated Actions Subfolders
    os.makedirs(".github/workflows", exist_ok=True)
    with open(".github/workflows/deploy.yml", "w", encoding="utf-8") as f:
        f.write("""name: Deploy The Esthetics Hub

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Static Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
""")
    print(" [+] Generated pipeline architecture mapping: ./.github/workflows/deploy.yml")
    
    # 4. Generate Localized GCP Serverless Environment Mockups
    os.makedirs("gcp-mpesa-function", exist_ok=True)
    with open("gcp-mpesa-function/index.js", "w", encoding="utf-8") as f:
        f.write("""const { google } = require('googleapis');

exports.handleMpesaCallback = async (req, res) => {
  res.set('Access-Control-Allow-Origin', 'https://esthetics03-ops.github.io');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const callbackData = req.body.Body.stkCallback;
    const resultCode = callbackData.ResultCode;
    const checkoutRequestID = callbackData.CheckoutRequestID;
    const merchantRequestID = callbackData.MerchantRequestID;

    let amount = 0, mpesaReceiptNumber = '', transactionDate = '', phoneNumber = '';

    if (resultCode === 0 && callbackData.CallbackMetadata) {
      const items = callbackData.CallbackMetadata.Item;
      amount = items.find(i => i.Name === 'Amount')?.Value || 0;
      mpesaReceiptNumber = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';
      transactionDate = items.find(i => i.Name === 'TransactionDate')?.Value || '';
      phoneNumber = items.find(i => i.Name === 'PhoneNumber')?.Value || '';
    }

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID; 
    const range = 'Transactions!A:G'; 

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          new Date().toISOString(),
          merchantRequestID,
          checkoutRequestID,
          resultCode === 0 ? 'SUCCESS' : 'FAILED',
          amount,
          mpesaReceiptNumber,
          phoneNumber
        ]]
      }
    });

    return res.status(200).json({ status: 'success', message: 'Callback logged successfully' });

  } catch (error) {
    console.error('Error processing callback:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
""")
    with open("gcp-mpesa-function/package.json", "w", encoding="utf-8") as f:
        f.write('{\n  "name": "mpesa-callback-logger",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {\n    "googleapis": "^126.0.0"\n  }\n}')
    print(" [+] Generated backend server tracking configuration maps inside: ./gcp-mpesa-function/")
    
    print("\n[✓] Build compilation successful. Commit your workspace contents and push to launch your live stack.")

if __name__ == "__main__":
    build_deployment()
