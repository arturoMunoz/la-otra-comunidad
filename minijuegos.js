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
  '.mj{position:absolute;inset:0;z-index:25;color:#2b1d0e;display:flex;flex-direction:column;padding:calc(12px + env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) calc(14px + env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));gap:10px;animation:up .25s ease-out}'+
  '.mj h2{font-family:var(--title);font-weight:700;font-size:1.35rem;margin:0}'+
  '.mj .hd{display:flex;justify-content:space-between;align-items:center;gap:8px}'+
  '.mj .x{all:unset;cursor:pointer;font-weight:800;font-size:1.4rem;padding:2px 8px;color:#6d6250}'+
  '.mj .stat{display:flex;gap:10px;font-weight:800;font-variant-numeric:tabular-nums}'+
  '.mj .stat span{background:#2b2418;color:#f6edd6;border-radius:8px;padding:4px 10px}'+
  '.mj .intro{display:flex;flex-direction:column;gap:12px;margin:auto 0}'+
  '.mj .intro p{margin:0;font-size:1.05rem;line-height:1.45}'+
  '.mj .ex{display:flex;gap:10px;flex-wrap:wrap}'+
  '.mj .ex div{display:flex;align-items:center;gap:6px;background:rgba(255,244,214,.45);border:2px solid #2b2418;border-radius:10px;padding:6px 10px;font-weight:700;font-size:.9rem}'+
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
  '.mj .msg{position:absolute;left:10px;right:10px;top:10px;background:#ecd7a6;border:2px solid #2b2418;border-radius:10px;padding:8px 10px;font-weight:700;font-size:.92rem;opacity:0;transition:opacity .2s}'+
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

/* ---------- piezas comunes de los minijuegos 2-4 ---------- */
(function(){ var c=document.createElement('style'); c.textContent=
  '.mj .hold{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);width:150px;height:150px;border-radius:50%;border:4px solid #2b2418;background:radial-gradient(#6d8a3a,#3f5a22);color:#fbf6e8;font-weight:800;font-size:1rem;display:grid;place-items:center;text-align:center;touch-action:none;user-select:none;-webkit-user-select:none;box-shadow:0 5px 0 rgba(0,0,0,.4)}'+
  '.mj .hold.on{background:radial-gradient(#4a6a2a,#2a3e16);transform:translateX(-50%) scale(.95)}'+
  '.mj .meter{position:absolute;left:12px;right:12px;top:12px;display:flex;flex-direction:column;gap:4px;font-weight:800;font-size:.85rem;color:#fbf6e8;text-shadow:0 1px 2px #000}'+
  '.mj .meter .b{height:12px;border-radius:6px;background:rgba(0,0,0,.45);overflow:hidden;border:2px solid #2b2418}'+
  '.mj .meter .b i{display:block;height:100%;width:0;background:#c9402d;transition:width .1s}'+
  '.mj .rider{position:absolute;top:34%;width:120px;height:110px;margin-left:-60px}'+
  '.mj .whisper{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-family:var(--title);font-weight:700;font-size:1.15rem;color:#f2d27a;text-shadow:0 0 12px #e2a54a,0 2px 2px #000;opacity:0;transition:opacity .4s;pointer-events:none;text-align:center;width:90%}'+
  '.mj .whisper.on{opacity:1}'+
  '.mj .dark{position:absolute;inset:0;background:radial-gradient(circle at 50% 75%,transparent 20%,rgba(0,0,0,.75));opacity:0;pointer-events:none;transition:opacity .2s}'+
  '.mj .grid{position:absolute;left:8%;right:8%;top:30%;bottom:8%;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:10px}'+
  '.mj .hole{position:relative;border-radius:50%;background:radial-gradient(ellipse at 50% 70%,#3a2614 40%,#5a3e1e 41%,#6d8a3a 62%,transparent 63%)}'+
  '.mj .pop{position:absolute;left:50%;bottom:30%;transform:translateX(-50%) translateY(30%) scale(.2);transition:transform .15s ease-out;background:none;border:0;padding:0;width:72px;height:72px;touch-action:manipulation}'+
  '.mj .pop.up{transform:translateX(-50%) translateY(0) scale(1)}'+
  '.mj .pop svg{width:100%;height:100%}'+
  '.mj .river{position:absolute;left:0;right:0;top:40%;bottom:30%;background:repeating-linear-gradient(90deg,#3f6fa8 0 30px,#4a7cb8 30px 60px)}'+
  '.mj .shore{position:absolute;top:34%;bottom:24%;width:16%;background:#6d8a3a;border:3px solid #2b2418}'+
  '.mj .raft{position:absolute;top:46%;width:86px;height:34px;margin-left:-43px;background:repeating-linear-gradient(90deg,#8a5a2a 0 12px,#6d4a24 12px 14px);border:3px solid #2b2418;border-radius:4px;transition:left .25s ease-out}'+
  '.mj .shadow{position:absolute;top:24%;width:44px;height:64px;margin-left:-22px;background:#120e0a;border-radius:22px 22px 6px 6px;opacity:.85}'+
  '.mj .rhythm{position:absolute;left:10%;right:10%;bottom:110px;height:26px;border:3px solid #2b2418;border-radius:13px;background:#f3e2b4;overflow:hidden}'+
  '.mj .rhythm .z{position:absolute;top:0;bottom:0;background:#8fb85a}'+
  '.mj .rhythm .k{position:absolute;top:-3px;bottom:-3px;width:6px;margin-left:-3px;background:#2b2418}'+
  '.mj .push{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);width:70%;background:#e2a54a;color:#221a0e;border:3px solid #2b2418;border-radius:12px;padding:16px;font-size:1.1rem;box-shadow:0 4px 0 rgba(0,0,0,.4);touch-action:manipulation}';
  document.head.appendChild(c); })();
