/* La Otra Comunidad · caché básica para que abra rápido y funcione con mala cobertura */
var C='loc-v72';
self.addEventListener('install',function(e){ self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(k){ return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);})); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url); if(e.request.method!=='GET'||u.origin!==location.origin) return;
  if(u.pathname.indexOf('/assets/')>=0){ e.respondWith(caches.open(C).then(function(c){ return c.match(e.request).then(function(r){ return r||fetch(e.request).then(function(n){ if(n.ok&&!/\.mp4$/.test(u.pathname)) c.put(e.request,n.clone()); return n; }); }); })); return; }
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(function(n){ var cp=n.clone(); caches.open(C).then(function(c){ c.put(e.request,cp); }); return n; }).catch(function(){ return caches.match(e.request); }));
});
