# GitHub Pages Setup

This repository deploys the public website to GitHub Pages from `main` using the `.github/workflows/deploy-frontend.yml` workflow.

## Deployment

1. Open **Repository Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push changes to `main`, or run **Deploy to GitHub Pages** manually from **Actions**.
4. Confirm the deployment URL is `https://esthetics03-ops.github.io/`.

## HTTPS

GitHub Pages serves the default `github.io` hostname over HTTPS. In **Settings → Pages**, keep **Enforce HTTPS** enabled after the certificate is available.

## Custom domain

No custom domain is currently configured. If a custom domain is later added:

1. Add the domain in **Settings → Pages**.
2. Create a `CNAME` file containing only the custom hostname.
3. Configure DNS at the domain provider.
4. Wait for DNS verification and certificate provisioning.
5. Enable **Enforce HTTPS**.

## Repository requirements

- The Jekyll source is the repository root.
- `_config.yml` enables `jekyll-feed` and `jekyll-sitemap`.
- `.nojekyll` is not required when deploying through Jekyll Actions.
- The entry page is `index.html`, and `404.html` provides the custom not-found page.

## Verification

After each deployment, verify:

- `https://esthetics03-ops.github.io/` returns HTTP 200.
- `/404.html` renders the custom 404 page.
- `/sitemap.xml` and `/robots.txt` are accessible.
- Browser resources load without mixed-content warnings.
