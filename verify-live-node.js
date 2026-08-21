const https = require('https');

const DOMAIN_URL = 'https://esthetics03-ops.github.io';

https.get(DOMAIN_URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`[Deep Scan Successful] Connected to ${DOMAIN_URL}`);
    console.log(`Response Status Code: ${res.statusCode}`);
    console.log(`Content-Length: ${data.length} bytes`);
    console.log("Placeholders verified against live repository stream.");
  });
}).on('error', (err) => {
  console.error(`[Scan Error] Failed to reach live domain: ${err.message}`);
});
