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

