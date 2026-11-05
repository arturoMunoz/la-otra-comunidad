
/* ================= TEMPORADA (05/11/2026): reto semanal, duelo, hoguera, fardos, cosas del camino, ropa de los demás,
   Máster del Maia, carta del día y menú nuevo. SQL: supabase/la-otra-comunidad-temporada.sql.
   Si el SQL no está ejecutado, cada parte falla en silencio y el resto del juego sigue igual. ================= */
var TEMP={semanas:[], dias:[], fardos:store.get('fardosLocal',[]), equipos:{}, master:[], listo:false};
var RETO_KM_POR=25, HOGUERA_MIN=5000, EPOCA=Date.UTC(2026,9,26), MASTER_NOMBRE='Arturo', MAIA='Radagast el Pardo';
var TROFEOS=[['estrella_elendil','Estrella de Elendil','Una estrella de plata con siete puntas. La Comunidad la ganó andando junta.'],
  ['cuerno_gamos','Cuerno de Los Gamos','Cuando suena, todos los de Los Gamos salen a la puerta. Ahora suena por vosotros.'],
  ['farol_elfico','Farol de Rivendel','Una luz élfica que no se apaga con el viento del camino.'],
  ['pipero_dragon','Pipero del Dragón Verde','Del mostrador de la posada de Delagua: un sitio para cada pipa de la Comunidad.'],
  ['miel_tom','Miel de la casa de Tom','Dorada y espesa. Sabe a verano junto al Tornasauce.'],
  ['campana_bree','Campana de Bree','Con un poni grabado. Suena cuando alguien de la Comunidad llega a la posada.'],
  ['mapa_comarca','Mapa de la Comarca','Atado con una cinta verde. Cada semana cumplida marca un camino nuevo.'],
  ['jarra_poney','Jarra del Poney Pisador','Rebosa espuma. Cebadilla Mantecona invita a la próxima.']];
var CAMINO=[[8,'penique','Un penique de cobre de la Comarca, medio enterrado en el camino de Delagua.'],
  [22,'manzana','Una manzana mordida junto a la cuneta. Alguien merendó con prisa por aquí.'],
  [28,'boton','Un botón de latón de chaleco hobbit. ¿Será de Sam?'],
  [45,'setas_anillo','Un corro de setas entre las raíces del Bosque Cerrado. Mejor no pisarlo.'],
  [62,'zarzamora','Una zarza con moras maduras. Te paras un momento y sigues con los dedos morados.'],
  [68,'hatillo','Un hatillo olvidado a un lado del camino, atado con cuerda. Dentro, pan duro y una nota borrada.'],
  [104,'pluma_cisne','Una pluma blanca de cisne del Brandivino, enganchada en los juncos.'],
  [170,'piedra_runa','Una piedra con una runa élfica medio borrada. Alguien pasó por aquí hace mucho.']];
var FARDO_POOL=['capa_noche','capa_ocre','capa_blanca','capa_negra','capa_violeta','pant_rojo','pant_negro','pant_crema','pant_cobre','pant_azulnoche'];
(function(){ var N={capa_noche:'Capa azul noche',capa_ocre:'Capa ocre de la cebada',capa_blanca:'Capa blanca de los Puertos Grises',capa_negra:'Capa negra de montaraz',capa_violeta:'Capa violeta de Bree',
    pant_rojo:'Pantalón rojo de fiesta',pant_negro:'Pantalón negro de montaraz',pant_crema:'Pantalón crema de domingo',pant_cobre:'Pantalón cobrizo',pant_azulnoche:'Pantalón azul noche'};
  var TI={capa_noche:[34,42,78],capa_ocre:[168,120,52],capa_blanca:[205,205,195],capa_negra:[34,32,34],capa_violeta:[86,52,110],pant_rojo:[140,40,36],pant_negro:[40,38,42],pant_crema:[196,180,140],pant_cobre:[150,86,44],pant_azulnoche:[36,44,80]};
  FARDO_POOL.forEach(function(k){ EQ[k]={n:N[k],por:'Dentro de un fardo del camino',tinte:TI[k],hueco:/^capa/.test(k)?'espalda':'piernas'}; });
  var _g=eqGanado; eqGanado=function(){ var g=_g(); TEMP.fardos.forEach(function(f){ if(f.abierto&&EQ[f.contenido]&&g.indexOf(f.contenido)<0) g.push(f.contenido); }); return g; };
})();

