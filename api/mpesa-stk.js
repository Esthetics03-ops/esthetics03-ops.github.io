// api/mpesa-stk.js

export default async function handler(req, res) {
  // CORS (allow origin via env or default to repo Pages domain)
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://esthetics03-ops.github.io';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { phone, amount } = req.body || {};
    if (!phone || !amount) return res.status(400).json({ error: 'Missing phone number or amount' });

    // Normalize phone: handle leading +, remove nondigits, convert leading 0 to 254
    let cleanPhone = String(phone).trim();
    if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.substring(1);
    cleanPhone = cleanPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);

    if (!/^254\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Phone number must be in Kenyan format (2547xxxxxxxx)' });
    }

    // Env variables (validated)
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    const envMode = (process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase();

    if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
      return res.status(500).json({ error: 'Missing M-Pesa configuration (check environment variables)' });
    }

    const darajaAuthUrl = envMode === 'live'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const darajaStkUrl = envMode === 'live'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    // Fetch OAuth token
    const authCredentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch(darajaAuthUrl, {
      method: 'GET',
      headers: { Authorization: `Basic ${authCredentials}` }
    });

    if (!tokenResponse.ok) {
      const body = await tokenResponse.text().catch(() => '');
      return res.status(502).json({ error: 'Failed to obtain OAuth token from Safaricom', details: body });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) return res.status(502).json({ error: 'Safaricom OAuth response missing access_token' });

    // Timestamp as YYYYMMDDHHMMSS
    const d = new Date();
    const timestamp = d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0');

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: envMode === 'live' ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline',
      Amount: Math.round(Number(amount)),
      PartyA: cleanPhone,
      PartyB: shortcode,
      PhoneNumber: cleanPhone,
      CallBackURL: callbackUrl,
      AccountReference: 'EstheticsHub',
      TransactionDesc: 'Service payment'
    };

    const stkResponse = await fetch(darajaStkUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPayload)
    });

    const responseData = await stkResponse.json().catch(() => null);
    if (!stkResponse.ok) {
      return res.status(stkResponse.status).json({ error: 'Safaricom STK request failed', details: responseData || null });
    }

    return res.status(200).json(responseData);

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
