/* El Vado del Isen · duelo de héroes 1v1 / 2v2 (contra la máquina o con amigos en línea).
   Un solo carril de norte a sur. Cada bando: fuente, estandarte (el «nexo») y dos torres.
   En línea manda el anfitrión: su móvil simula súbditos, torres, daño y bots, y manda una «foto» 12 veces por segundo.
   Cada jugador mueve a su héroe en su propio móvil (sin esperar al servidor) y avisa al anfitrión de dónde está y qué lanza. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const $ = (id) => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const ICO = (n) => '../abismo/iconos/' + n + '.webp';

/* ---------- datos ---------- */
const HEROES = {
  rohan: {nombre: 'Jinete de Rohan', modelo: 'rohan_kk', retrato: 'r_rohan', vida: 650, dano: 62, vatq: 0.9, alcance: 2.5, vel: 5.2, crecV: 85, crecD: 4.5,
    hab: {q: {n: 'Estocada', cd: 6, tipo: 'dash', dist: 5.5, dano: 95, icono: 'lanza', d: 'Te lanzas hacia delante y hieres a todos los que atraviesas.'},
      w: {n: 'Escudo de Edoras', cd: 12, tipo: 'escudo', val: 170, dur: 3, icono: 'escudo', d: 'Un escudo que absorbe daño durante 3 s.'},
      e: {n: 'Grito de la Marca', cd: 10, tipo: 'area', radio: 4, dano: 55, lento: 0.4, durL: 2, icono: 'cuerno', d: 'Hiere y frena a los que te rodean.'},
      r: {n: 'Carga de los Rohirrim', cd: 45, tipo: 'dash', dist: 11, dano: 230, aturde: 1, icono: 'h_rohan', d: 'Gran carga que derriba y aturde 1 s a todos a tu paso.'}}},
  enano: {nombre: 'Enano de Erebor', modelo: 'enano_kk', retrato: 'r_enano', vida: 740, dano: 58, vatq: 0.8, alcance: 2.3, vel: 4.9, crecV: 95, crecD: 4,
    hab: {q: {n: 'Hachazo', cd: 5, tipo: 'cono', alc: 3.8, ang: 1.5, dano: 115, icono: 'hacha', d: 'Un tajo en abanico delante de ti.'},
      w: {n: 'Piedra de la Montaña', cd: 14, tipo: 'reduce', val: 0.45, dur: 3, icono: 'escudo', d: 'Recibes un 45 % menos de daño durante 3 s.'},
      e: {n: 'Salto de Erebor', cd: 10, tipo: 'salto', dist: 7, radio: 2.6, dano: 85, lento: 0.35, durL: 1.5, icono: 'botas', d: 'Saltas a un punto, hieres y frenas al caer.'},
      r: {n: 'Furia de Durin', cd: 50, tipo: 'area', radio: 4.6, dano: 240, aturde: 1.25, icono: 'h_enano', d: 'El suelo tiembla: daño enorme y aturde a todos alrededor.'}}},
  elfo: {nombre: 'Arquero de Lórien', modelo: 'elfo_kk', retrato: 'r_elfo', vida: 520, dano: 50, vatq: 0.95, alcance: 7, vel: 5.3, crecV: 75, crecD: 4.5, proy: 'flecha_elfica',
    hab: {q: {n: 'Flecha de Lórien', cd: 6, tipo: 'linea', alc: 13, ancho: 0.9, dano: 125, perfora: true, proy: 'flecha_elfica', icono: 'arco', d: 'Flecha larga que atraviesa a todos en su línea.'},
      w: {n: 'Ráfaga', cd: 12, tipo: 'rafaga', val: 0.6, dur: 4, icono: 'i_abanico', d: 'Disparas un 60 % más rápido durante 4 s.'},
      e: {n: 'Paso élfico', cd: 9, tipo: 'dash', dist: 5, dano: 0, icono: 'i_esquivar', d: 'Saltas ágil hacia donde apuntes.'},
      r: {n: 'Lluvia de flechas', cd: 45, tipo: 'zona', alc: 10, radio: 3.6, dur: 3, dps: 80, lento: 0.3, icono: 'h_elfo', d: 'Durante 3 s llueven flechas sobre la zona: hieren y frenan.'}}},
  hobbit: {nombre: 'Hobbit de la Comarca', modelo: 'hobbit_kk', retrato: 'r_hobbit', vida: 560, dano: 50, vatq: 1.0, alcance: 6.5, vel: 5.8, crecV: 78, crecD: 4, proy: 'piedra',
    hab: {q: {n: 'Piedra certera', cd: 7, tipo: 'linea', alc: 11, ancho: 0.8, dano: 100, aturde: 0.9, proy: 'piedra', icono: 'honda', d: 'Una piedra que aturde al primero que toca.'},
      w: {n: 'Desapercibido', cd: 16, tipo: 'invis', dur: 3, vel: 0.35, icono: 'i_humo', d: 'Desapareces 3 s y corres más: ni torres ni enemigos te ven.'},
      e: {n: 'Puñado de piedras', cd: 6, tipo: 'cono', alc: 5.2, ang: 1.0, dano: 90, icono: 'i_piedras', d: 'Un puñado de piedras en abanico.'},
      r: {n: 'Suerte de Bolsón', cd: 45, tipo: 'suerte', cura: 0.4, vel: 0.5, dur: 5, icono: 'h_hobbit', d: 'Te curas un 40 %, corres más y pegas más fuerte 5 s.'}}},
};
const NIVEL_R = 4, NIVEL_MAX = 9;
const OBJ = {
  hoja: {t: 'Hoja larga', i: 'obj_01', c: 350, st: {dano: 18}},
  daga: {t: 'Daga de Bree', i: 'obj_02', c: 300, st: {vatq: 0.2}},
  cota: {t: 'Cota de anillas', i: 'obj_03', c: 350, st: {vida: 180}},
  yelmo: {t: 'Yelmo de hierro', i: 'obj_04', c: 400, st: {reduc: 0.1}},
  botas: {t: 'Botas de cuero', i: 'obj_05', c: 300, st: {vel: 0.12}},
  amuleto: {t: 'Amuleto de Lórien', i: 'obj_06', c: 300, st: {regen: 3}},
  herugrim: {t: 'Herugrim', i: 'obj_07', leg: 1, rec: ['hoja', 'hoja'], c: 500, st: {dano: 50, crit: 0.2}, p: 'Un 20 % de golpes críticos (doble daño).'},
  guthwine: {t: 'Guthwinë', i: 'obj_08', leg: 1, rec: ['hoja', 'daga'], c: 450, st: {dano: 28, vatq: 0.35}, p: 'Daño y velocidad de ataque.'},
  escudo: {t: 'Escudo de la Marca', i: 'obj_09', leg: 1, rec: ['cota', 'yelmo'], c: 500, st: {vida: 350, reduc: 0.18, espinas: 0.15}, p: 'Quien te pega cuerpo a cuerpo se lleva un 15 %.'},
  capa: {t: 'Capa élfica', i: 'obj_10', leg: 1, rec: ['botas', 'amuleto'], c: 400, st: {vel: 0.18, regen: 5, esquiva: 0.12}, p: 'Un 12 % de golpes no te tocan.'},
  hacha: {t: 'Hacha de El Sagrario', i: 'obj_11', leg: 1, rec: ['hoja', 'amuleto'], c: 450, st: {dano: 30, robo: 0.12}, p: 'Robo de vida del 12 %.'},
  mithril: {t: 'Cota de mithril', i: 'obj_14', leg: 1, rec: ['cota', 'cota', 'amuleto'], c: 550, st: {vida: 500, reduc: 0.12, regen: 4}, p: 'Ligera y casi irrompible.'},
};
const PLAN_BOT = {rohan: ['hoja', 'hoja', 'herugrim', 'cota', 'yelmo', 'escudo', 'botas', 'amuleto', 'capa', 'cota', 'cota', 'amuleto', 'mithril'], enano: ['cota', 'yelmo', 'escudo', 'hoja', 'amuleto', 'hacha', 'cota', 'cota', 'amuleto', 'mithril', 'hoja', 'hoja', 'herugrim'], elfo: ['daga', 'hoja', 'guthwine', 'botas', 'amuleto', 'capa', 'hoja', 'hoja', 'herugrim', 'cota', 'yelmo', 'escudo'], hobbit: ['hoja', 'amuleto', 'hacha', 'botas', 'amuleto', 'capa', 'hoja', 'daga', 'guthwine', 'cota', 'yelmo', 'escudo']};
const MAPA = {ancho: 26, fuente: 54, nexo: 46, torre2: 34, torre1: 20};
/* la espesura: empalizada entre el carril y la jungla (x = ±10) con huecos para pasar; río (el vado) en z = 0 */
const MURO_X = 10, MURO_Z = 44, HUECOS = [-30, -12, 0, 12, 30], HUECO = 2.8;
const NEUTRO = {
  warg: {nombre: 'Huargo', vida: 560, dano: 26, alcance: 1.9, vatq: 0.9, vel: 5, oro: 45, xp: 55, modelo: 'warg', alto: 1.5},
  troll: {nombre: 'Troll de las colinas', vida: 2600, dano: 70, alcance: 2.8, vatq: 0.55, vel: 3.6, oro: 150, xp: 240, modelo: 'troll', alto: 3.8, buff: 'troll', jefe: true},
  alfa: {nombre: 'Huargo alfa', vida: 2000, dano: 55, alcance: 2.2, vatq: 0.8, vel: 5, oro: 130, xp: 200, modelo: 'huargo_alfa', alto: 2.2, buff: 'alfa', jefe: true},
};
const CAMPOS = [{x: 17, z: 20, tipo: 'warg', n: 2}, {x: -17, z: 20, tipo: 'warg', n: 2}, {x: 17, z: -20, tipo: 'warg', n: 2}, {x: -17, z: -20, tipo: 'warg', n: 2},
  {x: -18.5, z: 0, tipo: 'troll', n: 1}, {x: 18.5, z: 0, tipo: 'alfa', n: 1}];
const BUFF_TXT = {troll: 'Fuerza del troll: +15 % de daño y vuestros súbditos golpean más fuerte las torres', alfa: 'Aullido del alfa: +15 % de velocidad y te curas más deprisa'};
const SUBD = {m: {vida: 380, dano: 18, alcance: 1.9, vatq: 0.9, vel: 3.4, oro: 22, xp: 32}, r: {vida: 270, dano: 24, alcance: 6, vatq: 0.8, vel: 3.4, oro: 16, xp: 26}, a: {vida: 1100, dano: 45, alcance: 2.3, vatq: 0.6, vel: 3.1, oro: 60, xp: 70, muros: 3}};
const MODELO_SUBD = [{m: 'ballestero2', r: 'arquero_rohan2', a: 'ballestero2'}, {m: 'uruk', r: 'q_arquero', a: 'uruk'}];
const ALTO_SUBD = {m: 1.7, r: 1.6, a: 2.6};
const signo = (eq) => eq === 0 ? 1 : -1;

/* ---------- motor ---------- */
const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#1b2230'); scene.fog = new THREE.Fog('#1b2230', 45, 110);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 200);
addEventListener('resize', () => {renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();});
scene.add(new THREE.HemisphereLight('#c9d6ff', '#3a2a1a', 1.5));
const sol = new THREE.DirectionalLight('#ffe2b8', 2.2); sol.position.set(12, 30, 10); sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, {left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90}); scene.add(sol, sol.target);

const loader = new GLTFLoader(), M = {}, TX = {};
const NOMBRES = ['warg', 'huargo_alfa', 'troll', 'carro_k', 'rohan_kk', 'enano_kk', 'elfo_kk', 'hobbit_kk', 'ballestero2', 'arquero_rohan2', 'uruk', 'q_arquero', 'proyectiles', 'torre_k', 'estandarte_muro', 'estandarte_patio', 'brasero', 'tienda', 'empalizada', 'barril_1', 'barril_2', 'caja_1', 'heno', 'sacos_terreros', 'antorcha_pie'];
async function cargaModelo(n) {
  const r = await fetch('../abismo/modelos/' + n + '.glb'); if (!r.ok) throw new Error(n);
  return new Promise(async (res, rej) => loader.parse(await r.arrayBuffer(), '', res, rej));
}
function cargaTex(n, rep) {const t = new THREE.TextureLoader().load('../abismo/' + n); t.colorSpace = THREE.SRGBColorSpace; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;}

