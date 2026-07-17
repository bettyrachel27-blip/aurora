const CACHE='aurora-1.4-sidebar';
const ASSETS=['./','index.html','style.css?v=140','app.js?v=140','manifest.webmanifest','icon-192.png','icon-512.png','assets/aurora-woman-premium.webp','assets/aurora-woman-clean.webp','assets/floral-header.webp','assets/brown-mandala.webp','assets/mandala.svg','assets/paper-texture.svg'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  e.respondWith(
    fetch(e.request,{cache:'no-store'})
      .then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r})
      .catch(()=>caches.match(e.request))
  );
});
