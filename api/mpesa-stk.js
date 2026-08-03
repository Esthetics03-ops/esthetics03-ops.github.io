// api/mpesa-stk.js
import crypto from 'crypto';

export default async function handler(req, res) {
  // 1. Enforce strict CORS boundaries to ensure only your frontend hits this route
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://esthetics03-ops.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { phone, amount } = req.body;
    
    // Validate inputs
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Missing phone number or amount' });
    }

    // Clean phone number structure into the required 254XXXXXXXXX string format
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    }

    // Pull encrypted assets securely from environment memory
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    const envMode = process.env.MPESA_ENVIRONMENT || 'sandbox';

    const darajaAuthUrl = envMode === 'live' 
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const darajaStkUrl = envMode === 'live'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    // 2. Fetch the Secure OAuth Access Token from Safaricom
    const authCredentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch(darajaAuthUrl, {
      headers: { Authorization: `Basic ${authCredentials}` }
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Safaricom OAuth Token generation failed');
    }
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 3. Generate Timestamps and Password Hashes
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14); // Format: YYYYMMDDHHMMSS
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // 4. Construct Safaricom Daraja API Payload
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: envMode === 'live' ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline',
      Amount: Math.round(amount),
      PartyA: cleanPhone,
      PartyB: shortcode,
      PhoneNumber: cleanPhone,
      CallBackURL: callbackUrl,
      AccountReference: 'EstheticsHubHub',
      TransactionDesc: 'BioSync Premium Activation'
    };

    // 5. Fire Request
    const stkResponse = await fetch(darajaStkUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPayload)
    });

    const responseData = await stkResponse.json();
    return res.status(stkResponse.status).json(responseData);

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error Routing Payment' });
  }
}