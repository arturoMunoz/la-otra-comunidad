/* ================= MINIJUEGOS =================
   Cada minijuego: abre una pantalla encima de la escena, se explica en una frase,
   se juega 30-45 s con un dedo y termina con 0-3 estrellas. El mejor resultado se guarda.
   Nunca da ni quita kilómetros (salvo la tentación del Anillo, aún por hacer). */

var MJ_SVG={
  pan:'<svg viewBox="0 0 32 32"><ellipse cx="16" cy="19" rx="12" ry="7" fill="#c8893f"/><ellipse cx="16" cy="17" rx="11" ry="6" fill="#e0a95a"/><path d="M10 14l3 4M15 13l3 4M20 13l3 4" stroke="#a86a2a" stroke-width="1.6" stroke-linecap="round"/></svg>',
  manta:'<svg viewBox="0 0 32 32"><rect x="4" y="10" width="24" height="13" rx="6" fill="#5f8a32"/><circle cx="23" cy="16.5" r="5.5" fill="#4a6d26"/><path d="M23 13a3.5 3.5 0 1 1-3.5 3.5" fill="none" stroke="#8fb85a" stroke-width="1.4"/><path d="M9 10v13M13 10v13" stroke="#8a5a2a" stroke-width="1.6"/></svg>',
  cuerda:'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#c9a36a" stroke-width="3.2"/><circle cx="16" cy="16" r="5.8" fill="none" stroke="#b08850" stroke-width="3"/><path d="M26 16c2 3 2 7-1 9" stroke="#c9a36a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  cantimplora:'<svg viewBox="0 0 32 32"><rect x="13" y="3" width="6" height="5" rx="1" fill="#6d4a24"/><circle cx="16" cy="18" r="10" fill="#8a6a3a"/><circle cx="16" cy="18" r="7" fill="#a8844a"/><path d="M6 16h20" stroke="#5a3e1e" stroke-width="2"/></svg>',
  queso:'<svg viewBox="0 0 32 32"><path d="M4 22l22-12v12z" fill="#f2c94c"/><path d="M4 22h22v4H4z" fill="#e0b33a"/><circle cx="18" cy="18" r="1.8" fill="#d9a62e"/><circle cx="22" cy="20" r="1.2" fill="#d9a62e"/></svg>',
  mapa:'<svg viewBox="0 0 32 32"><path d="M5 7l7-2 8 2 7-2v20l-7 2-8-2-7 2z" fill="#ecdcb4" stroke="#a8844a" stroke-width="1.2"/><path d="M8 20c4-6 7 2 10-4s5-2 7-5" fill="none" stroke="#9c2f22" stroke-width="1.4" stroke-dasharray="2 2"/></svg>',
  sillon:'<svg viewBox="0 0 32 32"><rect x="6" y="8" width="20" height="12" rx="3" fill="#9c3a2a"/><rect x="3" y="14" width="6" height="10" rx="2" fill="#b4483a"/><rect x="23" y="14" width="6" height="10" rx="2" fill="#b4483a"/><rect x="8" y="18" width="16" height="6" rx="2" fill="#c45a48"/><path d="M6 24v4M26 24v4" stroke="#5a3e1e" stroke-width="2"/></svg>',
  reloj:'<svg viewBox="0 0 32 32"><rect x="10" y="2" width="12" height="28" rx="2" fill="#7a5426"/><circle cx="16" cy="9" r="4.5" fill="#f3ead2" stroke="#3a2a14"/><path d="M16 9V6.5M16 9l2 1" stroke="#3a2a14" stroke-width="1.2"/><path d="M16 15v8" stroke="#e8c26a" stroke-width="1.4"/><circle cx="16" cy="24" r="2" fill="#e8c26a"/></svg>',
  cucharas:'<svg viewBox="0 0 32 32"><ellipse cx="11" cy="9" rx="3.5" ry="5" fill="#d7dde4" stroke="#8a96a3"/><path d="M11 14v14" stroke="#aeb8c2" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="21" cy="9" rx="3.5" ry="5" fill="#d7dde4" stroke="#8a96a3"/><path d="M21 14v14" stroke="#aeb8c2" stroke-width="2.4" stroke-linecap="round"/></svg>',
  paraguas:'<svg viewBox="0 0 32 32"><path d="M3 15a13 11 0 0 1 26 0z" fill="#4a78b8"/><path d="M3 15c3-2 5 2 8.6 0 3.6 2 5.2-2 8.8 0 3.6 2 5-2 8.6 0" fill="#3a5f96"/><path d="M16 15v11a3 3 0 0 1-6 0" fill="none" stroke="#3a2a14" stroke-width="1.8"/></svg>',
  jarron:'<svg viewBox="0 0 32 32"><path d="M12 4h8l-1 4c5 3 6 8 4 13-1 4-3 7-7 7s-6-3-7-7c-2-5-1-10 4-13z" fill="#3f7a8a"/><path d="M10 16h12" stroke="#e8c26a" stroke-width="2"/><path d="M11 21h10" stroke="#e8c26a" stroke-width="1.2"/></svg>',
  libraco:'<svg viewBox="0 0 32 32"><rect x="5" y="6" width="22" height="20" rx="2" fill="#5a3e1e"/><rect x="7" y="8" width="18" height="16" fill="#7a5426"/><path d="M27 8v16" stroke="#f3ead2" stroke-width="2"/><path d="M11 13h10M11 17h8" stroke="#e8c26a" stroke-width="1.4"/></svg>'
};
var ZURRON_ITEMS=[
  {k:'pan',n:'Pan',ok:true},{k:'manta',n:'Manta',ok:true},{k:'cuerda',n:'Cuerda',ok:true},
  {k:'cantimplora',n:'Cantimplora',ok:true},{k:'queso',n:'Queso',ok:true},{k:'mapa',n:'Mapa',ok:true},
  {k:'farol',n:'Farol',ok:true,icon:true},{k:'pipa',n:'Pipa',ok:true,icon:true},
  {k:'sillon',n:'Sillón',ok:false,q:'Un sillón no cabe en un zurrón, por mucho que te guste.'},
  {k:'reloj',n:'Reloj de pared',ok:false,q:'El reloj de pared se queda en Bolsón Cerrado.'},
  {k:'cucharas',n:'Cucharas de plata',ok:false,q:'Las cucharas de plata… mejor que no las eche de menos nadie.'},
  {k:'paraguas',n:'Paraguas',ok:false,q:'Un hobbit de viaje se moja, como todo el mundo.'},
  {k:'jarron',n:'Jarrón',ok:false,q:'El jarrón de la tía abuela se rompería en la primera zanja.'},
  {k:'libraco',n:'Libro de cuentas',ok:false,q:'Las cuentas de la casa pueden esperar a la vuelta.'}
];
function mjIcon(it){ var k=it.k||it; if(M.mj&&M.mj[k]) return '<img src="'+M.mj[k]+'" alt="">'; return ICON[k]||MJ_SVG[k]; }

