/* «Seguir la canción» tipo Guitar Hero (04/11/2026). COPIA DE REFERENCIA: a Henar le encanta.
   Base para futuras versiones (Poney Pisador, Rivendel…): sacar el motor a una función con configuración. */
function jugarCancion(el,cerrar){
  var ID='cancion',TIT='Seguir la canción',PASO=60/126,VIAJE=1.1,VENTANA=.16,COLA=.34;
  var tipos='SSSSSSSSSSS'+'SDSSDSDDS'+'SSDLSLDSLDLSLDSLDLSS';
  var frec=[392,493.88,587.33,783.99],col=['#649f45','#c04b43','#dbb44d','#4a93bd'],MAX=56,FIN=VIAJE+.8+39*PASO+.85;

  function nota(){
    return mjImg('cancion_nota','<div style="width:100%;height:100%;background:#777;border:2px solid #555"></div>');
  }

  function intro(){
    var n='<span style="display:inline-block;width:24px;height:24px">'+nota()+'</span>';
    mjIntro(el,ID,TIT,
      '<p>Tom canta en su casa junto al Tornasauce y su alegre canción llena el aire.</p>'+
      '<div class="ex" style="justify-content:space-around;gap:4px">'+
      '<div>'+n+' Toca</div>'+
      '<div>'+n+n+' A la vez</div>'+
      '<div>'+n+'<span style="color:#bd9131">╱</span> Arrastra</div></div>',
      empezar,cerrar);
  }

  function empezar(){
    if(el._stop) el._stop();

    el.innerHTML=mjCabecera(TIT,'<div class="stat"><span id="canT">22 s</span></div>')+
      '<style>'+
      '@keyframes canSube{0%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-42px)}}'+
      '#canF .canPop{position:absolute;top:calc(77% - 44px);z-index:8;pointer-events:none;font:800 12px var(--body);white-space:nowrap;text-shadow:0 2px 3px #111;animation:canSube .65s ease-out forwards}'+
      '</style>'+
      '<div class="field" id="canF" style="background:#777;touch-action:none;user-select:none;-webkit-user-select:none">'+
      '<div style="position:absolute;inset:0;pointer-events:none">'+mjImg('cancion_fondo','<div style="width:100%;height:100%;background:#777"></div>')+'</div>'+
      '<div style="position:absolute;inset:0;background:rgba(15,21,15,.52);pointer-events:none"></div>'+
      '<div id="canCarriles" style="position:absolute;inset:0;display:flex;pointer-events:none"></div>'+
      '<div style="position:absolute;left:0;right:0;top:77%;height:5px;background:#f4d37e;box-shadow:0 0 9px #e2a54a;z-index:2;pointer-events:none"></div>'+
      '<div id="canNotas" style="position:absolute;inset:0;z-index:3;pointer-events:none"></div>'+
      '<div id="canHilo" style="position:absolute;height:6px;border-radius:8px;transform-origin:left center;z-index:5;pointer-events:none;display:none;box-shadow:0 0 12px #f8d78a"></div>'+
      '<div id="canBotones" style="position:absolute;inset:0;z-index:6;pointer-events:none"></div>'+
      '<div id="canCuenta" style="position:absolute;inset:0;display:grid;place-items:center;z-index:7;pointer-events:none;font:800 clamp(65px,22vw,105px) var(--title);color:#f5df9f;text-shadow:0 4px 3px #26180a,0 0 25px #dfaa48">3</div>'+
      '<div class="meter" style="z-index:9;pointer-events:none"><span id="canP">Puntos 0 / 56 · Racha 0</span><div class="b"><i id="canB" style="background:#e2a54a"></i></div></div></div>';

    var F=el.querySelector('#canF'),capa=el.querySelector('#canNotas');
    var carriles=el.querySelector('#canCarriles'),botones=el.querySelector('#canBotones');
    var reloj=el.querySelector('#canT'),marcador=el.querySelector('#canP');
    var barra=el.querySelector('#canB'),cuenta=el.querySelector('#canCuenta'),hilo=el.querySelector('#canHilo');
    var eventos=[],dedos={},brillos=[],puntos=0,racha=0;
    var inicio=performance.now()+3000,raf=0,cerrado=false,audio=null,i;

    try{
      var AC=window.AudioContext||window.webkitAudioContext;
      if(AC){
        audio=new AC();
        if(audio.state==='suspended') audio.resume();
      }
    }catch(e){audio=null;}

    function tono(f,duracion,vol,espera,final){
      if(!audio||audio.state==='closed') return;
      try{
        var t=audio.currentTime+Math.max(.005,espera||0);
        var o=audio.createOscillator(),g=audio.createGain();
        o.type='triangle';
        o.frequency.setValueAtTime(f,t);
        if(final) o.frequency.linearRampToValueAtTime(final,t+duracion);
        g.gain.setValueAtTime(.0001,t);
        g.gain.exponentialRampToValueAtTime(vol,t+.014);
        g.gain.exponentialRampToValueAtTime(.0001,t+duracion);
        o.connect(g);
        g.connect(audio.destination);
        o.start(t);
        o.stop(t+duracion+.025);
      }catch(e){}
    }

    function pieza(c,tam){
      var e=document.createElement('div');
      e.style.cssText='position:absolute;width:'+tam+'px;height:'+tam+'px;transform:translate(-50%,-50%);display:none';
      e.innerHTML=
        '<div style="position:absolute;inset:0;border:4px solid '+col[c]+';border-radius:50%;background:'+col[c]+'77;box-shadow:0 0 9px '+col[c]+'"></div>'+
        '<div style="position:absolute;inset:5px">'+nota()+'</div>';
      capa.appendChild(e);
      return e;
    }

    function enlace(){
      var e=document.createElement('div');
      e.style.cssText='position:absolute;height:7px;border-radius:4px;box-shadow:0 0 7px #eaca62;transform-origin:left center;display:none';
      capa.appendChild(e);
      return e;
    }

    for(i=0;i<4;i++){
      var v=document.createElement('div');
      v.style.cssText='width:25%;height:100%;border-right:1px solid rgba(246,237,214,.22);background:linear-gradient(180deg,transparent 0%,'+col[i]+'1c 77%,transparent 100%)';
      carriles.appendChild(v);

      var b=document.createElement('div');
      b.style.cssText=
        'position:absolute;left:'+((i+.5)*25)+'%;top:77%;width:58px;height:58px;transform:translate(-50%,-50%);'+
        'border:5px solid #231c16;border-radius:50%;'+
        'background:radial-gradient(circle at 38% 30%,#ffffff55,'+col[i]+' 58%,#231c16 100%);'+
        'box-shadow:0 3px 0 #130f0a,0 0 8px '+col[i]+';transition:transform .07s,box-shadow .07s';
      botones.appendChild(b);
      brillos.push({el:b,hasta:0,pulso:0});
    }

    for(i=0;i<tipos.length;i++){
      var a=(i*7+Math.floor(i/5))%4,tipo=tipos.charAt(i),b=-1;
      if(tipo==='D') b=(a+1+i%3)%4;
      if(tipo==='L') b=a>1?a-(1+i%2):a+(1+i%2);

      var ev={
        tipo:tipo,a:a,b:b,t:VIAJE+.8+i*PASO,
        estado:0,hecho:0,musica:false,pulsados:{},
        icono:pieza(a,50)
      };
      if(tipo!=='S'){
        ev.linea=enlace();
        ev.icono2=pieza(b,tipo==='D'?50:28);
      }
      eventos.push(ev);
    }

    function tiempo(){
      return (performance.now()-inicio)/1000;
    }

    function carril(e){
      var r=F.getBoundingClientRect();
      return Math.max(0,Math.min(3,Math.floor((e.clientX-r.left)/r.width*4)));
    }

    function enBoton(e){
      var r=F.getBoundingClientRect();
      return Math.abs(e.clientY-r.top-r.height*.77)<=Math.max(48,r.height*.095);
    }

    function flash(c){
      brillos[c].hasta=performance.now()+190;
    }

    function pop(c,t,ok){
      var p=document.createElement('span');
      p.className='canPop';
      p.textContent=t;
      p.style.left=((c+.5)*25)+'%';
      p.style.color=ok?'#fff2b2':'#b9bac0';
      F.appendChild(p);
      p.onanimationend=function(){
        if(p.parentNode) p.parentNode.removeChild(p);
      };
    }

    function juicio(d){
      return Math.abs(d)<=.06?'¡Perfecto!':'¡Bien!';
    }

    function sumar(n){
      puntos+=n;
      racha+=n;
      marcador.textContent='Puntos '+puntos+' / '+MAX+' · Racha '+racha;
      barra.style.width=(100*puntos/MAX)+'%';
      if(typeof blip==='function') blip();
    }

    function ocultar(v){
      v.icono.style.display='none';
      if(v.icono2) v.icono2.style.display='none';
      if(v.linea) v.linea.style.display='none';
    }

    function fallo(v,t){
      if(v.estado) return;
      v.estado=2;
      v.fallo=t;
      racha=0;
      marcador.textContent='Puntos '+puntos+' / '+MAX+' · Racha 0';
      v.icono.style.filter='grayscale(1) brightness(.6)';
      if(v.icono2) v.icono2.style.filter='grayscale(1) brightness(.6)';
      if(v.linea) v.linea.style.filter='grayscale(1)';

      if(v.tipo==='D'){
        pop(v.a,'Fallo',false);
        pop(v.b,'Fallo',false);
      }else{
        pop(v.tipo==='L'&&v.hecho?v.b:v.a,'Fallo',false);
      }
      if(v.tipo==='L') hilo.style.display='none';
    }

    function acierto(v,n){
      v.estado=1;
      ocultar(v);
      sumar(n);
      flash(v.a);
      if(v.b>=0) flash(v.b);
      hilo.style.display='none';
    }

    function moverHilo(v,e){
      var r=F.getBoundingClientRect();
      var x1=(v.a+.5)*r.width/4,y1=.77*r.height;
      var x2=e.clientX-r.left,y2=e.clientY-r.top;
      var dx=x2-x1,dy=y2-y1;

      hilo.style.left=x1+'px';
      hilo.style.top=y1+'px';
      hilo.style.width=Math.sqrt(dx*dx+dy*dy)+'px';
      hilo.style.transform='rotate('+Math.atan2(dy,dx)*180/Math.PI+'deg)';
      hilo.style.background='linear-gradient(90deg,'+col[v.a]+','+col[v.b]+')';
      hilo.style.display='block';
    }

    F.onpointerdown=function(e){
      if(cerrado||tiempo()<0) return;
      e.preventDefault();
      if(!enBoton(e)) return;

      var c=carril(e),t=tiempo(),v=null,dist=VENTANA+.001,j,d,q;
      dedos[e.pointerId]={c:c,ev:null};
      brillos[c].pulso=performance.now()+110;

      try{F.setPointerCapture(e.pointerId);}catch(err){}

      for(j=0;j<eventos.length;j++){
        q=eventos[j];
        if(q.estado||(q.tipo==='L'?(q.a!==c||q.hecho):(q.a!==c&&q.b!==c))) continue;
        d=Math.abs(t-q.t);
        if(d<=VENTANA&&d<dist){
          v=q;
          dist=d;
        }
      }

      if(!v) return;

      if(v.tipo==='S'){
        pop(c,juicio(t-v.t),true);
        acierto(v,1);
        return;
      }

      if(v.tipo==='L'){
        v.hecho=1;
        v.dedo=e.pointerId;
        dedos[e.pointerId].ev=v;
        sumar(1);
        flash(c);
        pop(c,juicio(t-v.t),true);
        moverHilo(v,e);
        return;
      }

      if(v.pulsados[c]) return;
      v.pulsados[c]={id:e.pointerId,t:t};
      dedos[e.pointerId].ev=v;
      dedos[e.pointerId].hitLane=c;

      var p1=v.pulsados[v.a],p2=v.pulsados[v.b];

      if(p1&&p2&&p1.id!==p2.id&&Math.abs(p1.t-p2.t)<=VENTANA){
        pop(v.a,juicio(p1.t-v.t),true);
        pop(v.b,juicio(p2.t-v.t),true);
        acierto(v,2);
      }
    };

    function completarArrastre(p,e){
      var v=p.ev;
      if(!v||v.tipo!=='L'||!v.hecho||v.estado||v.dedo!==e.pointerId) return false;

      if(carril(e)===v.b&&tiempo()<=v.t+COLA){
        pop(v.b,'¡Bien!',true);
        tono(frec[v.b],.16,.055);
        acierto(v,1);
        return true;
      }
      return false;
    }

    F.onpointermove=function(e){
      var p=dedos[e.pointerId];
      if(!p||cerrado) return;
      e.preventDefault();
      p.c=carril(e);

      if(p.ev&&p.ev.tipo==='L'&&!p.ev.estado){
        moverHilo(p.ev,e);
        completarArrastre(p,e);
      }
    };

    function soltar(e){
      var p=dedos[e.pointerId];
      if(!p) return;
      var v=p.ev;

      if(v&&!v.estado){
        if(v.tipo==='L'&&v.dedo===e.pointerId){
          if(e.type==='pointerup') completarArrastre(p,e);
          if(!v.estado) fallo(v,tiempo());
        }else if(v.tipo==='D'&&v.pulsados[p.hitLane]&&v.pulsados[p.hitLane].id===e.pointerId){
          delete v.pulsados[p.hitLane];
        }
      }
      delete dedos[e.pointerId];
    }

    F.onpointerup=soltar;
    F.onpointercancel=soltar;
    F.onlostpointercapture=soltar;

    function posicionar(e,c,y){
      e.style.left=((c+.5)*25)+'%';
      e.style.top=y+'%';
      e.style.display='block';
    }

    function dibujar(v,t){
      if(v.estado===1){
        ocultar(v);
        return;
      }
      if(v.estado===2&&t>v.fallo+.28){
        ocultar(v);
        return;
      }

      var resto=v.t-t,y=77-resto/VIAJE*68,y2=y;

      if(v.tipo==='L'){
        if(v.hecho){
          y=77;
          y2=77-((v.t+COLA-t)/VIAJE)*68;
        }else{
          y2=y-COLA/VIAJE*68;
        }
      }

      if(v.estado!==2&&resto>VIAJE){
        ocultar(v);
        return;
      }
      if(y>115||y< -25){
        ocultar(v);
        return;
      }

      posicionar(v.icono,v.a,y);
      if(v.icono2) posicionar(v.icono2,v.b,y2);

      if(v.linea){
        var x1=(v.a+.5)*F.clientWidth/4,x2=(v.b+.5)*F.clientWidth/4;
        var yy1=y*F.clientHeight/100,yy2=y2*F.clientHeight/100;
        var dx=x2-x1,dy=yy2-yy1;

        v.linea.style.left=x1+'px';
        v.linea.style.top=yy1+'px';
        v.linea.style.width=Math.sqrt(dx*dx+dy*dy)+'px';
        v.linea.style.transform='rotate('+Math.atan2(dy,dx)*180/Math.PI+'deg)';
        v.linea.style.background=v.tipo==='D'?
          'linear-gradient(90deg,#bd902f,#fae1a0,#bd902f)':
          'linear-gradient(90deg,'+col[v.a]+','+col[v.b]+')';
        v.linea.style.display='block';
      }
    }

    function limpiar(){
      if(cerrado) return;
      cerrado=true;
      cancelAnimationFrame(raf);
      F.onpointerdown=null;
      F.onpointermove=null;
      F.onpointerup=null;
      F.onpointercancel=null;
      F.onlostpointercapture=null;

      if(audio){
        try{audio.close();}catch(e){}
        audio=null;
      }
    }

    function terminar(){
      if(cerrado) return;
      var p=puntos/MAX;
      var st=p>=.85?3:p>=.60?2:p>=.35?1:0;
      var frases=[
        'La melodía se dispersa por el bosque y apenas consigues seguirla.',
        'Algunas notas se escapan, pero la canción sigue viva en tus pasos.',
        'Tu ritmo acompaña la alegría de la casa hasta el último compás.',
        'Cada nota encaja a la perfección. La música ilumina el camino.'
      ];

      limpiar();
      mjFin(el,ID,TIT,st,frases[st],empezar,cerrar);
    }

    function tick(ahora){
      if(cerrado) return;

      var t=(ahora-inicio)/1000,j,v,resto;
      var listos=[0,0,0,0],pres=[0,0,0,0];

      reloj.textContent=Math.max(0,Math.ceil(FIN-Math.max(0,t)))+' s';

      if(t<0){
        cuenta.textContent=Math.ceil(-t);
        raf=requestAnimationFrame(tick);
        return;
      }

      cuenta.style.display='none';

      for(j=0;j<eventos.length;j++){
        v=eventos[j];
        resto=v.t-t;

        if(!v.musica&&resto<=.13&&resto>-.12){
          v.musica=true;
          var espera=Math.max(.005,resto);

          if(v.tipo==='D'){
            tono(frec[v.a],.25,.044,espera);
            tono(frec[v.b],.25,.036,espera);
          }else if(v.tipo==='L'){
            tono(frec[v.a],COLA,.055,espera,frec[v.b]);
          }else{
            tono(frec[v.a],.22,.05,espera);
          }

          if(j%4===0) tono(196,.25,.014,espera);
        }

        if(!v.estado&&((v.tipo==='L'&&v.hecho)?t>v.t+COLA:t>v.t+VENTANA)){
          fallo(v,t);
        }

        if(!v.estado&&Math.abs(resto)<=VENTANA){
          if(v.tipo!=='L'||!v.hecho) listos[v.a]=1;
          if(v.tipo==='D') listos[v.b]=1;
        }
        if(!v.estado&&v.tipo==='L'&&v.hecho) listos[v.b]=1;

        dibujar(v,t);
      }

      for(j in dedos){
        if(dedos.hasOwnProperty(j)) pres[dedos[j].c]=1;
      }

      for(j=0;j<4;j++){
        var listo=listos[j];
        var pr=pres[j]||brillos[j].pulso>ahora;
        var dest=brillos[j].hasta>ahora;
        var enRacha=racha>=10;
        var b=brillos[j].el;

        b.style.transform='translate(-50%,-50%) scale('+(pr?.9:listo?1.12:1)+')';
        b.style.boxShadow='0 3px 0 #130f0a,0 0 '+(pr||listo||dest||enRacha?25:8)+'px '+col[j]+(listo?',0 0 0 4px #fff0b8':'');
        b.style.borderColor=listo?'#ffebaf':'#231c16';
      }

      if(t>=FIN){
        terminar();
        return;
      }
      raf=requestAnimationFrame(tick);
    }

    el._stop=limpiar;
    raf=requestAnimationFrame(tick);
  }

  intro();
}

MINI.cancion={titulo:'Seguir la canción',tramo:11,jugar:jugarCancion};
