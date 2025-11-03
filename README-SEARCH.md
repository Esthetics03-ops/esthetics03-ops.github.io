# AI-Powered Blog Search (Client-side)

This package adds a lightweight, client-side search for your static blog using FlexSearch.

How it works:
1. A build-time script `scripts/generate-search-index.js` extracts text from your HTML pages and writes `public/search-index.json`.
2. The frontend `assets/js/search.js` loads the JSON and builds a FlexSearch index in the browser for fast fuzzy search.

Install / Run:
- Install dev deps: `npm install globby jsdom flexsearch --save-dev`
- Generate index: `node scripts/generate-search-index.js`
- Ensure `public/search-index.json` is copied to your published site root.

Embed in HTML (example):

<link rel="stylesheet" href="/assets/css/search.css">
<script src="https://cdn.jsdelivr.net/npm/flexsearch/dist/flexsearch.bundle.js"></script>
<div id="site-search">
  <input id="search-input" placeholder="Search the blog…" aria-label="Search articles">
  <div id="search-results" role="list"></div>
</div>
<script src="/assets/js/search.js" defer></script>

Notes:
- This is a private, client-side search — no external APIs required.
- For semantic/embedding search (OpenAI), a server component is required. Ask me and I'll add an embeddings-based server + indexer.