/* pantalla común */
(function(){
  var css=document.createElement('style');
  css.textContent=
  '.mj{position:absolute;inset:0;z-index:25;background:#efe5c9;color:#2b2418;display:flex;flex-direction:column;padding:calc(12px + env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) calc(14px + env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));gap:10px;animation:up .25s ease-out}'+
  '.mj h2{font-family:var(--title);font-weight:700;font-size:1.35rem;margin:0}'+
  '.mj .hd{display:flex;justify-content:space-between;align-items:center;gap:8px}'+
  '.mj .x{all:unset;cursor:pointer;font-weight:800;font-size:1.4rem;padding:2px 8px;color:#6d6250}'+
  '.mj .stat{display:flex;gap:10px;font-weight:800;font-variant-numeric:tabular-nums}'+
  '.mj .stat span{background:#2b2418;color:#f6edd6;border-radius:8px;padding:4px 10px}'+
  '.mj .intro{display:flex;flex-direction:column;gap:12px;margin:auto 0}'+
  '.mj .intro p{margin:0;font-size:1.05rem;line-height:1.45}'+
  '.mj .ex{display:flex;gap:10px;flex-wrap:wrap}'+
  '.mj .ex div{display:flex;align-items:center;gap:6px;background:#f8f1dc;border:2px solid #2b2418;border-radius:10px;padding:6px 10px;font-weight:700;font-size:.9rem}'+
  '.mj .ex svg,.mj .ex img{width:30px;height:30px;object-fit:contain;image-rendering:pixelated}'+
  '.mj .ex .no{opacity:.75;border-style:dashed}'+
  '.mj .go{background:#4f6b2e;color:#fbf6e8;border:0;border-radius:10px;padding:14px;font-size:1.05rem}'+
  '.mj .field{position:relative;flex:1;min-height:260px;border:3px solid #2b2418;border-radius:12px;overflow:hidden;background:#a8763a;image-rendering:pixelated}'+
  '.mj .table{position:absolute;left:0;right:0;top:56%;height:26%;box-shadow:0 -6px 12px rgba(0,0,0,.25);background:repeating-linear-gradient(90deg,#8a5a2a 0 46px,#7a4e24 46px 48px);border-top:4px solid #5a3e1e;border-bottom:4px solid #5a3e1e}'+
  '.mj .it{position:absolute;top:calc(56% + 6px);width:84px;margin-left:-42px;background:none;border:0;display:flex;flex-direction:column;align-items:center;gap:2px;color:#fbf6e8;font-weight:800;font-size:.78rem;text-shadow:0 1px 2px #000;padding:4px 0;touch-action:manipulation}'+
  '.mj .it svg,.mj .it img{width:64px;height:64px;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 3px 0 rgba(0,0,0,.35))}'+
  '.mj .it.fly{transition:transform .35s ease-in,opacity .35s;transform:translateY(140px) scale(.4)!important;opacity:0}'+
  '.mj .bag{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px}'+
  '.mj .bag svg{width:86px;height:70px}'+
  '.mj .slots{display:flex;gap:4px}'+
  '.mj .slots i{width:12px;height:12px;border-radius:50%;border:2px solid #f6edd6;background:none}'+
  '.mj .slots i.on{background:#e2a54a}'+
  '.mj .msg{position:absolute;left:10px;right:10px;top:10px;background:#f8f1dc;border:2px solid #2b2418;border-radius:10px;padding:8px 10px;font-weight:700;font-size:.92rem;opacity:0;transition:opacity .2s}'+
  '.mj .msg.on{opacity:1}'+
  '.mj .msg.bad{border-color:#9c2f22;color:#7a2418}'+
  '.mj .end{display:flex;flex-direction:column;gap:12px;margin:auto 0;text-align:center}'+
  '.mj .stars{font-size:2.6rem;letter-spacing:.15em;color:#c9a03a}'+
  '.mj .off{color:#d6ccb4}'+
  '.mj .got{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}'+
  '.mj .got svg,.mj .got img{width:38px;height:38px;object-fit:contain;image-rendering:pixelated}'+
  '.mj .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
  '.mj .ghost{background:none;border:2px solid #2b2418;color:#2b2418;border-radius:10px;padding:12px;font-size:1rem}'+
  '.mini-go{background:none;border:2px solid #4f6b2e;color:#4f6b2e;border-radius:10px;padding:11px;font-size:1rem}';
  document.head.appendChild(css);
})();
var BAG_SVG='<svg viewBox="0 0 86 70"><path d="M14 22h58l-6 44H20z" fill="#8a5a2a" stroke="#3a2a14" stroke-width="3"/><path d="M14 22c4-14 54-14 58 0" fill="#a8763a" stroke="#3a2a14" stroke-width="3"/><rect x="38" y="30" width="10" height="12" rx="2" fill="#e8c26a" stroke="#3a2a14" stroke-width="2"/></svg>';