/* alto de cada modelo para escalarlos igual (héroes ~2 m, súbditos ~1,7) */
const ALTO = {};
function alto(n) {if (!ALTO[n]) {const b = new THREE.Box3().setFromObject(M[n].scene); ALTO[n] = Math.max(0.5, b.max.y - b.min.y);} return ALTO[n];}
function montar(n, altura) {
  const raiz = SkeletonUtils.clone(M[n].scene); raiz.scale.setScalar(altura / alto(n));
  raiz.traverse((o) => {if (o.isMesh) {o.castShadow = true; o.material = o.material.clone(); if (o.isSkinnedMesh) o.frustumCulled = false;}});
  const mixer = new THREE.AnimationMixer(raiz), clips = {};
  for (const c of M[n].animations) clips[c.name] = mixer.clipAction(c);
  const alias = {atacar: ['disparar', 'atacar'], correr: ['correr', 'andar'], quieto: ['quieto'], morir: ['morir'], hab: ['golpe_cargado', 'atacar_3', 'atacar_2', 'disparar', 'atacar'], aturdido: ['aturdido', 'recibir_golpe', 'recibir', 'quieto']};
  const c2 = {}; for (const k in alias) {const f = alias[k].find((x) => clips[x]); if (f) c2[k] = clips[f];}
  for (const k of ['atacar', 'morir', 'hab']) if (c2[k]) {c2[k].setLoop(THREE.LoopOnce, 1); c2[k].clampWhenFinished = true;}
  return {raiz, mixer, clips: c2, actual: null};
}
function pon(a, k, f = 0.15) {const n = a.clips[k]; if (!n || a.actual === n) return; n.reset().play(); if (a.actual) a.actual.crossFadeTo(n, f, false); a.actual = n;}
function otraVez(a, k) {const n = a.clips[k]; if (!n) return; n.reset().play(); if (a.actual && a.actual !== n) a.actual.crossFadeTo(n, 0.08, false); a.actual = n;}

