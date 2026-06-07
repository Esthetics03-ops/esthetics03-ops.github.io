const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const analyticsDataClient = new BetaAnalyticsDataClient();

exports.getGaStats = async (req, res) => {
    // CORS headers for security
    res.set('Access-Control-Allow-Origin', 'https://esthetics03-ops.github.io');
    
    const [response] = await analyticsDataClient.runRealtimeReport({
        property: `properties/YOUR_PROPERTY_ID`,
        metrics: [{ name: 'activeUsers' }]
    });

    res.json({ activeUsers: response.rows[0].metricValues[0].value });
};