var SVG_SETA='<svg viewBox="0 0 40 40"><path d="M6 20a14 12 0 0 1 28 0z" fill="#b4483a" stroke="#2b2418" stroke-width="2"/><circle cx="14" cy="14" r="2.4" fill="#f6edd6"/><circle cx="24" cy="12" r="2" fill="#f6edd6"/><circle cx="27" cy="18" r="1.6" fill="#f6edd6"/><rect x="15" y="20" width="10" height="14" rx="3" fill="#f3ead2" stroke="#2b2418" stroke-width="2"/></svg>';
var SVG_PERRO='<svg viewBox="0 0 40 40"><ellipse cx="20" cy="24" rx="13" ry="11" fill="#7a5426" stroke="#2b2418" stroke-width="2"/><path d="M8 16l-2-10 9 6zM32 16l2-10-9 6z" fill="#5a3e1e" stroke="#2b2418" stroke-width="2"/><circle cx="15" cy="22" r="2" fill="#2b2418"/><circle cx="25" cy="22" r="2" fill="#2b2418"/><ellipse cx="20" cy="29" rx="4" ry="3" fill="#2b2418"/></svg>';
var SVG_JINETE='<svg viewBox="0 0 120 110"><path d="M10 100l12-40c4-14 18-22 34-22h20c14 0 24 8 28 20l8 42h-12l-6-26-10 6v20H72V80H44v20H32V78l-8 22z" fill="#120e0a"/><path d="M60 40c-4-18 0-34 12-38 10 6 12 22 6 38z" fill="#1d1712"/></svg>';

function mjCabecera(t,extra){ return '<div class="hd"><h2>'+t+'</h2>'+(extra||'<button class="x" type="button" aria-label="Cerrar">×</button>')+'</div>'; }
function mjIntro(el,id,titulo,html,go,cerrar){
  el.innerHTML=mjCabecera(titulo)+'<div class="intro">'+html+(mjBest(id)?'<p class="note">Tu mejor resultado: '+mjStars(mjBest(id))+'</p>':'')+'<button class="go" type="button" id="mjGo">Empezar</button></div>';
  el.querySelector('.x').onclick=cerrar; el.querySelector('#mjGo').onclick=go;
}
function mjFin(el,id,titulo,st,texto,otra,cerrar){
  mjSaveBest(id,st);
  el.innerHTML=mjCabecera(titulo)+'<div class="end"><div class="stars" aria-label="'+st+' de 3 estrellas">'+mjStars(st)+'</div><p>'+texto+'</p>'+
    '<p class="note">Mejor resultado: '+mjStars(mjBest(id))+'. Lo que da cada estrella está por decidir.</p>'+
    '<div class="row2"><button class="ghost" type="button" id="mjR">Otra vez</button><button class="go" type="button" id="mjOk">Seguir andando</button></div></div>';
  el.querySelector('.x').onclick=cerrar; el.querySelector('#mjOk').onclick=cerrar; el.querySelector('#mjR').onclick=otra;
}
function mjFondo(F){ try{ F.style.background='url('+cv.toDataURL()+') center 30%/cover no-repeat, #6d8a3a'; }catch(e){} }

