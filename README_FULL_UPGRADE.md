# Esthetics Full Upgrade Package

This package adds:
- Image optimization (Sharp -> WebP)
- Sitemap generation
- Lighthouse CI integrated into GitHub Actions
- PWA support (service-worker.js + manifest.json)
- AI-powered client-side search (FlexSearch)
- Cloudflare recommendations

## Quick install (root = ./)
1. Unzip into repo root.
2. Install dependencies:
   ```
   npm install --save-dev sharp globby jsdom @lhci/cli flexsearch sitemap
   ```
3. Run locally to test:
   ```
   node scripts/convert-images.js
   node scripts/generate-sitemap.js
   node scripts/generate-search-index.js
   ```
4. Commit & push to `main`.
5. Watch GitHub Actions -> Full Upgrade workflow run.

## Notes
- If your site build outputs to a folder like `dist` or `public`, adjust `.github/workflows/full_upgrade_all.yml` upload/download `path` to that folder.
- For Cloudflare, follow `CLOUDFLARE_INSTRUCTIONS.md`.
- To enable auto-deploy badges or more monitoring, ask me to add them.
