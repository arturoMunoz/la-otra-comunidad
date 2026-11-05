/* La Otra Comunidad · caché básica para que abra rápido y funcione con mala cobertura */
var C='loc-v100';
self.addEventListener('install',function(e){ self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(k){ return Promise.all(k.filter(function(x){return x!==C;}).map(function(x){return caches.delete(x);})); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url); if(e.request.method!=='GET'||u.origin!==location.origin) return;
  if(u.pathname.indexOf('/assets/')>=0){ e.respondWith(caches.open(C).then(function(c){ return c.match(e.request).then(function(r){ return r||fetch(e.request).then(function(n){ if(n.ok&&!/\.mp4$/.test(u.pathname)) c.put(e.request,n.clone()); return n; }); }); })); return; }
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(function(n){ var cp=n.clone(); caches.open(C).then(function(c){ c.put(e.request,cp); }); return n; }).catch(function(){ return caches.match(e.request); }));
});
/* Avisos al móvil (Web Push): los manda el Worker; aquí solo se enseñan y, al tocarlos, se abre el juego. */
self.addEventListener('push',function(e){ var d={}; try{ d=e.data?e.data.json():{}; }catch(x){ d={texto:e.data?e.data.text():''}; }
  e.waitUntil(self.registration.showNotification(d.titulo||'La Otra Comunidad',{body:d.texto||'',icon:'assets/icono-192.png',badge:'assets/ui/aviso_badge.png',tag:d.tag||undefined,data:{url:'./'}})); });
self.addEventListener('notificationclick',function(e){ e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(l){ for(var i=0;i<l.length;i++){ if('focus' in l[i]) return l[i].focus(); } return self.clients.openWindow('./'); })); });
