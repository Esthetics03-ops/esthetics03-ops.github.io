/* script.js
   Handles:
   - dropdown menus
   - mobile menu toggle
   - client-side search (SITE_INDEX)
   - tooltips for social icons
   - support modal + M-Pesa notify (manual placeholder)
   - stripe/paypal placeholder actions
*/

/* ------------ DOMContentLoaded -------------- */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Dropdown toggles ---------- */
  document.querySelectorAll('.eh-dropbtn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      const parent = btn.closest('.eh-dropdown');
      const panel = parent.querySelector('.eh-dropdown-panel');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // close others
      document.querySelectorAll('.eh-dropdown-panel').forEach(p => { p.style.display = 'none'; });
      document.querySelectorAll('.eh-dropbtn').forEach(b => b.setAttribute('aria-expanded','false'));
      if(!expanded){
        panel.style.display = 'block';
        btn.setAttribute('aria-expanded','true');
      } else {
        panel.style.display = 'none';
        btn.setAttribute('aria-expanded','false');
      }
    });
  });

  // close dropdowns clicking outside
  document.addEventListener('click', function(ev){
    if(!ev.target.closest('.eh-dropdown')){
      document.querySelectorAll('.eh-dropdown-panel').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.eh-dropbtn').forEach(b => b.setAttribute('aria-expanded','false'));
    }
  });

  /* ---------- Mobile menu toggle ---------- */
  const menuToggle = document.querySelector('.eh-menu-toggle');
  if(menuToggle){
    menuToggle.addEventListener('click', function(){
      const menu = document.querySelector('.eh-menu');
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menu.style.display = expanded ? 'none' : 'flex';
      menuToggle.setAttribute('aria-expanded', (!expanded).toString());
    });
  }

  /* ---------- Search functionality (client-side) ---------- */
  // Small site: use a JS array. For large sites, generate search-index.json server side.
  const SITE_INDEX = [
    {title: "10 Nutrition Tips for a Healthier Life", url: "nutrition-tips.html", excerpt: "Practical, science-backed steps to improve energy and immunity."},
    {title: "Managing Stress for Mental Clarity", url: "manage-stress.html", excerpt: "Evidence-based techniques to reduce stress and improve focus."},
    {title: "Holistic Living: Balance Mind, Body & Soul", url: "holistic-living.html", excerpt: "A practical guide to a balanced routine that supports mind and body."}
    // add more items (title,url,excerpt) or load via fetch('/search-index.json')
  ];

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClear = document.getElementById('searchClear');

  function renderResults(results){
    if(!results.length){
      searchResults.innerHTML = '<div class="result"><p>No results found.</p></div>';
    } else {
      searchResults.innerHTML = results.map(r => `<div class="result"><a href="${r.url}">${r.title}</a><p>${r.excerpt}</p></div>`).join('');
    }
    searchResults.style.display = 'block';
  }

  function runSearch(q){
    const ql = q.trim().toLowerCase();
    if(!ql){ searchResults.style.display = 'none'; searchClear.hidden = true; return; }
    searchClear.hidden = false;
    const results = SITE_INDEX.map(item => {
      const titleScore = item.title.toLowerCase().includes(ql) ? 2 : 0;
      const excerptScore = item.excerpt.toLowerCase().includes(ql) ? 1 : 0;
      return Object.assign({}, item, {score: titleScore + excerptScore});
    }).filter(i => i.score > 0).sort((a,b) => b.score - a.score);
    renderResults(results);
  }

  if(searchForm){
    searchForm.addEventListener('submit', function(e){
      e.preventDefault();
      runSearch(searchInput.value);
    });
    searchInput.addEventListener('input', function(){ runSearch(searchInput.value); });
    searchClear && searchClear.addEventListener('click', function(){ searchInput.value=''; searchClear.hidden=true; searchResults.style.display='none'; });
  }

  // keyboard shortcut: press / to focus search
  document.addEventListener('keydown', function(e){
    if(e.key === '/') { const el = document.getElementById('searchInput'); if(el){ e.preventDefault(); el.focus(); } }
  });

  /* ---------- Tooltips for social icons ---------- */
  let tooltipEl = null;
  document.querySelectorAll('.social-link').forEach(function(el){
    el.addEventListener('mouseenter', function(){
      const title = el.getAttribute('data-tooltip-title') || el.title || '';
      if(!title) return;
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'tooltip-custom';
      tooltipEl.innerHTML = `<strong>${title}</strong>`;
      document.body.appendChild(tooltipEl);
      const r = el.getBoundingClientRect();
      tooltipEl.style.left = (r.left + (r.width/2)) + 'px';
      tooltipEl.style.top = (r.top - 10) + 'px';
      tooltipEl.style.transform = 'translate(-50%,-8px) scale(.95)';
      tooltipEl.style.opacity = '1';
    });
    el.addEventListener('mouseleave', function(){
      if(tooltipEl){ tooltipEl.remove(); tooltipEl = null; }
    });
  });

  /* ---------- Support modal behavior ---------- */
  const openModalBtn = document.getElementById('openSupportModal');
  const modal = document.getElementById('supportModal');
  const closeModalBtn = document.getElementById('closeModal');

  function openModal(){
    if(modal){ modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  }
  function closeModal(){
    if(modal){ modal.setAttribute('aria-hidden','true'); document.body.style.overflow='auto'; }
  }

  openModalBtn && openModalBtn.addEventListener('click', openModal);
  closeModalBtn && closeModalBtn.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });

  /* ---------- M-Pesa notify ---------- */
  const mpesaBtn = document.getElementById('mpesaNotifyBtn');
  if(mpesaBtn){
    mpesaBtn.addEventListener('click', function(){
      const tx = document.getElementById('mpesaTx').value.trim();
      if(!tx){
        alert('Please enter your M-Pesa transaction ID so we can confirm your donation (example: O3K45X123).');
        return;
      }
      // TODO: send to your server endpoint for verification e.g. fetch('/api/notify-donation', ...)
      alert('Thanks — we received your M-Pesa Transaction ID: ' + tx + '\nWe will verify and respond by email.');
    });
  }

  /* ---------- Stripe / PayPal placeholder ---------- */
  const stripeBtn = document.getElementById('stripeCheckoutBtn');
  if(stripeBtn){
    stripeBtn.addEventListener('click', function(){
      const url = stripeBtn.dataset.checkoutUrl;
      if(!url){
        alert('Stripe checkout endpoint not configured. Replace data-checkout-url with your server endpoint that creates a Checkout Session.');
        return;
      }
      window.location = url;
    });
  }

  // lazy-load images (progressive enhancement)
  document.querySelectorAll('img').forEach(img => {
    if(!img.getAttribute('loading')) img.setAttribute('loading','lazy');
  });

});

