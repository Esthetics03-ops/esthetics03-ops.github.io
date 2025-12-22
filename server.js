const express = require('express');
const cors = require('cors'); // Use the cors middleware for optimization
const app = express();

// OPTIMIZATION: Only allow your specific GitHub domain
app.use(cors({
    origin: 'https://esthetics03-ops.github.io'
}));

app.get('/monetisation', (req, res) => {
    res.json({
        adsense: 0.00, // Your logic here
        affiliate: 0.00,
        donations: 0.00,
        total: 0.00
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server optimized on port ${PORT}`));

// This MUST be placed BEFORE your app.get routes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://esthetics03-ops.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Add this middleware to your server.js
app.use((req, res, next) => {
    // 1. Allow your specific GitHub domain
    res.header("Access-Control-Allow-Origin", "https://esthetics03-ops.github.io");
    
    // 2. Allow the standard methods
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    
    // 3. Allow standard headers
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // 4. Handle "Preflight" requests (Browsers send an OPTIONS request first)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});
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
