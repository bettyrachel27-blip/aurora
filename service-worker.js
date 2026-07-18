const CACHE='aurora-3.0.1-agenda-v1';
const ASSETS=['./','./index.html','./style-3.0.css?v=302','./app-3.0.js?v=302','./manifest.webmanifest','./icon-192.png','./icon-512.png','./assets/aurora-woman-clean.webp','./assets/lily-elegant.svg','./assets/lotus-gold.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  const isCore=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html')||url.pathname.includes('app-3.0.js')||url.pathname.includes('style-3.0.css');
  if(isCore){event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));return;}
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response})));
});
