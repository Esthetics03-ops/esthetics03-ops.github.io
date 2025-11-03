(function () {
  const INDEX_URL = '/search-index.json';
  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  if (!input || !resultsEl) return;
  let index, docs;
  async function loadIndex() {
    const res = await fetch(INDEX_URL);
    docs = await res.json();
    index = new FlexSearch.Document({
      document: { id: 'id', index: ['title','content'], store: ['title','url','excerpt'] },
      tokenize: 'forward', cache: true, context: true
    });
    for (const d of docs) index.add(d);
  }
  function escapeHtml(s){ return s? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }
  function renderResults(arr){
    if(!arr||arr.length===0){ resultsEl.innerHTML='<p class="no-results">No results</p>'; return; }
    resultsEl.innerHTML = arr.slice(0,10).map(d=>`<article class="search-item"><a href="${d.url}"><h4>${escapeHtml(d.title)}</h4><p>${escapeHtml(d.excerpt)}</p></a></article>`).join('');
  }
  input.addEventListener('input', function(e){
    const q = e.target.value.trim(); if(!q){ resultsEl.innerHTML=''; return; }
    const res = index.search(q, { enrich: true, limit: 20 });
    const ids = new Set();
    const out = [];
    for(const fieldRes of res){
      for(const id of fieldRes.result){
        if(!ids.has(id)){ ids.add(id); const d = docs.find(x=>x.id===id); if(d) out.push(d); }
      }
    }
    if(out.length===0){ const fallback = docs.filter(d => (d.title+' '+d.content).toLowerCase().includes(q.toLowerCase())); renderResults(fallback); return; }
    renderResults(out);
  });
  loadIndex().catch(err=>{ console.error(err); resultsEl.innerHTML='<p class="no-results">Search unavailable</p>'; });
})();
