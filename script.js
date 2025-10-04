// Fade-in effect for sections
const sections = document.querySelectorAll('section');

const revealOnScroll = () => {
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      sec.classList.add('visible');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);

// Add fade-in CSS dynamically
document.head.insertAdjacentHTML("beforeend", `
  <style>
    section { opacity: 0; transform: translateY(40px); transition: all 0.6s ease; }
    section.visible { opacity: 1; transform: translateY(0); }
  </style>
`);
// Dynamic year
document.getElementById("year").textContent = new Date().getFullYear();

// Highlight active nav link
const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Lazy load fallback for browsers without native support
if ('loading' in HTMLImageElement.prototype === false) {
  const script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js";
  document.body.appendChild(script);
}

// Re-initialize AdSense after page load
window.addEventListener("load", () => {
  if (window.adsbygoogle && document.querySelector(".adsbygoogle")) {
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense failed to load:", e);
    }
  }
});
