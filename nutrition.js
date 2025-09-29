// nutrition.js - reading progress, TOC highlight, share & copy link
document.addEventListener('DOMContentLoaded', function(){
  // progress bar
  const progress = document.getElementById('progressBar');
  document.addEventListener('scroll', () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / height) * 100;
    progress.style.width = scrolled + '%';
  });

  // copy link
  const copyBtn = document.getElementById('copyLink');
  if(copyBtn){
    copyBtn.addEventListener('click', async () => {
      try{
        await navigator.clipboard.writeText(window.location.href);
        copyBtn.textContent = 'Link copied!';
        setTimeout(()=> copyBtn.textContent = 'Copy link', 2000);
      }catch(e){
        alert('Copy failed - select and copy manually.');
      }
    });
  }

  // share to twitter
  const twitter = document.getElementById('shareTwitter');
  if(twitter){
    twitter.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(document.title + ' ' + window.location.href);
  }

  // simple TOC smooth scroll
  document.querySelectorAll('.toc a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
});
