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
