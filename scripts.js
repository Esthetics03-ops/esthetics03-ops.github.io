document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.navbar-toggler');
    const hamburger = document.querySelector('.hamburger');

    // Guard against missing elements (prevents TypeErrors on some browsers like Safari)
    if (menuBtn && hamburger) {
        menuBtn.addEventListener('click', () => {
            // Toggles the 'open' class on the hamburger div
            hamburger.classList.toggle('open');
        });
    }
});
