/* === header nav, dropdowns, search, tooltips, support interactions === */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Dropdown toggles ---------- */
  document.querySelectorAll('.eh-dropbtn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      const parent = btn.closest('.eh-dropdown');
      const panel = parent.querySelector('.eh-dropdown-panel');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // close any open panels
      document.querySelectorAll('.eh-dropdown-panel').forEach(p=>p.style.display='none');
      document.querySelectorAll('.eh-dropbtn').forEach(b=>b.setAttribute('aria-expanded','false'));
      if(!expanded){
        panel.style.display='block';
        btn.setAttribute('aria-expanded','true');
      } else {
        panel.style.display='none';
        btn.setAttribute('aria-expanded','false');
      }
    });
  });

  // close dropdowns when clicking outside
  document.addEventListener('click', function(ev){
    if(!ev.target.closest('.eh-dropdown')){
      document.querySelectorAll('.eh-dropdown-panel').forEach(p=>p.style.display='none');
      document.querySelectorAll('.eh-dropbtn').forEach(b=>b.setAttribute('aria-expanded','false'));
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
  // Replace this sample index with your actual site index if you have it.
  // For a small site we use a JS array of pages (title, url, excerpt, tags).
  const SITE_INDEX = [
    {title: "10 Nutrition Tips for a Healthier Life", url: "articles/nutrition.html", excerpt: "Practical, science-backed steps to improve energy and immunity."},
    {title: "Managing Stress for Mental Clarity", url: "articles/stress.html", excerpt: "Evidence-based techniques to reduce stress and improve focus."},
    {title: "Holistic Living: Balance Mind, Body & Soul", url: "articles/holistic.html", excerpt: "A practical guide to a balanced routine that supports mind and body."}
    // Add more items here or load via JSON fetch('/search-index.json')
  ];

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClear = document.getElementById('searchClear');

  function renderResults(results){
    if(!results.length){
      searchResults.innerHTML = '<div class="result"><p>No results found.</p></div>';
    } else {
      searchResults.innerHTML = results.map(r=>`<div class="result"><a href="${r.url}">${r.title}</a><p>${r.excerpt}</p></div>`).join('');
    }
    searchResults.style.display = 'block';
  }

  function runSearch(q){
    const ql = q.trim().toLowerCase();
    if(!ql){ searchResults.style.display='none'; searchClear.hidden=true; return; }
    searchClear.hidden = false;
    // simple scoring: title match & excerpt match
    const results = SITE_INDEX.map(item=>{
      const titleScore = item.title.toLowerCase().includes(ql) ? 2 : 0;
      const excerptScore = item.excerpt.toLowerCase().includes(ql) ? 1 : 0;
      return Object.assign({},item,{score: titleScore + excerptScore});
    }).filter(i=>i.score>0).sort((a,b)=>b.score-a.score);
    renderResults(results);
  }

  searchForm.addEventListener('submit', function(e){
    e.preventDefault();
    runSearch(searchInput.value);
  });
  searchInput.addEventListener('input', function(){ runSearch(searchInput.value); });
  searchClear && searchClear.addEventListener('click', function(){ searchInput.value=''; searchClear.hidden=true; searchResults.style.display='none'; });

  /* keyboard: / to focus search */
  document.addEventListener('keydown', function(e){
    if(e.key === '/') { e.preventDefault(); searchInput.focus(); }
  });

  /* ---------- Advanced tooltips for social links ---------- */
  // simple custom tooltip
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

  /* ---------- Support interactions ---------- */
  const mpesaBtn = document.getElementById('mpesaNotifyBtn');
  if(mpesaBtn){
    mpesaBtn.addEventListener('click', function(){
      const tx = document.getElementById('mpesaTx').value.trim();
      if(!tx){
        alert('Please enter your M-Pesa transaction ID so we can confirm your donation. Example: O3K45X123');
        return;
      }
      // Send to server for verification OR store in your Google Sheet via a serverless function.
      // For demo we just show confirmation.
      alert('Thanks — we received your M-Pesa Transaction ID: ' + tx + '\nWe will verify and respond by email.');
      // Here, you should POST tx to a secure endpoint: fetch('/api/notify-donation',{method:'POST',body:JSON.stringify({method:'mpesa',tx})})
    });
  }

  // Stripe checkout button (placeholder action)
  const stripeBtn = document.getElementById('stripeCheckoutBtn');
  if(stripeBtn){
    stripeBtn.addEventListener('click', function(){
      const url = stripeBtn.dataset.checkoutUrl;
      if(!url){
        alert('Stripe checkout endpoint not configured. Replace data-checkout-url with your server endpoint that creates a Checkout Session.');
        return;
      }
      // open checkout (should be server created)
      window.location = url;
    });
  }

});
// scripts/index.js - live search, smooth scroll, nav highlight, lazy images
document.addEventListener('DOMContentLoaded', function(){

  // Live search filtering
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const postsGrid = document.getElementById('postsGrid');
  const cards = Array.from(postsGrid.querySelectorAll('.card'));

  function filterPosts(query){
    const q = query.trim().toLowerCase();
    cards.forEach(card => {
      const title = card.dataset.title.toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    filterPosts(searchInput.value);
  });

  searchInput.addEventListener('input', (e) => filterPosts(e.target.value));

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length > 1){
        e.preventDefault();
        document.querySelector(href).scrollIntoView({behavior:'smooth'});
      }
    });
  });

  // Lazy images fallback (modern browsers have loading=lazy attribute, this is extra)
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const img = entry.target;
          if(img.dataset.src){ img.src = img.dataset.src; }
          observer.unobserve(img);
        }
      });
    }, {rootMargin:'200px'});
    imgs.forEach(img => io.observe(img));
  }

  // Nav highlight on scroll (simple)
  const navLinks = document.querySelectorAll('.main-nav a');
  window.addEventListener('scroll', () => {
    const fromTop = window.scrollY + 80;
    navLinks.forEach(link => {
      const section = document.querySelector(link.getAttribute('href'));
      if(section){
        if(section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop){
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });
});
// Fade-in effect for hotel cards when scrolling
const hotelCards = document.querySelectorAll('.hotel-card');

const revealOnScroll = () => {
  hotelCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      card.classList.add('visible');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);

// Add CSS for fade-in
document.head.insertAdjacentHTML("beforeend", `
  <style>
    .hotel-card { opacity: 0; transform: translateY(40px); transition: all 0.6s ease; }
    .hotel-card.visible { opacity: 1; transform: translateY(0); }
  </style>
`);
