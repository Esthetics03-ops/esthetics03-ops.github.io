// Simple performance enhancements
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img');
  images.forEach(img => img.setAttribute('loading', 'lazy'));
  console.log('Optimization script loaded: images lazy-loaded.');
});
