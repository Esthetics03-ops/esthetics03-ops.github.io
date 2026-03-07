const axios = require('axios');

async function initiateSTKPush(phoneNumber, amount) {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const passkey = 'YOUR_PASSKEY_FROM_DARAJA';
    const shortcode = '174379'; // Lipa na M-PESA Paybill
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // 1. Get Token
    const auth = Buffer.from('YOUR_CONSUMER_KEY:YOUR_CONSUMER_SECRET').toString('base64');
    const { data: { access_token } } = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        { headers: { Authorization: `Basic ${auth}` } }
    );

    // 2. Send STK Push
    const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: shortcode,
            PhoneNumber: phoneNumber,
            CallBackURL: 'https://your-domain.com/callback',
            AccountReference: 'BioSync',
            TransactionDesc: 'Premium Protocol Access'
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
    );

    return response.data;
      }
