const CACHE='aurora-1.8-v1';
const ASSETS=['./','./index.html','./style-1.8.css?v=170','./app-1.8.js?v=170','./manifest.webmanifest','./icon-192.png','./icon-512.png','./assets/aurora-woman-clean.webp','./assets/lily-elegant.svg','./assets/lotus-gold.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const isCore=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html')||url.pathname.includes('app-1.8.js')||url.pathname.includes('style-1.8.css');
  if(isCore){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response})));
});
