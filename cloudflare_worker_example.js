// Example Cloudflare Worker to add security headers
addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  const response = await fetch(request);
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Content-Security-Policy', "default-src 'self'; img-src * data:; object-src 'none';");
  newHeaders.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
}
