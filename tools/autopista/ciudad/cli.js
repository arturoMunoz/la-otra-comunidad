/* ---------- LA CIUDAD: cómo se dibuja (22/11) ----------
   Suelo horneado con calles, aceras, autopistas, solares de las bestias, la glorieta, el colector de Nasor y la central del lagarto.
   Edificios CC0 de Kenney (City Kit Commercial 2.1 e Industrial 1.0, juntos en modelos/ap_ciudad.glb): cada manzana se llena de edificios
   del tamaño justo, bajos cerca de las autopistas y dentro del barrio (la cámara mira desde arriba: nada debe tapar la pelea) y más altos
   cuanto más lejos; alrededor, rascacielos de fondo. Todo en InstancedMesh (pocas llamadas de dibujo) y con el tramado que deshace lo que
   tapa a tu héroe. */
const CIU_SKY = [];
/* luz de atardecer en la ciudad (sol bajo y anaranjado, cielo azulado, bruma cálida que funde los rascacielos); el Duelo vuelve a la de día */
let AMB0 = null;
function ambienteMapa(ciudad) {
  const hemi = scene.children.find((q) => q.isHemisphereLight);
  if (!AMB0) AMB0 = {bg: scene.background.clone(), fc: scene.fog.color.clone(), fn: scene.fog.near, ff: scene.fog.far, sc: sol.color.clone(), si: sol.intensity, hs: hemi.color.clone(), hg: hemi.groundColor.clone(), hi: hemi.intensity};
  if (!ciudad) {scene.background.copy(AMB0.bg); scene.fog.color.copy(AMB0.fc); scene.fog.near = AMB0.fn; scene.fog.far = AMB0.ff; sol.color.copy(AMB0.sc); sol.intensity = AMB0.si; hemi.color.copy(AMB0.hs); hemi.groundColor.copy(AMB0.hg); hemi.intensity = AMB0.hi; return;}
  scene.background.set('#c9a890'); scene.fog.color.set('#c9a890'); scene.fog.near = 55; scene.fog.far = 165;
  sol.color.set('#ffc98a'); sol.intensity = 2.45; hemi.color.set('#a9bde6'); hemi.groundColor.set('#3a3040'); hemi.intensity = 1.55;
}
function construyeCiudad(scene_) {
  const tH = cargaTex('texturas/campo.webp', true), tB = cargaTex('../batalla/texturas/ap_asfalto.webp', true), tC = cargaTex('../batalla/texturas/ap_hormigon.webp', true);
  const v2 = (L) => L.map((p) => new THREE.Vector2(p.x, p.z));
  const BX = MAPA.ancho + 14, BZ = MAPA.largo + 12;
  const R4 = RECTS.filter((r) => !r[4]).map((r) => new THREE.Vector4(r[0], r[1], r[2], r[3])); while (R4.length < 40) R4.push(new THREE.Vector4(999, 999, 999, 999));
  const C3 = CAMPOS.filter((c) => !NEUTRO[c.tipo].pasiva && !NEUTRO[c.tipo].jefe && !NEUTRO[c.tipo].draco).map((c) => new THREE.Vector3(c.x, c.z, NEUTRO[c.tipo].grande ? 3.9 : 3.1)); while (C3.length < 12) C3.push(new THREE.Vector3(999, 999, 0));
  const bakeU = {tH: {value: tH}, tB: {value: tB}, tC: {value: tC}, uA: {value: v2(CARRILES[0])}, uB: {value: v2(CARRILES[1])}, uR: {value: R4}, uC: {value: C3},
    uPit: {value: new THREE.Vector2(PIT.x, PIT.z)}, uPit2: {value: new THREE.Vector2(PIT2.x, PIT2.z)},
    uF: {value: [new THREE.Vector2(BASES[0].nexo.x, BASES[0].nexo.z), new THREE.Vector2(BASES[1].nexo.x, BASES[1].nexo.z)]}};
  const bakeM = new THREE.ShaderMaterial({uniforms: bakeU, depthTest: false, depthWrite: false,
    vertexShader: `varying vec3 vWP; void main(){vWP=(modelMatrix*vec4(position,1.)).xyz; gl_Position=vec4(uv*2.-1.,0.,1.);}`,
    fragmentShader: `varying vec3 vWP;
      uniform sampler2D tH,tB,tC; uniform vec2 uA[7]; uniform vec2 uB[7]; uniform vec2 uF[2]; uniform vec4 uR[40]; uniform vec3 uC[12]; uniform vec2 uPit, uPit2;
      ${GLSL_RUIDO}
      float dSeg(vec2 p,vec2 a,vec2 b){vec2 v=b-a;float t=clamp(dot(p-a,v)/dot(v,v),0.,1.);return length(p-a-v*t);}
      float dCar(vec2 p){float d=1e3;for(int i=0;i<6;i++){d=min(d,dSeg(p,uA[i],uA[i+1]));d=min(d,dSeg(p,uB[i],uB[i+1]));}return d;}
      float dRect(vec2 p,vec4 r){vec2 q=max(r.xy-p,p-r.zw);return length(max(q,0.))+min(max(q.x,q.y),0.);}
      void main(){
      vec2 w=vWP.xz; vec2 rw=mat2(.8,-.6,.6,.8)*w;
      float n1=fbm(w*.08+3.), n2=fbm(w*.6), gast=.55+.45*smoothstep(.25,.6,fbm(w*1.3));
      vec3 asf=mix(texture2D(tB,w*.09).rgb,texture2D(tB,rw*.041+.5).rgb,.45);
      vec3 hor=mix(texture2D(tC,w*.16).rgb,texture2D(tC,rw*.07+.3).rgb,.4);
      float dR=1e3; for(int i=0;i<40;i++) dR=min(dR,dRect(w,uR[i]));
      float dc=dCar(w);
      /* calles del barrio: asfalto gastado, con manchas y parches */
      vec3 col=asf*mix(.74,.92,n1)*vec3(.97,.98,1.02);
      col=mix(col,col*.82,smoothstep(.62,.8,fbm(w*.35+11.))*.7);
      /* aceras: 1,5 m de baldosa alrededor de cada manzana y bordillo */
      float acera=1.-smoothstep(1.35,1.5,dR);
      vec2 bq=abs(fract(w*.9)-.5);
      vec3 bald=hor*1.08*(1.-.16*step(.46,max(bq.x,bq.y)));
      col=mix(col,bald,acera);
      col=mix(col,vec3(.8,.79,.75),(1.-smoothstep(.0,.13,abs(dR-1.45)))*.85);
      /* la avenida: discontinua blanca en el centro */
      col=mix(col,vec3(.88,.87,.82),(1.-smoothstep(.05,.1,abs(w.y)))*step(.5,fract(w.x/3.))*step(abs(w.x),11.)*step(6.,length(w))*gast);
      /* solares de las bestias: tierra pisada y hierba seca */
      for(int i=0;i<12;i++){vec3 c=uC[i]; vec2 q=abs(w-c.xy); float d=length(max(q-vec2(c.z-1.2),0.))-1.2+min(max(q.x-c.z+1.2,q.y-c.z+1.2),0.);
        float k=1.-smoothstep(-.06,.06,d);
        float gr=vn(w*7.)*.5+vn(w*17.)*.5;
        vec3 tierra=mix(vec3(.25,.22,.18),vec3(.34,.3,.24),fbm(w*.35))*(.8+.32*gr);
        vec3 hs=texture2D(tH,w*.16).rgb*vec3(.62,.66,.45);
        vec3 sol=mix(tierra,hs,smoothstep(.55,.75,fbm(w*.3+7.))*.6);
        /* los grandes (toro y coloso) en un aparcamiento: asfalto con sus plazas pintadas y manchas de aceite */
        if(c.z>3.5){vec2 pq=w-c.xy; float pl=(1.-smoothstep(.04,.08,abs(fract(pq.x/2.5+.5)-.5)*2.5))*step(1.3,abs(pq.y))*step(abs(pq.y),c.z-.4);
          vec3 ap=asf*mix(.82,.95,n2); ap=mix(ap,ap*.55,smoothstep(.7,.85,fbm(w*.8+4.))*.7); sol=mix(ap,vec3(.85,.85,.8),pl*gast);}
        col=mix(col,sol,k); col=mix(col,vec3(.62,.61,.57),(1.-smoothstep(.0,.14,abs(d)))*.9);}
      /* la glorieta: isleta de césped con bordillo y su línea */
      float dg=length(w);
      col=mix(col,texture2D(tH,w*.2).rgb*vec3(1.05,1.3,.8),1.-smoothstep(2.3,2.45,dg));
      col=mix(col,vec3(.8,.79,.74),(1.-smoothstep(2.45,2.8,dg))*smoothstep(2.3,2.45,dg));
      col=mix(col,vec3(.88,.87,.82),(1.-smoothstep(.06,.12,abs(dg-5.4)))*.75*step(.4,fract(atan(w.y,w.x)*2.5))*gast);
      /* autopistas: calzada de 8 m, bordillo, líneas y pasos de cebra donde cruza la avenida */
      float roadO=1.-smoothstep(4.,4.2,dc), arc=1.-smoothstep(4.2,4.55,dc);
      vec3 asfA=mix(texture2D(tB,w*.075).rgb,texture2D(tB,rw*.037+.5).rgb,.4)*1.05;
      col=mix(col,vec3(.8,.79,.75)*mix(.85,1.,n2),arc*(1.-roadO)); col=mix(col,asfA,roadO);
      col=mix(col,vec3(.88,.87,.82),(1.-smoothstep(.07,.13,abs(dc-3.55)))*roadO*gast);
      col=mix(col,vec3(.9,.68,.16),(1.-smoothstep(.05,.09,abs(dc-.16)))*roadO*gast);
      col=mix(col,vec3(.88,.87,.82),(1.-smoothstep(.05,.09,abs(dc-1.85)))*step(.5,fract(w.y/5.))*roadO*gast*step(5.,abs(w.y)));
      float zeb=step(2.4,abs(w.y))*(1.-step(4.2,abs(w.y)))*step(.5,fract(w.x*1.15))*roadO;
      col=mix(col,vec3(.9,.9,.86),zeb*gast*.92);
      /* bases: plaza de hormigón */
      /* bases: la plaza del peaje, de hormigón en losas grandes, con bordillo (entre las dos autopistas que llegan) */
      {vec2 q=vec2(abs(w.x),abs(w.y)); float dB=max(q.x-14.,40.6-q.y); float k=1.-smoothstep(-.05,.05,dB);
       vec2 lq=abs(fract(w/2.4)-.5); vec3 losa=hor*.86*(1.-.1*step(.47,max(lq.x,lq.y)));
       col=mix(col,losa,k*(1.-roadO)); col=mix(col,vec3(.8,.79,.75),(1.-smoothstep(.0,.14,abs(dB)))*(1.-roadO)*.85);}
      /* el colector de Nasor: hormigón oscuro y mojado con rejillas; la central: hormigón con banda amarilla y negra */
      /* el colector de Nasor: explanada de hormigón mojado, canal central hasta la boca del tubo y rejilla grande */
      {vec2 p=w-uPit; float dB=max(abs(p.y)-5.,max(-p.x-6.4,p.x-5.6)); float k=1.-smoothstep(-.05,.05,dB);
       vec3 moj=hor*vec3(.42,.47,.5); moj=mix(moj,moj*.62,smoothstep(.45,.75,fbm(w*.35+2.)));
       col=mix(col,moj,k);
       float canal=(1.-smoothstep(.65,.75,abs(p.y)))*step(-6.4,p.x)*step(p.x,-1.2);
       col=mix(col,vec3(.1,.17,.2),canal*k);
       vec2 g=abs(p); float rej=step(max(g.x,g.y),1.9)*max(step(fract(p.x*2.5),.22),step(fract(p.y*2.5),.22));
       col=mix(col,vec3(.04,.05,.06),rej); col=mix(col,vec3(.62,.64,.66),(1.-smoothstep(.0,.12,abs(max(g.x,g.y)-1.95)))*.9);
       col=mix(col,vec3(.8,.79,.75),(1.-smoothstep(.0,.14,abs(dB)))*.8);}
      /* la central del lagarto: hormigón industrial con la banda amarilla y negra de peligro */
      {vec2 p=w-uPit2; float dB=max(abs(p.y)-5.,max(p.x-6.4,-p.x-5.6)); float k=1.-smoothstep(-.05,.05,dB);
       col=mix(col,hor*vec3(.66,.64,.58),k);
       float an=(1.-smoothstep(.0,.05,abs(dB+.45)-.35));
       col=mix(col,mix(vec3(.07,.07,.07),vec3(.95,.72,.08),step(.5,fract((w.x+w.y)*.7))),an*k);}
      gl_FragColor=vec4(col,1.);
      #include <colorspace_fragment>
      }`});
  const gB = new THREE.PlaneGeometry(BX * 2, BZ * 2, 1, 1); gB.rotateX(-Math.PI / 2);
  const listoTex = () => [tH, tB, tC].every((t) => t.image && t.image.complete !== false && t.image.width);
  const RES = 2048, rt = new THREE.WebGLRenderTarget(RES, RES, {colorSpace: THREE.SRGBColorSpace, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, anisotropy: 4});
  if (SUELO_RT) SUELO_RT.dispose(); SUELO_RT = rt;
  const hornea = () => {const sc = new THREE.Scene(), q = new THREE.Mesh(gB, bakeM); sc.add(q); const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); const prev = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.render(sc, cam); renderer.setRenderTarget(prev); bakeM.dispose();};
  (function espera() {if (listoTex()) hornea(); else setTimeout(espera, 60);})();
  const m = new THREE.MeshLambertMaterial({map: rt.texture});
  m.onBeforeCompile = (sh) => {sh.uniforms.tB = {value: tB}; sh.uniforms.tNie = {value: NIEBLA_TEX};
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vWD;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWD=(modelMatrix*vec4(transformed,1.)).xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vWD; uniform sampler2D tB,tNie;').replace('#include <map_fragment>', '#include <map_fragment>\nvec3 dt=texture2D(tB,vWD*.5).rgb; diffuseColor.rgb*=clamp(.78+dot(dt,vec3(.3,.6,.1))*.5,.9,1.08); diffuseColor.rgb*=1.-.58*texture2D(tNie,vec2((vWD.x+32.)/64.,1.-(vWD.y+70.)/140.)).a;');};
  const suelo = new THREE.Mesh(gB, m); suelo.receiveShadow = true; scene_.add(suelo);
  /* fuera de la zona horneada: hormigón oscuro bajo los rascacielos */
  const g = new THREE.PlaneGeometry(260, 300, 1, 1); g.rotateX(-Math.PI / 2);
  const tF = tC.clone(); tF.source = tC.source; tF.repeat.set(40, 46); tF.wrapS = tF.wrapT = THREE.RepeatWrapping;
  const fuera_ = new THREE.Mesh(g, new THREE.MeshLambertMaterial({map: tF, color: '#7d828a'})); fuera_.position.y = -0.03; fuera_.receiveShadow = true; scene_.add(fuera_);
  const semilla = {v: 11}; const al = () => {semilla.v = (semilla.v * 16807) % 2147483647; return semilla.v / 2147483647;};
  /* zócalo de hormigón de cada manzana: se lee como sólida aunque entre dos edificios quede un hueco */
  const tZ = tC.clone(); tZ.source = tC.source; tZ.repeat.set(1, 1); tZ.wrapS = tZ.wrapT = THREE.RepeatWrapping;
  const mZ = new THREE.MeshLambertMaterial({map: tZ, color: '#9aa0a8'}); 
  for (const r of RECTS) {if (r[4]) continue; const w = r[2] - r[0], d = r[3] - r[1]; if (Math.abs(r[0]) > 60) continue; const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, d), mZ); b.position.set((r[0] + r[2]) / 2, 0.16, (r[1] + r[3]) / 2); b.receiveShadow = true; b.castShadow = false;
    const uv = b.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 3, uv.getY(i) * d / 3); scene_.add(b);}
  /* matorrales (la hierba alta de las calles: zarzas que han crecido entre el asfalto) */
  const matas = {}, mata = (n, x, z, s) => (matas[n] = matas[n] || []).push({x, z, ry: al() * 6.28, s});
  for (const b of HIERBAS) for (let i = 0; i < 8; i++) {const a = al() * 6.28, d = Math.sqrt(al()) * b.r * 0.8; mata(['adelfa_1', 'adelfa_2'][i % 2], b.x + Math.cos(a) * d, b.z + Math.sin(a) * d, 1.05 + al() * 0.35);}
  for (const n in matas) instancias('ap_vegetacion', n, matas[n], true);
  for (const eq of [0, 1]) {const b = BASES[eq], s = signo(eq); for (const [dx, dz] of [[4, -4], [-4, -4]]) luzFuego(b.fuente.x + dx * s, b.fuente.z + dz * s);}
  edificiosCiudad(al);
  decoradoCiudad(al);
  {const bb = new THREE.Box3(); MAPA_G.updateMatrixWorld(true); MAPA_G.traverse((q) => {if (!q.isMesh || q.isInstancedMesh || q.isSkinnedMesh || !q.castShadow) return; bb.setFromObject(q); if (bb.max.y - Math.max(0, bb.min.y) < 2.2) q.castShadow = false;});}
  fusiona(MAPA_G);
  tapaArboles();
  vidaMapa(scene_);
}
/* lo que mide cada edificio del kit (sin escalar) */
let CIU_INFO = null;
function infoCiudad() {
  if (CIU_INFO) return CIU_INFO; CIU_INFO = {}; const raiz = M.ap_ciudad.scene; raiz.updateMatrixWorld(true);
  for (const o of raiz.children) {const b = new THREE.Box3().setFromObject(o); CIU_INFO[o.name] = {w: b.max.x - b.min.x, d: b.max.z - b.min.z, h: b.max.y - b.min.y, cx: (b.max.x + b.min.x) / 2 - o.position.x, cz: (b.max.z + b.min.z) / 2 - o.position.z, y0: b.min.y - o.position.y};}
  return CIU_INFO;
}
const CIU_BAJOS = ['i_h', 'i_i', 'i_j', 'i_k', 'i_o', 'i_p', 'i_q', 'i_s', 'c_c', 'c_e', 'i_t', 'i_g', 'i_d', 'c_k'];
const CIU_MEDIOS = ['c_a', 'c_b', 'c_d', 'c_h', 'c_j', 'i_a', 'i_b', 'i_c', 'i_e', 'i_l', 'i_r', 'c_i', 'c_f', 'c_g', 'i_f', 'i_m', 'i_n', 'c_l', 'c_n', 'c_m'];
const CIU_ALTOS = ['c_skyscraper_a', 'c_skyscraper_b', 'c_skyscraper_c', 'c_skyscraper_d', 'c_skyscraper_e', 'c_l', 'c_m', 'c_n'];
const CIU_FONDO = ['c_ld_a', 'c_ld_b', 'c_ld_c', 'c_ld_d', 'c_ld_e', 'c_ld_f', 'c_ld_g', 'c_ld_h', 'c_ld_i', 'c_ld_j', 'c_ld_k', 'c_ld_l', 'c_ld_m', 'c_ld_wide_a', 'c_ld_wide_b', 'c_skyscraper_b', 'c_skyscraper_d'];
function edificiosCiudad(al) {
  const G = MAPA_G;
  if (!M.ap_ciudad) {const t = setInterval(() => {if (MAPA_G !== G) clearInterval(t); else if (M.ap_ciudad) {clearInterval(t); edificiosCiudad(al); tapaArboles(); for (const im of BOSQUE) if (im.userData.ciudad) im.visible = true; cullBosque(camM.x, camM.z, true);}}, 300); return;}
  const I = infoCiudad(), lista = {}, pon = (n, x, z, ry, s, y = 0.32, sx = s, sy = s, sz = s) => {const k = I[n], c = Math.cos(ry), sn = Math.sin(ry), ox = k.cx * sx * c + k.cz * sz * sn, oz = -k.cx * sx * sn + k.cz * sz * c; (lista[n] = lista[n] || []).push({x: x - ox, z: z - oz, y: y - k.y0 * sy, ry, s, sx, sy, sz});};
  /* cuánto puede medir un edificio en (x, z): la cámara mira desde arriba a ~51°; junto a las autopistas y en el barrio, bajos */
  const tope = (x, z) => {const dc = distCarril(x, z); if (Math.abs(x) < 14 && Math.abs(z) < 37) return 5.4; return dc < 9 ? 5 : Math.min(26, 5 + (dc - 9) * 1.15);};
  /* manzanas de fuera: una franja de 2,4 m mirando a la autopista con árboles y coches aparcados; los edificios, detrás */
  const verde = {}, coches = [];
  for (const r0 of RECTS) {
    if (r0[4]) continue; let r = r0;
    if (Math.abs(r0[0] + r0[2]) / 2 > 20 && r0[2] - r0[0] > 8) {
      const este = r0[0] > 0, xb = este ? r0[0] + 1.2 : r0[2] - 1.2; r = este ? [r0[0] + 2.4, r0[1], r0[2], r0[3]] : [r0[0], r0[1], r0[2] - 2.4, r0[3]];
      for (let z = r0[1] + 2.5; z < r0[3] - 1.5; z += 4.6) {const n = al() < 0.55 ? 'eucalipto_' + (1 + Math.floor(al() * 2)) : 'pino_' + (1 + Math.floor(al() * 3)); (verde[n] = verde[n] || []).push({x: xb + (al() - 0.5) * 0.4, z: z + (al() - 0.5), y: 0.32, ry: al() * 6.28, s: 0.6 + al() * 0.2});
        if (al() < 0.45) coches.push({x: xb + (este ? 0.15 : -0.15), z: z + 2.3, ry: Math.PI / 2 * (al() < 0.5 ? 1 : -1) + Math.PI / 2});}
    }
    const w = r[2] - r[0] - 0.4, d = r[3] - r[1] - 0.4, largoX = w >= d, L = largoX ? w : d, corto = largoX ? d : w;
    /* manzanas grandes: se parten en filas a lo ancho */
    const filas = Math.max(1, Math.round(corto / 9)), cf = corto / filas;
    for (let f = 0; f < filas; f++) {
      const tl0 = Math.max(3.2, Math.min(9, cf * 1.25)), n = Math.max(1, Math.round(L / tl0)), tl = L / n;
      for (let i = 0; i < n; i++) {
        const a = -L / 2 + tl * (i + 0.5), b = -corto / 2 + cf * (f + 0.5), x = (r[0] + r[2]) / 2 + (largoX ? a : b), z = (r[1] + r[3]) / 2 + (largoX ? b : a), cap = tope(x, z);
        const cands = cap < 6 ? CIU_BAJOS : cap < 12 ? [...CIU_BAJOS, ...CIU_MEDIOS] : [...CIU_MEDIOS, ...CIU_ALTOS];
        let mejor = null;
        for (let k = 0; k < 7; k++) {
          const n0 = cands[Math.floor(al() * cands.length)], q = I[n0]; if (!q) continue;
          for (const rot of [0, 1]) {
            /* rot 0: el x del modelo va a lo largo de la fila */
            const fa = rot ? q.d : q.w, fb = rot ? q.w : q.d, sa0 = (tl - 0.15) / fa, sb0 = (cf - 0.15) / fb, s = Math.min(sa0, sb0), sa = Math.min(sa0, s * 1.35), sb = Math.min(sb0, s * 1.35);
            const h = q.h * s, lleno = (fa * fb * sa * sb) / (tl * cf), val = lleno * 2 - Math.max(0, h - cap) * 0.6 + Math.min(h, cap) / cap * 0.9 + al() * 0.15;
            if (!mejor || val > mejor.val) mejor = {n: n0, s, sa, sb, sy: h > cap * 1.05 ? cap * 1.05 / q.h : s, rot, val};
          }
        }
        if (!mejor) continue;
        const giro = (largoX ? 0 : Math.PI / 2) + (mejor.rot ? Math.PI / 2 : 0) + (al() < 0.5 ? Math.PI : 0);
        /* el x del modelo va a lo largo de la fila si (largoX y rot 0) o (no largoX y rot 0 girado 90°): en coordenadas del modelo, sx = a lo largo */
        pon(mejor.n, x, z, giro, mejor.s, 0.32, mejor.rot ? mejor.sb : mejor.sa, mejor.sy, mejor.rot ? mejor.sa : mejor.sb);
      }
    }
  }
  /* rascacielos de fondo, fuera del mapa: solo los de poco detalle (100-250 triángulos), en 6 trozos para que la cámara descarte los que no ve */
  const fondo = {}, FONDO = ['c_ld_a', 'c_ld_c', 'c_ld_f', 'c_ld_h', 'c_ld_j', 'c_ld_wide_a'];
  for (let x = -80; x <= 80; x += 10.5) for (let z = -104; z <= 104; z += 10.5) {
    if (Math.abs(x) < 39 && Math.abs(z) < 65) continue; if (al() < 0.15) continue;
    const n0 = FONDO[Math.floor(al() * FONDO.length)], q = I[n0]; if (!q) continue; const s = (6.5 + al() * 3) / Math.max(q.w, q.d), lejos = Math.max(Math.abs(x) - 39, Math.abs(z) - 65);
    const sy = s * (0.7 + Math.min(1.5, lejos / 22) + al() * 0.5), trozo = (x < -20 ? 0 : x > 20 ? 1 : 2) * 2 + (z < 0 ? 0 : 1), k = n0 + '|' + trozo;
    (fondo[k] = fondo[k] || []).push({x: x + (al() - 0.5) * 2, z: z + (al() - 0.5) * 2, ry: Math.floor(al() * 4) * Math.PI / 2, s, sy});
  }
  for (const n in verde) {const n0 = BOSQUE.length; instancias('ap_vegetacion', n, verde[n], true); for (const im of BOSQUE.slice(n0)) im.userData.ciudad = true;}
  const CO = ['ap_coche_1', 'ap_coche_2', 'ap_coche_3']; coches.forEach((c, i) => {const n = CO[i % 3]; if (!M[n]) return; const o = M[n].scene.clone(true); o.position.set(c.x, 0.32, c.z); o.rotation.y = c.ry; o.scale.setScalar(0.62); o.traverse((q) => {if (q.isMesh) {q.castShadow = false; q.receiveShadow = true;}}); MAPA_G.add(o);});
  for (const n in lista) {const n0 = BOSQUE.length; instancias('ap_ciudad', n, lista[n], true); for (const im of BOSQUE.slice(n0)) {im.userData.ciudad = true; im.userData.fijo = true;}}
  /* el fondo no se recorta por distancia (se ve desde lejos) ni hace sombra */
  for (const k in fondo) {const n = k.split('|')[0], n0 = BOSQUE.length; instancias('ap_ciudad', n, fondo[k].map((c) => ({x: c.x, z: c.z, ry: c.ry, s: c.s, sx: c.s, sy: c.sy, sz: c.s})), false);
    const ims = BOSQUE.splice(n0); for (const im of ims) {im.computeBoundingSphere(); im.frustumCulled = true; im.userData.cull = null; CIU_SKY.push(im);}}
}
/* farolas, vallas publicitarias, la glorieta, el colector, la central y los pasos elevados de los extremos */
function decoradoCiudad(al) {
  const G = MAPA_G, pon2 = (n, x, z, ry = 0, e = 1) => {if (!M[n]) return null; const o = M[n].scene.clone(true); o.position.set(x, 0, z); o.rotation.y = ry; o.scale.setScalar(e); o.traverse((q) => {if (q.isMesh) {q.castShadow = true; q.receiveShadow = true;}}); G.add(o); return o;};
  /* farolas a los dos lados de cada autopista, cada ~13 m */
  for (const l of [0, 1]) for (let f = 0.12; f < 0.9; f += 0.125) {
    const p = puntoCarril(l, f), q = puntoCarril(l, f + 0.01), dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz) || 1, nx = dz / d, nz = -dx / d;
    for (const sg of [1, -1]) {const x = p.x + nx * 4.75 * sg, z = p.z + nz * 4.75 * sg; if (Math.abs(z) < 5 || BASES.some((b) => Math.hypot(b.torre.x - x, b.torre.z - z) < 6) || distCarril(x, z) < 4.5 || Math.hypot(x - PIT.x, z - PIT.z) < 8 || Math.hypot(x - PIT2.x, z - PIT2.z) < 8) continue;
      const o = pon2('ap_farola', x, z, Math.atan2(-nx * sg, -nz * sg) + Math.PI / 2, 1); if (o) o.traverse((q) => {if (q.isMesh && q.material.emissive) q.material.emissiveIntensity = 2;});
      if ((Math.round(f * 8) + l + (sg > 0 ? 0 : 1)) % 2 === 0) luzFuego(x - nx * sg * 1.2, z - nz * sg * 1.2);}
  }
  /* la glorieta: una palmera y matas */
  if (M.ap_vegetacion) {instancias('ap_vegetacion', 'palmera_1', [{x: 0.3, z: -0.2, ry: 0.4, s: 1.05}], true); instancias('ap_vegetacion', 'adelfa_1', [{x: 1.3, z: 0.9, ry: 1, s: 0.9}, {x: -1.2, z: -1, ry: 2, s: 0.8}, {x: -0.9, z: 1.3, ry: 3, s: 0.85}], false);}
  /* vallas publicitarias sobre las manzanas de fuera, lejos de las autopistas (son altas) */
  if (M.ap_borde) for (const s of [1, -1]) for (const z of [20, 33]) {const o = pieza('ap_borde', 'valla_publicitaria'); o.position.set(-s * 30.5, 0.32, s * z); o.rotation.y = Math.PI / 2 * s; G.add(o);}
  /* pasos elevados al fondo, detrás de cada base */
  if (M.ap_borde) for (const s of [1, -1]) {const o = pieza('ap_borde', 'paso_elevado'); o.position.set(0, 0, s * 70); G.add(o); const o2 = pieza('ap_borde', 'paso_elevado'); o2.position.set(s * 30, 0, s * 70); G.add(o2);}
  /* el colector de Nasor (oeste) y la central eléctrica del lagarto (este): chimeneas y depósitos al fondo de cada boca */
  const I = M.ap_ciudad ? infoCiudad() : null, ind = {};
  const mete = (n, x, z, s, ry = 0) => {if (!I || !I[n]) return; const k = I[n]; (ind[n] = ind[n] || []).push({x: x - k.cx * s, z: z - k.cz * s, y: 0.32 - k.y0 * s, ry, s});};
  if (I) {
    
    for (const n in ind) {const n0 = BOSQUE.length; instancias('ap_ciudad', n, ind[n], true); for (const im of BOSQUE.slice(n0)) {im.userData.ciudad = true; im.userData.fijo = true;}}
  }
  fososCiudad(G);
}
/* 23/11 (Pack 63 WORK): el colector de Nasor y la central del lagarto (antes, cajas y cilindros): el lado abierto de cada modelo mira a +X,
   hacia su autopista; el del lagarto está girado 180°. Si la jungla aún no ha llegado, se esperan. */
