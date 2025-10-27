/* analytics.js
   The Esthetics Hub - Global Analytics Integration
   Tracks both global and regional audiences.
*/

(function(i,s,o,g,r,a,m){
  i['GoogleAnalyticsObject']=r;
  i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)
  };
  i[r].l=1*new Date();
  a=s.createElement(o), m=s.getElementsByTagName(o)[0];
  a.async=1;
  a.src=g;
  m.parentNode.insertBefore(a,m);
})(window,document,'script','https://www.googletagmanager.com/gtag/js?id=G-QCX3G9KSPC','gtag');

window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

gtag('js', new Date());

// Main tracking IDs
gtag('config', 'G-QCX3G9KSPC', { 'anonymize_ip': true }); // Flood-It! Web
gtag('config', 'G-PSW1MY7HB4', { 'anonymize_ip': true }); // North America & Canada

// Optional custom events
// gtag('event', 'page_view', { 'page_title': document.title, 'page_path': location.pathname });