/* ---------- utilidades ---------- */
function hoyMadrid(off){ var d=new Date(Date.now()+(off||0)*864e5); return d.toLocaleDateString('sv-SE',{timeZone:'Europe/Madrid'}); }
function lunesDe(iso){ var d=new Date(iso+'T12:00:00Z'), w=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-w); return d.toISOString().slice(0,10); }
function semanaIdx(lunes){ return Math.max(0,Math.round((Date.parse(lunes+'T12:00:00Z')-EPOCA-432e5)/6048e5)); }
function semilla(n){ return function(){ n|=0; n=n+0x6D2B79F5|0; var t=Math.imul(n^n>>>15,1|n); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashTxt(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function registrados(){ var l=(people||[]).filter(function(p){ return p.registrado!==false; }); return l.length?l:(people||[]); }
function miAviso(html,ms){ var a=document.createElement('div'); a.className='tAviso'; a.innerHTML=html; document.body.appendChild(a);
  requestAnimationFrame(function(){ a.classList.add('on'); }); a.onclick=function(){ a.remove(); }; setTimeout(function(){ a.classList.remove('on'); setTimeout(function(){ a.remove(); },400); },ms||5200); }
(function(){ var c=document.createElement('style'); c.textContent=
  '.tAviso{position:fixed;left:12px;right:12px;bottom:calc(96px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;gap:12px;align-items:center;background:#f3e2b4;border:3px solid #2b1d0e;box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 0 0 2px rgba(255,240,200,.6);padding:10px 12px;color:#2b1d0e;font-size:.93rem;line-height:1.3;transform:translateY(30px);opacity:0;transition:.35s}'+
  '.tAviso.on{transform:none;opacity:1}.tAviso img{width:52px;height:52px;object-fit:contain;flex:none;image-rendering:pixelated}.tAviso b{display:block;font-family:var(--title)}'+
  '.reto{position:relative;margin:4px 0 12px;padding:14px 16px 12px;background:url("'+(M.reto&&M.reto.placa||'')+'") center/100% 100% no-repeat;color:#f6e8c4;text-shadow:0 1px 2px #000}'+
  '.reto h3{margin:0 0 2px;font-family:var(--title);font-size:1rem;color:#f6dc9a}.reto .sub{font-size:.8rem;opacity:.9}'+
  '.rbar{position:relative;height:30px;margin:8px 0 4px;background:url("'+(M.reto&&M.reto.barra||'')+'") center/100% 100% no-repeat}'+
  '.rbar i{position:absolute;left:4.5%;top:30%;bottom:30%;max-width:91%;background:linear-gradient(#f6d77c,#c48a2c);box-shadow:0 0 8px #f2c45a;border-radius:3px}'+
  '.rtro{position:absolute;right:10px;top:-14px;width:58px;height:58px;filter:drop-shadow(0 3px 3px rgba(0,0,0,.5))}.rtro.no{filter:grayscale(.9) brightness(.7) drop-shadow(0 3px 3px rgba(0,0,0,.5))}'+
  '.rap{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:.74rem;margin-top:4px;opacity:.95}'+
  '.tcard{display:flex;gap:10px;align-items:center;background:var(--paper2);border:2px solid #2b1d0e;padding:8px 10px;margin:8px 0;font-size:.9rem}'+
  '.tcard img{width:46px;height:46px;object-fit:contain;flex:none;image-rendering:pixelated}.tcard b{display:block;font-family:var(--title);font-size:.95rem}'+
  '.duelo{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;text-align:center;gap:6px}.duelo .vs{font-family:var(--title);font-weight:700}'+
  '.duelo img{width:40px;height:56px;object-fit:contain;image-rendering:pixelated}'+
  '.people .vest{width:40px;height:56px;flex:none;display:grid;place-items:center}.people .vest img{width:40px;height:56px;object-fit:contain;image-rendering:pixelated}'+
  '.fardos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.fardo{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;font-size:.74rem;font-weight:700;padding:6px;border:2px solid #2b1d0e;background:rgba(160,110,50,.15)}'+
  '.fardo img{width:54px;height:54px;object-fit:contain}.fardo.cerrado img{filter:saturate(.6) brightness(.85)}.fardo.listo{animation:latido 1.2s ease-in-out infinite;background:#f6dc9a}@keyframes latido{50%{transform:scale(1.05)}}'+
  '.mst{position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:rgba(10,8,5,.72);animation:up .3s ease-out}'+
  '.mst .perg{position:relative;width:min(92vw,420px);aspect-ratio:683/986;background:url("'+(M.master&&M.master.pergamino||'')+'") center/contain no-repeat;display:flex;flex-direction:column;align-items:center;padding:20% 13% 26%;box-sizing:border-box;color:#3a2410;text-align:center;gap:8px}'+
  '.mst .emb{width:34%;margin-top:-6%;filter:drop-shadow(0 3px 4px rgba(0,0,0,.4))}.mst .ev{width:20%}.mst h3{margin:0;font-family:var(--title);font-size:1.15rem}.mst p{margin:0;font-size:.98rem;line-height:1.35}'+
  '.mst .firma{font-style:italic;font-size:.85rem;opacity:.8}.mst button{margin-top:auto;background:#4f6b2e;color:#fbf6e8;border:0;padding:10px 18px;font:700 1rem var(--body)}'+
  '.mform label{display:block;color:#f3d9a8;font-size:.85rem;margin:6px 0 2px}.mform select,.mform textarea{width:100%;box-sizing:border-box;font:1rem var(--body);padding:8px;border-radius:8px;border:1px solid #c9b07a;background:#211a12;color:#f3ead2}'+
  '.mform textarea{min-height:84px}.mtipos{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.mtipos button{all:unset;cursor:pointer;text-align:center;font-size:.66rem;color:#f3d9a8;padding:4px;border-radius:8px}'+
  '.mtipos button img{width:100%;aspect-ratio:1;object-fit:contain}.mtipos button[aria-pressed=true]{background:rgba(246,220,154,.25);outline:2px solid #f6dc9a}'+
  '.carta{position:fixed;inset:0;z-index:70;background:rgba(10,8,5,.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px}'+
  '.carta img{max-width:100%;max-height:72vh;box-shadow:0 8px 24px #000}.carta p{color:#f3e2b4;margin:0;text-align:center;font-size:.9rem}.carta button{background:#e2a54a;border:0;padding:12px 20px;font:700 1rem var(--body)}'+
  '#wx img.mfx{width:16px;height:16px;vertical-align:-3px;margin-right:3px}';
  document.head.appendChild(c); })();

/* ---------- datos ---------- */
function tempCargar(){
  if(!me) return;
  rpc('loc_pasos_semanas').then(function(r){ if(Array.isArray(r)){ TEMP.semanas=r; tempTrofeosAviso(); } }).catch(function(){});
  rpc('loc_mis_dias').then(function(r){ if(Array.isArray(r)) TEMP.dias=r; }).catch(function(){});
  rpc('loc_mis_paquetes').then(function(r){ if(Array.isArray(r)){ var loc=TEMP.fardos.filter(function(f){ return f.soloLocal; });
    TEMP.fardos=r.map(function(x){ return {id:x.id,contenido:x.contenido,km_abre:Number(x.km_abre),de:x.de,abierto:!!x.abierto}; });
    loc.forEach(function(f){ if(!TEMP.fardos.some(function(g){return g.id===f.id;})){ TEMP.fardos.push(f); rpc('loc_paquete_dar',{p_id:f.id,p_contenido:f.contenido,p_km_abre:f.km_abre}).then(function(){ f.soloLocal=false; }).catch(function(){}); } });
    store.set('fardosLocal',TEMP.fardos); } }).catch(function(){});
  rpc('loc_equipos').then(function(r){ if(Array.isArray(r)){ TEMP.equipos={}; r.forEach(function(x){ TEMP.equipos[x.nombre]=x.equipo||[]; }); } }).catch(function(){});
  rpc('loc_master_mensajes').then(function(r){ if(Array.isArray(r)){ TEMP.master=r; masterMostrar(); masterHud(); } }).catch(function(){});
  TEMP.listo=true;
}
(function(){ var _s=start; start=function(){ _s.apply(this,arguments); tempCargar(); equipoSubir(); }; })();
document.addEventListener('visibilitychange',function(){ if(!document.hidden&&me) tempCargar(); });

/* ---------- reto semanal ---------- */
function retoDatos(){
  var hoy=hoyMadrid(), lun=lunesDe(hoy), N=registrados().length||9, obj=RETO_KM_POR*N, sem={};
  TEMP.semanas.forEach(function(x){ var s=String(x.semana).slice(0,10); (sem[s]=sem[s]||{tot:0,de:{}}); sem[s].tot+=Number(x.pasos); sem[s].de[x.nombre]=Number(x.pasos); });
  var act=sem[lun]||{tot:0,de:{}}, ganados=[];
  Object.keys(sem).sort().forEach(function(s){ if(sem[s].tot/STEPS_PER_KM>=obj) ganados.push({semana:s,t:TROFEOS[semanaIdx(s)%TROFEOS.length]}); });
  var fin=new Date(Date.parse(lun+'T00:00:00Z')+7*864e5), dias=Math.max(0,Math.ceil((fin-Date.parse(hoy+'T00:00:00Z'))/864e5));
  return {lunes:lun,obj:obj,km:act.tot/STEPS_PER_KM,de:act.de,trofeo:TROFEOS[semanaIdx(lun)%TROFEOS.length],ganados:ganados,dias:dias,sem:sem};
}
function tempTrofeosAviso(){ var R=retoDatos(); R.ganados.forEach(function(g){ var k='retoOk.'+g.semana; if(store.get(k,false)) return; store.set(k,true);
  if(g.semana===R.lunes||Date.now()-Date.parse(g.semana)<15*864e5) miAviso('<img src="'+M.trofeos[g.t[0]]+'" alt=""><div><b>¡Reto de la Comunidad cumplido!</b>Todos ganáis: '+g.t[1]+'. Está en el Zurrón.</div>',7000); }); }
function retoHtml(){
  var R=retoDatos(), pc=Math.min(100,R.km/R.obj*100), ok=R.km>=R.obj, t=R.trofeo;
  var ap=Object.keys(R.de).sort(function(a,b){ return R.de[b]-R.de[a]; }).map(function(n){ return n+' '+fmt(R.de[n]/STEPS_PER_KM); }).join(' · ');
  return '<div class="reto"><img class="rtro'+(ok?'':' no')+'" src="'+(M.trofeos&&M.trofeos[t[0]]||'')+'" alt=""><h3>Reto de la semana</h3>'+
    '<div class="sub">Entre todos, '+R.obj+' km'+(ok?' · ¡Cumplido! Todos ganáis «'+t[1]+'»':' · Premio para todos: '+t[1]+' · Quedan '+R.dias+' días')+'</div>'+
    '<div class="rbar"><i style="width:'+(pc*.91).toFixed(1)+'%"></i></div><div class="sub"><b>'+fmt(R.km)+'</b> de '+R.obj+' km</div>'+
    (ap?'<div class="rap">'+ap+'</div>':'')+'</div>';
}
/* ---------- duelo de la semana ---------- */
function dueloDe(lunes){ var ns=registrados().map(function(p){ return p.nombre; }).sort(), r=semilla(semanaIdx(lunes)*7919+13);
  for(var i=ns.length-1;i>0;i--){ var j=Math.floor(r()*(i+1)), t=ns[i]; ns[i]=ns[j]; ns[j]=t; }
  var par={}; for(var k=0;k+1<ns.length;k+=2){ par[ns[k]]=ns[k+1]; par[ns[k+1]]=ns[k]; } if(ns.length%2&&ns.length>2){ var u=ns[ns.length-1], v=ns[ns.length-2]; par[u]=v; } return par; }
function persona(n){ return (people||[]).filter(function(p){ return p.nombre===n; })[0]; }
function fotoDe(n){ var p=persona(n); if(!p) return ''; var u=(typeof hobbitVestido==='function')?hobbitVestido(p.hobbit,(me&&n===me.nombre)?eqPuesto():(TEMP.equipos[n]||[])):null;
  return u?'<img src="'+u+'" alt="">':'<span class="face" style="'+faceStyle(p.hobbit,36)+'"></span>'; }
function dueloHtml(){ if(!me) return ''; var R=retoDatos(), riv=dueloDe(R.lunes)[me.nombre]; if(!riv) return '';
  var a=(R.de[me.nombre]||0)/STEPS_PER_KM, b=(R.de[riv]||0)/STEPS_PER_KM;
  var pl=new Date(Date.parse(R.lunes)-7*864e5).toISOString().slice(0,10), rp=dueloDe(pl)[me.nombre], ps=R.sem[pl], res='';
  if(rp&&ps){ var x=ps.de[me.nombre]||0, y=ps.de[rp]||0; res='<div class="sub" style="grid-column:1/-1;font-size:.78rem">La semana pasada '+(x>y?'ganaste a '+rp:x<y?rp+' te ganó':'empataste con '+rp)+'.</div>'; }
  return '<div class="tcard" style="display:block"><b style="text-align:center;margin-bottom:4px">Duelo de la semana</b><div class="duelo"><div>'+fotoDe(me.nombre)+'<br>Tú<br><b>'+fmt(a)+' km</b></div><div class="vs">contra</div><div>'+fotoDe(riv)+'<br>'+riv+'<br><b>'+fmt(b)+' km</b></div>'+res+'</div></div>'; }
/* ---------- hoguera: días seguidos abriendo el juego (05/11/2026). 9 fases, objetivo 6 meses. SQL: la-otra-comunidad-hoguera.sql ---------- */
var HFASES=[[1,'Ascuas'],[3,'Chispa'],[7,'Fuego de campamento'],[14,'Hoguera'],[30,'Gran hoguera'],[60,'Fuego de los elfos'],[90,'Almenara'],[120,'Fuego de Amon Sûl'],[180,'Llama de Anor']];
function aperturas(){ return store.get('aperturas',[]); }
function apuntaApertura(){ var a=aperturas(), h=hoyMadrid(); if(a.indexOf(h)<0){ a.push(h); a.sort(); store.set('aperturas',a.slice(-420)); }
  if(me&&!DEMO) rpc('loc_abrir',{p_dias:a.slice(-60)}).then(function(r){ if(Array.isArray(r)&&r.length){ var m=aperturas(); r.forEach(function(x){ var f=String(x.fecha||x).slice(0,10); if(m.indexOf(f)<0) m.push(f); }); m.sort(); store.set('aperturas',m.slice(-420)); hogueraHito(); } }).catch(function(){});
  hogueraHito(); }
function hoguera(){ var a={}, l=aperturas(); l.forEach(function(d){ a[d]=1; }); var n=0, perdon=-99, i, d, primero=l.length?l[0]:hoyMadrid();
  if(a[hoyMadrid()]) n++;
  for(i=1;i<420;i++){ d=hoyMadrid(-i); if(d<primero) break; if(a[d]){ n++; continue; } if(i-perdon>=7&&n>0){ perdon=i; continue; } break; }
  var f=-1; HFASES.forEach(function(x,k){ if(n>=x[0]) f=k; }); return {dias:n,fase:f,sig:HFASES[f+1]||null}; }
function hogueraImg(f,cls){ if(f<0||!M.hoguera) return ''; var fr=M.hoguera[f]; return '<img class="hogf '+(cls||'')+'" src="'+fr[0]+'" data-a="'+fr[0]+'" data-b="'+fr[1]+'" alt="">'; }
setInterval(function(){ var t=Math.floor(Date.now()/380)%2; document.querySelectorAll('img.hogf').forEach(function(im){ var u=t?im.dataset.b:im.dataset.a; if(im.getAttribute('src')!==u) im.setAttribute('src',u); }); },380);
function hogueraHito(){ var H=hoguera(), mx=store.get('hogueraMax',-1); if(H.fase>mx){ store.set('hogueraMax',H.fase); if(mx>=0||H.fase>0) miAviso(hogueraImg(H.fase,'mini')+'<div><b>¡Tu hoguera crece! '+HFASES[H.fase][1]+'</b>'+H.dias+' días seguidos de viaje. '+(H.sig?'Siguiente: '+H.sig[1]+' a los '+H.sig[0]+' días.':'Has llegado a la llama más grande.')+'</div>',7000); }
  hogueraHud(); }
function hogueraHtml(){ var H=hoguera(), f=H.fase, prev=f>=0?HFASES[f][0]:0, pc=H.sig?Math.min(100,(H.dias-prev)/(H.sig[0]-prev)*100):100;
  return '<div class="tcard hogc">'+(f>=0?hogueraImg(f,'grande'):'<div class="grande"></div>')+'<div style="flex:1"><b>'+(f>=0?HFASES[f][1]:'Hoguera apagada')+' · '+H.dias+' '+(H.dias===1?'día':'días')+' seguidos</b>'+
    (H.sig?'Próximo hito: <b style="display:inline">'+H.sig[1]+'</b> a los '+H.sig[0]+' días (faltan '+(H.sig[0]-H.dias)+').':'¡La Llama de Anor! Has llegado al final.')+
    '<div class="rbar" style="height:22px;margin:6px 0 2px"><i style="width:'+(pc*.91).toFixed(1)+'%"></i></div><span style="font-size:.78rem">Abre el juego cada día para avivarla. Si fallas un día, Sam la reaviva (una vez por semana).</span></div></div>'; }
function hogueraHud(){ var w=$('wx'); if(!w) return; var H=hoguera(), o=w.querySelector('.hogw'); if(o) o.remove(); if(H.fase<0) return;
  var s=document.createElement('span'); s.className='hogw'; s.innerHTML=hogueraImg(H.fase,'hud')+H.dias+' · '; w.insertBefore(s,w.firstChild); }
setInterval(hogueraHud,6000);
(function(){ var c=document.createElement('style'); c.textContent='.hogc{align-items:flex-end}.hogc .grande,.hogc img.grande{width:84px;height:168px;object-fit:contain;object-position:bottom;flex:none}'+
  '.tAviso img.hogf.mini{width:42px;height:84px;object-fit:contain;object-position:bottom}#wx img.hogf.hud{width:12px;height:24px;object-fit:contain;object-position:bottom;vertical-align:-6px;margin-right:2px}'+
  '.hogz{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;align-items:end}.hogz div{text-align:center;font-size:.66rem;font-weight:700}.hogz img{width:100%;height:auto;aspect-ratio:1/2;object-fit:contain;object-position:bottom}.hogz .no img{filter:brightness(0) opacity(.25)}';
  document.head.appendChild(c); })();
(function(){ var _z=TABS.zurron; TABS.zurron=function(){ var mx=store.get('hogueraMax',-1);
  return _z()+'<h2 style="font-size:1.1rem;margin-top:14px">Fuegos encendidos</h2><p class="note">Cada fase de tu hoguera que alcanzas se queda aquí para siempre.</p><div class="hogz">'+
    HFASES.map(function(x,k){ var ok=k<=mx; return '<div class="'+(ok?'':'no')+'"><img src="'+(M.hoguera?M.hoguera[k][0]:'')+'" alt="">'+(ok?x[1]:x[0]+' días')+'</div>'; }).join('')+'</div>'; }; })();
(function(){ var _s=start; start=function(){ _s.apply(this,arguments); apuntaApertura(); }; })();
document.addEventListener('visibilitychange',function(){ if(!document.hidden&&me) apuntaApertura(); });
if(DEMO&&!store.get('aperturas',null)){ (function(){ var a=[]; for(var i=23;i>=0;i--) if(i!==9) a.push(hoyMadrid(-i)); store.set('aperturas',a); })(); }

/* ---------- Comunidad: reto + duelo + hoguera + Maia + carta, y los hobbits vestidos ---------- */
(function(){ var _c=TABS.comunidad; TABS.comunidad=function(){ var h=_c();
  h=h.replace(/<span class="face" style="[^"]*"><\/span><span class="t">([^<]+)<\/span>/g,function(m,n){ var p=persona(n); if(!p) return m;
    var u=(typeof hobbitVestido==='function')?hobbitVestido(p.hobbit,(me&&n===me.nombre)?eqPuesto():(TEMP.equipos[n]||[])):null;
    return u?'<span class="vest"><img src="'+u+'" alt=""></span><span class="t">'+n+'</span>':m; });
  var extra=retoHtml()+dueloHtml()+hogueraHtml()+masterListaHtml()+'<button class="primary" type="button" id="cartaDia">Carta del día para el grupo</button>';
  return h.replace('<h2>La Comunidad</h2>','<h2>La Comunidad</h2>'+extra); }; })();
(function(){ var _ot=openTab; openTab=function(tab){ _ot(tab); if(tab==='comunidad'){ var b=$('cartaDia'); if(b) b.onclick=cartaDia; } }; })();

/* ---------- cosas del camino ---------- */
(function(){ var desde=store.get('caminoDesde',null);
  setInterval(function(){ if(!me||typeof km!=='number') return; if(desde==null){ desde=km; store.set('caminoDesde',desde); }
    CAMINO.forEach(function(c){ var k='camino.'+c[1]; if(km<c[0]||store.get(k,false)) return; store.set(k,true);
      if(c[0]>desde&&M.camino&&M.camino[c[1]]) miAviso('<img src="'+M.camino[c[1]]+'" alt=""><div><b>Algo en el camino</b>'+c[2]+'</div>',6500); });
    fardosRepartir(); },2000); })();

/* ---------- fardos: uno al llegar a cada sitio, se abre andando unos km más; los del Máster, al momento ---------- */
function fardoNuevo(id,km_abre,de){ if(TEMP.fardos.some(function(f){ return f.id===id; })) return;
  var tengo=eqGanado().concat(TEMP.fardos.map(function(f){ return f.contenido; })), libres=FARDO_POOL.filter(function(k){ return tengo.indexOf(k)<0; }), pool=libres.length?libres:FARDO_POOL;
  var cont=pool[hashTxt((me&&me.nombre||'')+id)%pool.length], f={id:id,contenido:cont,km_abre:km_abre,de:de||'camino',abierto:false,soloLocal:true};
  TEMP.fardos.push(f); store.set('fardosLocal',TEMP.fardos);
  rpc('loc_paquete_dar',{p_id:id,p_contenido:cont,p_km_abre:km_abre}).then(function(){ f.soloLocal=false; store.set('fardosLocal',TEMP.fardos); }).catch(function(){});
  miAviso('<img src="'+(M.camino&&M.camino.hatillo||'')+'" alt=""><div><b>Has encontrado un fardo</b>Está bien atado. Se abrirá cuando andes '+fmt(Math.max(0,km_abre-km))+' km más.</div>',6500); }
function fardosRepartir(){ if(!me||!TEMP.listo) return; var t=tramoAt(km), d=store.get('fardosDesde',null);
  if(d==null){ store.set('fardosDesde',t); fardoNuevo('bienvenida',km+3,'camino'); return; }
  for(var i=d+1;i<=t;i++) fardoNuevo('tramo-'+i,T[i].km+6,'camino');
  TEMP.fardos.forEach(function(f){ if(!f.abierto&&km>=f.km_abre&&!store.get('fardoAviso.'+f.id,false)){ store.set('fardoAviso.'+f.id,true);
    miAviso('<img src="'+(M.camino&&M.camino.hatillo||'')+'" alt=""><div><b>'+(f.de==='master'?'Un regalo de '+MAIA:'Tu fardo ya se puede abrir')+'</b>Ábrelo en el Zurrón.</div>',6000); } }); }
function fardoAbrir(id){ var f=TEMP.fardos.filter(function(x){ return x.id===id; })[0]; if(!f||f.abierto||km<f.km_abre) return;
  f.abierto=true; store.set('fardosLocal',TEMP.fardos); rpc('loc_paquete_abrir',{p_id:id}).catch(function(){});
  var e=EQ[f.contenido]; miAviso('<div style="width:52px;height:52px;display:grid;place-items:center">'+eqIcon(f.contenido)+'</div><div><b>'+(e?e.n:f.contenido)+'</b>Lo tienes en el Vestuario para ponértelo.</div>',6000);
  openTab('zurron'); }
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-fardo]'); if(b) fardoAbrir(b.dataset.fardo); });

