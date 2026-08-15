/**
 * api/sync-engine.js
 * Improved sync-engine: validates inputs, proxies trigger_stk to internal STK handler,
 * and supports a sandbox/test simulation mode.
 */

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://esthetics03-ops.github.io';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const safeAction = String(action || 'system_status').trim().toLowerCase();

  try {
    if (safeAction === 'trigger_stk') {
      const body = req.method === 'POST' ? (req.body || {}) : (req.query || {});
      const phone = String(body.phone || '').trim();
      const amount = Number(body.amount || 0);

      if (!phone || !amount) {
        return res.status(400).json({ success: false, error: 'phone and amount are required' });
      }

      // Test mode simulation
      if ((process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase() === 'test' || process.env.SIMULATE_STK === '1') {
        return res.status(200).json({
          success: true,
          status: 'SIMULATED_STK',
          transactionId: `SIM-${Date.now()}`,
          message: `Simulated STK push to ${phone} for KES ${amount}`
        });
      }

      // Proxy to internal STK handler. Set INTERNAL_API_BASE to the site's base if needed (e.g., https://yourdomain.com)
      const internalBase = process.env.INTERNAL_API_BASE || '';
      const targetUrl = `${internalBase}/api/mpesa-stk`;

      // Determine fetch implementation (Node 18+ has global fetch)
      const fetchFn = (typeof fetch !== 'undefined') ? fetch : (await import('node-fetch')).default;

      const upstreamResp = await fetchFn(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount })
      });

      const upstreamJson = await upstreamResp.json().catch(() => null);
      // Forward status and body from upstream
      return res.status(upstreamResp.status).json(upstreamJson || { error: 'Upstream returned no JSON' });
    }

    // Default system status
    return res.status(200).json({
      domain: process.env.ALLOWED_ORIGIN || 'https://esthetics03-ops.github.io',
      systemState: 'SYSTEM READY',
      activeNodes: Number(process.env.ACTIVE_NODES || 1),
      masterHubVersion: process.env.MASTER_HUB_VERSION || 'v24.0.0',
      revenueEngineActive: !!process.env.REVENUE_ENGINE_ACTIVE,
      lastReconciliation: new Date().toISOString()
    });

  } catch (err) {
    // Avoid leaking internals
    console.error('sync-engine error:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
