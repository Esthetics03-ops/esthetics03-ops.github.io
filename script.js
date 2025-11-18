// ================================
// LOAD CONFIG.JSON FROM ROOT
// ================================
async function loadConfig() {
    try {
        const res = await fetch('/config.json');
        if (!res.ok) throw new Error('Unable to load config.json');
        return await res.json();
    } catch (err) {
        console.error("CONFIG ERROR:", err);
        showError("Could not load configuration file.");
        return null;
    }
}

// ================================
// MAIN INITIALIZER
// ================================
async function initDashboard() {
    const config = await loadConfig();
    if (!config) return;

    // Extract values from improved structure
    const apiKey            = config.google_api.api_key;
    const ga4Properties     = config.analytics.ga4_properties;
    const adsensePub        = config.adsense.publisher_id;
    const affiliateID       = config.affiliate.affiliate_id;

    // Display config values in UI
    updateConfigStatus(apiKey, ga4Properties, adsensePub, affiliateID);

    // Run simulated GA4 & AdSense data
    simulateGA4(ga4Properties);
    simulateAdSense(adsensePub);
    simulateAffiliate(affiliateID);
}

// ================================
// UPDATE CONFIG STATUS ON SCREEN
// ================================
function updateConfigStatus(apiKey, ga4Props, adsense, affiliate) {
    safeSet("api-key-status", apiKey !== "REPLACE_WITH_REAL_GOOGLE_API_KEY" ? "Valid Key Loaded" : "⚠ Replace API Key");
    safeSet("ga4-status", ga4Props.join(", "));
    safeSet("adsense-status", adsense);
    safeSet("affiliate-status", affiliate);
}

function safeSet(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// ================================
// SIMULATION — GA4 (browser cannot call GA4 API directly)
// ================================
function simulateGA4(properties) {
    const daily = random(120, 380);
    const weekly = daily * 7;
    const realtime = random(1, 7);

    safeSet("ga4-realtime", realtime + " users");
    safeSet("ga4-daily", daily + " visits");
    safeSet("ga4-weekly", weekly + " visits");

    console.log("GA4 properties detected:", properties);
}

// ================================
// SIMULATION — AdSense
// ================================
function simulateAdSense(pubID) {
    const today = random(0.10, 2.40).toFixed(2);
    const weekly = (today * 7).toFixed(2);
    const monthly = (weekly * 4.2).toFixed(2);

    safeSet("adsense-today", "USD " + today);
    safeSet("adsense-week", "USD " + weekly);
    safeSet("adsense-month", "USD " + monthly);

    console.log("AdSense Publisher:", pubID);
}

// ================================
// SIMULATION — Affiliate Earnings
// ================================
function simulateAffiliate(affiliateID) {
    const clicks = random(15, 80);
    const conversions = random(1, 4);
    const earnings = (random(1.5, 17.5)).toFixed(2);

    safeSet("aff-clicks", clicks);
    safeSet("aff-conversions", conversions);
    safeSet("aff-earnings", "USD " + earnings);

    console.log("Affiliate ID:", affiliateID);
}

// ================================
// HELPER
// ================================
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showError(msg) {
    const box = document.getElementById("error-box");
    if (box) {
        box.style.display = "block";
        box.textContent = msg;
    }
}

// Run the dashboard
initDashboard();

function showModal(){
  const modal = document.getElementById('bookingModal');
  if(modal){
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    trapFocus(modal);
  }
}
window.showModal = showModal;

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

  // Accessibility: focus trapping for modals
  function trapFocus(modal){
    const focusable = modal.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
    if(!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length -1];
    function keyHandler(e){
      if(e.key === 'Tab'){
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
      if(e.key === 'Escape'){ closeModal(modal); }
    }
    modal.addEventListener('keydown', keyHandler);
    modal._focusHandler = keyHandler;
    first.focus();
  }

  function closeModal(modal){
    document.getElementById('closeBookingModal').onclick = function() {
  document.getElementById('bookingModal').style.display = 'none';
};
    if(!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
    if(modal._focusHandler) modal.removeEventListener('keydown', modal._focusHandler);
  }

  // showModal used by rich-results test; define it
  function showModal(){
    const modal = document.getElementById('bookingModal');
    if(modal){
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden','false');
      trapFocus(modal);
    }
  }
  // expose showModal globally (some tools expect it)
  window.showModal = showModal;

  // auto show booking modal after 5s (every page load)
  setTimeout(function(){ showModal(); }, 5000);

  const closeBooking = document.getElementById('closeBookingModal');
  if(closeBooking){
    closeBooking.addEventListener('click', function(){ const modal = document.getElementById('bookingModal'); closeModal(modal); });
  }

  // support modal handlers
  const openSupport = document.getElementById('openSupportModal');
  const supportModal = document.getElementById('supportModal');
  const closeSupport = document.getElementById('closeSupportModal');
  if(openSupport && supportModal){
    openSupport.addEventListener('click', function(){ supportModal.style.display='flex'; supportModal.setAttribute('aria-hidden','false'); trapFocus(supportModal); });
  }
  if(closeSupport){
    closeSupport.addEventListener('click', function(){ closeModal(supportModal); });
  }

  // mpesa notify
  const mpesaBtn = document.getElementById('mpesaNotifyBtn');
  if(mpesaBtn){
    mpesaBtn.addEventListener('click', function(){
      const tx = document.getElementById('mpesaTx').value.trim();
      if(!tx){ alert('Please enter your M-Pesa transaction ID (e.g., O3K45X123).'); return; }
      alert('Thanks — we received your M-Pesa Transaction ID: ' + tx + '\\nWe will verify and respond by email.');
    });
  }

  // lazy-load images
  document.querySelectorAll('img').forEach(img => { if(!img.getAttribute('loading')) img.setAttribute('loading','lazy'); });

});