function mjBest(id){ return store.get('mj.'+id, 0); }
function mjSaveBest(id,st){ if(st>mjBest(id)) store.set('mj.'+id, st); }
function mjStars(n){ var s=''; for(var i=0;i<3;i++) s+=(i<n?'★':'<span class="off">★</span>'); return s; }

var MINI={ zurron:{titulo:'Hacer el zurrón', tramo:0, jugar:jugarZurron} };
function miniDe(i){ var m=null; Object.keys(MINI).forEach(function(k){ if(MINI[k].tramo===i) m=k; }); return m; }

function abrirMinijuego(id){
  var m=MINI[id]; if(!m) return;
  var el=document.createElement('section'); el.className='mj'; el.setAttribute('role','dialog'); el.setAttribute('aria-label',m.titulo);
  $('app').appendChild(el);
  var cerrar=function(){ if(el._stop) el._stop(); el.remove(); };
  m.jugar(el,cerrar);
}

/* ---------- 1 · HACER EL ZURRÓN (tramo 1) ---------- */
function jugarZurron(el,cerrar){
  var CAP=8, DUR=30;
  function intro(){
    el.innerHTML='<div class="hd"><h2>Hacer el zurrón</h2><button class="x" type="button" aria-label="Cerrar">×</button></div>'+
      '<div class="intro"><p>Frodo se va mañana y el zurrón solo tiene <b>'+CAP+' huecos</b>. Por la mesa van pasando cosas de Bolsón Cerrado: <b>toca las que sirven para el camino</b> y deja pasar las demás.</p>'+
      '<div class="ex"><div>'+mjIcon('pan')+'Pan</div><div>'+mjIcon('cuerda')+'Cuerda</div><div>'+mjIcon('farol')+'Farol</div><div class="no">'+mjIcon('sillon')+'Sillón</div><div class="no">'+mjIcon('reloj')+'Reloj</div></div>'+
      '<p class="note">Acierto +1 · cosa inútil −1 · '+DUR+' segundos. '+(mjBest('zurron')?'Tu mejor resultado: '+mjStars(mjBest('zurron')):'')+'</p>'+
      '<button class="go" type="button" id="mjGo">Empezar</button></div>';
    el.querySelector('.x').onclick=cerrar; el.querySelector('#mjGo').onclick=jugar;
  }
  function jugar(){
    el.innerHTML='<div class="hd"><h2>Hacer el zurrón</h2><div class="stat"><span id="mjT">'+DUR+'</span><span id="mjP">0</span></div></div>'+
      '<div class="field" id="mjF"><div class="table"></div><div class="msg" id="mjM"></div><div class="bag">'+BAG_SVG+'<div class="slots" id="mjS"></div></div></div>';
    var F=el.querySelector('#mjF'), S=el.querySelector('#mjS'), M=el.querySelector('#mjM');
    try{ F.style.background='url('+cv.toDataURL()+') center 30%/cover no-repeat, #a8763a'; }catch(e){}
    for(var i=0;i<CAP;i++) S.appendChild(document.createElement('i'));
    var pts=0, packed=[], live=[], t0=performance.now(), lastSpawn=-9, raf=0, done=false, msgT=0;
    /* baraja: 60 % útiles, sin repetir la misma cosa seguida */
    var deck=[], prev=null;
    function next(){ var pool=ZURRON_ITEMS.filter(function(x){return x!==prev;}); var useful=Math.random()<.6;
      var c=pool.filter(function(x){return x.ok===useful;}); prev=c[Math.floor(Math.random()*c.length)]; return prev; }
    function say(t,bad){ M.textContent=t; M.className='msg on'+(bad?' bad':''); clearTimeout(msgT); msgT=setTimeout(function(){M.className='msg';},1600); }
    function spawn(){
      var it=next(), b=document.createElement('button'); b.type='button'; b.className='it';
      b.innerHTML=mjIcon(it)+it.n; F.appendChild(b);
      var o={el:b,it:it,x:F.clientWidth+50,v:(F.clientWidth+100)/(2.9-Math.min(1.2,(performance.now()-t0)/30000*1.2))};
      b.style.left=o.x+'px';
      b.onpointerdown=function(e){ e.preventDefault(); if(done||o.gone) return; o.gone=true; b.classList.add('fly');
        setTimeout(function(){b.remove();},380);
        if(it.ok){ pts++; packed.push(it); say('¡'+it.n+' al zurrón!'); }
        else { pts=Math.max(0,pts-1); say(it.q,true); }
        S.querySelectorAll('i').forEach(function(d,j){ d.className=j<packed.length?'on':''; });
        el.querySelector('#mjP').textContent=pts;
        if(packed.length>=CAP) fin();
      };
      live.push(o);
    }
    var last=performance.now();
    function tick(now){
      var dt=(now-last)/1000; last=now; var t=(now-t0)/1000;
      el.querySelector('#mjT').textContent=Math.max(0,Math.ceil(DUR-t));
      var gap=1.25-Math.min(.5,t/DUR*.5);
      if(t-lastSpawn>gap){ spawn(); lastSpawn=t; }
      live=live.filter(function(o){ if(o.gone) return false; o.x-=o.v*dt; o.el.style.left=o.x+'px'; if(o.x<-60){ o.el.remove(); return false; } return true; });
      if(t>=DUR) return fin();
      raf=requestAnimationFrame(tick);
    }
    function fin(){
      if(done) return; done=true; cancelAnimationFrame(raf);
      var st=pts>=7?3:pts>=5?2:pts>=3?1:0; mjSaveBest('zurron',st);
      var frase=['El zurrón va más vacío que una despensa después de la fiesta.','Algo es algo: no os moriréis de hambre el primer día.','Buen zurrón. Sam estaría orgulloso.','Zurrón perfecto: ni Bilbo lo habría hecho mejor.'][st];
      el.innerHTML='<div class="hd"><h2>Hacer el zurrón</h2><button class="x" type="button" aria-label="Cerrar">×</button></div>'+
        '<div class="end"><div class="stars" aria-label="'+st+' de 3 estrellas">'+mjStars(st)+'</div><p><b>'+pts+' puntos.</b> '+frase+'</p>'+
        (packed.length?'<div class="got">'+packed.map(mjIcon).join('')+'</div>':'')+
        '<p class="note">Mejor resultado: '+mjStars(mjBest('zurron'))+'. Lo que da cada estrella está por decidir.</p>'+
        '<div class="row2"><button class="ghost" type="button" id="mjR">Otra vez</button><button class="go" type="button" id="mjOk">Seguir andando</button></div></div>';
      el.querySelector('.x').onclick=cerrar; el.querySelector('#mjOk').onclick=cerrar; el.querySelector('#mjR').onclick=jugar;
    }
    el._stop=function(){ done=true; cancelAnimationFrame(raf); };
    raf=requestAnimationFrame(tick);
  }
  intro();
}
