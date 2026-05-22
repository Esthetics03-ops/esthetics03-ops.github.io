const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LEDGER_FILE = path.join(__dirname, 'ledger.json');

// 1. GLOBAL MIDDLEWARE
app.use(cors({
    origin: 'https://esthetics03-ops.github.io',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Native Express body parser replacing 'body-parser' package

// Initialize file synchronously ONCE during startup boot sequence (safe to block here)
if (!fs.existsSync(LEDGER_FILE)) {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify({ transactions: [], metrics: {} }, null, 2));
}

// 2. PRODUCTION API ENDPOINTS

/**
 * POST Endpoint: Ingests traffic metrics or monetization payloads asynchronously
 */
app.post('/api/v1/push-data', async (req, res) => {
    try {
        const { timestamp, type, amount, status, metadata } = req.body;

        // Strict validation checks
        if (!type || amount === undefined || isNaN(parseFloat(amount))) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation Error: 'type' string and numeric 'amount' are mandatory." 
            });
        }

        // ASYNCHRONOUS I/O: Non-blocking read operation
        const rawData = await fsPromises.readFile(LEDGER_FILE, 'utf8');
        const fileData = JSON.parse(rawData);

        // Normalize tracking parameters
        const currentRecord = {
            id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: timestamp || new Date().toISOString(),
            type: type, // e.g., "AdSense_Simulated", "BioSync_Conversion"
            amount: parseFloat(amount),
            status: status || "processed",
            metadata: metadata || {}
        };

        // Inject new payload into transaction history arrays
        fileData.transactions.push(currentRecord);

        // ASYNCHRONOUS I/O: Non-blocking write operation
        await fsPromises.writeFile(LEDGER_FILE, JSON.stringify(fileData, null, 2));

        console.log(`[DATA INGESTED] ${currentRecord.id} | Amount: $${currentRecord.amount}`);

        return res.status(200).json({
            success: true,
            message: "Data pipeline ingestion complete.",
            recordId: currentRecord.id
        });

    } catch (error) {
        console.error("🚨 Pipeline Ingestion Core Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error during data write." });
    }
});

/**
 * GET Endpoint: Reads and returns the aggregated system ledger data
 */
app.get('/api/v1/ledger', async (req, res) => {
    try {
        // Non-blocking file fetch
        const rawData = await fsPromises.readFile(LEDGER_FILE, 'utf8');
        const fileData = JSON.parse(rawData);
        res.status(200).json(fileData);
    } catch (error) {
        console.error("🚨 Ledger Retrieval Error:", error);
        res.status(500).json({ success: false, message: "Error parsing the tracking ledger." });
    }
});

// 3. EXECUTE SYSTEM ENGINE
app.listen(PORT, () => {
    console.log(`🚀 Automated Data Engine live on port ${PORT}`);
    console.log(`📊 Local system ledger database linked at: ${LEDGER_FILE}`);
});
