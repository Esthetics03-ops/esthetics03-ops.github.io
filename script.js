// Optimized script.js — preserves your original behavior, improves performance & accessibility
document.addEventListener('DOMContentLoaded', function () {

  // Helper: delegate click outside
  function closeAllDropdowns() {
    document.querySelectorAll('.eh-dropdown-panel').forEach(function(p){ p.style.display = 'none'; p.setAttribute('aria-hidden','true'); });
    document.querySelectorAll('.eh-dropbtn').forEach(function(b){ b.setAttribute('aria-expanded','false'); });
  }

  // Dropdown toggles
  document.querySelectorAll('.eh-dropbtn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      const parent = btn.closest('.eh-dropdown');
      if(!parent) return;
      const panel = parent.querySelector('.eh-dropdown-panel');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns();
      if(!expanded){
        panel.style.display = 'block';
        panel.setAttribute('aria-hidden','false');
        btn.setAttribute('aria-expanded','true');
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', function(ev){
    if(!ev.target.closest('.eh-dropdown')) closeAllDropdowns();
  }, {passive:true});

  // Mobile menu toggle
  const menuToggle = document.querySelector('.eh-menu-toggle');
  if(menuToggle){
    menuToggle.addEventListener('click', function(){
      const menu = document.querySelector('.eh-menu');
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if(menu){
        if(expanded){
          menu.style.display = 'none';
          menu.classList.remove('mobile-active');
        } else {
          menu.style.display = 'flex';
          menu.classList.add('mobile-active');
        }
        menuToggle.setAttribute('aria-expanded', (!expanded).toString());
      }
    });
  }

  // SEARCH (client-side small index)
  const SITE_INDEX = [
    {title: "10 Nutrition Tips for a Healthier Life", url: "nutrition-tips.html", excerpt: "Practical, science-backed steps to improve energy and immunity."},
    {title: "Managing Stress for Mental Clarity", url: "managing-stress.html", excerpt: "Evidence-based techniques to reduce stress and improve focus."},
    {title: "Holistic Living: Balance Mind, Body & Soul", url: "holistic-living.html", excerpt: "A practical guide to a balanced routine that supports mind and body."}
  ];

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClear = document.getElementById('searchClear');

  function renderResults(results){
    if(!results || !results.length){
      searchResults.innerHTML = '<div class="result"><p>No results found.</p></div>';
      searchResults.style.display = 'block';
      return;
    }
    searchResults.innerHTML = results.map(function(r){
      return '<div class="result"><a href="'+r.url+'">'+r.title+'</a><p>'+r.excerpt+'</p></div>';
    }).join('');
    searchResults.style.display = 'block';
  }

  function runSearch(q){
    const ql = (q || '').trim().toLowerCase();
    if(!ql){
      if(searchResults) searchResults.style.display = 'none';
      if(searchClear) searchClear.hidden = true;
      return;
    }
    if(searchClear) searchClear.hidden = false;
    const results = SITE_INDEX.map(function(item){
      var titleScore = item.title.toLowerCase().includes(ql) ? 2 : 0;
      var excerptScore = item.excerpt.toLowerCase().includes(ql) ? 1 : 0;
      return Object.assign({}, item, {score: titleScore + excerptScore});
    }).filter(function(i){ return i.score > 0; }).sort(function(a,b){ return b.score - a.score; });
    renderResults(results);
  }

  if(searchForm){
    searchForm.addEventListener('submit', function(e){ e.preventDefault(); runSearch(searchInput.value); });
    if(searchInput) searchInput.addEventListener('input', function(){ runSearch(searchInput.value); });
    if(searchClear) searchClear.addEventListener('click', function(){ if(searchInput) searchInput.value=''; if(searchClear) searchClear.hidden=true; if(searchResults) searchResults.style.display='none'; });
  }

  // Keyboard shortcut: focus search on pressing '/'
  document.addEventListener('keydown', function(e){
    if(e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){
      var el = document.getElementById('searchInput');
      if(el){ e.preventDefault(); el.focus(); }
    }
  }, {passive:true});

  // Tooltips for social icons
  var tooltipEl = null;
  document.querySelectorAll('.social-link').forEach(function(el){
    el.addEventListener('mouseenter', function(){
      var title = el.getAttribute('data-tooltip-title') || el.title || '';
      if(!title) return;
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'tooltip-custom';
      tooltipEl.innerHTML = '<strong>'+title+'</strong>';
      document.body.appendChild(tooltipEl);
      var r = el.getBoundingClientRect();
      tooltipEl.style.left = (r.left + (r.width/2)) + 'px';
      tooltipEl.style.top = (r.top - 8) + 'px';
      tooltipEl.style.transform = 'translate(-50%, -100%)';
      tooltipEl.style.opacity = '1';
    });
    el.addEventListener('mouseleave', function(){
      if(tooltipEl){ tooltipEl.remove(); tooltipEl = null; }
    });
  });

  // Support modal behavior
  var openModalBtn = document.getElementById('openSupportModal');
  var modal = document.getElementById('supportModal');
  var closeModalBtn = document.getElementById('closeModal');
  function openModal(){ if(modal){ modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; modal.focus(); } }
  function closeModal(){ if(modal){ modal.setAttribute('aria-hidden','true'); document.body.style.overflow='auto'; } }
  if(openModalBtn) openModalBtn.addEventListener('click', openModal);
  if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); }, {passive:true});

  // M-Pesa notify
  var mpesaBtn = document.getElementById('mpesaNotifyBtn');
  if(mpesaBtn){
    mpesaBtn.addEventListener('click', function(){
      var tx = document.getElementById('mpesaTx').value.trim();
      if(!tx){
        // better UX than alert - use inline message if possible
        alert('Please enter your M-Pesa transaction ID so we can confirm your donation (example: O3K45X123).');
        return;
      }
      alert('Thanks — we received your M-Pesa Transaction ID: ' + tx + '\nWe will verify and respond by email.');
    });
  }

  // Stripe / PayPal placeholders
  var stripeBtn = document.getElementById('stripeCheckoutBtn');
  if(stripeBtn){
    stripeBtn.addEventListener('click', function(){
      var url = stripeBtn.getAttribute('data-checkout-url');
      if(!url){
        alert('Stripe checkout endpoint not configured. Replace data-checkout-url with your server endpoint that creates a Checkout Session.');
        return;
      }
      window.location = url;
    });
  }

  // Lazy-load images
  document.querySelectorAll('img').forEach(function(img){ if(!img.getAttribute('loading')) img.setAttribute('loading','lazy'); });

});
