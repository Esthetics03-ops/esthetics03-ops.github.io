
const express = require('express');
const app = express();
app.get('/api/ga4', (req, res) => res.json({message: 'GA4 API placeholder'}));
module.exports = app;