/* ---------- 2 · QUIETO BAJO EL ÁRBOL (tramo 3) ----------
   Mantén el dedo pulsado y quieto mientras pasa el jinete. Si sueltas o mueves el dedo, sube la sospecha.
   El Anillo susurra para que sueltes. */
function jugarArbol(el,cerrar){
  var ID='arbol', TIT='Quieto bajo el árbol', DUR=22;
  function intro(){ mjIntro(el,ID,TIT,'<p>Se oyen cascos. Frodo y los suyos se esconden entre las raíces del árbol. <b>Mantén el dedo pulsado en «Escondido» y no lo muevas</b> hasta que el jinete se vaya.</p><p>Si sueltas o mueves el dedo, el jinete sospecha. Y el Anillo te va a pedir que sueltes: <b>no le hagas caso</b>.</p>',jugar,cerrar); }
  function jugar(){
    el.innerHTML=mjCabecera(TIT,'<div class="stat"><span id="mjT">'+DUR+'</span></div>')+
      '<div class="field" id="mjF"><div class="meter"><span>Sospecha del jinete</span><div class="b"><i id="mjB"></i></div></div><div class="rider" id="mjJ">'+SVG_JINETE+'</div><div class="dark" id="mjD"></div><div class="whisper" id="mjW"></div><button class="hold" id="mjH" type="button">Escondido</button></div>';
    var F=el.querySelector('#mjF'), H=el.querySelector('#mjH'), B=el.querySelector('#mjB'), J=el.querySelector('#mjJ'), D=el.querySelector('#mjD'), Wh=el.querySelector('#mjW');
    mjFondo(F);
    var sus=0, maxSus=0, holding=false, sx=0, sy=0, t0=performance.now(), last=t0, raf=0, done=false, wT=0;
    var FR=['Póntelo… nadie te verá','Suelta… será solo un momento','Él no puede encontrarte si te lo pones','¿Por qué esconderse? Póntelo'];
    H.onpointerdown=function(e){ e.preventDefault(); holding=true; sx=e.clientX; sy=e.clientY; H.classList.add('on'); try{H.setPointerCapture(e.pointerId);}catch(_){} };
    H.onpointermove=function(e){ if(holding && Math.hypot(e.clientX-sx,e.clientY-sy)>18){ sus+=6; sx=e.clientX; sy=e.clientY; } };
    var up=function(){ holding=false; H.classList.remove('on'); };
    H.onpointerup=up; H.onpointercancel=up; H.onlostpointercapture=up;
    function tick(now){
      var dt=(now-last)/1000; last=now; var t=(now-t0)/1000, p=t/DUR;
      var x=-0.2+1.4*p; J.style.left=(x*100)+'%';
      var near=Math.max(0,1-Math.abs(x-0.5)*2.2);       /* 1 cuando el jinete está encima */
      if(!holding) sus+=dt*(18+60*near); else sus=Math.max(0,sus-dt*4);
      sus=Math.min(100,sus); maxSus=Math.max(maxSus,sus); B.style.width=sus+'%';
      D.style.opacity=(0.25+0.6*near).toFixed(2);
      if(now-wT>2600 && near>0.2){ wT=now; Wh.textContent=FR[Math.floor(Math.random()*FR.length)]; Wh.classList.add('on'); setTimeout(function(){Wh.classList.remove('on');},1500); }
      el.querySelector('#mjT').textContent=Math.max(0,Math.ceil(DUR-t));
      if(sus>=100) return fin(true);
      if(t>=DUR) return fin(false);
      raf=requestAnimationFrame(tick);
    }
    function fin(visto){
      if(done) return; done=true; cancelAnimationFrame(raf);
      var st=visto?0:maxSus<30?3:maxSus<60?2:1;
      var txt=visto?'<b>El jinete os ha visto.</b> Frodo tiene que salir corriendo campo a través.':['','Se ha ido… por los pelos.','Se ha ido sin veros. Sam respira.','Ni una hoja se ha movido. El jinete se pierde en la noche.'][st];
      mjFin(el,ID,TIT,st,txt,jugar,cerrar);
    }
    el._stop=function(){ done=true; cancelAnimationFrame(raf); };
    raf=requestAnimationFrame(tick);
  }
  intro();
}

