// stress.js - progress, timer for guided practice, share & copy
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
  if(copyBtn) copyBtn.addEventListener('click', async () => {
    try{ await navigator.clipboard.writeText(window.location.href); copyBtn.textContent='Link copied!'; setTimeout(()=>copyBtn.textContent='Copy link',2000);}catch(e){alert('Copy failed');}
  });

  // twitter share
  const twitter = document.getElementById('shareTwitter');
  if(twitter) twitter.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(document.title + ' ' + window.location.href);

  // guided practice timer (simple)
  const startBtn = document.getElementById('startPractice');
  const timerEl = document.getElementById('timer');
  let countdown;
  function startTimer(duration){
    let time = duration;
    timerEl.textContent = 'Time left: ' + Math.ceil(time) + 's';
    countdown = setInterval(()=>{
      time -= 1;
      if(time <= 0){ clearInterval(countdown); timerEl.textContent = 'Session complete. Well done!'; } else { timerEl.textContent = 'Time left: ' + Math.ceil(time) + 's'; }
    },1000);
  }
  if(startBtn){
    startBtn.addEventListener('click', ()=> {
      if(countdown) clearInterval(countdown);
      // 10 minutes = 600s; here demo uses 60s to be quick
      startTimer(60);
    });
  }
});