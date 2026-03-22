document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.navbar-toggler');
    const hamburger = document.querySelector('.hamburger');

    menuBtn.addEventListener('click', () => {
        // Toggles the 'open' class on the hamburger div
        hamburger.classList.toggle('open');
    });
});