/* ---------- 3 · SETAS A ESCONDIDAS (tramo 6) ----------
   Topo clásico: toca las setas que asoman, nunca a los perros del granjero. */
function jugarSetas(el,cerrar){
  var ID='setas', TIT='Setas a escondidas', DUR=30;
  function intro(){ mjIntro(el,ID,TIT,'<p>En los campos del granjero asoman setas. <b>Tócalas antes de que se escondan</b>, pero cuidado: a veces asoma uno de sus perros. <b>Si tocas un perro, pierdes 2 setas.</b></p><div class="ex"><div>'+SVG_SETA+'Seta +1</div><div class="no">'+SVG_PERRO+'Perro −2</div></div>',jugar,cerrar); }
  function jugar(){
    el.innerHTML=mjCabecera(TIT,'<div class="stat"><span id="mjT">'+DUR+'</span><span id="mjP">0</span></div>')+'<div class="field" id="mjF"><div class="msg" id="mjM"></div><div class="grid" id="mjG"></div></div>';
    var F=el.querySelector('#mjF'), G=el.querySelector('#mjG'), Msg=el.querySelector('#mjM'); mjFondo(F);
    var holes=[]; for(var i=0;i<9;i++){ var h=document.createElement('div'); h.className='hole'; G.appendChild(h); holes.push({el:h,busy:false}); }
    var pts=0, t0=performance.now(), raf=0, done=false, lastPop=-9, mT=0;
    function say(t,bad){ Msg.textContent=t; Msg.className='msg on'+(bad?' bad':''); clearTimeout(mT); mT=setTimeout(function(){Msg.className='msg';},1100); }
    function pop(t){
      var free=holes.filter(function(h){return !h.busy;}); if(!free.length) return;
      var h=free[Math.floor(Math.random()*free.length)], dog=Math.random()<0.25+0.1*(t/DUR);
      var b=document.createElement('button'); b.type='button'; b.className='pop'; b.innerHTML=dog?SVG_PERRO:SVG_SETA; b.setAttribute('aria-label',dog?'Perro':'Seta');
      h.el.appendChild(b); h.busy=true; requestAnimationFrame(function(){ b.classList.add('up'); });
      var life=1100-500*(t/DUR), gone=false;
      var quit=function(){ if(gone) return; gone=true; b.classList.remove('up'); setTimeout(function(){ b.remove(); h.busy=false; },160); };
      b.onpointerdown=function(e){ e.preventDefault(); if(done||gone) return;
        if(dog){ pts=Math.max(0,pts-2); say('¡Guau! El perro te ha olido. −2',true); } else { pts++; }
        el.querySelector('#mjP').textContent=pts; quit(); };
      setTimeout(quit,life);
    }
    function tick(now){
      var t=(now-t0)/1000; el.querySelector('#mjT').textContent=Math.max(0,Math.ceil(DUR-t));
      if(t-lastPop>0.75-0.35*(t/DUR)){ pop(t); lastPop=t; }
      if(t>=DUR) return fin();
      raf=requestAnimationFrame(tick);
    }
    function fin(){ if(done) return; done=true; cancelAnimationFrame(raf);
      var st=pts>=18?3:pts>=12?2:pts>=6?1:0;
      mjFin(el,ID,TIT,st,'<b>'+pts+' setas.</b> '+['Los perros te han dado más guerra que las setas.','Para una tortilla pequeña da.','Buena cesta. El granjero ni se ha enterado.','Cesta llena. Como cuando Frodo era pequeño.'][st],jugar,cerrar); }
    el._stop=function(){ done=true; cancelAnimationFrame(raf); };
    raf=requestAnimationFrame(tick);
  }
  intro();
}

