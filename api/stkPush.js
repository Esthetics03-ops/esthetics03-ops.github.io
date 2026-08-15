// api/stkPush.js
// Hardened STK push endpoint

export default async function handler(req, res) {
  // Determine fetch implementation (Node 18+ has global fetch)
  const fetchFn = (typeof fetch !== 'undefined') ? fetch : (await import('node-fetch')).default;

  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://esthetics03-ops.github.io';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { phoneNumber, amount } = req.body || {};
    if (!phoneNumber || !amount) return res.status(400).json({ error: 'Missing phone number or amount.' });

    // Normalize phone to 254XXXXXXXXX
    let formattedPhone = String(phoneNumber).trim();
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);
    formattedPhone = formattedPhone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.substring(1);
    if (!/^254\d{9}$/.test(formattedPhone)) {
      return res.status(400).json({ error: 'Phone number must be in Kenyan format (2547xxxxxxxx)' });
    }

    // Env vars
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortCode = process.env.MPESA_SHORTCODE;
    const passKey = process.env.MPESA_PASSKEY;
    const callbackURL = process.env.MPESA_CALLBACK_URL;
    const envMode = (process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase();

    if (!consumerKey || !consumerSecret || !shortCode || !passKey || !callbackURL) {
      return res.status(500).json({ error: 'Missing M-Pesa configuration (check environment variables)' });
    }

    const baseUrl = envMode === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

    // OAuth token
    const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResp = await fetchFn(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: { Authorization: `Basic ${authHeader}` }
    });

    if (!tokenResp.ok) {
      const txt = await tokenResp.text().catch(() => '');
      return res.status(502).json({ error: 'Failed to obtain OAuth token', details: txt });
    }

    const tokenJson = await tokenResp.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) return res.status(502).json({ error: 'Missing access_token in OAuth response' });

    // Timestamp in YYYYMMDDHHMMSS
    const d = new Date();
    const timestamp = d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0');

    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

    const stkPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(Number(amount)),
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: 'EstheticsHub',
      TransactionDesc: 'Service payment'
    };

    const stkResp = await fetchFn(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPayload)
    });

    const stkJson = await stkResp.json().catch(() => null);
    if (!stkResp.ok) {
      return res.status(stkResp.status).json({ error: 'STK request failed', details: stkJson || null });
    }

    if (stkJson && (stkJson.ResponseCode === '0' || stkJson.responseCode === '0')) {
      return res.status(200).json({ success: true, data: stkJson });
    } else {
      return res.status(400).json({ success: false, data: stkJson || null });
    }

  } catch (err) {
    console.error('stkPush error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
