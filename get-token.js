const axios = require('axios');

async function getDarajaAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error("Error: Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET environment variables.");
    process.exit(1);
  }

  // Combine and encode credentials in Base64
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          authorization: `Basic ${auth}`
        }
      }
    );
    console.log("Access Token Successfully Generated:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate Daraja access token:", error.response?.data || error.message);
    process.exit(1);
  }
}

getDarajaAccessToken();
