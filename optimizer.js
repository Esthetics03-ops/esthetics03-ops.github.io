/**
 * The Esthetics Hub - Core Performance & Mobile Optimization Script
 * Version: 24.1.0
 * Focus: 3G/4G Mobile Throttling Mitigation, Input Validation, & Non-Blocking Execution
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Mobile M-Pesa Number Validation & Auto-Formatting
    initMpesaValidation();

    // 2. Defer Non-Critical UI Updates (System Clock / Node Status) to Prevent Main-Thread Blocking
    initOptimizedSystemClock();

    // 3. Lazy Load Non-Critical Elements / External Embeds
    initLazyLoadObservers();
});

/**
 * Validates and formats Kenyan M-Pesa phone numbers on the fly
 * Ensures format starts with 254 and contains correct digit length to reduce checkout drop-offs.
 */
function initMpesaValidation() {
    const phoneInput = document.querySelector('input[name*="phone"], input[placeholder*="254"], input[id*="phone"]');
    
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Strip non-numeric characters
        
        // Auto-correct standard local formats (e.g., '07...' or '7...') to '254...'
        if (value.startsWith('07') || value.startsWith('01')) {
            value = '254' + value.substring(1);
        } else if (value.startsWith('7') || value.startsWith('1')) {
            value = '254' + value;
        }

        e.target.value = value;

        // Visual validation cue
        if (value.startsWith('254') && value.length === 12) {
            phoneInput.style.borderColor = '#10B981'; // Green for valid
            phoneInput.dataset.valid = "true";
        } else {
            phoneInput.style.borderColor = '#EF4444'; // Red for invalid/incomplete
            phoneInput.dataset.valid = "false";
        }
    });
}

/**
 * Throttles or optimizes background system log/clock updates to save CPU cycles on low-end 3G smartphones.
 */
function initOptimizedSystemClock() {
    const timeNode = document.querySelector('.local-time, [data-role="system-time"]');
    if (!timeNode) return;

    // Update only once every 10 seconds instead of every second to lower CPU main-thread strain
    const updateTime = () => {
        const now = new Date();
        timeNode.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    };

    updateTime();
    setInterval(updateTime, 10000); 
}

/**
 * Implements Intersection Observer for images, widgets, and banners to save mobile data on 3G connections.
 */
function initLazyLoadObservers() {
    const lazyElements = document.querySelectorAll('img[data-src], iframe[data-src], .defer-load');
    
    if ('IntersectionObserver' in window && lazyElements.length > 0) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (el.dataset.src) {
                        el.src = el.dataset.src;
                    }
                    el.classList.add('loaded');
                    observerInstance.unobserve(el);
                }
            });
        }, { rootMargin: '50px 0px', threshold: 0.01 });

        lazyElements.forEach(el => observer.observe(el));
    }
                                }
