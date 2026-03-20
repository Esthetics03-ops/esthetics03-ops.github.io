/**
 * GOOGLE SITEMAP PING
 * Forces a crawl update for the Esthetics Hub.
 */
function pingGoogleSitemap() {
    const sitemapUrl = "https://esthetics03-ops.github.io/sitemap.xml";
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    // Using a hidden image fetch to trigger the GET request without CORS issues
    const img = new Image();
    img.src = pingUrl;
    console.log("Sitemap Ping Sent to Google Search Console");
}

// Call this inside your "Manual Sync" function
