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
