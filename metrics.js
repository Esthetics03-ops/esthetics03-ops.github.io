let config;
fetch('config.json')
  .then(res => res.json())
  .then(data => { config = data; initDashboard(); });

let dashboardData = {};

function initDashboard() {
  updateMetrics();
  setInterval(updateMetrics, config.REFRESH_INTERVAL);
}

function randomVariation(base, variance = 0.3) {
  const variation = base * variance;
  return Math.max(0, Math.round(base + (Math.random() * variation * 2 - variation)));
}

function updateMetrics() {
  // Page-level metrics
  dashboardData.pages = config.PAGES.map(page => {
    const activeUsers = randomVariation(page.baseTraffic, 0.4);
    const adRPM = randomVariation(2, 0.5); // simulated AdSense RPM
    const adRevenue = (activeUsers * adRPM / 100).toFixed(2);
    const affiliateClicks = randomVariation(activeUsers / 5, 0.5);
    const affiliateRevenue = (affiliateClicks * 0.2).toFixed(2);

    return {
      ...page,
      activeUsers,
      adRPM,
      adRevenue,
      affiliateClicks,
      affiliateRevenue
    };
  });

  // Totals
  dashboardData.totals = {
    activeUsers: dashboardData.pages.reduce((a, p) => a + p.activeUsers, 0),
    adRevenue: dashboardData.pages.reduce((a, p) => a + parseFloat(p.adRevenue), 0).toFixed(2),
    affiliateRevenue: dashboardData.pages.reduce((a, p) => a + parseFloat(p.affiliateRevenue), 0).toFixed(2)
  };

  // Device breakdown
  dashboardData.devices = config.DEVICES.map(device => ({
    device,
    users: randomVariation(dashboardData.totals.activeUsers / config.DEVICES.length, 0.2)
  }));

  // Traffic sources
  dashboardData.sources = config.TRAFFIC_SOURCES.map(source => ({
    source,
    users: randomVariation(dashboardData.totals.activeUsers / config.TRAFFIC_SOURCES.length, 0.25)
  }));

  renderDashboard();
      }