/* ---------- 4 · LA BALSA (tramo 8) ----------
   Toca «Empujar» cuando la marca pase por la zona verde. Llega a la otra orilla antes de que la sombra llegue al embarcadero. */
function jugarBalsa(el,cerrar){
  var ID='balsa', TIT='La balsa', DUR=20;
  function intro(){ mjIntro(el,ID,TIT,'<p>Una sombra se acerca al embarcadero. Cruzad el río en la balsa: <b>pulsa «Empujar» justo cuando la marca pase por la zona verde</b>. Si fallas, la balsa apenas avanza.</p><p>Tienes que llegar a la otra orilla antes de que la sombra llegue al agua.</p>',jugar,cerrar); }
  function jugar(){
    el.innerHTML=mjCabecera(TIT,'<div class="stat"><span id="mjT">'+DUR+'</span></div>')+
      '<div class="field" id="mjF"><div class="river"></div><div class="shore" style="left:0"></div><div class="shore" style="right:0"></div><div class="shadow" id="mjS"></div><div class="raft" id="mjR"></div><div class="msg" id="mjM"></div>'+
      '<div class="rhythm"><div class="z" id="mjZ"></div><div class="k" id="mjK"></div></div><button class="push" id="mjP" type="button">Empujar</button></div>';
    var F=el.querySelector('#mjF'), R=el.querySelector('#mjR'), S=el.querySelector('#mjS'), K=el.querySelector('#mjK'), Z=el.querySelector('#mjZ'), Msg=el.querySelector('#mjM');
    var prog=0, t0=performance.now(), raf=0, done=false, zone=[0.4,0.6], mT=0, pos=0;
    function newZone(){ var w=0.2-0.08*Math.min(1,prog); var a=0.15+Math.random()*(0.7-w); zone=[a,a+w]; Z.style.left=(a*100)+'%'; Z.style.width=(w*100)+'%'; }
    function say(t,bad){ Msg.textContent=t; Msg.className='msg on'+(bad?' bad':''); clearTimeout(mT); mT=setTimeout(function(){Msg.className='msg';},800); }
    newZone();
    el.querySelector('#mjP').onpointerdown=function(e){ e.preventDefault(); if(done) return;
      if(pos>=zone[0]&&pos<=zone[1]){ prog+=0.11; say('¡Buen empujón!'); } else { prog+=0.02; say('Casi…',true); }
      newZone(); if(prog>=1) fin(true); };
    function tick(now){
      var t=(now-t0)/1000; pos=(Math.sin(t*(2.6+1.2*Math.min(1,prog)))+1)/2;
      K.style.left=(pos*100)+'%'; R.style.left=(16+68*Math.min(1,prog)+5)+'%';
      S.style.left=(4+12*Math.min(1,t/DUR))+'%';
      el.querySelector('#mjT').textContent=Math.max(0,Math.ceil(DUR-t));
      if(t>=DUR) return fin(false);
      raf=requestAnimationFrame(tick);
    }
    function fin(ok){ if(done) return; done=true; cancelAnimationFrame(raf);
      var left=Math.max(0,DUR-(performance.now()-t0)/1000);
      var st=!ok?0:left>8?3:left>4?2:1;
      mjFin(el,ID,TIT,st,ok?(st===3?'Habéis cruzado de sobra: la sombra se queda mirando desde la otra orilla.':'Habéis cruzado. La sombra llega al embarcadero demasiado tarde.'):'<b>La sombra ha llegado al agua</b> antes de que llegarais a la orilla. Menos mal que no sabe nadar.',jugar,cerrar); }
    el._stop=function(){ done=true; cancelAnimationFrame(raf); };
    raf=requestAnimationFrame(tick);
  }
  intro();
}
MINI.arbol={titulo:'Quieto bajo el árbol', tramo:2, jugar:jugarArbol};
MINI.setas={titulo:'Setas a escondidas', tramo:5, jugar:jugarSetas};
MINI.balsa={titulo:'La balsa', tramo:7, jugar:jugarBalsa};
