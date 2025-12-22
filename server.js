const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use((req, res, next) => {
    // FIX: Explicitly allowing your GitHub Pages domain
    res.header("Access-Control-Allow-Origin", "https://esthetics03-ops.github.io");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.get('/monetisation', (req, res) => {
    res.json({
        adsense: 0.00,
        affiliate: 0.00,
        donations: 0.00,
        total: 0.00
    });
});

app.listen(port, () => console.log(`API running on port ${port}`));
