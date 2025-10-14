document.addEventListener('DOMContentLoaded', function () {

  // Dropdown toggles
  document.querySelectorAll('.eh-dropbtn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      const parent = btn.closest('.eh-dropdown');
      const panel = parent.querySelector('.eh-dropdown-panel');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // close others
      document.querySelectorAll('.eh-dropdown-panel').forEach(p => { if(p !== panel) p.style.display = 'none'; });
      document.querySelectorAll('.eh-dropbtn').forEach(b => { if(b !== btn) b.setAttribute('aria-expanded','false'); });
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

  // mobile menu toggle
  const menuToggle = document.querySelector('.eh-menu-toggle');
  if(menuToggle){
    menuToggle.addEventListener('click', function(){
      const menu = document.querySelector('.eh-menu');
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if(!expanded){
        menu.classList.add('mobile-active'); menu.style.display='flex';
        menuToggle.setAttribute('aria-expanded','true');
      } else {
        menu.classList.remove('mobile-active'); menu.style.display='none';
        menuToggle.setAttribute('aria-expanded','false');
      }
    }, {passive:true});
  }

  // Search
  const SITE_INDEX = [
    {title: "10 Nutrition Tips for a Healthier Life", url: "nutrition-tips.html", excerpt: "Practical, science-backed steps to improve energy and immunity."},
    {title: "Managing Stress for Mental Clarity", url: "managing-stress.html", excerpt: "Techniques to reduce stress and improve focus."},
    {title: "Holistic Living: Balance Mind, Body & Soul", url: "holistic-living.html", excerpt: "A practical guide to a balanced routine that supports mind and body."}
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
    searchForm.addEventListener('submit', function(e){ e.preventDefault(); runSearch(searchInput.value); });
    searchInput.addEventListener('input', function(){ runSearch(searchInput.value); });
    searchClear && searchClear.addEventListener('click', function(){ searchInput.value=''; searchClear.hidden=true; searchResults.style.display='none'; });
  }
  document.addEventListener('keydown', function(e){ if(e.key === '/') { const el = document.getElementById('searchInput'); if(el){ e.preventDefault(); el.focus(); } } });

  // modal
  const openModalBtn = document.getElementById('openSupportModal');
  const modal = document.getElementById('supportModal');
  const closeModalBtn = document.getElementById('closeModal');
  function openModal(){ if(modal){ modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; } }
  function closeModal(){ if(modal){ modal.setAttribute('aria-hidden','true'); document.body.style.overflow='auto'; } }
  openModalBtn && openModalBtn.addEventListener('click', openModal);
  closeModalBtn && closeModalBtn.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });

  // M-Pesa notify
  const mpesaBtn = document.getElementById('mpesaNotifyBtn');
  if(mpesaBtn){
    mpesaBtn.addEventListener('click', function(){
      const tx = document.getElementById('mpesaTx').value.trim();
      if(!tx){ alert('Please enter your M-Pesa transaction ID so we can confirm your donation (example: O3K45X123).'); return; }
      alert('Thanks — we received your M-Pesa Transaction ID: ' + tx + '\nWe will verify and respond by email.');
    });
  }

  // Stripe / PayPal placeholder
  const stripeBtn = document.getElementById('stripeCheckoutBtn');
  if(stripeBtn){
    stripeBtn.addEventListener('click', function(){
      const url = stripeBtn.dataset.checkoutUrl;
      if(!url){ alert('Stripe checkout endpoint not configured. Replace data-checkout-url with your server endpoint.'); return; }
      window.location = url;
    });
  }

  // lazy-load images
  document.querySelectorAll('img').forEach(img => { if(!img.getAttribute('loading')) img.setAttribute('loading','lazy'); });

});