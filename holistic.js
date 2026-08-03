// holistic.js - progress, share, simple analytics events
document.addEventListener('DOMContentLoaded', function(){
  // progress bar
  const progress = document.getElementById('progressBar');
  document.addEventListener('scroll', () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / height) * 100;
    if(progress) progress.style.width = scrolled + '%';
  });

  // copy link
  const copyBtn = document.getElementById('copyLink');
  if(copyBtn){
    copyBtn.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(window.location.href); copyBtn.textContent='Copied'; setTimeout(()=>copyBtn.textContent='Copy link',2000);}catch(e){alert('Copy failed');}
    });
  }

  // twitter share
  const twitter = document.getElementById('shareTwitter');
  if(twitter) twitter.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(document.title + ' ' + window.location.href);
});