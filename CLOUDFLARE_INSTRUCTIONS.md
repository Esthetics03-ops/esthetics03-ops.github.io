Cloudflare Setup Recommendations (manual steps)

1. Add your site to Cloudflare and point DNS (if not using custom domain, optional for GitHub Pages).
2. Enable CDN + caching:
   - Caching Level: Standard
   - Browser Cache TTL: a month (Respect existing cache-control if you set)
3. Page Rules to set:
   - /* (static assets)
     Cache Level: Cache Everything
     Edge Cache TTL: a month
   - /assets/images/*
     Cache Level: Cache Everything
     Edge Cache TTL: a year
4. Workers (optional): Add a small Worker to serve compressed assets or rewrite headers.
5. Enable Automatic HTTPS Rewrites and Brotli compression.
6. Add security headers via Transform Rules (CSP, HSTS) if needed.

Example Cache-Control headers (for origin):
- /assets/* -> Cache-Control: public, max-age=31536000, immutable
- /index.html -> Cache-Control: public, max-age=3600, must-revalidate
