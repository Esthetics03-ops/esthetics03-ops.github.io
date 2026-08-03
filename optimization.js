/**
 * The Esthetics Hub - Performance & Accessibility Optimization Script
 * Fixes: Render Blocking, Script Bloat, M-Pesa Input Sanitization, and Dynamic Layout Shifts
 */

// 1. DYNAMICALLY INITIALIZE GOOGLE TAGS ASYNC (Prevents Render-Blocking)
(function() {
    // Only run if tags aren't already initialized
    if (!window.gtag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ dataLayer.push(arguments); };
        gtag('js', new Date());

        // Streamlined dual configurations
        gtag('config', 'G-QCX3G9KSPC');
        gtag('config', 'G-PSW1MY7HB4');

        // Dynamically append the external script file securely
        const gTagScript = document.createElement('script');
        gTagScript.async = true;
        gTagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-QCX3G9KSPC";
        document.head.appendChild(gTagScript);
    }
})();

// 2. WAIT FOR DOM TO LOAD TO EXECUTE INTERFACE INTERACTIONS (Crushes TBT)
document.addEventListener("DOMContentLoaded", function() {
    
    // --- M-PESA FORM UX & SANITIZATION HANDLER ---
    const mpesaForm = document.getElementById('mpesa-form') || document.getElementById('mpesa-payment-form');
    
    if (mpesaForm) {
        mpesaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('pay-btn');
            const phoneInput = document.getElementById('phone');
            
            if (!phoneInput || !btn) return;

            const rawPhone = phoneInput.value.trim();
            
            // Format phone entry to standard Kenyan 254 format
            let sanitizedPhone = rawPhone.replace(/[\s\-+]/g, ''); 
            if (sanitizedPhone.startsWith('0')) {
                sanitizedPhone = '254' + sanitizedPhone.slice(1);
            }
            
            // Validation filter
            if (sanitizedPhone.length !== 12 || !/^254/.test(sanitizedPhone)) {
                alert("Please enter a valid Safaricom phone number (e.g., 0712345678 or 254712345678)");
                return;
            }
            
            // Accessible Processing State Switch
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...`;
            
            console.log("Initiating STK Push for: " + sanitizedPhone);
            
            // STK Response Mock-up
            setTimeout(() => {
                alert("STK Push sent! Please check your phone to enter your M-PESA PIN.");
                btn.disabled = false;
                btn.innerHTML = "Send Payment Prompt";
            }, 2000);
        });
    }

    // --- COOKIE BANNER LAYOUT SHIFT (CLS) FIX ---
    // Forces the cookie banner container to overlay smoothly without violently pushing structural geometry
    const cookieBanner = document.querySelector('.cookie-banner') || document.getElementById('cookie-consent');
    if (cookieBanner) {
        cookieBanner.style.position = 'fixed';
        cookieBanner.style.bottom = '0';
        cookieBanner.style.left = '0';
        cookieBanner.style.width = '100%';
        cookieBanner.style.zIndex = '9999';
    }
});