/* ---------- el mapa ---------- */
function construyeMapa() {
  const tH = cargaTex('texturas/campo.webp', true), tB = cargaTex('texturas/barro.webp', true);
  const g = new THREE.PlaneGeometry(80, 132, 1, 1); g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.95});
  m.onBeforeCompile = (sh) => {
    sh.uniforms.tH = {value: tH}; sh.uniforms.tB = {value: tB};
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWP; uniform sampler2D tH,tB;
      #define S_T 0.
      float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}`)
      .replace('#include <map_fragment>', `
      vec2 w=vWP.xz; vec2 rw=mat2(.8,-.6,.6,.8)*w;
      vec3 hi=mix(texture2D(tH,w*.15).rgb,texture2D(tH,rw*.067+.37).rgb,smoothstep(.3,.7,fbm(w*.1+5.)));
      vec3 ba=mix(texture2D(tB,w*.12).rgb,texture2D(tB,rw*.053+.61).rgb,smoothstep(.3,.7,fbm(w*.08+2.)))*vec3(.8,.74,.68);
      float carril=1.-smoothstep(4.5,7.5,abs(w.x)+fbm(w*.3)*1.5);
      float mb=max(carril*.85,smoothstep(.55,.75,fbm(w*.05+1.3)));
      vec3 col=mix(hi,ba,mb);
      /* la espesura: hierba más oscura y húmeda, con claros de barro donde están las bestias */
      float jungla=smoothstep(9.5,11.,abs(w.x));
      vec3 musgo=hi*vec3(.62,.78,.55)*(.75+.5*fbm(w*.2+9.));
      col=mix(col,musgo,jungla*(1.-smoothstep(.62,.8,fbm(w*.09+4.))*.5));
      /* el vado: agua poco honda cruzando de lado a lado */
      float rio=1.-smoothstep(2.2,3.6,abs(w.y+sin(w.x*.25)*.8)+fbm(w*.4)*.8);
      vec3 agua=mix(vec3(.004,.016,.026),vec3(.012,.04,.05),fbm(w*.5+vec2(S_T)));
      col=mix(col,agua,rio*.9);
      float borde=smoothstep(25.,28.,abs(w.x)); col*=1.-borde*.7;
      diffuseColor.rgb*=col;`);
  };
  const suelo = new THREE.Mesh(g, m); suelo.receiveShadow = true; scene.add(suelo);
  const pon2 = (n, x, z, ry = 0, e = 1) => {if (!M[n]) return null; const o = M[n].scene.clone(true); o.position.set(x, 0, z); o.rotation.y = ry; o.scale.setScalar(e); o.traverse((q) => {if (q.isMesh) {q.castShadow = true; q.receiveShadow = true;}}); scene.add(o); return o;};
  const valla = (x, z) => {const o = pon2('empalizada', x + rnd(-0.2, 0.2), z, Math.PI / 2 + rnd(-0.05, 0.05), 1.05); if (o) o.traverse((q) => {if (/^nivel_\d$/.test(q.name)) q.visible = q.name === 'nivel_1';});};
  /* empalizada entre el carril y la espesura, con huecos para pasar */
  for (let z = -MURO_Z + 2; z <= MURO_Z - 2; z += 4.2) if (!enHueco(z) && !enHueco(z - 1.6) && !enHueco(z + 1.6)) for (const x of [-MURO_X, MURO_X]) valla(x, z);
  /* borde exterior */
  for (let z = -60; z <= 60; z += 4.2) for (const x of [-27.5, 27.5]) valla(x, z);
  for (let i = 0; i < 22; i++) {const z = rnd(-44, 44), x = (Math.random() < 0.5 ? -1 : 1) * rnd(8.2, 9.2); if (!enHueco(z)) pon2(['barril_1', 'barril_2', 'caja_1', 'heno', 'sacos_terreros'][i % 5], x, z, rnd(0, 6.28), 1);}
  /* la espesura: restos de campamentos, carros volcados y braseros junto a cada cubil */
  for (const c of CAMPOS) {
    const sx = Math.sign(c.x), jefe = NEUTRO[c.tipo].jefe;
    pon2('brasero', c.x + sx * 3.2, c.z + 2.6, 0, jefe ? 1.8 : 1.3); luzFuego(c.x + sx * 3.2, c.z + 2.6);
    pon2(jefe ? 'carro_k' : 'barril_2', c.x + sx * 3.5, c.z - 3, rnd(0, 6.28), jefe ? 1.3 : 1);
    pon2('sacos_terreros', c.x + sx * 2.5, c.z - 5, rnd(0, 6.28), 1);
  }
  for (let i = 0; i < 30; i++) {const x = (Math.random() < 0.5 ? -1 : 1) * rnd(12, 25), z = rnd(-46, 46); if (CAMPOS.some((c) => Math.hypot(c.x - x, c.z - z) < 5) || Math.abs(z) < 4) continue; pon2(['barril_2', 'caja_1', 'sacos_terreros', 'barril_1'][i % 4], x, z, rnd(0, 6.28), rnd(0.9, 1.3));}
  for (const eq of [0, 1]) {
    const s = signo(eq), fz = s * MAPA.fuente;
    pon2('tienda', 5.5, fz + s * 2, eq ? 0 : Math.PI, 1.6);
    for (const x of [-4, 4]) pon2('brasero', x, fz - s * 3.5, 0, 1.4);
    luzFuego(-4, fz - s * 3.5); luzFuego(4, fz - s * 3.5);
  }
}
const LUCES = [];
function luzFuego(x, z) {const l = new THREE.PointLight('#ff9a4a', 12, 12, 1.6); l.position.set(x, 2, z); scene.add(l); LUCES.push(l);}

/* ---------- la partida (estado) ---------- */
let S = null;          /* estado completo (solo lo tiene quien simula: el anfitrión o el modo contra la máquina) */
let VISTA = new Map(); /* lo que se dibuja: id → {k, eq, x, z, rot, vida, max, ...} */
let YO = null;         /* id de mi héroe */
let MI_EQ = 0;
const NET = {ws: null, soy: -1, anf: -1, online: false, jugadores: [], modo: '1v1', ping: 0};
let ESTADO = 'menu';   /* menu, sala, juego, fin */
let idSig = 1;

function nuevaPartida(jugadores, modo) {
  S = {t: 0, u: [], proy: [], zonas: [], dif: [], bufEq: [{}, {}], campos: CAMPOS.map((c) => ({...c, resp: NEUTRO[c.tipo].jefe ? 90 : 30, vivos: 0})), ev: [], ola: 5, oleadaN: 0, muertes: [0, 0], fin: -1};
  idSig = 1;
  const plazas = modo === '2v2' ? 4 : 2;
  for (let slot = 0; slot < plazas; slot++) {
    const j = jugadores.find((q) => q.slot === slot);
    const tipo = j ? j.heroe : Object.keys(HEROES)[(slot * 3 + 1) % 4];
    const eq = slot % 2, s = signo(eq), x = (slot >= 2 ? 1.5 : -1.5);
    const b = HEROES[tipo] || HEROES.rohan;
    S.u.push({id: idSig++, k: 'h', eq, tipo, slot, bot: !j, nombre: j ? j.nombre : 'Bot ' + b.nombre.split(' ')[0], x, z: s * (MAPA.fuente - 3), rot: eq ? 0 : Math.PI,
      vida: b.vida, max: b.vida, nivel: 1, xp: 0, oro: 500, inv: [], cd: {q: 0, w: 0, e: 0, r: 0, a: 0}, buf: {}, resp: 0, muerto: false, ac: 0, hc: 0, hk: '', mueve: false, ataca: false, mx: 0, mz: 0, kills: 0, plan: 0});
  }
  for (const eq of [0, 1]) {
    const s = signo(eq);
    S.u.push({id: idSig++, k: 't', eq, n: 1, x: 0, z: s * MAPA.torre1, vida: 2000, max: 2000, cd: 0, rad: 1.6});
    S.u.push({id: idSig++, k: 't', eq, n: 2, x: 0, z: s * MAPA.torre2, vida: 2000, max: 2000, cd: 0, rad: 1.6});
    S.u.push({id: idSig++, k: 'n', eq, x: 0, z: s * MAPA.nexo, vida: 3000, max: 3000, rad: 2});
  }
}
const heroes = () => S.u.filter((u) => u.k === 'h');
function stats(h) {
  const b = HEROES[h.tipo], n = h.nivel - 1, st = {vida: b.vida + b.crecV * n, dano: b.dano + b.crecD * n, vatq: b.vatq, alcance: b.alcance, vel: b.vel, reduc: 0, regen: 1.5, crit: 0, robo: 0, espinas: 0, esquiva: 0};
  let va = 0, ve = 0;
  for (const id of h.inv) {const o = OBJ[id].st; st.vida += o.vida || 0; st.dano += o.dano || 0; va += o.vatq || 0; ve += o.vel || 0; st.reduc += o.reduc || 0; st.regen += o.regen || 0; st.crit += o.crit || 0; st.robo += o.robo || 0; st.espinas += o.espinas || 0; st.esquiva += o.esquiva || 0;}
  const be = S && S.bufEq[h.eq] || {};
  if (be.troll > S.t) st.dano *= 1.15;
  if (be.alfa > S.t) {ve += 0.15; st.regen += 6;}
  if (h.buf.rafaga > 0) va += 0.6;
  if (h.buf.suerte > 0) {ve += 0.5; st.dano *= 1.35;}
  if (h.buf.invis > 0) ve += 0.35;
  if (h.buf.lento > 0) ve -= h.buf.lentoV || 0.35;
  st.vatq *= 1 + va; st.vel *= Math.max(0.3, 1 + ve);
  if (h.buf.reduce > 0) st.reduc += 0.45;
  st.reduc = Math.min(0.75, st.reduc);
  return st;
}
function xpNivel(n) {return 100 + 60 * (n - 1);}
function ganaXp(h, n) {
  if (h.nivel >= NIVEL_MAX) return; h.xp += n;
  while (h.nivel < NIVEL_MAX && h.xp >= xpNivel(h.nivel)) {h.xp -= xpNivel(h.nivel); const v0 = stats(h).vida; h.nivel++; const v1 = stats(h).vida; h.vida += v1 - v0; ev(['fx', 'onda', h.x, h.z, 3]); if (h.nivel === NIVEL_R) ev(['aviso', h.id, '¡Habilidad definitiva lista!']);}
}
function ev(e) {S.ev.push(e); efectoLocal(e);}

/* ---------- simulación (anfitrión) ---------- */
function enemigosDe(eq) {return S.u.filter((u) => u.eq !== eq && !u.muerto && u.vida > 0 && !(u.k === 'h' && u.buf.invis > 0) && !(eq === 2 && u.k !== 'h'));}
function atacable(u) {
  if (u.k === 't' && u.n === 2) return !S.u.some((q) => q.k === 't' && q.eq === u.eq && q.n === 1 && q.vida > 0);
  if (u.k === 'n') return !S.u.some((q) => q.k === 't' && q.eq === u.eq && q.vida > 0);
  return true;
}
function radio(u) {return u.rad || (u.k === 'h' ? 0.6 : 0.5);}
function dana(o, d, n, tipo) {
  if (!d || d.vida <= 0 || d.muerto) return;
  if (d.k === 'h') {
    const st = stats(d);
    if (tipo !== 'hab' && st.esquiva && Math.random() < st.esquiva) {ev(['num', d.x, d.z, '¡esquiva!', 'r']); return;}
    n *= 1 - st.reduc;
    if (d.buf.escudo > 0) {const a = Math.min(d.buf.escudoV || 0, n); d.buf.escudoV -= a; n -= a;}
    if (o && o.k === 'h') {d.agresor = o.id; d.agresorT = S.t + 3; o.atacoHeroeT = S.t + 2.5;}
    if (st.espinas && o && o.k !== 't' && tipo !== 'hab' && dist(o, d) < 3) dana(null, o, n * st.espinas, 'hab');
  }
  if (d.k === 'j' && o && o.k === 'h') {d.agro = o.id; d.agroT = S.t + 6;}
  d.vida -= n; ev(['num', d.x, d.z, Math.round(n), tipo === 'crit' ? 'c' : '']);
  if (o && o.k === 'h' && o.vida > 0) {const r = stats(o).robo; if (r) o.vida = Math.min(stats(o).vida, o.vida + n * r);}
  if (d.vida <= 0) muere(d, o);
}
function muere(d, o) {
  d.vida = 0;
  if (d.k === 's') {
    d.muerto = true; d.quitar = S.t + 1.6; ev(['muere', d.id]);
    const sd = SUBD[d.tipo];
    if (o && o.k === 'h') {o.oro += sd.oro; ev(['num', d.x, d.z, '+' + sd.oro, 'o', o.id]);}
    for (const h of heroes()) if (h.eq !== d.eq && !h.muerto && dist(h, d) < 12) ganaXp(h, sd.xp);
  }
  if (d.k === 'j') {
    d.muerto = true; d.quitar = S.t + 2; ev(['muere', d.id]);
    const nd = NEUTRO[d.tipo], c = S.campos[d.campo]; c.vivos--; if (c.vivos <= 0) c.resp = S.t + (nd.jefe ? 150 : 60);
    const eq = o && o.k === 'h' ? o.eq : null;
    if (o && o.k === 'h') {o.oro += nd.oro; ev(['num', d.x, d.z, '+' + nd.oro, 'o', o.id]);}
    if (eq !== null) for (const h of heroes()) if (h.eq === eq && !h.muerto && (h === o || dist(h, d) < 14)) ganaXp(h, nd.xp);
    if (nd.buff && eq !== null) {S.bufEq[eq][nd.buff] = S.t + 90; ev(['fx', 'onda', d.x, d.z, 6]); ev(['aviso', 0, (eq === 0 ? 'Rohan' : 'Isengard') + ' vence al ' + nd.nombre + ' · ' + BUFF_TXT[nd.buff]]);}
  }
  if (d.k === 'h') {
    d.muerto = true; d.resp = S.t + 6 + d.nivel * 2; d.buf = {}; ev(['muere', d.id]); S.muertes[1 - d.eq]++;
    const asesino = o && o.k === 'h' ? o : S.u.find((q) => q.id === d.agresor && d.agresorT > S.t);
    if (asesino) {asesino.oro += 300; asesino.kills++; ganaXp(asesino, 120 + 25 * d.nivel); ev(['aviso', 0, asesino.nombre + ' ha derribado a ' + d.nombre]);}
  }
  if (d.k === 't') {ev(['fx', 'explosion', d.x, d.z, 5]); ev(['aviso', 0, (d.eq === 0 ? 'Rohan' : 'Isengard') + ' pierde una torre']); for (const h of heroes()) if (h.eq !== d.eq) {h.oro += 150; ganaXp(h, 80);}}
  if (d.k === 'n') {S.fin = 1 - d.eq; ev(['fx', 'explosion', d.x, d.z, 8]); ev(['fin', 1 - d.eq]);}
}
/* golpes con retraso dentro de la simulación (no con setTimeout: así va igual a cualquier velocidad) */
function luego(seg, fn) {S.dif.push({t: S.t + seg, fn});}
function golpea(o, d) {
  if (o.k === 'h') {
    const st = stats(o), crit = st.crit && Math.random() < st.crit, n = st.dano * (crit ? 2 : 1), b = HEROES[o.tipo];
    o.ac++;
    if (b.proy) lanzaProy(o, d, b.proy, n, crit ? 'crit' : 'at');
    else luego(0.18, () => {if (d.vida > 0 && !o.muerto) {dana(o, d, n, crit ? 'crit' : 'at'); ev(['fx', 'impacto', d.x, d.z, 1.4]);}});
    return;
  }
  if (o.k === 's') {o.ac++; const sd = SUBD[o.tipo]; if (o.tipo === 'r') lanzaProy(o, d, o.eq ? 'flecha_orca' : 'flecha_elfica', sd.dano, 'at'); else luego(0.2, () => {if (d.vida > 0 && o.vida > 0) dana(o, d, sd.dano * ((d.k === 't' || d.k === 'n') ? (sd.muros || 1.5) * (S.bufEq[o.eq].troll > S.t ? 1.6 : 1) : 1), 'at');}); return;}
  if (o.k === 'j') {o.ac++; const nd = NEUTRO[o.tipo]; luego(0.3, () => {if (d.vida > 0 && o.vida > 0) {dana(o, d, nd.dano * (1 + S.t / 900), 'at'); if (nd.jefe) ev(['fx', 'impacto', d.x, d.z, 2]);}}); return;}
  if (o.k === 't') {o.ac++; const n = d.k === 'h' ? 120 + 12 * Math.floor(S.t / 60) : 90; lanzaProy(o, d, 'piedra', n, 'at', 1.8, 4);}
}
function lanzaProy(o, d, modelo, n, tipo, esc = 1, y = 1.2) {
  const p = {o, d, x: o.x, z: o.z, n, tipo, v: o.k === 't' ? 16 : 22};
  S.proy.push(p); ev(['proy', modelo, o.x, o.z, d.id, p.v, esc, y]);
}
function mueveHacia(u, tx, tz, vel, dt) {
  const dx = tx - u.x, dz = tz - u.z, l = Math.hypot(dx, dz); if (l < 0.05) return false;
  const p = Math.min(l, vel * dt); u.x += dx / l * p; u.z += dz / l * p; u.rot = Math.atan2(dx, dz); limita(u); return true;
}
function limita(u) {u.x = Math.max(-MAPA.ancho, Math.min(MAPA.ancho, u.x)); u.z = Math.max(-MAPA.fuente - 3, Math.min(MAPA.fuente + 3, u.z)); choca(u);}
function enHueco(z) {return HUECOS.some((g) => Math.abs(z - g) < HUECO);}
function choca(u) {
  const ax = Math.abs(u.x);
  if (ax > MURO_X - 0.7 && ax < MURO_X + 0.7 && Math.abs(u.z) < MURO_Z && !enHueco(u.z)) {
    const lado = u.px !== undefined ? Math.abs(u.px) < MURO_X : ax < MURO_X;
    u.x = Math.sign(u.x || 1) * (lado ? MURO_X - 0.7 : MURO_X + 0.7);
  }
  u.px = u.x;
}
/* camino con los huecos: si el destino está al otro lado de la empalizada, primero al hueco más cercano */
function rumbo(u, tx, tz) {
  const dentro = Math.abs(u.x) < MURO_X, dentroT = Math.abs(tx) < MURO_X;
  if (dentro !== dentroT && Math.abs(u.z) < MURO_Z + 1 && Math.abs(tz) < MURO_Z + 1 && !(enHueco(u.z) && Math.abs(Math.abs(u.x) - MURO_X) < 1.2)) {
    const g = HUECOS.reduce((m, q) => Math.abs(q - (u.z + tz) / 2) + Math.abs(q - u.z) * 0.5 < Math.abs(m - (u.z + tz) / 2) + Math.abs(m - u.z) * 0.5 ? q : m);
    const lx = Math.sign(dentroT ? u.x : tx) * MURO_X;
    return [lx * (dentro ? 0.9 : 1.1) - u.x, g - u.z];
  }
  return [tx - u.x, tz - u.z];
}
function ve(h, tx, tz) {const [x, z] = rumbo(h, tx, tz); h.mx = x; h.mz = z;}
function masCercano(u, lista, r) {let m = null, md = r; for (const q of lista) {const d0 = dist(u, q) - radio(q); if (d0 < md) {md = d0; m = q;}} return m;}

function oleada() {
  S.oleadaN++;
  for (const eq of [0, 1]) {
    const s = signo(eq);
    /* desde el minuto 4, cada tercera oleada trae un «ariete»: mucha vida y triple daño a torres (para que las partidas acaben) */
    const tipos = ['m', 'm', 'm', 'r', 'r']; if (S.t > 240 && S.oleadaN % 3 === 0) tipos.push('a'); if (S.t > 600) tipos.push('a');
    tipos.forEach((tipo, i) => {
      const sd = SUBD[tipo], refuerzo = 1 + 0.06 * Math.floor(S.t / 60);
      S.u.push({id: idSig++, k: 's', eq, tipo, x: tipo === 'a' ? 0 : (i % 3 - 1) * 1.6, z: s * (MAPA.nexo - 2.5 - (tipo === 'r' ? 2.5 : tipo === 'a' ? 5 : 0) - (i % 2) * 0.8), vida: sd.vida * refuerzo, max: sd.vida * refuerzo, cd: 0, ac: 0, rot: eq ? 0 : Math.PI, rad: tipo === 'a' ? 0.8 : 0.5});
    });
  }
}

function paso(dt) {
  S.t += dt; S.ola -= dt;
  for (let i = S.dif.length - 1; i >= 0; i--) if (S.dif[i].t <= S.t) {const f = S.dif[i].fn; S.dif.splice(i, 1); f();} if (S.ola <= 0) {S.ola = 25; oleada();}
  const hs = heroes();
  for (const h of hs) {
    for (const k in h.cd) h.cd[k] = Math.max(0, h.cd[k] - dt);
    for (const k in h.buf) if (typeof h.buf[k] === 'number' && !k.endsWith('V')) h.buf[k] = Math.max(0, h.buf[k] - dt);
    if (h.muerto) {if (S.t >= h.resp) {h.muerto = false; const s = signo(h.eq); h.x = (h.slot >= 2 ? 1.5 : -1.5); h.z = s * (MAPA.fuente - 3); h.vida = stats(h).vida; ev(['vive', h.id]);} continue;}
    const st = stats(h); h.oro += 2.2 * dt;
    const enFuente = Math.abs(h.z - signo(h.eq) * MAPA.fuente) < 7;
    h.vida = Math.min(st.vida, h.vida + (st.regen + (enFuente ? st.vida * 0.12 : 0)) * dt);
    if (h.bot) ia(h, dt, st);
    if (h.dash) {
      const d = h.dash; d.t -= dt; h.x += d.vx * dt; h.z += d.vz * dt; limita(h);
      if (d.n) for (const e of enemigosDe(h.eq)) if (!d.toc.has(e.id) && e.k !== 'n' && (e.k !== 't') && dist(h, e) < 1.6 + radio(e)) {d.toc.add(e.id); dana(h, e, d.n, 'hab'); if (d.aturde && e.k !== 't') {e.aturd = S.t + d.aturde;}}
      if (d.t <= 0) {if (d.cae) {for (const e of enemigosDe(h.eq)) if (e.k !== 't' && e.k !== 'n' && dist(e, d.cae) < d.cae.r) {dana(h, e, d.cae.n, 'hab'); e.buf ? (e.buf.lento = d.cae.dur, e.buf.lentoV = d.cae.l) : (e.lento = S.t + d.cae.dur);} ev(['fx', 'onda', h.x, h.z, d.cae.r * 1.6]);} h.dash = null;}
    } else if (!(h.aturd > S.t)) {
      if (h.bot || h.local) {if (h.mx || h.mz) {const l = Math.hypot(h.mx, h.mz); h.x += h.mx / l * st.vel * Math.min(1, l) * dt; h.z += h.mz / l * st.vel * Math.min(1, l) * dt; h.rot = Math.atan2(h.mx, h.mz); limita(h); h.mueve = true;} else h.mueve = false;}
    }
    /* ataque básico */
    if (h.ataca && !h.dash && !(h.aturd > S.t) && h.cd.a <= 0) {
      const en = enemigosDe(h.eq).filter(atacable), r = st.alcance + 0.6;
      let obj = null; const hh = en.filter((e) => e.k === 'h' && dist(h, e) - radio(e) < r);
      obj = hh.length && (h.prioHeroe !== false) ? hh.sort((a, b) => a.vida - b.vida)[0] : masCercano(h, en.filter((e) => e.k !== 'j' || e.agro === h.id || !h.bot || h.ataca), r);
      if (obj) {h.cd.a = 1 / st.vatq; h.rot = Math.atan2(obj.x - h.x, obj.z - h.z); if (h.buf.invis) h.buf.invis = 0; golpea(h, obj);}
    }
  }
  /* súbditos */
  for (const u of S.u) {
    if (u.k !== 's' || u.muerto) continue;
    const sd = SUBD[u.tipo], s = signo(u.eq); u.cd = Math.max(0, u.cd - dt);
    if (u.aturd > S.t) continue;
    const en = enemigosDe(u.eq).filter((e) => e.eq !== 2 && atacable(e)), obj = masCercano(u, en, u.tipo === 'r' ? 7 : 6);
    const vel = sd.vel * (u.lento > S.t ? 0.6 : 1);
    if (obj) {
      const d0 = dist(u, obj) - radio(obj);
      if (d0 > sd.alcance) {mueveHacia(u, obj.x, obj.z, vel, dt); u.mueve = true;}
      else {u.mueve = false; u.rot = Math.atan2(obj.x - u.x, obj.z - u.z); if (u.cd <= 0) {u.cd = 1 / sd.vatq; golpea(u, obj);}}
    } else {u.mueve = mueveHacia(u, u.x * 0.98, -s * (MAPA.nexo + 2), vel, dt);}
  }
  /* la espesura: campamentos que reaparecen y bestias que vuelven a su sitio si te alejas */
  S.campos.forEach((c, ci) => {
    if (c.vivos > 0 || S.t < c.resp) return;
    const nd = NEUTRO[c.tipo], k = 1 + S.t / 600; c.vivos = c.n;
    for (let i = 0; i < c.n; i++) S.u.push({id: idSig++, k: 'j', eq: 2, tipo: c.tipo, campo: ci, x: c.x + (i - (c.n - 1) / 2) * 1.6, z: c.z, cx: c.x + (i - (c.n - 1) / 2) * 1.6, cz: c.z, vida: nd.vida * k, max: nd.vida * k, cd: 0, ac: 0, rot: c.x > 0 ? -Math.PI / 2 : Math.PI / 2, rad: nd.jefe ? 1.1 : 0.6});
    if (nd.jefe) ev(['aviso', 0, 'El ' + nd.nombre + ' ha despertado en la espesura']);
  });
  for (const u of S.u) {
    if (u.k !== 'j' || u.muerto) continue;
    const nd = NEUTRO[u.tipo]; u.cd = Math.max(0, u.cd - dt);
    if (u.aturd > S.t) continue;
    let obj = u.agro && S.t < u.agroT + 4 ? S.u.find((q) => q.id === u.agro && !q.muerto && q.vida > 0) : null;
    const lejos = Math.hypot(u.x - u.cx, u.z - u.cz) > 11;
    if (obj && (lejos || dist(obj, {x: u.cx, z: u.cz}) > 13)) obj = null;
    if (obj) {
      const d0 = dist(u, obj) - radio(obj);
      if (d0 > nd.alcance) {u.mueve = mueveHacia(u, obj.x, obj.z, nd.vel * (u.lento > S.t ? 0.6 : 1), dt);}
      else {u.mueve = false; u.rot = Math.atan2(obj.x - u.x, obj.z - u.z); if (u.cd <= 0) {u.cd = 1 / nd.vatq; golpea(u, obj);}}
    } else {
      u.agro = null; u.mueve = mueveHacia(u, u.cx, u.cz, nd.vel * 1.3, dt);
      if (!u.mueve || lejos) u.vida = Math.min(u.max, u.vida + u.max * 0.25 * dt);
    }
  }
  /* separación entre súbditos para que no se monten */
  const ss = S.u.filter((u) => (u.k === 's' || u.k === 'h') && !u.muerto);
  for (let i = 0; i < ss.length; i++) for (let j = i + 1; j < ss.length; j++) {const a = ss[i], b = ss[j], dx = a.x - b.x, dz = a.z - b.z, d0 = Math.hypot(dx, dz), m = 0.9; if (d0 < m && d0 > 0.001) {const p = (m - d0) / 2; if (a.k === 's') {a.x += dx / d0 * p; a.z += dz / d0 * p;} if (b.k === 's') {b.x -= dx / d0 * p; b.z -= dz / d0 * p;}}}
  /* torres */
  for (const t of S.u) {
    if (t.k !== 't' || t.vida <= 0) continue; t.cd = Math.max(0, t.cd - dt);
    const en = enemigosDe(t.eq).filter((e) => e.eq !== 2 && e.k !== 't' && e.k !== 'n' && dist(t, e) < 9.5);
    let obj = en.find((e) => e.k === 'h' && e.atacoHeroeT > S.t && hs.some((a) => a.eq === t.eq && !a.muerto && dist(a, t) < 11));
    if (!obj) obj = masCercano(t, en.filter((e) => e.k === 's'), 9.5) || masCercano(t, en, 9.5);
    if (obj && t.cd <= 0) {t.cd = 1.1; golpea(t, obj);}
  }
  /* proyectiles */
  for (let i = S.proy.length - 1; i >= 0; i--) {
    const p = S.proy[i], d = p.d;
    if (!d || d.vida <= 0) {S.proy.splice(i, 1); continue;}
    const dx = d.x - p.x, dz = d.z - p.z, l = Math.hypot(dx, dz);
    if (l < 0.6) {dana(p.o, d, p.n, p.tipo); S.proy.splice(i, 1); continue;}
    p.x += dx / l * Math.min(l, p.v * dt); p.z += dz / l * Math.min(l, p.v * dt);
  }
  /* zonas (lluvia de flechas) */
  for (let i = S.zonas.length - 1; i >= 0; i--) {
    const z = S.zonas[i]; z.t -= dt; z.tick -= dt;
    if (z.tick <= 0) {z.tick = 0.5; for (const e of enemigosDe(z.eq)) if (e.k !== 't' && e.k !== 'n' && dist(e, z) < z.r + radio(e)) {dana(z.o, e, z.dps * 0.5, 'hab'); if (e.buf) {e.buf.lento = 0.8; e.buf.lentoV = z.l;} else e.lento = S.t + 0.8;}}
    if (z.t <= 0) S.zonas.splice(i, 1);
  }
  S.u = S.u.filter((u) => !((u.k === 's' || u.k === 'j') && u.muerto && S.t > u.quitar));
}

/* habilidades: las resuelve quien simula. dx,dz: dirección; px,pz: punto */
function usaHab(h, k, dx, dz, px, pz) {
  if (!h || h.muerto || h.aturd > S.t || h.cd[k] > 0 || (k === 'r' && h.nivel < NIVEL_R)) return false;
  const H = HEROES[h.tipo].hab[k], st = stats(h), escala = 1 + 0.08 * (h.nivel - 1) + (st.dano - HEROES[h.tipo].dano) / 150;
  const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; h.rot = Math.atan2(dx, dz);
  h.cd[k] = H.cd; h.hc++; h.hk = k; if (h.buf.invis && H.tipo !== 'invis') h.buf.invis = 0;
  const n = (H.dano || 0) * escala, en = () => enemigosDe(h.eq).filter((e) => e.k !== 'n' && (e.k !== 't' || atacable(e)));
  if (H.tipo === 'dash') {const v = H.dist / 0.28; h.dash = {vx: dx * v, vz: dz * v, t: 0.28, n, aturde: H.aturde, toc: new Set()}; ev(['fx', 'polvo', h.x, h.z, 1.5]);}
  if (H.tipo === 'salto') {const d0 = Math.min(H.dist, Math.hypot(px - h.x, pz - h.z) || H.dist), v = d0 / 0.45; h.dash = {vx: dx * v, vz: dz * v, t: 0.45, salto: true, toc: new Set(), cae: {x: h.x + dx * d0, z: h.z + dz * d0, r: H.radio, n, l: H.lento, dur: H.durL}};}
  if (H.tipo === 'escudo') {h.buf.escudo = H.dur; h.buf.escudoV = H.val * escala; ev(['fx', 'onda', h.x, h.z, 2.5]);}
  if (H.tipo === 'reduce') {h.buf.reduce = H.dur; ev(['fx', 'onda', h.x, h.z, 2.5]);}
  if (H.tipo === 'rafaga') h.buf.rafaga = H.dur;
  if (H.tipo === 'invis') h.buf.invis = H.dur;
  if (H.tipo === 'suerte') {h.buf.suerte = H.dur; h.vida = Math.min(st.vida, h.vida + st.vida * H.cura); ev(['fx', 'onda', h.x, h.z, 3]);}
  if (H.tipo === 'area') {for (const e of en()) if (dist(e, h) < H.radio + radio(e)) {dana(h, e, n, 'hab'); if (H.aturde && e.k !== 't') e.aturd = S.t + H.aturde; if (H.lento) {if (e.buf) {e.buf.lento = H.durL; e.buf.lentoV = H.lento;} else e.lento = S.t + H.durL;}} ev(['fx', 'onda', h.x, h.z, H.radio * 1.8]); ev(['fx', 'explosion', h.x, h.z, H.radio * 0.6]);}
  if (H.tipo === 'cono') {for (const e of en()) {const ex = e.x - h.x, ez = e.z - h.z, d0 = Math.hypot(ex, ez); if (d0 < H.alc + radio(e) && (ex * dx + ez * dz) / (d0 || 1) > Math.cos(H.ang / 2)) dana(h, e, n, 'hab');} ev(['fx', 'tajo', h.x + dx * 1.8, h.z + dz * 1.8, H.alc]);}
  if (H.tipo === 'linea') {
    const ex0 = h.x, ez0 = h.z; let golpeados = 0;
    const lista = en().map((e) => ({e, t: (e.x - ex0) * dx + (e.z - ez0) * dz})).filter((o) => o.t > 0 && o.t < H.alc).sort((a, b) => a.t - b.t);
    for (const o of lista) {const px0 = ex0 + dx * o.t, pz0 = ez0 + dz * o.t; if (Math.hypot(o.e.x - px0, o.e.z - pz0) < H.ancho + radio(o.e)) {const e = o.e; luego(o.t / 26, () => {dana(h, e, n, 'hab'); if (H.aturde && e.k !== 't') e.aturd = S.t + H.aturde;}); golpeados++; if (!H.perfora) break;}}
    ev(['tiro', H.proy, ex0, ez0, ex0 + dx * H.alc, ez0 + dz * H.alc, 26]);
  }
  if (H.tipo === 'zona') {const d0 = Math.min(H.alc, Math.hypot(px - h.x, pz - h.z)), x = h.x + dx * d0, z = h.z + dz * d0; S.zonas.push({x, z, r: H.radio, t: H.dur, tick: 0, dps: H.dps * escala, l: H.lento, eq: h.eq, o: h}); ev(['zona', x, z, H.radio, H.dur]);}
  return true;
}

/* ---------- bots ---------- */
function heroeEn0(h, en) {return en.filter((e) => e.k === 'h').sort((a, b) => dist(h, a) - dist(h, b))[0];}
function ia(h, dt, st) {
  const s = signo(h.eq), en = enemigosDe(h.eq), fz = s * MAPA.fuente;
  h.iaT = (h.iaT || 0) - dt; h.mx = 0; h.mz = 0; h.ataca = false;
  /* compra en la fuente */
  if (Math.abs(h.z - fz) < 7) {const plan = PLAN_BOT[h.tipo] || []; const id = plan[h.plan]; if (id && compra(h, id) === '') h.plan++;}
  const pv = h.vida / st.vida;
  if (pv < 0.28 || h.vuelve) {h.vuelve = pv < 0.92; ve(h, 0, fz); return;}
  /* el segundo de cada equipo (y cualquiera desde nivel 6 en el 1 contra 1) caza en la espesura */
  /* si un compañero está peleando con un jefe de la espesura, se va a ayudarle */
  const jefeAliado = S.u.find((u) => u.k === 'j' && !u.muerto && NEUTRO[u.tipo].jefe && S.u.some((q) => q.k === 'h' && q.eq === h.eq && q !== h && q.id === u.agro));
  if (jefeAliado && pv > 0.6) {if (dist(h, jefeAliado) - radio(jefeAliado) > st.alcance) ve(h, jefeAliado.x, jefeAliado.z); else h.ataca = true; return;}
  const cazador = h.slot >= 2 || (S.u.filter((q) => q.k === 'h').length === 2 && h.nivel >= 6 && Math.floor(S.t / 90) % 2 === 1);
  if (cazador && pv > 0.5) {
    const bestias = S.u.filter((u) => u.k === 'j' && !u.muerto && (NEUTRO[u.tipo].jefe ? h.nivel >= 5 && pv > 0.75 : u.cz * s > 0) && !en.some((e) => e.k === 'h' && dist(e, u) < 12));
    const b = bestias.sort((a, c) => dist(h, a) - dist(h, c))[0];
    if (b && !(heroeEn0(h, en) && dist(h, heroeEn0(h, en)) < 6)) {
      if (dist(h, b) - radio(b) > st.alcance) ve(h, b.x, b.z); else {h.ataca = true; h.mx = 0; h.mz = 0;}
      return;
    }
  }
  /* frente: el súbdito aliado más adelantado; no pasar de él salvo contra un héroe débil */
  const aliados = S.u.filter((u) => u.eq === h.eq && u.k === 's' && !u.muerto);
  const frente = aliados.length ? aliados.reduce((m, u) => (-s * u.z > -s * m.z ? u : m)) : null;
  const torreEn = S.u.find((t) => (t.k === 't' || t.k === 'n') && t.eq !== h.eq && t.vida > 0 && atacable(t));
  const heroeEn = en.filter((e) => e.k === 'h').sort((a, b) => dist(h, a) - dist(h, b))[0];
  const enTorre = (p) => S.u.some((t) => t.k === 't' && t.eq !== h.eq && t.vida > 0 && dist(t, p) < 9.5);
  let objetivo = null;
  if (heroeEn && dist(h, heroeEn) < st.alcance + 4 && (heroeEn.vida / stats(heroeEn).vida < pv + 0.15) && !enTorre(heroeEn)) objetivo = heroeEn;
  if (!objetivo) {const c = masCercano(h, en.filter((e) => e.k === 's' && !enTorre(e)), st.alcance + 3); if (c) objetivo = c;}
  const nadieDefiende = !en.some((e) => e.k === 'h' && torreEn && dist(e, torreEn) < 14);
  if (!objetivo && torreEn && (aliados.some((a) => dist(a, torreEn) < 9) || nadieDefiende) && (dist(h, torreEn) < st.alcance + 5 || nadieDefiende)) objetivo = torreEn;
  /* habilidades */
  if (heroeEn && dist(h, heroeEn) < 9 && h.iaT <= 0) {
    h.iaT = 0.6;
    for (const k of ['r', 'q', 'e', 'w']) {
      const H = HEROES[h.tipo].hab[k]; if (h.cd[k] > 0 || (k === 'r' && h.nivel < NIVEL_R)) continue;
      const d0 = dist(h, heroeEn), alc = H.alc || H.dist || H.radio || 4;
      if (['escudo', 'reduce', 'rafaga', 'suerte', 'invis'].includes(H.tipo)) {if (d0 < 6) {usaHab(h, k, heroeEn.x - h.x, heroeEn.z - h.z, heroeEn.x, heroeEn.z); break;} continue;}
      if (d0 < alc + 0.5) {usaHab(h, k, heroeEn.x - h.x, heroeEn.z - h.z, heroeEn.x, heroeEn.z); break;}
    }
  }
  if (objetivo) {
    const d0 = dist(h, objetivo) - radio(objetivo);
    if (d0 > st.alcance) ve(h, objetivo.x, objetivo.z); else h.ataca = true;
  } else {
    const tz = frente ? frente.z + s * 3 : s * (MAPA.torre1 - 2);
    if (Math.abs(h.z - tz) > 1 || Math.abs(h.x) > 7) ve(h, frente ? frente.x * 0.5 : 0, tz);
  }
}

/* ---------- tienda ---------- */
function puedeComprar(h) {return h.muerto || Math.abs(h.z - signo(h.eq) * MAPA.fuente) < 8;}
function falta(h, id) {const o = OBJ[id]; if (!o.rec) return []; const q = [...h.inv], f = []; for (const r of o.rec) {const k = q.indexOf(r); if (k >= 0) q.splice(k, 1); else f.push(r);} return f;}
function compra(h, id) {
  const o = OBJ[id]; if (!o) return 'No existe';
  if (!puedeComprar(h)) return 'Solo se compra en tu fuente (o mientras esperas a volver)';
  const fl = falta(h, id); if (fl.length) return 'Antes necesitas: ' + fl.map((f) => OBJ[f].t).join(' y ');
  if (h.oro < o.c) return 'Te falta oro';
  const usa = o.rec ? [...o.rec] : [];
  if (h.inv.length - usa.length >= 6) return 'No caben más objetos';
  const v0 = stats(h).vida; h.oro -= o.c; for (const u of usa) h.inv.splice(h.inv.indexOf(u), 1); h.inv.push(id);
  h.vida += Math.max(0, stats(h).vida - v0); return '';
}

/* ---------- foto de la partida (anfitrión → todos) ---------- */
const AN = {quieto: 0, correr: 1};
function foto() {
  const u = S.u.map((q) => q.k === 'h'
    ? [q.id, 'h', q.eq, +q.x.toFixed(2), +q.z.toFixed(2), +(q.rot || 0).toFixed(2), Math.round(q.vida), Math.round(stats(q).vida), q.mueve || q.dash ? 1 : 0, q.ac, q.hc, q.hk, q.muerto ? Math.max(0, Math.ceil(q.resp - S.t)) : -1, q.tipo, q.nivel, Math.floor(q.oro), q.inv.join(','), ['q', 'w', 'e', 'r'].map((k) => +q.cd[k].toFixed(1)).join(','), (q.buf.invis > 0 ? 1 : 0) | (q.aturd > S.t ? 2 : 0) | (q.buf.escudo > 0 ? 4 : 0), q.nombre, q.slot, +(q.xp / xpNivel(q.nivel)).toFixed(2)]
    : [q.id, q.k, q.eq, +q.x.toFixed(2), +q.z.toFixed(2), +(q.rot || 0).toFixed(2), Math.round(q.vida), Math.round(q.max), q.mueve ? 1 : 0, q.ac || 0, 0, '', q.muerto ? 0 : -1, q.tipo || q.n || 0]);
  const be = S.bufEq.map((b) => [Math.max(0, Math.round((b.troll || 0) - S.t)), Math.max(0, Math.round((b.alfa || 0) - S.t))]);
  const cp = S.campos.map((c) => c.vivos > 0 ? -1 : Math.max(0, Math.round(c.resp - S.t)));
  return {t: +S.t.toFixed(2), u, m: S.muertes, be, cp, ev: S.ev.splice(0)};
}
function aplicaFila(f, t) {
  const [id, k, eq, x, z, rot, vida, max, mueve, ac, hc, hk, muerto, tipo] = f;
  let v = VISTA.get(id);
  if (!v) {v = {id, k, eq, x, z, rot, x0: x, z0: z, r0: rot, t0: t, t1: t}; VISTA.set(id, v);}
  else {v.x0 = v.xi ?? v.x; v.z0 = v.zi ?? v.z; v.r0 = v.ri ?? v.rot; v.t0 = performance.now();}
  Object.assign(v, {x, z, rot, vida, max, mueve, ac, hc, hk, muerto, tipo, visto: true, llega: performance.now()});
  if (k === 'h') Object.assign(v, {nivel: f[14], oro: f[15], inv: f[16] ? f[16].split(',') : [], cds: f[17].split(',').map(Number), flags: f[18], nombre: f[19], slot: f[20], xpP: f[21]});
}
function recibeFoto(o) {
  for (const v of VISTA.values()) v.visto = false;
  for (const f of o.u) aplicaFila(f, o.t);
  for (const [id, v] of VISTA) if (!v.visto) {quitaVis(id); VISTA.delete(id);}
  marcador(o.m, o.t); EXTRA.be = o.be; EXTRA.cp = o.cp;
  for (const e of o.ev || []) efectoLocal(e);
}

/* ---------- dibujo ---------- */
const VIS = new Map();
const PROY_MODELOS = {};
function modeloProy(n) {if (!PROY_MODELOS[n]) {const o = M.proyectiles.scene.getObjectByName(n); PROY_MODELOS[n] = o ? o.clone(true) : new THREE.Object3D(); PROY_MODELOS[n].position.set(0, 0, 0);} return PROY_MODELOS[n].clone(true);}
const texAro = cargaTex('ui/aro_heroe.webp');
function aro(color, r) {const g = new THREE.PlaneGeometry(r * 2, r * 2); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({map: texAro, color, transparent: true, depthWrite: false, opacity: 0.85})); m.renderOrder = 2; return m;}
function creaVis(v) {
  let o = {};
  if (v.k === 'h') {o = montar(HEROES[v.tipo].modelo, 2.05); o.aro = aro(v.eq === MI_EQ ? '#6fc8ff' : '#ff5a4a', 0.95); if (v.id === YO) o.aro.material.color.set('#ffd24a'); scene.add(o.aro);}
  else if (v.k === 's') o = montar(MODELO_SUBD[v.eq][v.tipo], ALTO_SUBD[v.tipo]);
  else if (v.k === 'j') o = montar(NEUTRO[v.tipo].modelo, NEUTRO[v.tipo].alto);
  else if (v.k === 't') {
    const g = new THREE.Group(), t = M.torre_k.scene.clone(true); t.scale.setScalar(0.62); g.add(t);
    const b = M.estandarte_patio.scene.clone(true); b.position.set(0, 3.4, 0); b.scale.setScalar(0.8); g.add(b);
    g.traverse((q) => {if (q.isMesh) {q.castShadow = true; q.receiveShadow = true; if (v.eq === 1 && q.name === 'tela') {q.material = q.material.clone(); q.material.color.set('#c0392b');}}});
    o = {raiz: g}; luzFuego(1.6, v.z);
  } else if (v.k === 'n') {
    const g = new THREE.Group(), b = M.estandarte_muro.scene.clone(true); b.scale.setScalar(1.5); g.add(b);
    for (const x of [-2.2, 2.2]) {const a = M.antorcha_pie.scene.clone(true); a.position.set(x, 0, 0); a.scale.setScalar(1.4); g.add(a);}
    g.traverse((q) => {if (q.isMesh) {q.castShadow = true; if (v.eq === 1 && q.name === 'tela') {q.material = q.material.clone(); q.material.color.set('#c0392b');}}});
    o = {raiz: g};
  }
  o.raiz.position.set(v.x, 0, v.z); scene.add(o.raiz); o.ac = v.ac; o.hc = v.hc;
  if (o.clips) pon(o, 'quieto');
  VIS.set(v.id, o); return o;
}
function quitaVis(id) {const o = VIS.get(id); if (!o) return; scene.remove(o.raiz); if (o.aro) scene.remove(o.aro); VIS.delete(id); const b = BARRAS.get(id); if (b) {b.remove(); BARRAS.delete(id);}}
const BARRAS = new Map();
const _p = new THREE.Vector3();
function dibuja(dt) {
  const ahora = performance.now();
  for (const v of VISTA.values()) {
    let o = VIS.get(v.id); if (!o) o = creaVis(v);
    /* interpolación: de la posición anterior a la nueva en el tiempo entre fotos */
    let x = v.x, z = v.z, r = v.rot;
    if (!S && v.id !== YO) {const k = Math.min(1, (ahora - v.t0) / 90); x = v.x0 + (v.x - v.x0) * k; z = v.z0 + (v.z - v.z0) * k; let dr = v.rot - v.r0; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); r = v.r0 + dr * k;}
    v.xi = x; v.zi = z; v.ri = r;
    const muerto = v.k === 'h' ? v.muerto >= 0 : v.muerto === 0;
    o.raiz.position.set(x, 0, z);
    if (o.clips) {
      let dr = r - (o.rv ?? r); dr = Math.atan2(Math.sin(dr), Math.cos(dr)); o.rv = (o.rv ?? r) + dr * Math.min(1, dt * 14); o.raiz.rotation.y = o.rv;
      if (muerto) pon(o, 'morir', 0.1);
      else {
        if (v.hc !== o.hc) {o.hc = v.hc; otraVez(o, 'hab'); o.ocup = 0.45;}
        else if (v.ac !== o.ac) {o.ac = v.ac; otraVez(o, 'atacar'); o.ocup = 0.35;}
        o.ocup = (o.ocup || 0) - dt;
        if (o.ocup <= 0) pon(o, v.flags & 2 ? 'aturdido' : v.mueve ? 'correr' : 'quieto');
      }
      o.mixer.update(dt);
      const invis = v.k === 'h' && v.flags & 1; o.raiz.visible = !(invis && v.eq !== MI_EQ) && !(v.k === 'h' && muerto && v.muerto > 3);
      if (invis && v.eq === MI_EQ) o.raiz.traverse((q) => {if (q.isMesh) {q.material.transparent = true; q.material.opacity = 0.4;}}); else if (o.semi) o.raiz.traverse((q) => {if (q.isMesh) q.material.opacity = 1;});
      o.semi = invis;
    } else if (v.k === 't' || v.k === 'n') o.raiz.visible = v.vida > 0;
    if (o.aro) {o.aro.position.set(x, 0.05, z); o.aro.visible = o.raiz.visible && !muerto; o.aro.rotation.y += dt * 0.6;}
    /* barra de vida */
    let b = BARRAS.get(v.id);
    if (!b) {b = document.createElement('div'); b.className = 'bv ' + {h: 'h', s: 'm', t: 't', n: 't', j: NEUTRO[v.tipo] && NEUTRO[v.tipo].jefe ? 't' : 'm'}[v.k] + ' e' + (v.eq === 2 ? 2 : v.eq === MI_EQ ? 0 : 1); b.innerHTML = (v.k === 'h' ? '<b></b>' : '') + '<i><u></u></i>'; $('barras').appendChild(b); BARRAS.set(v.id, b);}
    const altoB = v.k === 'h' ? 2.6 : v.k === 's' ? 2 : v.k === 'j' ? NEUTRO[v.tipo].alto + 0.6 : v.k === 't' ? 5.2 : 6.5;
    _p.set(x, altoB, z).project(camera);
    const vis = o.raiz.visible && !muerto && v.vida > 0 && _p.z < 1 && Math.abs(_p.x) < 1.2 && Math.abs(_p.y) < 1.2 && (v.k !== 's' || v.vida < v.max) && (v.k !== 'j' || v.vida < v.max || NEUTRO[v.tipo].jefe);
    b.style.display = vis ? 'flex' : 'none';
    if (vis) {b.style.left = ((_p.x + 1) / 2 * innerWidth) + 'px'; b.style.top = ((1 - _p.y) / 2 * innerHeight) + 'px'; b.querySelector('u').style.width = Math.max(0, v.vida / v.max * 100) + '%'; if (v.k === 'h') b.querySelector('b').innerHTML = '<em>' + v.nivel + '</em>' + (v.nombre || '');}
  }
  /* proyectiles y efectos */
  for (let i = FXP.length - 1; i >= 0; i--) {
    const p = FXP[i]; p.t += dt;
    if (p.tipo === 'proy') {const d = VISTA.get(p.d); const tx = d ? (d.xi ?? d.x) : p.tx, tz = d ? (d.zi ?? d.z) : p.tz; p.tx = tx; p.tz = tz; const dx = tx - p.x, dz = tz - p.z, l = Math.hypot(dx, dz); if (l < 0.5 || p.t > 2) {scene.remove(p.o); FXP.splice(i, 1); continue;} p.x += dx / l * Math.min(l, p.v * dt); p.z += dz / l * Math.min(l, p.v * dt); p.o.position.set(p.x, p.y, p.z); p.o.rotation.y = Math.atan2(dx, dz);}
    else if (p.tipo === 'tiro') {const k = Math.min(1, p.t / p.dur); p.o.position.set(p.x + (p.tx - p.x) * k, 1.2, p.z + (p.tz - p.z) * k); if (k >= 1) {scene.remove(p.o); FXP.splice(i, 1);}}
    else {const k = p.t / p.dur; if (k >= 1) {scene.remove(p.o); FXP.splice(i, 1); continue;} if (p.flip) {const f = Math.min(p.flip.n - 1, Math.floor(k * p.flip.n)); p.o.material.map.offset.set((f % p.flip.c) / p.flip.c, 1 - (Math.floor(f / p.flip.c) + 1) / p.flip.r);} if (p.crece) p.o.scale.setScalar(p.esc * (0.6 + 0.6 * k)); if (p.o.material) p.o.material.opacity = (p.op || 1) * (1 - k * k);}
  }
  for (let i = NUMS.length - 1; i >= 0; i--) {
    const n = NUMS[i]; n.t += dt; if (n.t > 0.8) {n.el.remove(); NUMS.splice(i, 1); continue;}
    _p.set(n.x, 2.2 + n.t * 1.6, n.z).project(camera); n.el.style.left = ((_p.x + 1) / 2 * innerWidth) + 'px'; n.el.style.top = ((1 - _p.y) / 2 * innerHeight) + 'px'; n.el.style.opacity = 1 - Math.max(0, n.t - 0.5) / 0.3;
  }
}
/* efectos que llegan como avisos de la simulación (se ven igual en todos los móviles) */
const FXP = [], NUMS = [];
const FB = {impacto: ['texturas/fx_impacto.webp', 2, 2], onda: ['texturas/fx_onda.webp', 4, 1], explosion: ['texturas/fx_explosion.webp', 4, 4], tajo: ['texturas/fx_tajo.webp', 4, 1], polvo: ['texturas/fx_humo.webp', 4, 2], fuego: ['texturas/fx_fuego.webp', 4, 2]};
const fbTex = {};
function flip(nombre, x, z, tam, suelo) {
  const [f, c, r] = FB[nombre]; if (!fbTex[f]) fbTex[f] = cargaTex(f);
  const t = fbTex[f].clone(); t.needsUpdate = true; t.repeat.set(1 / c, 1 / r);
  const mat = new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, blending: nombre === 'polvo' ? THREE.NormalBlending : THREE.AdditiveBlending});
  let o; if (suelo) {const g = new THREE.PlaneGeometry(tam, tam); g.rotateX(-Math.PI / 2); o = new THREE.Mesh(g, mat); o.position.set(x, 0.12, z);} else {o = new THREE.Sprite(mat); o.scale.setScalar(tam); o.position.set(x, 1.3, z);}
  scene.add(o); FXP.push({o, t: 0, dur: nombre === 'onda' ? 0.5 : 0.45, flip: {c, r, n: c * r}, esc: tam});
}
/* sonido con WebAudio: cada archivo se descodifica una vez y se reproduce sin crear reproductores nuevos */
let AC = null; const SON = {}, SON_T = {};
function suena(n, vol = 0.5) {
  const lista = {golpe: 'golpe_carne', espada: 'espada_corte', arco: 'disparo_arco', clavada: 'flecha_clavada', muerte: 'muerte_orco', nivel: 'subir_nivel', moneda: 'recoger_moneda', cuerno: 'cuerno_lejano', explosion: 'explosion_piedras', viento: 'rafaga_viento', magia: 'rayo_magico'}[n]; if (!lista) return;
  const ahora = performance.now(); if (ahora - (SON_T[n] || 0) < 70) return; SON_T[n] = ahora;
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const f = '../abismo/sonidos/fx/' + lista + '_' + (1 + Math.floor(Math.random() * 3)) + '.mp3';
    if (!SON[f]) {SON[f] = 'cargando'; fetch(f).then((r) => r.arrayBuffer()).then((b) => AC.decodeAudioData(b)).then((buf) => {SON[f] = buf;}).catch(() => {SON[f] = null;}); return;}
    if (!(SON[f] instanceof AudioBuffer)) return;
    const src = AC.createBufferSource(), g = AC.createGain(); g.gain.value = vol; src.buffer = SON[f]; src.connect(g).connect(AC.destination); src.start();
  } catch (e) {}
}
function numero(x, z, txt, cls) {const el = document.createElement('div'); el.className = 'num ' + (cls || ''); el.textContent = txt; $('barras').appendChild(el); NUMS.push({el, x: x + rnd(-0.3, 0.3), z, t: 0});}
function efectoLocal(e) {
  const t = e[0];
  if (t === 'num') {if (e[4] === 'o' && e[5] !== YO) return; numero(e[1], e[2], e[3], e[4]); if (e[4] === 'o') suena('moneda', 0.3);}
  if (t === 'fx') {if (e[1] === 'onda') flip('onda', e[2], e[3], e[4], true); else flip(e[1], e[2], e[3], e[4], e[1] === 'tajo'); if (e[1] === 'explosion') suena('explosion', 0.6); if (e[1] === 'onda') suena('viento', 0.4);}
  if (t === 'proy') {const o = modeloProy(e[1]); o.scale.multiplyScalar(e[6] || 1); scene.add(o); FXP.push({tipo: 'proy', o, x: e[2], z: e[3], y: e[7] || 1.2, d: e[4], v: e[5], t: 0}); suena(e[1] === 'piedra' ? 'golpe' : 'arco', 0.25);}
  if (t === 'tiro') {const o = modeloProy(e[1]); o.scale.multiplyScalar(1.6); o.rotation.y = Math.atan2(e[4] - e[2], e[5] - e[3]); scene.add(o); FXP.push({tipo: 'tiro', o, x: e[2], z: e[3], tx: e[4], tz: e[5], dur: Math.hypot(e[4] - e[2], e[5] - e[3]) / e[6], t: 0}); suena('arco', 0.5);}
  if (t === 'zona') {const a = aro('#ffd9a0', e[3]); a.position.set(e[1], 0.08, e[2]); scene.add(a); FXP.push({o: a, t: 0, dur: e[4], op: 0.9}); for (let i = 0; i < 8; i++) setTimeout(() => flip('impacto', e[1] + rnd(-e[3], e[3]) * 0.7, e[2] + rnd(-e[3], e[3]) * 0.7, 1.2), i * 350); suena('arco', 0.5);}
  if (t === 'muere') suena('muerte', 0.35);
  if (t === 'aviso' && (e[1] === 0 || e[1] === YO)) aviso(e[2]);
  if (t === 'fin') acaba(e[1]);
}
let avisoT = 0;
function aviso(txt) {const a = $('aviso'); a.textContent = txt; a.style.opacity = 1; clearTimeout(avisoT); avisoT = setTimeout(() => {a.style.opacity = 0;}, 2200);}

/* ---------- cámara ---------- */
const camM = new THREE.Vector3();
const ZOOMS = [[24, 14], [31, 18], [40, 23]]; let zoomI = +(localStorage.getItem('vado.zoom') ?? 1);
function camara(dt) {
  const v = VISTA.get(YO); if (!v) return;
  const s = signo(MI_EQ), x = v.xi ?? v.x, z = v.zi ?? v.z;
  camM.x += (x - camM.x) * Math.min(1, dt * 6); camM.z += (z - s * 3 - camM.z) * Math.min(1, dt * 6);
  const zz = ZOOMS[zoomI]; camera.position.set(camM.x, zz[0], camM.z + s * zz[1]); camera.lookAt(camM.x, 0, camM.z);
  sol.position.set(camM.x + 10, 40, camM.z + 8); sol.target.position.set(camM.x, 0, camM.z);
}

/* ---------- mandos ---------- */
const MANDO = {mx: 0, mz: 0, ataca: false};
const joy = {id: null, x0: 0, y0: 0};
function preparaMandos() {
  const J = $('joy'), bola = J.querySelector('b'), dedo = bola.querySelector('i');
  J.addEventListener('pointerdown', (e) => {joy.id = e.pointerId; joy.x0 = e.clientX; joy.y0 = e.clientY; bola.style.display = 'block'; bola.style.left = e.clientX + 'px'; bola.style.top = (e.clientY - J.getBoundingClientRect().top) + 'px'; J.setPointerCapture(e.pointerId);});
  J.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joy.id) return; let dx = (e.clientX - joy.x0) / 50, dy = (e.clientY - joy.y0) / 50; const l = Math.hypot(dx, dy); if (l > 1) {dx /= l; dy /= l;}
    dedo.style.transform = 'translate(' + dx * 35 + 'px,' + dy * 35 + 'px)'; const s = signo(MI_EQ); MANDO.mx = s * dx; MANDO.mz = s * dy;
  });
  const suelta = (e) => {if (e.pointerId !== joy.id) return; joy.id = null; bola.style.display = 'none'; dedo.style.transform = ''; MANDO.mx = 0; MANDO.mz = 0;};
  J.addEventListener('pointerup', suelta); J.addEventListener('pointercancel', suelta);
  const at = $('bAt');
  at.addEventListener('pointerdown', (e) => {MANDO.ataca = true; at.setPointerCapture(e.pointerId);});
  for (const t of ['pointerup', 'pointercancel']) at.addEventListener(t, () => {MANDO.ataca = false;});
  for (const k of ['q', 'w', 'e', 'r']) {
    const b = $('b' + k.toUpperCase()); let p0 = null, apunta = null;
    b.addEventListener('pointerdown', (e) => {p0 = {x: e.clientX, y: e.clientY, id: e.pointerId}; b.setPointerCapture(e.pointerId);});
    b.addEventListener('pointermove', (e) => {if (!p0 || e.pointerId !== p0.id) return; const dx = e.clientX - p0.x, dy = e.clientY - p0.y; if (Math.hypot(dx, dy) > 18) {apunta = {dx, dy}; muestraMira(k, dx, dy);}});
    b.addEventListener('pointerup', (e) => {if (!p0) return; const a = apunta; p0 = null; apunta = null; ocultaMira(); lanzaMia(k, a);});
    b.addEventListener('pointercancel', () => {p0 = null; apunta = null; ocultaMira();});
  }
  $('bTienda').onclick = abreTienda;
  $('bZoom').onclick = () => {zoomI = (zoomI + 1) % ZOOMS.length; localStorage.setItem('vado.zoom', zoomI);};
  $('bBase').onclick = () => {const v = VISTA.get(YO); if (!v || v.muerto >= 0) return; volverBase = 3; aviso('Volviendo a la fuente… (no te muevas 3 s)');};
}
let volverBase = 0;
let mira = null;
function muestraMira(k, dx, dy) {
  const v = VISTA.get(YO); if (!v) return; const H = HEROES[v.tipo].hab[k], s = signo(MI_EQ), l = Math.hypot(dx, dy), wx = s * dx / l, wz = s * dy / l, alc = H.alc || H.dist || H.radio || 4;
  if (!mira) {mira = {aro: aro('#ffffff', 1), linea: new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: '#ffe9a8', transparent: true, opacity: 0.35, depthWrite: false}))}; scene.add(mira.aro, mira.linea);}
  const x = v.xi ?? v.x, z = v.zi ?? v.z, k2 = Math.min(1, l / 90);
  if (H.tipo === 'zona' || H.tipo === 'salto') {mira.linea.visible = false; mira.aro.visible = true; mira.aro.scale.setScalar(H.radio); mira.aro.position.set(x + wx * alc * k2, 0.1, z + wz * alc * k2);}
  else if (H.tipo === 'area') {mira.linea.visible = false; mira.aro.visible = true; mira.aro.scale.setScalar(H.radio); mira.aro.position.set(x, 0.1, z);}
  else {mira.aro.visible = false; mira.linea.visible = true; mira.linea.scale.set(H.ancho ? H.ancho * 2 : 1.4, 1, alc); mira.linea.position.set(x + wx * alc / 2, 0.1, z + wz * alc / 2); mira.linea.rotation.y = Math.atan2(wx, wz);}
  mira.dir = {wx, wz, px: x + wx * alc * k2, pz: z + wz * alc * k2};
}
function ocultaMira() {if (mira) {mira.aro.visible = false; mira.linea.visible = false;}}
function lanzaMia(k, apunta) {
  const v = VISTA.get(YO); if (!v || v.muerto >= 0) return;
  const i = 'qwer'.indexOf(k); if (v.cds && v.cds[i] > 0) return; if (k === 'r' && v.nivel < NIVEL_R) {aviso('La definitiva se desbloquea a nivel ' + NIVEL_R); return;}
  const H = HEROES[v.tipo].hab[k], x = v.xi ?? v.x, z = v.zi ?? v.z; let dx, dz, px, pz;
  if (apunta && mira && mira.dir) {dx = mira.dir.wx; dz = mira.dir.wz; px = mira.dir.px; pz = mira.dir.pz;}
  else {/* toque: apunta solo al héroe enemigo más cercano (o a lo que tengas delante) */
    let mejor = null, md = (H.alc || H.dist || 6) + 4; for (const q of VISTA.values()) if (q.eq !== MI_EQ && (q.k === 'h' ? q.muerto < 0 && !(q.flags & 1) : (q.k === 's' || q.k === 'j') && q.muerto !== 0)) {const d0 = Math.hypot(q.x - x, q.z - z) - (q.k === 'h' ? 0 : 3); if (d0 < md) {md = d0; mejor = q;}}
    if (mejor) {dx = mejor.x - x; dz = mejor.z - z; px = mejor.x; pz = mejor.z;} else {const r = v.rot || 0; dx = Math.sin(r); dz = Math.cos(r); px = x + dx * 5; pz = z + dz * 5;}
  }
  suena(['dash', 'salto'].includes(H.tipo) ? 'viento' : 'espada', 0.5);
  if (S) {const h = S.u.find((q) => q.id === YO); usaHab(h, k, dx, dz, px, pz);}
  else {
    NET.manda({t: 'hab', k, dx, dz, px, pz, x: MIO.x, z: MIO.z});
    /* el movimiento de las cargas y saltos lo hace mi móvil al momento (y el anfitrión, igual) */
    if (H.tipo === 'dash' || H.tipo === 'salto') {const l = Math.hypot(dx, dz) || 1, d0 = H.tipo === 'salto' ? Math.min(H.dist, Math.hypot(px - x, pz - z) || H.dist) : H.dist, T = H.tipo === 'salto' ? 0.45 : 0.28; MIO.dash = {vx: dx / l * d0 / T, vz: dz / l * d0 / T, t: T};}
  }
}
/* mi héroe en un móvil que no simula: se mueve aquí y se avisa al anfitrión */
const MIO = {x: 0, z: 0, rot: 0, listo: false, dash: null};
function mueveMio(dt) {
  const v = VISTA.get(YO); if (!v) return;
  if (!MIO.listo || v.muerto >= 0) {MIO.x = v.x; MIO.z = v.z; MIO.listo = v.muerto < 0; return;}
  const st = {vel: HEROES[v.tipo].vel * (v.inv.includes('botas') ? 1.12 : 1) * (v.inv.includes('capa') ? 1.18 : 1)};
  if (MIO.dash) {MIO.x += MIO.dash.vx * dt; MIO.z += MIO.dash.vz * dt; MIO.dash.t -= dt; if (MIO.dash.t <= 0) MIO.dash = null;}
  else if (!(v.flags & 2) && (MANDO.mx || MANDO.mz)) {const l = Math.hypot(MANDO.mx, MANDO.mz); MIO.x += MANDO.mx / l * st.vel * Math.min(1, l) * dt; MIO.z += MANDO.mz / l * st.vel * Math.min(1, l) * dt; MIO.rot = Math.atan2(MANDO.mx, MANDO.mz);}
  limita(MIO);
  /* si el anfitrión me ve muy lejos (me han empujado, he reaparecido), manda él */
  if (Math.hypot(v.x - MIO.x, v.z - MIO.z) > 6 && !MIO.dash) {MIO.x = v.x; MIO.z = v.z;}
  v.xi = MIO.x; v.zi = MIO.z; v.x = MIO.x; v.z = MIO.z; v.rot = MANDO.mx || MANDO.mz ? MIO.rot : v.rot; v.mueve = !!(MANDO.mx || MANDO.mz || MIO.dash);
}

/* ---------- red ---------- */
NET.manda = (o) => {if (NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(o));};
function conecta(codigo, modo, nombre, heroe) {
  const proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
  const base = window.SALA_URL || (proto + location.host);
  const ws = new WebSocket(base + '/api/sala/' + codigo + '?modo=' + modo + '&nombre=' + encodeURIComponent(nombre) + '&heroe=' + heroe);
  NET.ws = ws; NET.codigo = codigo; NET.online = true;
  ws.onmessage = (m) => {let o; try {o = JSON.parse(m.data);} catch (e) {return;} recibe(o);};
  ws.onclose = () => {if (ESTADO === 'juego' && !S) {aviso('Se ha perdido la conexión'); setTimeout(() => acaba(-1), 1500);} else if (ESTADO === 'sala') msg('Conexión cerrada');};
  ws.onerror = () => msg('No se puede conectar con la sala (¿está activado el servidor en Cloudflare?)');
  ESTADO = 'sala';
}
function recibe(o) {
  if (o.t === 'hola') NET.soy = o.slot;
  if (o.t === 'error') msg(o.txt);
  if (o.t === 'sala') {NET.jugadores = o.jugadores; NET.anf = o.anfitrion; NET.modo = o.modo; pintaSala();}
  if (o.t === 'empieza') {NET.jugadores = o.jugadores; NET.modo = o.modo; empieza(o.jugadores, o.modo, NET.soy === NET.anf);}
  if (o.t === 'pong') {NET.ping = Math.round(performance.now() - o.c); $('ping').textContent = NET.ping + ' ms';}
  if (o.t === 'foto' && !S) recibeFoto(o.f);
  if (S) {/* soy el anfitrión: mandos de los demás */
    const h = S.u.find((q) => q.k === 'h' && q.slot === o.de); if (!h) return;
    if (o.t === 'in') {if (!h.muerto && !h.dash && !(h.aturd > S.t)) {h.x = o.x; h.z = o.z; h.rot = o.rot; h.mueve = o.m;} h.ataca = o.a; h.prioHeroe = true;}
    if (o.t === 'hab') {h.x = o.x; h.z = o.z; usaHab(h, o.k, o.dx, o.dz, o.px, o.pz);}
    if (o.t === 'compra') {const r = compra(h, o.id); if (r) S.ev.push(['aviso', h.id, r]);}
    if (o.t === 'volver') {if (!h.muerto) {h.x = 0; h.z = signo(h.eq) * (MAPA.fuente - 3);}}
  }
  if (o.t === 'se_fue') {
    if (S) {const h = S.u.find((q) => q.k === 'h' && q.slot === o.slot); if (h) {h.bot = true; h.nombre += ' (bot)';} aviso(o.nombre + ' se ha ido: lo lleva la máquina');}
    else if (o.slot === NET.anf) {aviso('El anfitrión se ha ido'); setTimeout(() => acaba(-1), 1500);}
  }
}

/* ---------- partida ---------- */
let fotoT = 0, inT = 0, pingT = 0, reloj0 = 0;
function empieza(jugadores, modo, simulo) {
  ESTADO = 'juego'; $('menu').classList.add('hidden'); ['hud', 'joy', 'mandos', 'bTienda', 'bBase', 'bZoom', 'mini', 'objetivo'].forEach((i) => $(i).classList.remove('hidden'));
  VISTA = new Map(); for (const id of [...VIS.keys()]) quitaVis(id);
  const yo = jugadores.find((j) => j.slot === NET.soy) || jugadores[0]; MI_EQ = yo.slot % 2;
  if (simulo) {nuevaPartida(jugadores, modo); const h = S.u.find((q) => q.k === 'h' && q.slot === yo.slot); h.local = true; YO = h.id; recibeFoto(foto());}
  else {S = null; YO = null; const pide = setInterval(() => {const v = [...VISTA.values()].find((q) => q.k === 'h' && q.slot === yo.slot); if (v) {YO = v.id; MIO.listo = false; clearInterval(pide); iconosHab(v.tipo);}}, 100);}
  if (simulo) iconosHab(yo.heroe);
  $('yoImg').src = '../abismo/ui/' + HEROES[yo.heroe].retrato + '.webp';
  camM.set(0, 0, signo(MI_EQ) * MAPA.fuente); reloj0 = performance.now();
  aviso('¡Al vado! Derriba las torres y el estandarte enemigo'); suena('cuerno', 0.7);
}
function iconosHab(tipo) {for (const k of ['q', 'w', 'e', 'r']) {const b = $('b' + k.toUpperCase()); b.querySelector('img').src = ICO(HEROES[tipo].hab[k].icono); b.title = HEROES[tipo].hab[k].n;}}
function marcador(m, t) {$('marcador').dataset.t = t;$('marcador').innerHTML = '<span class="a">' + m[MI_EQ] + '</span> · <span class="b">' + m[1 - MI_EQ] + '</span><div style="font-size:11px;color:#d9c49a">' + Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') + '</div>';}
let miniT = 0, consejoI = 0;
const CONSEJOS = ['Mueve con el joystick y mantén ⚔ para atacar: primero a lo que tengas más cerca', 'Toca una habilidad para lanzarla sola; arrástrala para apuntar tú', 'Las torres pegan muy fuerte: entra con tus súbditos delante, que reciban ellos', 'En la espesura (a los lados, cruzando los huecos de la empalizada) hay huargos: dan oro y experiencia', 'El troll (oeste) y el huargo alfa (este) dan una bendición a todo tu equipo durante 90 s', 'Con poca vida pulsa ⌂: vuelves a la fuente, te curas y compras en la armería'];
function consejos(t) {if (localStorage.getItem('vado.consejos') === '3') return; const i = Math.floor((t - 2) / 14); if (i >= 0 && i < CONSEJOS.length && i >= consejoI) {consejoI = i + 1; aviso('💡 ' + CONSEJOS[i]); if (i === CONSEJOS.length - 1) localStorage.setItem('vado.consejos', String(+(localStorage.getItem('vado.consejos') || 0) + 1));}}
function objetivoTxt() {
  const en = (k, n) => [...VISTA.values()].find((q) => q.k === k && q.eq === 1 - MI_EQ && (n === undefined || q.tipo === n) && q.vida > 0);
  if (en('t', 1)) return 'Objetivo: la torre exterior enemiga';
  if (en('t', 2)) return 'Objetivo: la torre interior enemiga';
  return '¡Objetivo: el estandarte enemigo!';
}
function minimapa() {
  const c = $('mini'), W = c.width, H = c.height, g = c.getContext('2d'), s = signo(MI_EQ);
  const px = (x) => W / 2 + s * x / 28 * (W / 2), pz = (z) => H / 2 + s * z / 57 * (H / 2);
  g.clearRect(0, 0, W, H); g.fillStyle = '#1d2a18'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#5a4630'; g.fillRect(px(-6) < px(6) ? px(-6) : px(6), 0, Math.abs(px(6) - px(-6)), H);
  g.fillStyle = '#29495a'; g.fillRect(0, pz(-2.5) < pz(2.5) ? pz(-2.5) : pz(2.5), W, Math.abs(pz(2.5) - pz(-2.5)));
  g.strokeStyle = '#8a6a3a'; g.lineWidth = 2;
  for (const x of [-MURO_X, MURO_X]) {let z0 = -MURO_Z; for (const h of [...HUECOS, MURO_Z + HUECO]) {g.beginPath(); g.moveTo(px(x), pz(z0)); g.lineTo(px(x), pz(h - HUECO)); g.stroke(); z0 = h + HUECO;}}
  CAMPOS.forEach((cp, i) => {const t = EXTRA.cp[i]; g.fillStyle = t === -1 ? (NEUTRO[cp.tipo].jefe ? '#ffb02e' : '#e8d27a') : '#555'; g.beginPath(); g.arc(px(cp.x), pz(cp.z), NEUTRO[cp.tipo].jefe ? 5 : 3.5, 0, 7); g.fill(); if (t > 0) {g.fillStyle = '#bbb'; g.font = '8px system-ui'; g.textAlign = 'center'; g.fillText(t, px(cp.x), pz(cp.z) - 6);}});
  for (const q of VISTA.values()) {
    if (q.k === 'j') continue;
    const mio = q.eq === MI_EQ, col = mio ? '#5fb6ff' : '#ff5a4a', x = px(q.xi ?? q.x), z = pz(q.zi ?? q.z);
    if (q.k === 't' || q.k === 'n') {if (q.vida <= 0) continue; g.fillStyle = col; const r = q.k === 'n' ? 5 : 4; g.fillRect(x - r, z - r, r * 2, r * 2); g.strokeStyle = '#000'; g.lineWidth = 1; g.strokeRect(x - r, z - r, r * 2, r * 2);}
    else if (q.k === 's') {if (q.muerto === 0) continue; g.fillStyle = col; g.fillRect(x - 1.2, z - 1.2, 2.4, 2.4);}
    else if (q.k === 'h') {if (q.muerto >= 0 || (!mio && q.flags & 1)) continue; g.fillStyle = q.id === YO ? '#ffd24a' : col; g.beginPath(); g.arc(x, z, q.id === YO ? 5 : 4, 0, 7); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1.5; g.stroke();}
  }
  /* lo que ve la cámara */
  const vz = ZOOMS[zoomI][0] * 0.45; g.strokeStyle = '#ffffff88'; g.lineWidth = 1; g.strokeRect(px(camM.x) - vz * 1.6, pz(camM.z) - vz * 2.2, vz * 3.2, vz * 3.4);
}
function hud() {
  const v = VISTA.get(YO); if (!v || v.k !== 'h') return;
  miniT -= 1 / 60; if (miniT <= 0) {miniT = 0.15; minimapa(); $('objetivo').textContent = objetivoTxt(); const b = EXTRA.be[MI_EQ] || [0, 0]; $('buffs').innerHTML = (b[0] ? '<span>💪 Troll ' + b[0] + ' s</span>' : '') + (b[1] ? '<span>🐺 Alfa ' + b[1] + ' s</span>' : ''); consejos(+($('marcador').dataset.t || 0));}
  $('yoNv').textContent = 'Nv ' + v.nivel; $('oro').textContent = '🪙 ' + v.oro;
  ['q', 'w', 'e', 'r'].forEach((k, i) => {const b = $('b' + k.toUpperCase()), c = b.querySelector('.cd'), cd = v.cds ? v.cds[i] : 0; c.classList.toggle('hidden', !(cd > 0)); c.textContent = cd > 0 ? Math.ceil(cd) : ''; b.classList.toggle('bloq', k === 'r' && v.nivel < NIVEL_R);});
  const m = $('muerto'); if (v.muerto >= 0) {m.classList.remove('hidden'); m.textContent = 'Vuelves en ' + v.muerto + ' s · puedes comprar';} else m.classList.add('hidden');
  const enFuente = Math.abs(v.z - signo(MI_EQ) * MAPA.fuente) < 8 || v.muerto >= 0;
  $('bTienda').style.opacity = enFuente ? 1 : 0.45;
}
function acaba(ganador) {
  if (ESTADO === 'fin') return; ESTADO = 'fin';
  const f = $('fin'); f.classList.remove('hidden');
  f.innerHTML = '<h2>' + (ganador === MI_EQ ? '¡Victoria!' : ganador === -1 ? 'Partida terminada' : 'Derrota') + '</h2><p>' + (ganador === MI_EQ ? 'El estandarte enemigo ha caído.' : ganador === -1 ? '' : 'Han derribado vuestro estandarte.') + '</p><button class="bt" id="bOtra">Volver al menú</button>';
  $('bOtra').onclick = () => location.reload();
  suena('cuerno', 0.8);
}

/* ---------- bucle ---------- */
const reloj = new THREE.Clock(); let acum = 0;
function bucle() {
  requestAnimationFrame(bucle);
  const dt = Math.min(0.05, reloj.getDelta());
  try {
    if (ESTADO === 'juego' || ESTADO === 'fin') {
      if (S && ESTADO === 'juego') {
        const h = S.u.find((q) => q.id === YO);
        if (h) {h.mx = MANDO.mx; h.mz = MANDO.mz; h.ataca = MANDO.ataca; h.prioHeroe = true;}
        if (volverBase > 0) {volverBase -= dt; if (MANDO.mx || MANDO.mz) {volverBase = 0; aviso('Vuelta a la fuente cancelada');} else if (volverBase <= 0 && h && !h.muerto) {h.x = 0; h.z = signo(h.eq) * (MAPA.fuente - 3); aviso('En la fuente: ya puedes comprar');}}
        acum += dt; while (acum >= 1 / 30) {paso(1 / 30); acum -= 1 / 30;}
        const f = foto(); fotoT -= dt;
        recibeFotoLocal(f);
        if (NET.online && fotoT <= 0) {fotoT = 1 / 12; NET.manda({t: 'foto', f: {...f, ev: ENVIAR.splice(0)}});}
      } else if (!S && ESTADO === 'juego') {
        mueveMio(dt);
        if (volverBase > 0) {volverBase -= dt; if (MANDO.mx || MANDO.mz) volverBase = 0; else if (volverBase <= 0) {NET.manda({t: 'volver'}); MIO.listo = false;}}
        inT -= dt; if (inT <= 0 && MIO.listo) {inT = 1 / 15; NET.manda({t: 'in', x: +MIO.x.toFixed(2), z: +MIO.z.toFixed(2), rot: +MIO.rot.toFixed(2), m: !!(MANDO.mx || MANDO.mz), a: MANDO.ataca});}
      }
      if (NET.online) {pingT -= dt; if (pingT <= 0) {pingT = 2; NET.manda({t: 'ping', c: performance.now()});}}
      camara(dt); dibuja(dt); hud();
    }
  } catch (err) {console.error(err); if (!window._errVisto) {window._errVisto = 1; aviso('⚠ ' + String(err.message || err).slice(0, 80));}}
  renderer.render(scene, camera);
}
/* el anfitrión dibuja de su propio estado: los avisos ya los pinta al crearlos; los que se mandan, se guardan */
const ENVIAR = [];
function recibeFotoLocal(f) {ENVIAR.push(...f.ev); f.ev = []; for (const v of VISTA.values()) v.visto = false; for (const fila of f.u) aplicaFila(fila, f.t); for (const [id, v] of VISTA) if (!v.visto) {quitaVis(id); VISTA.delete(id);} for (const v of VISTA.values()) {v.x0 = v.x; v.z0 = v.z; v.r0 = v.rot;} marcador(f.m, f.t); EXTRA.be = f.be; EXTRA.cp = f.cp;}
const EXTRA = {be: [[0, 0], [0, 0]], cp: []};

/* ---------- tienda (en la fuente) ---------- */
let tSel = 'hoja';
function abreTienda() {
  const v = VISTA.get(YO); if (!v) return;
  if (!(Math.abs(v.z - signo(MI_EQ) * MAPA.fuente) < 8 || v.muerto >= 0)) {aviso('La armería está en tu fuente (botón ⌂ para volver)'); return;}
  $('tienda').classList.remove('hidden'); pintaTienda();
}
function pintaTienda() {
  const v = VISTA.get(YO), t = $('tienda'); if (!v) return;
  const o = OBJ[tSel], h = {inv: v.inv}, fl = falta(h, tSel), puede = !fl.length && v.oro >= o.c;
  const carta = (id) => {const x = OBJ[id], f = falta(h, id), st = f.length ? 'bloq' : v.oro < x.c ? 'caro' : x.leg ? 'forja' : ''; return '<button class="tObj ' + st + (x.leg ? ' leg' : '') + (id === tSel ? ' sel' : '') + '" data-id="' + id + '"><img src="' + ICO(x.i) + '" alt="">' + (f.length ? '<i>🔒</i>' : '') + '<span>' + x.t + '</span><b>' + x.c + '</b></button>';};
  const st = Object.entries(o.st).map(([k, val]) => '<li>' + ({dano: '+' + val + ' de daño', vatq: '+' + Math.round(val * 100) + ' % de velocidad de ataque', vida: '+' + val + ' de vida', reduc: '−' + Math.round(val * 100) + ' % de daño recibido', vel: '+' + Math.round(val * 100) + ' % de velocidad', regen: '+' + val + ' de vida por segundo', crit: Math.round(val * 100) + ' % de críticos', espinas: 'Devuelve ' + Math.round(val * 100) + ' % del daño', esquiva: Math.round(val * 100) + ' % de esquiva', robo: Math.round(val * 100) + ' % de robo de vida'}[k]) + '</li>').join('');
  t.innerHTML = '<div class="tCab"><button class="tX" id="tX">←</button><b>Armería</b><span class="tOro">🪙 ' + v.oro + '</span></div>' +
    '<div class="tInv">' + Array.from({length: 6}, (_, i) => v.inv[i] ? '<span class="tHueco lleno"><img src="' + ICO(OBJ[v.inv[i]].i) + '" alt=""></span>' : '<span class="tHueco"></span>').join('') + '</div>' +
    '<div class="tLista"><h4>Básicos</h4><div class="tGrid">' + Object.keys(OBJ).filter((k) => !OBJ[k].leg).map(carta).join('') + '</div><h4>Legendarios (se forjan con sus básicos)</h4><div class="tGrid">' + Object.keys(OBJ).filter((k) => OBJ[k].leg).map(carta).join('') + '</div></div>' +
    '<div class="tDet"><b class="n">' + o.t + '</b><ul>' + st + '</ul>' + (o.p ? '<p>' + o.p + '</p>' : '') + (o.rec ? '<p>Receta: ' + o.rec.map((r) => (v.inv.includes(r) ? '✓ ' : '') + OBJ[r].t).join(' + ') + ' + ' + o.c + ' de oro</p>' : '') +
    '<button class="tComprar" id="tComprar"' + (puede ? '' : ' disabled') + '>' + (fl.length ? 'Antes: ' + fl.map((f) => OBJ[f].t).join(' y ') : v.oro < o.c ? 'Te faltan ' + (o.c - v.oro) + ' de oro' : 'Comprar · ' + o.c) + '</button></div>';
  t.querySelectorAll('[data-id]').forEach((b) => b.onclick = () => {tSel = b.dataset.id; pintaTienda();});
  $('tX').onclick = () => t.classList.add('hidden');
  $('tComprar').onclick = () => {
    if (S) {const hh = S.u.find((q) => q.id === YO), r = compra(hh, tSel); if (r) aviso(r); else {suena('moneda'); recibeFotoLocal(foto());}}
    else {NET.manda({t: 'compra', id: tSel}); suena('moneda'); v.oro -= o.c;}
    setTimeout(pintaTienda, 150);
  };
}

/* ---------- menú y sala ---------- */
let heroeElegido = localStorage.getItem('vado.heroe') || 'rohan', modoElegido = '1v1';
function msg(t) {$('msg').textContent = t || '';}
function pintaMenu() {
  $('heroes').innerHTML = Object.entries(HEROES).map(([k, h]) => '<button class="heroe' + (k === heroeElegido ? ' on' : '') + '" data-h="' + k + '"><img src="../abismo/ui/' + h.retrato + '.webp" alt=""><span>' + h.nombre + '</span></button>').join('');
  $('heroes').querySelectorAll('[data-h]').forEach((b) => b.onclick = () => {heroeElegido = b.dataset.h; localStorage.setItem('vado.heroe', heroeElegido); pintaMenu(); if (ESTADO === 'sala') NET.manda({t: 'heroe', heroe: heroeElegido});});
  document.querySelectorAll('.modos button').forEach((b) => {b.classList.toggle('on', b.dataset.m === modoElegido); b.onclick = () => {modoElegido = b.dataset.m; pintaMenu();};});
}
function pintaSala() {
  const s = $('sala'); s.classList.remove('hidden');
  const plazas = NET.modo === '2v2' ? 4 : 2, soyAnf = NET.soy === NET.anf;
  let html = '<div>Código de la sala</div><div class="cod">' + NET.codigo + '</div><div style="font-size:12px;color:#d9c49a">Pásaselo a tus amigos · ' + (NET.modo === '2v2' ? '2 contra 2' : '1 contra 1') + '</div>';
  for (let i = 0; i < plazas; i++) {const j = NET.jugadores.find((q) => q.slot === i); html += '<div class="jug eq' + (i % 2) + '">' + (i % 2 ? 'Isengard' : 'Rohan') + ' · ' + (j ? '<img src="../abismo/ui/' + HEROES[j.heroe].retrato + '.webp" alt="">' + j.nombre + (j.slot === NET.anf ? ' (anfitrión)' : '') : '<i>libre (lo llevará la máquina)</i>') + '</div>';}
  html += soyAnf ? '<button class="bt v" id="bEmpezar">Empezar</button>' : '<div style="font-size:13px">Esperando a que el anfitrión empiece…</div>';
  s.innerHTML = html; if (soyAnf) $('bEmpezar').onclick = () => NET.manda({t: 'empezar'});
}
function nombreJugador() {let n = localStorage.getItem('vado.nombre'); if (!n) {try {const a = JSON.parse(localStorage.getItem('loc.yo') || 'null'); n = a && a.nombre;} catch (e) {} } return n || 'Hobbit' + Math.floor(Math.random() * 90 + 10);}
function preparaMenu() {
  pintaMenu();
  $('bBots').onclick = () => {NET.soy = 0; NET.anf = 0; const js = [{slot: 0, nombre: nombreJugador(), heroe: heroeElegido}]; empieza(js, modoElegido, true);};
  $('bCrear').onclick = () => {const c = Array.from({length: 4}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join(''); conecta(c, modoElegido, nombreJugador(), heroeElegido);};
  $('bUnir').onclick = () => {const c = $('codigo').value.trim().toUpperCase(); if (c.length < 3) {msg('Escribe el código que te han pasado'); return;} conecta(c, modoElegido, nombreJugador(), heroeElegido);};
  $('bSalir').onclick = () => {location.href = '../';};
}

/* ---------- arranque ---------- */
(async () => {
  $('bBots').disabled = $('bCrear').disabled = true; msg('Cargando…');
  try {const gl = await Promise.all(NOMBRES.map(cargaModelo)); NOMBRES.forEach((n, i) => M[n] = gl[i]);} catch (e) {msg('No se pudo cargar: ' + e.message); return;}
  construyeMapa(); preparaMenu(); preparaMandos();
  $('bBots').disabled = $('bCrear').disabled = false; msg('');
  camera.position.set(0, 19, 60); camera.lookAt(0, 0, 46);
  bucle();
})();
window._vado = {get S() {return S;}, get VISTA() {return VISTA;}, get YO() {return YO;}, MIO, HEROES, usaHab, compra, empieza, NET, paso, foto, recibeFotoLocal, get ESTADO() {return ESTADO;}};