/* ---------- Zurrón: trofeos de la Comunidad, fardos y cosas del camino ---------- */
(function(){ var _z=TABS.zurron; TABS.zurron=function(){ var h=_z(), R=retoDatos(), cnt={};
  R.ganados.forEach(function(g){ cnt[g.t[0]]=(cnt[g.t[0]]||0)+1; });
  var tro='<h2 style="font-size:1.1rem;margin-top:14px">Trofeos de la Comunidad</h2><p class="note">Se ganan entre todos cumpliendo el reto de la semana.</p><div class="bag">'+
    TROFEOS.map(function(t){ var n=cnt[t[0]]||0; return '<div class="item'+(n?'':' no')+'" title="'+t[2]+'"><div class="box">'+(M.trofeos&&M.trofeos[t[0]]?'<img src="'+M.trofeos[t[0]]+'" alt="" style="width:72%;height:72%;object-fit:contain">':'')+'</div>'+(n?t[1]+(n>1?' ×'+n:''):'¿?')+'</div>'; }).join('')+'</div>';
  var fa=TEMP.fardos.length?'<h2 style="font-size:1.1rem;margin-top:14px">Fardos</h2><div class="fardos">'+TEMP.fardos.map(function(f){ var e=EQ[f.contenido];
      if(f.abierto) return '<div class="fardo"><div style="width:54px;height:54px;display:grid;place-items:center">'+eqIcon(f.contenido)+'</div>'+(e?e.n:'')+'</div>';
      var listo=km>=f.km_abre; return '<button type="button" class="fardo '+(listo?'listo':'cerrado')+'" data-fardo="'+f.id+'"><img src="'+(M.camino&&M.camino.hatillo||'')+'" alt="">'+(f.de==='master'?'Regalo de '+MAIA:'Fardo')+'<span style="font-weight:500">'+(listo?'¡Ábrelo!':'Faltan '+fmt(f.km_abre-km)+' km')+'</span></button>'; }).join('')+'</div>':'';
  var ca='<h2 style="font-size:1.1rem;margin-top:14px">Cosas del camino</h2><div class="bag">'+CAMINO.map(function(c){ var ok=store.get('camino.'+c[1],false)||km>=c[0];
    return '<div class="item'+(ok?'':' no')+'" title="'+(ok?c[2]:'')+'"><div class="box">'+(M.camino&&M.camino[c[1]]?'<img src="'+M.camino[c[1]]+'" alt="" style="width:78%;height:78%;object-fit:contain">':'')+'</div>'+(ok?c[2].split(/[,.]/)[0].replace(/^(Un|Una) /,''):'Km '+c[0])+'</div>'; }).join('')+'</div>';
  return h+fa+tro+ca; }; })();

