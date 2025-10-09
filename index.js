document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.navbar');
  const btn = document.createElement('button');
  btn.innerHTML = '☰';
  btn.className = 'menu-toggle';
  nav.insertBefore(btn, nav.children[1]);
  btn.addEventListener('click', () => menu.classList.toggle('active'));
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector(anchor.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
      menu.classList.remove('active');
    });
  });
});