function fososCiudad(G) {
  if (!M.ap_foso_nasor || !M.ap_foso_lagarto) {const t = setInterval(() => {if (MAPA_G !== G) clearInterval(t); else if (M.ap_foso_nasor && M.ap_foso_lagarto) {clearInterval(t); fososCiudad(G);}}, 300); return;}
  for (const [n, P, ry] of [['ap_foso_nasor', PIT, 0], ['ap_foso_lagarto', PIT2, Math.PI]]) {
    const o = M[n].scene.clone(true); o.position.set(P.x, 0, P.z); o.rotation.y = ry;
    o.traverse((q) => {if (!q.isMesh) return; q.castShadow = true; q.receiveShadow = true; const m = q.material; if (m && m.name === 'luz') {m.emissiveIntensity = Math.max(m.emissiveIntensity || 1, 2.2); q.castShadow = false;} q.userData.fijo = true;});
    G.add(o);
  }
}
/* el colector de Nasor: muro de hormigón al fondo con la boca de un tubo enorme (oscura por dentro), dos tubos pequeños y un hilo de agua */
function colector(G) {
  const P = PIT, tC = cargaTex('../batalla/texturas/ap_hormigon.webp', true), t = tC.clone(); t.source = tC.source; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1);
  const mH = new THREE.MeshLambertMaterial({map: t, color: '#8b9097'}), mN = new THREE.MeshBasicMaterial({color: '#07090b'});
  const muro = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 11.5), mH); muro.position.set(-34.6, 1.8, P.z); muro.castShadow = true; muro.receiveShadow = true; G.add(muro);
  const tubo = (r, z, y, l) => {const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 28, 1, true), new THREE.MeshLambertMaterial({map: t, color: '#7c8188', side: THREE.DoubleSide})); c.rotation.z = Math.PI / 2; g.add(c);
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(r, 0.18, 8, 28), mH); anillo.rotation.y = Math.PI / 2; anillo.position.x = l / 2; g.add(anillo);
    const fondo = new THREE.Mesh(new THREE.CircleGeometry(r * 0.98, 28), mN); fondo.rotation.y = Math.PI / 2; fondo.position.x = -l / 2 + 0.3; g.add(fondo);
    g.position.set(-34.2, y, z); g.traverse((q) => {if (q.isMesh) {q.castShadow = true; q.receiveShadow = true;}}); G.add(g);};
  tubo(2.1, P.z, 2.1, 2.6); tubo(0.75, P.z + 4, 0.9, 1.6); tubo(0.75, P.z - 4, 0.9, 1.6);
  const agua = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.4), new THREE.MeshStandardMaterial({color: '#1d3540', roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.85}));
  agua.rotation.x = -Math.PI / 2; agua.position.set(-31.4, 0.035, P.z); agua.receiveShadow = true; G.add(agua);
}
