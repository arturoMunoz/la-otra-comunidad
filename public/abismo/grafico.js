import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

/* ============ El Abismo de Helm · gráficos (v4) ============
   Cielo de tormenta con relámpagos, reflejos mojados, variación de la piedra,
   texturas por proyección (si existen en texturas/), bloom, gradación de color,
   brasas de las antorchas y calidad que baja sola si el móvil no llega. */

const RUIDO = `
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}`;

export function creaGraficos({renderer, scene, camera, luna, hemi}) {
  const G = {flash: 0, rayoT: 7, calidad: 2, lento: 0, ok: 0, brasas: null, focos: []};
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  luna.shadow.mapSize.set(1536, 1536); luna.shadow.bias = -0.0006; luna.shadow.normalBias = 0.03;
  luna.color.set('#d6d4d8'); luna.intensity = 1.7;
  hemi.color.set('#aab4dc'); hemi.groundColor.set('#6a4a2c'); hemi.intensity = 0.9;
  scene.fog = new THREE.FogExp2('#26305a', 0.0085);
  const relleno = new THREE.DirectionalLight('#a6b6ff', 1.0); relleno.position.set(6, 20, 40); scene.add(relleno);
  scene.background = null;

  /* --- cielo: degradado + nubes que corren + relámpago --- */
  const uCielo = {uT: {value: 0}, uFlash: {value: 0}, uTex: {value: null}, uHay: {value: 0}};
  const cielo = new THREE.Mesh(new THREE.SphereGeometry(160, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: uCielo,
    vertexShader: `varying vec3 vD; void main(){vD=normalize(position); vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww;}`,
    fragmentShader: RUIDO + `
      uniform float uT,uFlash,uHay; uniform sampler2D uTex; varying vec3 vD;
      void main(){
        float y=vD.y;
        vec3 col;
        if(uHay>.5){vec2 uv=vec2(atan(vD.x,-vD.z)/6.2832+.5, clamp(asin(clamp(y,-1.,1.))/3.14159+.5,0.,1.)); col=texture2D(uTex,uv).rgb; col=pow(col,vec3(2.2));}
        else{
          col=mix(vec3(.075,.085,.12),vec3(.012,.016,.03),smoothstep(-.05,.6,y));
          vec2 q=vD.xz/(y+.35)*1.6+vec2(uT*.03,uT*.012);
          float n=fbm(q)+.5*fbm(q*2.3-uT*.02);
          float nube=smoothstep(.55,1.15,n)*smoothstep(-.02,.25,y);
          col=mix(col,vec3(.09,.1,.14),nube*.8);
          col+=vec3(.5,.55,.7)*uFlash*(.25+nube*1.6)*smoothstep(-.1,.3,y);
          float monte=.04+.05*fbm(vec2(atan(vD.x,-vD.z)*3.,1.))+.035*vn(vec2(atan(vD.x,-vD.z)*14.,3.));
          col=mix(col,vec3(.018,.02,.03)+uFlash*vec3(.05,.06,.08),step(y,monte));
        }
        col+=uFlash*.06;
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`
  }));
  cielo.renderOrder = -10; cielo.frustumCulled = false; scene.add(cielo);

  /* --- entorno para los reflejos mojados (una sola vez) --- */
  const pm = new THREE.PMREMGenerator(renderer);
  const sEnv = new THREE.Scene();
  sEnv.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({side: THREE.BackSide,
    fragmentShader: `varying vec3 vD; void main(){float y=vD.y; vec3 c=mix(vec3(.05,.06,.09),vec3(.22,.26,.36),smoothstep(-.2,.7,y)); c+=vec3(1.,.55,.2)*.35*smoothstep(.96,1.,-vD.z*.6+vD.y*.3); gl_FragColor=vec4(c,1.);}`,
    vertexShader: `varying vec3 vD; void main(){vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`})));
  scene.environment = pm.fromScene(sEnv, 0.04).texture; scene.environmentIntensity = 0.55;

  /* --- texturas opcionales (de ChatGPT) --- */
  const TX = {};
  const tl = new THREE.TextureLoader();
  const carga = (n, srgb = true) => new Promise((res) => tl.load('texturas/' + n + '.webp', (t) => {t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; TX[n] = t; res(t);}, undefined, () => res(null)));
  const PBR = ['roca', 'sillares', 'madera', 'losas'];
  G.listo = Promise.all(['losas', 'sillares', 'barro', 'madera', 'roca', 'hierro', 'tejado', 'cielo', 'campo'].map((n) => carga(n)).concat(PBR.map((n) => carga(n + '_pbr')), PBR.map((n) => carga(n + '_pbr_n', false)))).then(() => {
    /* texturas de Poly Haven (CC0): sustituyen a las pintadas cuando están */
    PBR.forEach((n) => {if (TX[n + '_pbr']) TX[n] = TX[n + '_pbr'];});
    if (!TX.campo) TX.campo = TX.barro;
    if (TX.cielo) {uCielo.uTex.value = TX.cielo; uCielo.uHay.value = 1;}
    mats.forEach(pintaTex); mats4.forEach(pintaTex4);
  });

  /* --- materiales del patio --- */
  const mats = [];
  const blanco = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); blanco.needsUpdate = true;
  function pintaTex(m) {
    const u = m.userData.u; if (!u) return;
    const k = m.userData.clase;
    const top = k === 'madera' ? TX.madera : TX.losas, lado = k === 'madera' ? TX.madera : TX.sillares;
    if (top) {u.tTop.value = top; u.uHay.value.x = 1;}
    if (lado) {u.tLado.value = lado; u.uHay.value.y = 1;}
    if (TX.barro && k === 'piedra') {u.tBarro.value = TX.barro; u.uHay.value.z = 1;}
  }
  G.mejoraPatio = (raiz) => {
    const hechos = new Map();
    raiz.traverse((o) => {
      if (!o.isMesh) return;
      o.receiveShadow = true;
      const arr = Array.isArray(o.material) ? o.material : [o.material];
      const nuevos = arr.map((m) => {
        if (hechos.has(m)) return hechos.get(m);
        const n = m.name || '';
        let r = m;
        if (/^(puddle|water)/.test(n)) {
          r = new THREE.MeshStandardMaterial({name: n, color: new THREE.Color(m.color).multiplyScalar(0.4), roughness: 0.3, metalness: 0.15, envMapIntensity: 0.6});
        } else if (/^(stone|mortar|moss|ash|wood)/.test(n)) {
          r = m.clone(); r.roughness = /^wood/.test(n) ? 0.8 : 0.82; r.metalness = 0;
          r.userData.clase = /^wood/.test(n) ? 'madera' : 'piedra';
          inyecta(r, /^(moss|ash)/.test(n));
          mats.push(r);
        }
        hechos.set(m, r); return r;
      });
      o.material = Array.isArray(o.material) ? nuevos : nuevos[0];
    });
    mats.forEach(pintaTex);
  };
  function inyecta(m, suave) {
    const u = {tTop: {value: blanco}, tLado: {value: blanco}, tBarro: {value: blanco}, uHay: {value: new THREE.Vector3()}, uSuave: {value: suave ? 1 : 0}};
    m.userData.u = u;
    m.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, u);
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz; vWN=normalize(mat3(modelMatrix)*objectNormal);');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform sampler2D tTop,tLado,tBarro; uniform vec3 uHay; uniform float uSuave; float gMojado;' + RUIDO)
        .replace('#include <color_fragment>', `#include <color_fragment>
          {
            vec3 an=abs(normalize(vWN));
            float arriba=smoothstep(.55,.85,an.y);
            vec3 cT=uHay.x>.5? texture2D(tTop,vWP.xz*.22).rgb*1.9 : vec3(1.);
            vec3 cL=uHay.y>.5? mix(texture2D(tLado,vWP.zy*.25).rgb,texture2D(tLado,vWP.xy*.25).rgb,step(an.x,an.z))*1.9 : vec3(1.);
            vec3 tx=mix(cL,cT,arriba);
            float r1=fbm(vWP.xz*.45+vWP.y*.3), r2=vn(floor(vWP.xz*1.3)+floor(vWP.y*2.));
            float vari=mix(.78+.44*r1, .9+.2*r2, .5);
            if(uSuave>.5) vari=.9+.2*r1;
            diffuseColor.rgb*=tx*vari;
            /* suciedad abajo en las paredes */
            float pie=(1.-arriba)*(1.-smoothstep(.0,1.4,vWP.y))*.45;
            diffuseColor.rgb*=1.-pie;
            /* barro y charcos sobre el suelo */
            float b=smoothstep(.48,.72,fbm(vWP.xz*.12+3.1))*arriba*step(vWP.y,.6);
            vec3 cb=uHay.z>.5? texture2D(tBarro,vWP.xz*.18).rgb*1.6 : vec3(.42,.36,.3);
            diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*cb,b*.85);
            gMojado=arriba*smoothstep(.45,.62,fbm(vWP.xz*.21+7.7));
            diffuseColor.rgb*=1.-gMojado*.32;
          }`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.3,gMojado);');
    };
    m.customProgramCacheKey = () => 'patio' + (suave ? 1 : 0);
  }


  /* --- ver a través: lo que tapa al héroe o queda pegado a la cámara se deshace en trama --- */
  const uOjo = {uCam: {value: new THREE.Vector3()}, uHer: {value: new THREE.Vector3()}, uSur: {value: 0}};
  const uRotos = {value: [0, 0, 0, 0, 0, 0]}, XT = [-14.333, -8.6, -2.867, 2.867, 8.6, 14.333];
  G.rompeTramo = (i, roto) => {if (i < 0) uRotos.value.fill(0); else uRotos.value[i] = roto ? 1 : 0;};
  G.ojo = (cam, x, z, sur = 0, y = 0) => {uOjo.uCam.value.copy(cam); uOjo.uHer.value.set(x, 1.2 + y, z); uOjo.uSur.value = sur;};
  const TRAMA = `
    if(vWP.y>0.6){
      vec3 ab=uHer-uCam; float t=clamp(dot(vWP-uCam,ab)/dot(ab,ab),0.,1.);
      float d=length(vWP-(uCam+ab*t));
      float f=(t<0.9? 1.-smoothstep(2.8,5.,d) : 0.);
      f=max(f,1.-smoothstep(7.,12.,length(vWP-uCam)));
      #ifdef SUR
      if(vWP.z>35.9&&vWP.y>0.9) f=max(f,uSur*1.2);
      #endif
      if(f>0.){float th=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715)))); if(th<f*.85) discard;}
    }`;
  G.cortaVista = (m, sur = true) => {
    if (m.userData.trama) return; m.userData.trama = true;
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => {
      if (prev) prev(sh, r);
      Object.assign(sh.uniforms, uOjo);
      if (!sh.vertexShader.includes('varying vec3 vWP')) {
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
          .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;');
      }
      sh.fragmentShader = (sur ? '#define SUR\n' : '') + sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uCam,uHer; uniform float uSur;')
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>' + TRAMA);
    };
    const k0 = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => '';
    m.customProgramCacheKey = () => k0() + 'trama' + (sur ? 1 : 0);
    m.needsUpdate = true;
  };

  /* --- patio4: 7 materiales con UV y oclusión horneada en los vértices --- */
  const BASE4 = {
    losas: ['#9b9890', 0.86, 0, true], sillares: ['#a39d8e', 0.9, 0, false], barro: ['#6b5a45', 0.95, 0, true],
    madera: ['#7a5a3e', 0.82, 0, false], roca: ['#6f7a86', 0.93, 0, false], hierro: ['#4b5058', 0.55, 0.6, false], tejado: ['#4e5560', 0.8, 0, false],
  };
  const mats4 = [];
  const ESCALA4 = {losas: 0.6, sillares: 0.42, barro: 0.8, roca: 0.3, madera: 0.8};
  function pintaTex4(m) {
    const k = m.name === 'losas' && TX.campo ? 'campo' : m.name, t = TX[k]; if (!t || m.map === t) return;
    const c = t.clone(); c.repeat.setScalar(ESCALA4[m.name] || 1); c.needsUpdate = true; m.map = c; m.color.set({sillares: '#c4b294', roca: '#9a9088', losas: '#bfae92'}[m.name] || '#ffffff');
    const nm = TX[k + '_pbr_n']; if (nm) {const n2 = nm.clone(); n2.repeat.copy(c.repeat); n2.needsUpdate = true; m.normalMap = n2; m.normalScale.set(0.9, 0.9);}
    if (m.userData.u4 && TX.barro) {const tb = TX.barro.clone(); tb.wrapS = tb.wrapT = THREE.RepeatWrapping; tb.needsUpdate = true; m.userData.u4.tBarro2.value = tb;}
    if (m.name === 'losas' || m.name === 'barro') {m.normalMap = null; c.wrapS = c.wrapT = THREE.RepeatWrapping;}
    m.needsUpdate = true;
  }
  G.mejoraPatio4 = (raiz) => {
    const hechos = new Map();
    raiz.traverse((o) => {
      if (!o.isMesh) return;
      o.receiveShadow = true; o.castShadow = false;
      const m0 = o.material, b = BASE4[m0.name]; if (!b) return;
      if (!b[3]) o.geometry.computeVertexNormals(); /* las normales de los muros venían al revés: se rehacen según el orden de los vértices */
      if (hechos.has(m0)) {o.material = hechos.get(m0); return;}
      const m = new THREE.MeshStandardMaterial({name: m0.name, color: b[0], roughness: b[1], metalness: b[2], vertexColors: !!o.geometry.attributes.color, side: b[3] ? THREE.FrontSide : THREE.DoubleSide, shadowSide: THREE.FrontSide});
      const u = {uSuelo: {value: b[3] ? 1 : 0}, tBarro2: {value: blanco}, uPatio: {value: m0.name === 'losas' || m0.name === 'barro' ? 1 : 0}};
      m.userData.u4 = u;
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, u); sh.uniforms.uRotos = uRotos;
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
          .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz; vWN=normalize(mat3(modelMatrix)*objectNormal);');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform float uSuelo; uniform float uPatio; uniform sampler2D tBarro2; uniform float uRotos[6]; float gMojado;' + RUIDO)
          /* suelo del patio: hierba y barro mezclados por manchas grandes, cada uno muestreado dos veces (girado y a otra escala) para que no se vea la repetición del dibujo */
          .replace('#include <map_fragment>', `#ifdef USE_MAP
            if(uPatio>.5){
              vec2 w=vWP.xz; vec2 rw=mat2(.8,-.6,.6,.8)*w;
              vec4 g1=texture2D(map,w*.15), g2=texture2D(map,rw*.067+.37);
              vec4 hierba=mix(g1,g2,smoothstep(.3,.7,fbm(w*.1+5.)));
              vec4 b1=texture2D(tBarro2,w*.12), b2=texture2D(tBarro2,rw*.053+.61);
              vec4 barro=mix(b1,b2,smoothstep(.3,.7,fbm(w*.08+2.)))*vec4(.78,.72,.66,1.);
              float mb=smoothstep(.45,.7,fbm(w*.055+1.3)+.22*fbm(w*.45));
              mb=max(mb,(1.-smoothstep(1.2,4.2,abs(w.x)))*.7*smoothstep(-14.,-4.,w.y));
              vec4 tc=mix(hierba,barro,mb);
              tc.rgb=mix(vec3(dot(tc.rgb,vec3(.3,.59,.11))),tc.rgb,.82);
              diffuseColor*=tc;
            } else {
              #include <map_fragment>
            }
          #endif`)
          .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
            if(vWP.z>-22.8&&vWP.z<-16.6&&vWP.y>0.35){
              ${XT.map((x, k) => `if(uRotos[${k}]>.5&&abs(vWP.x-(${x.toFixed(1)}))<1.5+vWP.y*.2+.25*sin(vWP.y*3.1+${k}.)) discard;`).join('')}
            }`)
          .replace('#include <color_fragment>', `#include <color_fragment>
            {
              float arriba=smoothstep(.55,.85,abs(normalize(vWN).y));
              float r1=fbm(vWP.xz*.18+vWP.y*.2);
              diffuseColor.rgb*=.86+.28*r1;
              float pie=(1.-arriba)*(1.-smoothstep(.0,1.6,vWP.y))*.25;
              diffuseColor.rgb*=1.-pie;
              gMojado=uSuelo*arriba*smoothstep(.6,.74,fbm(vWP.xz*.13+7.7))*step(vWP.y,.4);
              diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.55,.6,.7),gMojado*.7);
            }`)
          .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.42,gMojado);');
      };
      m.customProgramCacheKey = () => 'p4' + m0.name;
      hechos.set(m0, m); mats4.push(m); pintaTex4(m); if (!b[3]) G.cortaVista(m); o.material = m;
    });
  };

  /* --- brasas que suben de las antorchas --- */
  G.brasas = (focos) => {
    G.focos = focos; const N = 140, pos = new Float32Array(N * 3), dat = [];
    for (let i = 0; i < N; i++) dat.push({f: focos[i % focos.length], t: Math.random() * 2, vx: 0, vz: 0, vy: 0, x: 0, y: -50, z: 0});
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({color: '#ffb060', size: 0.11, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false}));
    p.frustumCulled = false; scene.add(p); G.pb = {p, pos, dat};
  };
  function mueveBrasas(dt) {
    const b = G.pb; if (!b) return;
    for (let i = 0; i < b.dat.length; i++) {
      const d = b.dat[i]; d.t -= dt;
      if (d.t <= 0) {const f = d.f; d.x = f.x + (Math.random() - .5) * .3; d.y = f.y + .3; d.z = f.z + (Math.random() - .5) * .3; d.vx = (Math.random() - .5) * .6; d.vz = (Math.random() - .5) * .6 + 0.4; d.vy = 1 + Math.random() * 1.4; d.t = 1 + Math.random() * 1.6;}
      d.vx += (Math.random() - .5) * dt * 3; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
      b.pos[i * 3] = d.x; b.pos[i * 3 + 1] = d.t > 0.15 ? d.y : -50; b.pos[i * 3 + 2] = d.z;
    }
    b.p.geometry.attributes.position.needsUpdate = true;
  }

  /* --- posproceso --- */
  const rtMSAA = new THREE.WebGLRenderTarget(innerWidth, innerHeight, {samples: 4, type: THREE.HalfFloatType});
  const comp = new EffectComposer(renderer, rtMSAA);
  comp.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.5, 0.45, 0.82);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const grado = new ShaderPass({
    uniforms: {tDiffuse: {value: null}, uFlash: {value: 0}, uDano: {value: 0}},
    vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uFlash,uDano; varying vec2 vUv;
      void main(){vec3 c=texture2D(tDiffuse,vUv).rgb; float l=dot(c,vec3(.299,.587,.114));
        c=mix(c*vec3(.94,.98,1.06),c,smoothstep(.05,.45,l));
        c=mix(c,c*vec3(1.08,1.,.88),smoothstep(.45,.95,l));
        c=mix(vec3(l),c,1.38); c=(c-.5)*1.08+.5; c=max(c,vec3(0.))+vec3(.012,.01,.03);
        vec2 d=vUv-.5; float v=dot(d,d); c*=1.-v*.55;
        c=mix(c,vec3(.55,.05,.03),uDano*smoothstep(.1,.45,v)*.8);
        c+=uFlash*vec3(.1,.12,.16);
        gl_FragColor=vec4(c,1.);}`
  });
  comp.addPass(grado);
  addEventListener('resize', () => {comp.setSize(innerWidth, innerHeight); bloom.resolution.set(innerWidth / 2, innerHeight / 2);});

  /* resolución dinámica (como los juegos de móvil): se ajusta sola para ir fluido, en pasos pequeños */
  function ponPr(pr) {renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight); comp.setPixelRatio(pr); comp.setSize(innerWidth, innerHeight);}
  G.frames = 0; G.tAcum = 0; G.rapido = 0;
  function calidad(n) {
    G.calidad = n;
    bloom.enabled = n >= 2;
    G.prMax = Math.min(devicePixelRatio, n >= 2 ? 2.25 : n === 1 ? 1.6 : 1.15);
    G.pr = Math.min(G.pr || 1.75, G.prMax); ponPr(G.pr);
    const conSombra = n > 0;
    if (renderer.shadowMap.enabled !== conSombra) {renderer.shadowMap.enabled = conSombra; scene.traverse((o) => {if (o.material) [].concat(o.material).forEach((m) => m.needsUpdate = true);});}
    if (G.pb) G.pb.p.visible = n >= 1;
  }
  G.calidad = 2;
  calidad(2);

  G.golpe = () => {G.dano = 0.6;};
  G.render = (dt, enJuego) => {
    uCielo.uT.value += dt;
    /* relámpagos: doble destello cada 6-16 s */
    G.rayoT -= dt;
    if (G.rayoT <= 0) {G.rayoT = 6 + Math.random() * 10; G.seq = [0, 0.09, 0.22]; G.seqT = 0; if (G.alRayo) G.alRayo();}
    if (G.seq) {G.seqT += dt; const i = G.seq.findIndex((s) => G.seqT >= s && G.seqT < s + 0.06); if (i >= 0) G.flash = i === 1 ? 0.5 : 1; if (G.seqT > 0.35) G.seq = null;}
    G.flash = Math.max(0, G.flash - dt * 5);
    uCielo.uFlash.value = G.flash; grado.uniforms.uFlash.value = G.flash;
    luna.intensity = 2.1 + G.flash * 4; hemi.intensity = 0.9 + G.flash * 1.4;
    G.dano = Math.max(0, (G.dano || 0) - dt * 1.8); grado.uniforms.uDano.value = G.dano;
    mueveBrasas(dt);
    cielo.position.copy(camera.position);
    /* cada 1,5 s mira la media: si baja de ~50 fps reduce la resolución un poco; si va sobrado, la sube.
       Solo si ya está al mínimo y sigue lento quita sombras o brillo (un escalón de calidad). */
    if (enJuego && dt > 0) {
      G.jugado = (G.jugado || 0) + dt; G.frames++; G.tAcum += dt;
      if (G.jugado > 4 && G.tAcum > 1.5) {
        const media = G.tAcum / G.frames; G.frames = 0; G.tAcum = 0;
        if (media > 1 / 48) {
          G.rapido = 0;
          if (G.pr > 0.9) {G.pr = Math.max(0.9, G.pr - (media > 1 / 35 ? 0.25 : 0.12)); ponPr(G.pr);}
          else if (G.calidad > 0) {G.lento = (G.lento || 0) + 1; if (G.lento >= 2) {calidad(G.calidad - 1); G.lento = 0;}}
        } else if (media < 1 / 57) {
          G.lento = 0; G.rapido++;
          if (G.rapido >= 3 && G.pr < G.prMax) {G.pr = Math.min(G.prMax, G.pr + 0.1); ponPr(G.pr); G.rapido = 0;}
        } else G.rapido = 0;
      }
    }
    comp.render(dt);
  };
  G.ponCalidad = (n) => {calidad(n); try {localStorage.setItem('abismo.calidad', n);} catch (e) {}};
  return G;
}