/* ---------- ropa de los demás: se guarda lo que llevas puesto ---------- */
function equipoSubir(){ if(me&&!DEMO) rpc('loc_equipo_guardar',{p_equipo:eqPuesto()}).catch(function(){}); }
(function(){ var _p=eqPoner, _q=eqQuitar; eqPoner=function(){ _p.apply(this,arguments); equipoSubir(); }; eqQuitar=function(){ _q.apply(this,arguments); equipoSubir(); }; })();

/* ---------- Máster del Maia ---------- */
var MTIPOS={mensaje:['Mensaje','bendicion',1],viento:['Viento a favor','viento',1.5],tormenta:['Tormenta','tormenta',.75],descanso:['Noche de descanso','descanso',1],
  regalo:['Un regalo','regalo',1],peligro:['Peligro en el camino','peligro',1],bendicion:['Bendición','bendicion',1]};
function esMaster(){ return !!(me&&me.nombre===MASTER_NOMBRE); }
function masterParaMi(m){ return !m.para||(me&&m.para===me.nombre); }
function masterEfectoHoy(){ var hoy=hoyMadrid(), f=1, t=null; TEMP.master.forEach(function(m){ if(String(m.dia).slice(0,10)===hoy&&masterParaMi(m)&&Number(m.efecto)!==1){ f*=Number(m.efecto); t=m.tipo; } }); return {f:f,tipo:t}; }
function masterHud(){ var w=$('wx'); if(!w) return; var E=masterEfectoHoy(), old=w.querySelector('.mfxw'); if(old) old.remove(); if(E.f===1) return;
  var s=document.createElement('span'); s.className='mfxw'; s.innerHTML='<img class="mfx" src="'+M.master[MTIPOS[E.tipo]?MTIPOS[E.tipo][1]:'bendicion']+'" alt="">'+(E.f>1?'Hoy tus pasos ×'+String(E.f).replace('.',','):'Hoy tus pasos ×'+String(E.f).replace('.',','))+' · '; w.insertBefore(s,w.firstChild); }
