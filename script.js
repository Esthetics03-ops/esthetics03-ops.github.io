/* ==========================================
   The Esthetics Hub - script.js
   Handles:
   - dropdown menus
   - mobile menu toggle
   - client-side search
   - tooltips
   - support modal
   - M-Pesa notify
   - floating WhatsApp chat
   ========================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Dropdown Menus ---------- */
  document.querySelectorAll('.eh-dropbtn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const parent = btn.closest('.eh-dropdown');
      const panel = parent.querySelector('.eh-dropdown-panel');
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // Close others
      document.querySelectorAll('.eh-dropdown-panel').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.eh-dropbtn').forEach(b => b.setAttribute('aria-expanded', 'false'));

      if (!expanded) {
        panel.style.display = 'block';
        btn.setAttribute('aria-expanded', 'true');
      } else {
        panel.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.eh-dropdown')) {
      document.querySelectorAll('.eh-dropdown-panel').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.eh-dropbtn').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
  });

  /* ---------- Mobile Menu ---------- */
  const menuToggle = document.querySelector('.eh-menu-toggle');
  const menu = document.querySelector('.eh-menu');
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', (!expanded).toString());
      menu.classList.toggle('active');
    });
  }

  /* ---------- Search ---------- */
  const SITE_INDEX = [
    { title: "10 Nutrition Tips for a Healthier Life", url: "nutrition-tips.html", excerpt: "Practical, science-backed steps to improve energy and immunity." },
    { title: "Managing Stress for Mental Clarity", url: "managing-stress.html", excerpt: "Techniques to reduce stress and improve focus." },
    { title: "Holistic Living: Balance Mind, Body & Soul", url: "holistic-living.html", excerpt: "A practical guide to a balanced routine that supports mind and body." }
  ];

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClear = document.getElementById('searchClear');

  function renderResults(results) {
    if (!results.length) {
      searchResults.innerHTML = '<div class="result"><p>No results found.</p></div>';
    } else {
      searchResults.innerHTML = results.map(r =>
        `<div class="result"><a href="${r.url}">${r.title}</a><p>${r.excerpt}</p></div>`
      ).join('');
    }
    searchResults.style.display = 'block';
  }

  function runSearch(q) {
    const query = q.trim().toLowerCase();
    if (!query) { searchResults.style.display = 'none'; searchClear.hidden = true; return; }
    searchClear.hidden = false;
    const results = SITE_INDEX
      .map(item => {
        const titleScore = item.title.toLowerCase().includes(query) ? 2 : 0;
        const excerptScore = item.excerpt.toLowerCase().includes(query) ? 1 : 0;
        return { ...item, score: titleScore + excerptScore };
      })
      .filter(i => i.score > 0)
      .sort((a, b) => b.score - a.score);
    renderResults(results);
  }

  if (searchForm) {
    searchForm.addEventListener('submit', e => { e.preventDefault(); runSearch(searchInput.value); });
    searchInput.addEventListener('input', () => runSearch(searchInput.value));
    if (searchClear) searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.hidden = true;
      searchResults.style.display = 'none';
    });
  }

  /* ---------- Tooltips ---------- */
  let tooltip = null;
  document.querySelectorAll('.social-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const title = el.getAttribute('data-tooltip-title');
      if (!title) return;
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip-custom';
      tooltip.textContent = title;
      document.body.appendChild(tooltip);
      const rect = el.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 + 'px';
      tooltip.style.top = rect.top - 20 + 'px';
    });
    el.addEventListener('mouseleave', () => { if (tooltip) tooltip.remove(); });
  });

  /* ---------- Support Modal ---------- */
  const modal = document.getElementById('supportModal');
  const openBtn = document.getElementById('openSupportModal');
  const closeBtn = document.getElementById('closeModal');

  function openModal() { modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeModal() { modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = 'auto'; }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---------- M-Pesa Notify ---------- */
  const mpesaBtn = document.getElementById('mpesaNotifyBtn');
  if (mpesaBtn) {
    mpesaBtn.addEventListener('click', () => {
      const tx = document.getElementById('mpesaTx').value.trim();
      if (!tx) {
        alert('Please enter your M-Pesa transaction ID for verification.');
        return;
      }
      alert(`Thank you! We received your M-Pesa Transaction ID: ${tx}\nWe'll verify and confirm via email.`);
    });
  }

  /* ---------- Floating WhatsApp ---------- */
  const chatBubble = document.createElement('a');
  chatBubble.href = "https://chat.whatsapp.com/BmBFZe4Xu7g73QBstg256C?mode=ems_copy_t";
  chatBubble.className = "whatsapp-float";
  chatBubble.target = "_blank";
  chatBubble.rel = "noopener noreferrer";
  chatBubble.innerHTML = '<i class="bi bi-whatsapp"></i>';
  document.body.appendChild(chatBubble);

});
