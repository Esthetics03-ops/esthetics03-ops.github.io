function parseGA4(data) {
  return {
    activeUsers: data.rows ? data.rows[0].metricValues[0].value : 0,
    pageviews: data.rows ? data.rows[0].metricValues[1].value : 0,
    avgSessionDuration: data.rows ? data.rows[0].metricValues[2].value : '0:00',
    topPages: data.rows ? data.rows.map(r => ({ page: r.dimensionValues[0].value, views: r.metricValues[1].value })) : [],
    trafficSources: [
      { source: 'Organic', sessions: 120 },
      { source: 'Direct', sessions: 80 },
      { source: 'Referral', sessions: 40 }
    ]
  };
}

function parseAdSense(data) {
  const metrics = data.rows ? data.rows[0].metricValues : [];
  return {
    impressions: metrics[1] || 0,
    clicks: metrics[2] || 0,
    ctr: metrics[2] && metrics[1] ? ((metrics[2]/metrics[1])*100).toFixed(2) : 0,
    earnings: metrics[0] || 0
  };
}

module.exports = { parseGA4, parseAdSense };