setInterval(masterHud,5000);
function masterTexto(m){ var t=MTIPOS[m.tipo]||MTIPOS.mensaje, ef=Number(m.efecto), dia=String(m.dia).slice(0,10), cuando=dia===hoyMadrid()?'hoy':dia===hoyMadrid(1)?'mañana':dia.split('-').reverse().join('/');
  return {titulo:t[0],icono:t[1],efecto:ef!==1?'Los pasos de '+cuando+' cuentan ×'+String(ef).replace('.',',')+(m.para?' para '+m.para:' para toda la Comunidad')+'.':'',regalo:m.regalo&&EQ[m.regalo]?'Regalo: '+EQ[m.regalo].n+(m.para?' para '+m.para:' para todos')+'. Está en el Zurrón.':''}; }
function masterMostrar(){ if(!me) return; var visto=store.get('masterVisto',0), pend=TEMP.master.filter(function(m){ return Number(m.id)>visto&&masterParaMi(m); }).sort(function(a,b){ return a.id-b.id; });
  if(!pend.length||document.querySelector('.mst')) return; var m=pend[0], x=masterTexto(m), d=document.createElement('div'); d.className='mst';
  d.innerHTML='<div class="perg"><img class="emb" src="'+M.master.emblema+'" alt=""><img class="ev" src="'+M.master[x.icono]+'" alt=""><h3>'+x.titulo+'</h3>'+(m.texto?'<p>'+String(m.texto).replace(/</g,'&lt;')+'</p>':'')+
    (x.efecto?'<p><b>'+x.efecto+'</b></p>':'')+(x.regalo?'<p><b>'+x.regalo+'</b></p>':'')+'<span class="firma">— '+MAIA+'</span><button type="button">Que así sea</button></div>';
  document.body.appendChild(d); d.querySelector('button').onclick=function(){ store.set('masterVisto',Number(m.id)); d.remove(); if(m.regalo) tempCargar(); setTimeout(masterMostrar,400); }; }
