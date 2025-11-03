/**
 * assets/js/search.js
 * Client-side search UI using FlexSearch.
 * Include FlexSearch via CDN in your HTML:
 * <script src="https://cdn.jsdelivr.net/npm/flexsearch/dist/flexsearch.bundle.js"></script>
 * <script src="/assets/js/search.js" defer></script>
 *
 * HTML snippet (place where you want it):
 * <div id="site-search">
 *   <input id="search-input" placeholder="Search the blog…" aria-label="Search articles">
 *   <div id="search-results" role="list"></div>
 * </div>
 */
(function () {
  const INDEX_URL = '/search-index.json';
  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');

  if (!input || !resultsEl) return;

  let index, docs;

  async function loadIndex() {
    const res = await fetch(INDEX_URL);
    docs = await res.json();

    // create FlexSearch index
    index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['title', 'content'],
        store: ['title', 'url', 'excerpt']
      },
      tokenize: 'forward',
      cache: true,
      context: true
    });

    for (const d of docs) {
      index.add(d);
    }
    console.log('Search index loaded:', docs.length, 'docs');
  }

  function renderResults(results) {
    if (!results || results.length === 0) {
      resultsEl.innerHTML = '<p class="no-results">No results</p>';
      return;
    }
    const html = results.slice(0,10).map(r => {
      const doc = r.doc || r;
      return `<article class="search-item"><a href="${doc.url}"><h4>${escapeHtml(doc.title)}</h4><p>${escapeHtml(doc.excerpt)}</p></a></article>`;
    }).join('');
    resultsEl.innerHTML = html;
  }

  function escapeHtml(s) {
    return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
  }

  input.addEventListener('input', function (e) {
    const q = e.target.value.trim();
    if (!q) {
      resultsEl.innerHTML = '';
      return;
    }
    // search across title and content
    const res = index.search(q, { enrich: true, limit: 20 });
    // FlexSearch Document returns array per field -- unify
    const docsMap = new Map();
    for (const fieldRes of res) {
      for (const item of fieldRes.result) {
        const d = index.export().find(x=> x.id === item);
        if (d) docsMap.set(d.id, d);
      }
    }
    // Fallback: simple search
    if (docsMap.size === 0) {
      const fallback = docs.filter(d => (d.title + ' ' + d.content).toLowerCase().includes(q.toLowerCase()));
      renderResults(fallback);
      return;
    }
    renderResults(Array.from(docsMap.values()));
  });

  // init
  loadIndex().catch(err => {
    console.error('Failed to load search index', err);
    resultsEl.innerHTML = '<p class="no-results">Search unavailable</p>';
  });
})();
    
