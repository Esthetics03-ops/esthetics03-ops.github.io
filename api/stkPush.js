import fetch from 'node-fetch'; // Required if running Node environment below v18

export default async function handler(req, res) {
  // 1. CORS & Method Safeguards
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
    const { phoneNumber, amount } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: 'Missing phone number or amount.' });
    }

    // Format phone number cleanly to 254XXXXXXXXX matching Safaricom guidelines
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    }

    // 2. Fetch Secure Credentials via Env variables
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortCode = process.env.MPESA_SHORTCODE; // Business Paybill or Till
    const passKey = process.env.MPESA_PASSKEY;
    const callbackURL = process.env.MPESA_CALLBACK_URL; // Endpoint listening for payment resolution

    // Base URLs depending on environment (Sandbox vs Production)
    const baseUrl = "https://sandbox.safaricom.co.ke"; // Swap out for production endpoint 'api.safaricom.co.ke'

    // 3. Generate Timed OAuth Access Token
    const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${authHeader}` }
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('M-Pesa Token authentication routine failed.');
    }

    // 4. Calculate Password Timestamp matching Safaricom's specific protocol
    const date = new Date();
    const timestamp = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');

    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

    // 5. Construct Payload and Fire STK Push Request
    const stkPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline", // Change to 'CustomerBuyGoodsOnline' if utilizing a Till Number
      Amount: Math.round(amount).toString(),
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: "TheEstheticsHub",
      TransactionDesc: "Premium BioSync Access Protocol"
    };

    const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPayload)
    });

    const stkData = await stkResponse.json();

    // 6. Report Request Results back to Client
    if (stkData.ResponseCode === "0") {
      return res.status(200).json({
        success: true,
        message: "STK Push successfully transmitted to client device.",
        merchantRequestID: stkData.MerchantRequestID,
        checkoutRequestID: stkData.CheckoutRequestID
      });
    } else {
      return res.status(400).json({
        success: false,
        message: stkData.ResponseDescription || "Safaricom rejected the push payload layout."
      });
    }

  } catch (error) {
    console.error('Fatal M-Pesa Request Error:', error);
    return res.status(500).json({ error: 'Internal gateway error execution failed.' });
  }
}