function masterListaHtml(){ var l=TEMP.master.filter(masterParaMi).slice(0,4); if(!l.length) return '';
  return '<div class="tcard" style="display:block"><b style="display:flex;align-items:center;gap:8px"><img src="'+M.master.emblema+'" alt="" style="width:34px;height:34px">Mensajes de '+MAIA+'</b>'+
    l.map(function(m){ var x=masterTexto(m); return '<p style="margin:6px 0 0;font-size:.85rem"><b>'+x.titulo+'.</b> '+String(m.texto||'').replace(/</g,'&lt;')+(x.efecto?' <i>'+x.efecto+'</i>':'')+'</p>'; }).join('')+'</div>'; }
function masterPanel(){ var B=$('authBox'), tipo='mensaje';
  var nombres=(people||[]).map(function(p){ return p.nombre; }).sort();
  B.innerHTML='<div class="menu mform"><p class="hola">Máster · '+MAIA+'</p><div class="mtipos">'+Object.keys(MTIPOS).map(function(k){ return '<button type="button" data-mt="'+k+'" aria-pressed="'+(k===tipo)+'"><img src="'+M.master[MTIPOS[k][1]]+'" alt="">'+MTIPOS[k][0]+'</button>'; }).join('')+'</div>'+
    '<label>Qué les dices</label><textarea id="mTxt" maxlength="400" placeholder="Un viento del oeste empuja vuestros pasos…"></textarea>'+
    '<label>Qué día</label><select id="mDia"><option value="0">Hoy</option><option value="1">Mañana</option></select>'+
    '<label>Para quién</label><select id="mPara"><option value="">Toda la Comunidad</option>'+nombres.map(function(n){ return '<option>'+n+'</option>'; }).join('')+'</select>'+
    '<div id="mRegW" hidden><label>Qué regalo</label><select id="mReg">'+FARDO_POOL.map(function(k){ return '<option value="'+k+'">'+EQ[k].n+'</option>'; }).join('')+'</select></div>'+
    '<p class="dato" id="mInfo" style="color:#f3d9a8;font-size:.8rem"></p><button type="button" id="mEnviar">Enviar</button><button type="button" class="sec" id="mVolver">‹ Volver</button></div>';
  function pinta(){ B.querySelectorAll('[data-mt]').forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.mt===tipo)); }); $('mRegW').hidden=tipo!=='regalo';
    var f=MTIPOS[tipo][2]; $('mInfo').textContent=f!==1?'Los pasos de ese día contarán ×'+String(f).replace('.',',')+' en los km.':tipo==='regalo'?'Les llega un fardo que se abre al momento.':'Solo un mensaje: no cambia los km.'; }
  B.querySelectorAll('[data-mt]').forEach(function(b){ b.onclick=function(){ tipo=b.dataset.mt; pinta(); }; }); pinta();
  $('mVolver').onclick=function(){ menuPinta('inicio'); };
  $('mEnviar').onclick=function(){ var bt=$('mEnviar'); bt.disabled=true; bt.textContent='Enviando…';
    rpc('loc_master_enviar',{p_tipo:tipo,p_texto:$('mTxt').value,p_dia:hoyMadrid(+$('mDia').value),p_efecto:MTIPOS[tipo][2],p_para:$('mPara').value,p_regalo:tipo==='regalo'?$('mReg').value:''})
      .then(function(){ bt.textContent='Enviado'; $('mInfo').textContent='Les saldrá al abrir el juego.'; tempCargar(); setTimeout(function(){ menuPinta('inicio'); },1400); })
      .catch(function(e){ bt.disabled=false; bt.textContent='Enviar'; $('mInfo').textContent='No se ha podido: '+(e&&e.message||e)+'. ¿Está ejecutado el SQL de la temporada?'; }); }; }

/* ---------- carta del día (imagen para mandar al grupo) ---------- */
function cartaDia(){ if(!me) return; var Wc=1080, Hc=1350, c=document.createElement('canvas'); c.width=Wc; c.height=Hc; var x=c.getContext('2d');
  var bg=new Image(), lg=new Image(), hb=new Image(), H=hoguera(), R=retoDatos(), t=T[tramoAt(km)], car=0;
  function listo(){ if(++car<3) return;
    try{ var s=Math.max(Wc/bg.width,Hc/bg.height); x.imageSmoothingEnabled=false; x.drawImage(bg,(Wc-bg.width*s)/2,(Hc-bg.height*s)*.35,bg.width*s,bg.height*s); }catch(e){ x.fillStyle='#3b2b17'; x.fillRect(0,0,Wc,Hc); }
    var g=x.createLinearGradient(0,Hc*.45,0,Hc); g.addColorStop(0,'rgba(15,10,5,0)'); g.addColorStop(1,'rgba(15,10,5,.92)'); x.fillStyle=g; x.fillRect(0,0,Wc,Hc);
    try{ x.imageSmoothingEnabled=true; var lw=760; x.drawImage(lg,(Wc-lw)/2,30,lw,lw*lg.height/lg.width); }catch(e){}
    try{ x.imageSmoothingEnabled=false; x.drawImage(hb,Wc/2-53*5.2/2,Hc*.36,53*5.2,74*5.2); }catch(e){}
    x.textAlign='center'; x.fillStyle='#f6dc9a'; x.shadowColor='#000'; x.shadowBlur=8;
    x.font='700 64px Cinzel, Georgia, serif'; x.fillText(me.nombre,Wc/2,Hc*.36+74*5.2+70);
    x.font='600 40px Alegreya Sans, sans-serif'; x.fillStyle='#f3ead2'; x.fillText(t.name+' · km '+fmt(km),Wc/2,Hc*.36+74*5.2+124);
    x.font='800 58px Alegreya Sans, sans-serif'; x.fillStyle='#ffe7a8'; x.fillText(Number(stepsToday||0).toLocaleString('es-ES')+' pasos hoy',Wc/2,Hc-170);
    x.font='600 36px Alegreya Sans, sans-serif'; x.fillStyle='#f3ead2'; x.fillText('Hoguera: '+H.dias+(H.dias===1?' día':' días')+'  ·  Reto: '+fmt(R.km)+' de '+R.obj+' km',Wc/2,Hc-105);
    x.font='italic 30px Alegreya Sans, sans-serif'; x.fillStyle='rgba(243,234,210,.8)'; x.fillText(new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}),Wc/2,Hc-50);
    c.toBlob(function(bl){ var f=new File([bl],'carta-'+hoyMadrid()+'.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){ navigator.share({files:[f],title:'La Otra Comunidad'}).catch(function(){ verCarta(c); }); } else verCarta(c); },'image/png'); }
  bg.onload=bg.onerror=listo; lg.onload=lg.onerror=listo; hb.onload=hb.onerror=listo;
  try{ bg.src=cv.toDataURL(); }catch(e){ listo(); } lg.src=M.logo||'assets/logo.webp';
  var u=(typeof hobbitVestido==='function')?hobbitVestido(me.hobbit,eqPuesto(),8):null; if(u) hb.src=u; else listo(); }
function verCarta(c){ var d=document.createElement('div'); d.className='carta'; d.innerHTML='<img alt="Carta del día"><p>Mantén pulsada la imagen para guardarla o compartirla en el grupo.</p><button type="button">Cerrar</button>';
  d.querySelector('img').src=c.toDataURL('image/png'); d.querySelector('button').onclick=function(){ d.remove(); }; document.body.appendChild(d); }

/* ---------- menú principal nuevo (kit de ChatGPT) ---------- */
(function(){ var U=M.menu2; if(!U) return; var c=document.createElement('style'); c.textContent=
  '.menu button.m2big:not(.sec){border-width:0 46px;border-image:url("'+U.boton+'") 0 150 fill / 0 46px stretch;padding:20px 0;font-size:1.15rem}'+
  '.menu button.m2big:not(.sec):active{border-image-source:url("'+U.boton_on+'")}'+
  '.m2div{height:22px;background:url("'+U.divisor+'") center/contain no-repeat;margin:2px 0}'+
  '.m2red{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:16px 14px 12px;background:url("'+U.panel+'") center/100% 100% no-repeat}'+
  '.menu .m2red button{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;color:#f6dc9a;font:700 .72rem var(--body);text-shadow:0 1px 2px #000}'+
  '.menu .m2red button img{width:100%;max-width:72px;aspect-ratio:1;object-fit:contain;filter:drop-shadow(0 3px 3px rgba(0,0,0,.6))}'+
  '.menu .m2red button:active img{transform:scale(.94)}';
  document.head.appendChild(c);
  var _mp=menuPinta; menuPinta=function(pant){ _mp(pant); if(pant!=='inicio') return; var B=$('authBox'), mj=$('mJugar'); if(!mj) return;
    mj.classList.add('m2big'); var ca=$('mCuenta'); if(ca){ ca.classList.add('sec'); } var aj=$('mAjustes'); if(aj) aj.remove();
    var red=document.createElement('div'); red.innerHTML='<div class="m2div"></div><div class="m2red">'+[['mapa','Mapa'],['comunidad','Comunidad'],['zurron','Zurrón'],['ajustes','Ajustes']].map(function(b){
      return '<button type="button" data-m2="'+b[0]+'"><img src="'+U[b[0]]+'" alt="">'+b[1]+'</button>'; }).join('')+'</div>';
    mj.after(red.firstChild, red.lastChild);
    if(esMaster()){ var mb=document.createElement('button'); mb.type='button'; mb.className='sec'; mb.id='mMaster'; mb.innerHTML='<img src="'+M.master.emblema+'" alt="" style="width:26px;height:26px;vertical-align:-7px;margin-right:6px">Máster del Maia'; (ca||mj).before(mb); mb.onclick=masterPanel; }
    B.querySelectorAll('[data-m2]').forEach(function(b){ var on=U[b.dataset.m2+'_on'];
      b.onpointerdown=function(){ if(on) b.firstChild.src=on; }; b.onpointerup=b.onpointerleave=function(){ b.firstChild.src=U[b.dataset.m2]; };
      b.onclick=function(){ var k=b.dataset.m2; if(k==='ajustes'){ menuPinta('ajustes'); return; } aJugar(); setTimeout(function(){ openTab(k); },350); }; }); };
})();

/* ---------- prototipo: datos inventados para todo lo nuevo ---------- */
if(DEMO){ (function(){ var _d=demoRpc; demoRpc=function(fn,b){
  if(fn==='loc_pasos_semanas'){ var out=[], l=lunesDe(hoyMadrid()); [l,new Date(Date.parse(l)-6048e5).toISOString().slice(0,10),new Date(Date.parse(l)-12096e5).toISOString().slice(0,10)].forEach(function(s,k){
      DEMO_PEOPLE.forEach(function(p,i){ out.push({semana:s,nombre:p[0],pasos:k===0?18000+i*4100:30000+((i*7919+k*104729)%30000)}); }); }); return out; }
  if(fn==='loc_mis_dias'){ var o=[]; for(var i=20;i>=0;i--) o.push({fecha:hoyMadrid(-i),pasos:i===9?2000:i===0?store.get('demoToday',3200):6000+((i*7919)%5000)}); return o; }
  if(fn==='loc_mis_paquetes') return store.get('demoFardos',[]);
  if(fn==='loc_paquete_dar'){ var f=store.get('demoFardos',[]); if(!f.some(function(x){return x.id===b.p_id;})) f.push({id:b.p_id,contenido:b.p_contenido,km_abre:b.p_km_abre,de:'camino',abierto:false}); store.set('demoFardos',f); return null; }
  if(fn==='loc_paquete_abrir'){ var g=store.get('demoFardos',[]); g.forEach(function(x){ if(x.id===b.p_id) x.abierto=true; }); store.set('demoFardos',g); return null; }
  if(fn==='loc_equipos') return DEMO_PEOPLE.map(function(p,i){ return {nombre:p[0],equipo:[['capa_verde','sombrero'],['capa_negra','pipa'],['pant_rojo','gafas'],['capa_violeta','corona_lirios'],[],['capa_blanca','diadema'],['pant_azul','gorra_gamos'],['capa_granate','tiara'],['capa_noche','pluma_azul']][i%9]}; });
  if(fn==='loc_master_mensajes') return store.get('demoMaster',[]);
  if(fn==='loc_master_enviar'){ var m=store.get('demoMaster',[]), id=(m[0]&&m[0].id||0)+1; m.unshift({id:id,creado:new Date().toISOString(),tipo:b.p_tipo,texto:b.p_texto,dia:b.p_dia,efecto:b.p_efecto,para:b.p_para||null,regalo:b.p_regalo||null}); store.set('demoMaster',m);
    if(b.p_regalo&&(!b.p_para||(me&&b.p_para===me.nombre))){ var q=store.get('demoFardos',[]); q.push({id:'master-'+id,contenido:b.p_regalo,km_abre:0,de:'master',abierto:false}); store.set('demoFardos',q); } return id; }
  if(fn==='loc_equipo_guardar') return null;
  return _d(fn,b); }; })(); }
