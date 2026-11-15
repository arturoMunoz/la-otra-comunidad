/* La Brecha (antes «El Vado del Isen») · duelo de héroes 1v1 / 2v2 (contra la máquina o con amigos en línea).
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
/* rango máximo de cada habilidad según el nivel (Q/W/E hasta 4, R a nivel 4 y 8) */
const rangoMax = (nivel, k) => k === 'r' ? (nivel >= 8 ? 2 : nivel >= 4 ? 1 : 0) : Math.min(4, Math.ceil(nivel / 2));
function puedeSubir(h, k) {return h.pts > 0 && h.rk[k] < rangoMax(h.nivel, k);}
function subeHab(h, k) {if (!puedeSubir(h, k)) return false; h.rk[k]++; h.pts--; return true;}
function autoSube(h) {let n = 0; while (h.pts > 0 && n++ < 6) {const o = ['r', 'q', 'e', 'w', 'q', 'e'].find((k) => puedeSubir(h, k) && (k === 'r' || h.rk[k] <= Math.min(h.rk.q, h.rk.e, h.rk.w) + (k === 'q' ? 1 : 0))) || ['q', 'w', 'e'].find((k) => puedeSubir(h, k)); if (!o) break; subeHab(h, o);}}
/* hechizos de invocador: Destello y Curar */
const HECHIZOS = {d: {n: 'Destello', cd: 100, icono: 'ui/hz_destello.webp'}, f: {n: 'Curar', cd: 90, icono: 'ui/hz_curar.webp'}, c: {n: 'Castigo', cd: 60, icono: 'ui/hz_castigo.webp'}};
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
const PLAN_BOT = {rohan: ['hoja', 'hoja', 'herugrim', 'cota', 'yelmo', 'escudo', 'botas', 'amuleto', 'capa', 'cota', 'cota', 'amuleto', 'mithril', 'hoja', 'daga', 'guthwine', 'hoja', 'amuleto', 'hacha'], enano: ['cota', 'yelmo', 'escudo', 'hoja', 'amuleto', 'hacha', 'cota', 'cota', 'amuleto', 'mithril', 'hoja', 'hoja', 'herugrim', 'hoja', 'daga', 'guthwine', 'hoja', 'amuleto', 'hacha'], elfo: ['daga', 'hoja', 'guthwine', 'botas', 'amuleto', 'capa', 'hoja', 'hoja', 'herugrim', 'cota', 'yelmo', 'escudo', 'hoja', 'daga', 'guthwine', 'hoja', 'amuleto', 'hacha'], hobbit: ['hoja', 'amuleto', 'hacha', 'botas', 'amuleto', 'capa', 'hoja', 'daga', 'guthwine', 'cota', 'yelmo', 'escudo', 'hoja', 'daga', 'guthwine', 'hoja', 'amuleto', 'hacha']};
/* El mapa en «ojo» (dibujo de Arturo, 14/11): dos caminos curvos de la base de Rohan (abajo a la izquierda) a la de Isengard
   (arriba a la derecha), la espesura en medio con el Uruk azul en el centro y el río (el vado) cruzando por la mitad.
   Todo es simétrico girando 180° alrededor del centro. */
/* Dos mapas:
   · «OJO» (2 contra 2, dibujo de Arturo): dos caminos curvos de Rohan (abajo izquierda) a Isengard (arriba derecha), espesura en medio,
     el Uruk Azul en el centro y el río cruzando; simétrico girando 180°.
   · «LÍNEA» (1 contra 1): un solo camino recto de abajo arriba, espesura a los dos lados, el río por la mitad y el Uruk a un lado del vado;
     simétrico como en un espejo (cada bando su mitad). */
const gira = (p) => ({x: -p.x, z: -p.z}), refleja = (p) => ({x: p.x, z: -p.z});
let MAPA, CARRILES, LARGOS, OJO, EJE, BASES, HIERBAS, CAMPOS, PIT, TIPO_MAPA = '', SIM, ORILLA, RELIQ = [], PIT2 = {x: 400, z: 400}, PLANTAS = [];
function puntoCarril(l, f) {const L = CARRILES[l], c = LARGOS[l], d = f * c[c.length - 1]; for (let i = 1; i < L.length; i++) if (d <= c[i]) {const k = (d - c[i - 1]) / (c[i] - c[i - 1]); return {x: L[i - 1].x + (L[i].x - L[i - 1].x) * k, z: L[i - 1].z + (L[i].z - L[i - 1].z) * k};} return {...L[L.length - 1]};}
function distSeg(px, pz, a, b) {const vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((px - a.x) * vx + (pz - a.z) * vz) / l2)); return Math.hypot(px - a.x - vx * t, pz - a.z - vz * t);}
function distCarril(x, z, l) {let m = 1e9; for (const k of l === undefined ? (TIPO_MAPA === 'ojo' ? [0, 1] : [0]) : [l]) {const L = CARRILES[k]; for (let i = 1; i < L.length; i++) m = Math.min(m, distSeg(x, z, L[i - 1], L[i]));} return m;}
/* cuánto ha avanzado un punto por un camino (0 en Rohan, 1 en Isengard) */
function progreso(l, p) {const L = CARRILES[l], c = LARGOS[l]; let mejor = 1e9, f = 0; for (let i = 1; i < L.length; i++) {const a = L[i - 1], b = L[i], vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.z - a.z) * vz) / l2)), d = Math.hypot(p.x - a.x - vx * t, p.z - a.z - vz * t); if (d < mejor) {mejor = d; f = (c[i - 1] + t * (c[i] - c[i - 1])) / c[c.length - 1];}} return f;}
function dentroOjo(x, z) {if (!OJO) return Math.abs(x) < MAPA.ancho && Math.abs(z) < MAPA.largo; let c = false; for (let i = 0, j = OJO.length - 1; i < OJO.length; j = i++) {const a = OJO[i], b = OJO[j]; if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) c = !c;} return c;}
const ladoDe = (p) => p.x * EJE.x + p.z * EJE.z;        /* < 0 lado de Rohan, > 0 lado de Isengard */
const TORRE_F = 0.27;                                   /* las torres de camino, al 27 % desde su base */
const enHierba = (u) => HIERBAS.findIndex((b) => Math.hypot(u.x - b.x, u.z - b.z) < b.r);
function ponMapa(modo) {
  const tipo = modo === '2v2' ? 'ojo' : 'linea'; if (tipo === TIPO_MAPA) return false; TIPO_MAPA = tipo;
  if (tipo === 'ojo') {
    MAPA = {ancho: 33, largo: 58}; SIM = gira; EJE = {x: 0.423, z: -0.906}; PIT = {x: 0, z: 0};
    const A = [{x: -21, z: 45}, {x: -27, z: 28}, {x: -27, z: 8}, {x: -21, z: -14}, {x: -9, z: -33}, {x: 6, z: -44}, {x: 21, z: -45}];
    CARRILES = [A, A.map(gira).reverse()];
    const R = {fuente: {x: -29, z: 53}, nexo: {x: -24.5, z: 48.5}, torre: {x: -17, z: 40.5}};
    BASES = [R, {fuente: gira(R.fuente), nexo: gira(R.nexo), torre: gira(R.torre)}];
    /* como la jungla del LoL: roja (troll) y azul (Huorn), lobos (huargos), rapaces (crebain), Gromp (sapo); el Uruk (Barón) y el draco (dragón) en dos fosos a orillas del río, uno a cada lado, y la nutria (cangrejo) por el río */
    PIT = {x: 11.8, z: 5.5}; PIT2 = {x: -11.8, z: -5.5};
    const C = [{x: -13, z: 18, tipo: 'crebain', n: 4}, {x: 3, z: 25, tipo: 'warg', n: 2}, {x: -6, z: 35, tipo: 'sapo', n: 1}, {x: -16, z: 4, tipo: 'troll', n: 1}, {x: 9, z: 13, tipo: 'huorn', n: 1}];
    CAMPOS = [...C, ...C.map((c) => ({...c, ...gira(c)})), {x: PIT.x, z: PIT.z, tipo: 'uruk', n: 1}, {x: PIT2.x, z: PIT2.z, tipo: 'draco', n: 1}, {x: 0, z: 0, tipo: 'nutria', n: 1}];
    const PL = [{x: -10, z: 26, tipo: 'seta'}, {x: -19.5, z: 13, tipo: 'baya'}, {x: 2, z: 17, tipo: 'flor'}];
    PLANTAS = [...PL, ...PL.map((q) => ({...q, ...gira(q)}))];
    ORILLA = [{x: 7, z: 3.2}, {x: -7, z: -3.2}];
  } else {
    /* 1 contra 1 en «el Abismo», como el Abismo de los Lamentos del ARAM (donde el Wild Rift juega su Duelo):
       un único puente recto, sin espesura ni bestias, matorrales a los lados y 4 reliquias de vida */
    MAPA = {ancho: 10.5, largo: 58}; SIM = refleja; EJE = {x: 0, z: -1}; PIT = {x: 400, z: 400}; PIT2 = {x: 400, z: -400}; PLANTAS = [];
    const A = [{x: 0, z: 46}, {x: 0, z: 31}, {x: 0, z: 15}, {x: 0, z: 0}, {x: 0, z: -15}, {x: 0, z: -31}, {x: 0, z: -46}];
    CARRILES = [A, A];
    const R = {fuente: {x: 0, z: 55}, nexo: {x: 0, z: 49.5}, torre: {x: 0, z: 41}};
    BASES = [R, {fuente: refleja(R.fuente), nexo: refleja(R.nexo), torre: refleja(R.torre)}];
    const C = [{x: -12, z: 18, tipo: 'warg', n: 2}, {x: 12, z: 26, tipo: 'warg', n: 2}, {x: -13, z: 35, tipo: 'orco', n: 3}, {x: 14, z: 13, tipo: 'troll', n: 1}, {x: -15, z: 7, tipo: 'alfa', n: 1}];
    CAMPOS = [];
    ORILLA = [];
  }
  LARGOS = CARRILES.map((L) => {const c = [0]; for (let i = 1; i < L.length; i++) c.push(c[i - 1] + Math.hypot(L[i].x - L[i - 1].x, L[i].z - L[i - 1].z)); return c;});
  OJO = tipo === 'ojo' ? [...CARRILES[0], ...CARRILES[1].slice().reverse()] : null;
  /* hierba alta (como los matorrales del Wild Rift): dentro no te ven los héroes enemigos salvo que estén a tu lado */
  HIERBAS = [];
  for (const l of tipo === 'ojo' ? [0, 1] : [0]) for (const [f, lado] of [[0.36, 1], [0.5, -1], [0.64, 1]]) for (const sgn of tipo === 'ojo' ? [0] : [1, -1]) {
    const p = puntoCarril(l, f), q = puntoCarril(l, Math.min(1, f + 0.01)), tx = q.x - p.x, tz = q.z - p.z, tl = Math.hypot(tx, tz) || 1, nx = -tz / tl, nz = tx / tl;
    const haciaDentro = Math.sign((PIT.x - p.x) * nx + (PIT.z - p.z) * nz) || 1, s2 = sgn || lado * haciaDentro, d = tipo === 'ojo' ? (lado > 0 ? 6.2 : 5.6) : 7.2;
    HIERBAS.push({x: p.x + nx * s2 * d, z: p.z + nz * s2 * d, r: 2.4});
  }
  for (const q of ORILLA) HIERBAS.push({...q, r: 2.4});
  /* reliquias de vida del ARAM: dos por lado, una delante de la torre de camino y otra detrás; salen a 1:45 y 2:30 y vuelven 90 s después de cogerlas */
  RELIQ = [];
  if (tipo === 'linea') {const t = puntoCarril(0, TORRE_F).z; for (const [z, t0] of [[t - 7, 105], [t + 8, 150]]) for (const sg of [1, -1]) RELIQ.push({x: -6.8, z: z * sg, t0});}
  ARB.clear(); FUEGOS.length = 0;
  NAV = haceNav();
  return true;
}
const ARB = new Map(); const FUEGOS = [], LUCES = []; let NAV = null; const arbKey = (x, z) => Math.floor(x / 4) + ',' + Math.floor(z / 4);
function ponArbolChoque(x, z, r) {const k = arbKey(x, z); if (!ARB.has(k)) ARB.set(k, []); ARB.get(k).push({x, z, r});}
function lineaLibre(a, b) {const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / 1.2); for (let i = 1; i < n; i++) {const x = a.x + (b.x - a.x) * i / n, z = a.z + (b.z - a.z) * i / n, l = ARB.get(arbKey(x, z)); if (l) for (const t of l) if (Math.hypot(t.x - x, t.z - z) < t.r + 0.6) return false;} return true;}
const NEUTRO = {
  warg: {nombre: 'Huargo', vida: 560, dano: 26, alcance: 1.9, vatq: 0.9, vel: 5, oro: 45, xp: 55, modelo: 'warg', alto: 1.5},
  orco: {nombre: 'Saqueador orco', vida: 430, dano: 22, alcance: 1.8, vatq: 1, vel: 4.4, oro: 35, xp: 40, modelo: 'orco', alto: 1.75},
  troll: {nombre: 'Troll de piedra', vida: 2200, dano: 60, alcance: 2.8, vatq: 0.55, vel: 3.6, oro: 120, xp: 200, modelo: 'troll', alto: 3.6, buff: 'troll', grande: true},
  /* la jungla del LoL a la manera de la Tierra Media (Pack Vado 9): rapaces → crebain, Gromp → sapo, azul → Huorn, dragón → draco, cangrejo → nutria */
  crebain: {nombre: 'Crebain', vida: 300, dano: 16, alcance: 1.6, vatq: 1.1, vel: 5, oro: 22, xp: 28, modelo: 'crebain', alto: 0.75},
  sapo: {nombre: 'Sapo de las Ciénagas', vida: 1300, dano: 38, alcance: 2.2, vatq: 0.7, vel: 3.4, oro: 80, xp: 110, modelo: 'sapo', alto: 1.1},
  huorn: {nombre: 'Huorn', vida: 1900, dano: 46, alcance: 2.8, vatq: 0.6, vel: 3.2, oro: 110, xp: 180, modelo: 'huorn', alto: 3.5, buff: 'huorn', grande: true},
  draco: {nombre: 'Draco', vida: 4200, dano: 85, alcance: 3.2, vatq: 0.6, vel: 3.6, oro: 150, xp: 260, modelo: 'draco', alto: 2.4, grande: true, draco: true},
  nutria: {nombre: 'Nutria del Isen', vida: 900, dano: 0, alcance: 0, vatq: 1, vel: 3.2, oro: 70, xp: 90, modelo: 'nutria', alto: 0.55, pasiva: true},
  alfa: {nombre: 'Huargo alfa', vida: 1800, dano: 50, alcance: 2.2, vatq: 0.8, vel: 5, oro: 110, xp: 180, modelo: 'huargo_alfa', alto: 2.2, buff: 'alfa', grande: true},
  /* el «Barón» del Vado: un uruk enorme y azulado en el centro; da la Furia del Uruk a todo el equipo */
  uruk: {nombre: 'Uruk Azul', vida: 6500, dano: 130, alcance: 3.2, vatq: 0.5, vel: 3.4, oro: 250, xp: 400, modelo: 'capitan', alto: 4.4, buff: 'uruk', grande: true, jefe: true, azul: true},
};
const BUFF_TXT = {troll: 'Brasa del troll: tus golpes queman y frenan durante 90 s', huorn: 'Savia del Huorn: habilidades un 20 % más rápidas y más regeneración durante 90 s', alfa: 'Aullido del alfa: corres más y te curas deprisa durante 90 s', uruk: 'Furia del Uruk: todo el equipo pega más, se cura más y sus hordas salen más fuertes durante 150 s'};
/* red de caminos para los bots: puntos de los dos caminos, cubiles y fuentes; los árboles nunca se ponen encima de estas sendas */
function haceNav() {
  const nodos = [], aristas = [], idx = new Map(), add = (p, extra) => {nodos.push({x: p.x, z: p.z, ...extra}); return nodos.length - 1;};
  const ruta = CARRILES.map(() => []);
  CARRILES.forEach((L, l) => L.forEach((p, i) => {const k = p.x + ',' + p.z; if (!idx.has(k)) idx.set(k, add(p, {carril: true})); ruta[l].push(idx.get(k));}));
  for (const r of ruta) for (let i = 1; i < r.length; i++) aristas.push([r[i - 1], r[i]]);
  const camp = CAMPOS.map((c) => add(c, {campo: true}));
  const carriles = nodos.map((n, i) => i).filter((i) => nodos[i].carril);
  const d = (a, b) => Math.hypot(nodos[a].x - nodos[b].x, nodos[a].z - nodos[b].z);
  for (const c of camp) {
    const cerca = (lista, n, max) => lista.filter((i) => i !== c).sort((a, b) => d(c, a) - d(c, b)).slice(0, n).filter((i) => d(c, i) < max);
    for (const i of cerca(carriles, 2, 24)) aristas.push([c, i]);
    for (const i of cerca(camp, nodos[c].x === 0 && nodos[c].z === 0 ? 4 : 2, 26)) aristas.push([c, i]);
  }
  for (const b of BASES) {const p = CARRILES[0][b === BASES[0] ? 0 : CARRILES[0].length - 1], f = add(b.fuente, {}), n = idx.get(p.x + ',' + p.z); aristas.push([f, n]);}
  const vec = nodos.map(() => []); for (const [a, b] of aristas) {vec[a].push(b); vec[b].push(a);}
  return {nodos, aristas, vec, d};
}
function camino(desde, hasta) {
  const N = NAV.nodos, cerca = (p) => {let m = -1, md = 1e9; N.forEach((n, i) => {const dd = Math.hypot(n.x - p.x, n.z - p.z) + (lineaLibre(p, n) ? 0 : 40); if (dd < md) {md = dd; m = i;}}); return m;};
  const a = cerca(desde), b = cerca(hasta), dist0 = N.map(() => 1e9), prev = N.map(() => -1), hecho = N.map(() => false); dist0[a] = 0;
  for (;;) {let u = -1; for (let i = 0; i < N.length; i++) if (!hecho[i] && (u < 0 || dist0[i] < dist0[u])) u = i; if (u < 0 || dist0[u] >= 1e9 || u === b) break; hecho[u] = true; for (const v of NAV.vec[u]) {const nd = dist0[u] + NAV.d(u, v); if (nd < dist0[v]) {dist0[v] = nd; prev[v] = u;}}}
  const r = []; for (let u = b; u >= 0; u = prev[u]) r.unshift(N[u]); return r;
}
/* súbditos: a los héroes les quitan poco (como en el Wild Rift, un 2 % de la vida de un héroe por golpe al principio); entre ellos se pegan más */
const SUBD = {m: {vida: 380, dano: 12, alcance: 1.9, vatq: 0.85, vel: 3.4, oro: 22, xp: 32}, r: {vida: 270, dano: 16, alcance: 6, vatq: 0.75, vel: 3.4, oro: 16, xp: 26}, a: {vida: 1100, dano: 30, alcance: 2.3, vatq: 0.6, vel: 3.1, oro: 60, xp: 70, muros: 3}};
const SUBD_X = {s: 1.6, t: 2.2, n: 2.2};
/* supersúbdito (Wild Rift: sale cuando cae la torre de la base enemiga, en lugar del de asedio): mucha vida, pega fuerte,
   las torres le quitan un 7 % de su vida por golpe, hace la mitad a las estructuras y protege a los súbditos de al lado */
SUBD.x = {vida: 1500, dano: 40, alcance: 2.2, vatq: 0.85, vel: 3.3, oro: 60, xp: 90, muros: 1.1};
/* encantamientos de botas (Wild Rift): mejoran las botas y dan un botón propio; uno a la vez (se puede cambiar) */
const ENC = {
  estasis: {t: 'Estasis', i: 'ui/enc_estasis.webp', c: 400, cd: 120, d: 'Te vuelves invulnerable 2,5 s, pero no puedes moverte ni atacar.'},
  gargola: {t: 'Gárgola', i: 'ui/enc_gargola.webp', c: 200, cd: 45, d: '+40 % de vida durante 4 s, pero haces un 60 % menos de daño.'},
  azogue: {t: 'Azogue', i: 'ui/enc_azogue.webp', c: 320, cd: 70, d: 'Te quita aturdimientos y frenos y corres un 50 % más 1,5 s.'},
  medallon: {t: 'Medallón', i: 'ui/enc_medallon.webp', c: 200, cd: 90, d: 'Escudo para ti y los aliados cercanos durante 2,5 s.'},
};
const tieneBotas = (inv) => inv.includes('botas') || inv.includes('capa');
/* Duelo (modo 1 contra 1 del Wild Rift): gana quien derriba 2 veces al rival o tira la primera torre; en el minuto 8 aparece
   un anillo de fuego que cubre el mapa, a los 30 s empieza a cerrarse y 1:30 después mide 5 m; fuera quema; con el anillo, 1 derribo gana.
   Oro y experiencia aumentados. */
const DUELO = {anillo: 480, cierra: 30, dura: 90, r0: 62, r1: 5, quema: 0.06, botin: 1.5};
const radioAnillo = (t) => t < DUELO.anillo ? 0 : t < DUELO.anillo + DUELO.cierra ? DUELO.r0 : DUELO.r0 + (DUELO.r1 - DUELO.r0) * Math.min(1, (t - DUELO.anillo - DUELO.cierra) / DUELO.dura);
/* desde el minuto 5 las hordas pegan cada vez más fuerte a las torres, para que las partidas no se eternicen */
const asedio = () => 1 + Math.max(0, (S.t - 300) / 240);   /* multiplicador contra súbditos y contra torres/estandarte */
const MODELO_SUBD = [{m: 'ballestero2', r: 'arquero_rohan2', a: 'ballestero2', x: 'super_rohan'}, {m: 'uruk', r: 'q_arquero', a: 'uruk', x: 'super_isengard'}];
const ALTO_SUBD = {m: 1.7, r: 1.6, a: 2.6, x: 2.7};
const signo = (eq) => eq === 0 ? 1 : -1;
const ORDA = 3;   /* cuerpo a cuerpo por oleada y camino (más 2 arqueros) */

/* ---------- siempre en horizontal ----------
   Si el móvil está en vertical (iPhone con la app instalada, que no deja girar), toda la página se gira 90° por CSS
   y se juega en horizontal sin pedir nada. VW/VH son el ancho y alto «lógicos» (los del juego en horizontal). */
let VW = innerWidth, VH = innerHeight, GIRO = false;
const MEDIA0 = new Map();
function giraMedia() {
  for (const sh of document.styleSheets) {let rs; try {rs = sh.cssRules;} catch (e) {continue;}
    for (const ru of rs) {if (!ru.media) continue; if (!MEDIA0.has(ru)) MEDIA0.set(ru, ru.media.mediaText); const o = MEDIA0.get(ru);
      let t = o; if (GIRO) {if (/portrait/.test(o)) t = 'not all'; else t = o.replace(/\(orientation:\s*landscape\)/g, '(min-width: 0px)').replace(/(max|min)-height/g, '$1-QQ').replace(/(max|min)-width(?!: 0px)/g, '$1-height').replace(/-QQ/g, '-width');}
      if (ru.media.mediaText !== t) ru.media.mediaText = t;}}
}
function giraPantalla() {
  GIRO = innerHeight > innerWidth; VW = GIRO ? innerHeight : innerWidth; VH = GIRO ? innerWidth : innerHeight;
  const b = document.body; b.classList.toggle('giro', GIRO);
  b.style.width = GIRO ? VW + 'px' : ''; b.style.height = GIRO ? VH + 'px' : ''; b.style.transform = GIRO ? 'translateX(' + innerWidth + 'px) rotate(90deg)' : '';
  const r = document.documentElement.style; r.setProperty('--vw', VW / 100 + 'px'); r.setProperty('--vh', VH / 100 + 'px');
  giraMedia();
}
giraPantalla();
/* coordenadas de un dedo en el juego (con la página girada, el eje X de la pantalla es el Y del juego) */
const PX = (e) => GIRO ? e.clientY : e.clientX, PY = (e) => GIRO ? innerWidth - e.clientX : e.clientY;
const topC = (el) => {const r = el.getBoundingClientRect(); return GIRO ? innerWidth - r.right : r.top;};

/* ---------- motor ---------- */
const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
/* resolución dinámica (como en el Abismo): si el móvil no llega a ~50 fps baja la nitidez un paso; si va sobrado, la sube */
const PR = {max: Math.min(devicePixelRatio, 2), v: Math.min(devicePixelRatio, 2), t: 0, n: 0, acum: 0};
renderer.setPixelRatio(PR.v); renderer.setSize(VW, VH);
function ajustaResolucion(dt) {
  PR.acum += dt; PR.n++; PR.t += dt; if (PR.t < 1.5) return;
  const fps = PR.n / PR.acum; PR.t = PR.acum = PR.n = 0;
  const nv = fps < 48 ? Math.max(0.75, PR.v - 0.25) : fps > 58 ? Math.min(PR.max, PR.v + 0.25) : PR.v;
  if (nv !== PR.v) {PR.v = nv; renderer.setPixelRatio(nv); renderer.setSize(VW, VH);}
}
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#1b2230'); scene.fog = new THREE.Fog('#1b2230', 45, 110);
const camera = new THREE.PerspectiveCamera(42, VW / VH, 0.5, 200);
addEventListener('resize', () => {giraPantalla(); renderer.setSize(VW, VH); camera.aspect = VW / VH; camera.updateProjectionMatrix(); APAI = VW > VH;});
scene.add(new THREE.HemisphereLight('#c9d6ff', '#3a2a1a', 1.5));
const sol = new THREE.DirectionalLight('#ffe2b8', 2.2); sol.position.set(12, 30, 10); sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, {left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90}); scene.add(sol, sol.target);

const loader = new GLTFLoader(), M = {}, TX = {};
const VADO = ['vado_arboles', 'vado_rocas', 'vado_torres', 'vado_nexos', 'vado_cubiles', 'vado_fuentes', 'super_rohan', 'super_isengard', 'huorn', 'crebain', 'draco', 'nutria', 'sapo'];
const NOMBRES = [...VADO, 'warg', 'huargo_alfa', 'troll', 'orco', 'capitan', 'carro_k', 'rohan_kk', 'enano_kk', 'elfo_kk', 'hobbit_kk', 'ballestero2', 'arquero_rohan2', 'uruk', 'q_arquero', 'proyectiles', 'torre_k', 'estandarte_muro', 'estandarte_patio', 'brasero', 'tienda', 'empalizada', 'barril_1', 'barril_2', 'caja_1', 'heno', 'sacos_terreros', 'antorcha_pie'];
async function cargaModelo(n) {
  const r = await fetch((VADO.includes(n) ? 'modelos/' : '../abismo/modelos/') + n + '.glb'); if (!r.ok) throw new Error(n);
  return new Promise(async (res, rej) => loader.parse(await r.arrayBuffer(), '', res, rej));
}
function cargaTex(n, rep) {const t = new THREE.TextureLoader().load('../abismo/' + n); t.colorSpace = THREE.SRGBColorSpace; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;}

/* alto de cada modelo para escalarlos igual (héroes ~2 m, súbditos ~1,7) */
/* un objeto del pack del Vado (cada .glb es un catálogo con todo en el origen) */
function pieza(archivo, nombre) {const o = M[archivo] && M[archivo].scene.getObjectByName(nombre); if (!o) return new THREE.Group(); const c = o.clone(true); c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); c.traverse((q) => {if (q.isMesh) {q.castShadow = true; q.receiveShadow = true;}}); return c;}
/* muchas copias del mismo objeto en pocas llamadas de dibujo: un InstancedMesh por cada malla del objeto */
function instancias(archivo, nombre, lista, sombra = true) {
  const o = M[archivo] && M[archivo].scene.getObjectByName(nombre); if (!o || !lista.length) return;
  M[archivo].scene.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(o.matrixWorld).invert();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  o.traverse((malla) => {
    if (!malla.isMesh) return;
    const rel = new THREE.Matrix4().multiplyMatrices(inv, malla.matrixWorld), im = new THREE.InstancedMesh(malla.geometry, malla.material, lista.length);
    lista.forEach((c, i) => {q.setFromAxisAngle(up, c.ry || 0); p.set(c.x, c.y || 0, c.z); e.setScalar(c.s || 1); m4.compose(p, q, e).multiply(rel); im.setMatrixAt(i, m4);});
    im.castShadow = sombra; im.receiveShadow = true; im.computeBoundingSphere(); (MAPA_G || scene).add(im);
  });
}
const ALTO = {};
function alto(n) {if (!ALTO[n]) {const b = new THREE.Box3().setFromObject(M[n].scene, ['draco', 'huorn', 'crebain', 'nutria', 'sapo'].includes(n)); ALTO[n] = Math.max(0.5, b.max.y - b.min.y);} return ALTO[n];}
function montar(n, altura) {
  const raiz = SkeletonUtils.clone(M[n].scene); raiz.scale.setScalar(altura / alto(n));
  raiz.traverse((o) => {if (o.isMesh) {o.castShadow = true; o.material = o.material.clone(); if (o.isSkinnedMesh) o.frustumCulled = false;}});
  const mixer = new THREE.AnimationMixer(raiz), clips = {};
  for (const c of M[n].animations) clips[c.name] = mixer.clipAction(c);
  const alias = {atacar: ['disparar', 'atacar'], correr: ['correr', 'andar'], quieto: ['quieto'], morir: ['morir'], hab: ['golpe_cargado', 'atacar_3', 'atacar_2', 'disparar', 'atacar'], aturdido: ['aturdido', 'recibir_golpe', 'recibir', 'quieto']};
  const c2 = {}; for (const k in alias) {const f = alias[k].find((x) => clips[x]); if (f) c2[k] = clips[f];}
  for (const k of ['atacar', 'morir', 'hab']) if (c2[k]) {c2[k].setLoop(THREE.LoopOnce, 1); c2[k].clampWhenFinished = true;}
  return {raiz, mixer, clips: c2, todos: clips, actual: null};
}
function pon(a, k, f = 0.15) {const n = a.clips[k]; if (!n || a.actual === n) return; n.reset().play(); if (a.actual) a.actual.crossFadeTo(n, f, false); a.actual = n;}
function otraVez(a, k) {const n = a.clips[k]; if (!n) return; n.reset().play(); if (a.actual && a.actual !== n) a.actual.crossFadeTo(n, 0.08, false); a.actual = n;}

/* ---------- el mapa ---------- */
let MAPA_G = null;
function construyeMapa() {
  if (MAPA_G) {scene.remove(MAPA_G); MAPA_G.traverse((q) => {if (q.isInstancedMesh) q.dispose();});}
  MAPA_G = new THREE.Group(); scene.add(MAPA_G); const scene_ = MAPA_G;
  const tH = cargaTex('texturas/campo.webp', true), tB = cargaTex('texturas/barro.webp', true);
  const g = new THREE.PlaneGeometry(110, 150, 1, 1); g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.95});
  const v2 = (L) => L.map((p) => new THREE.Vector2(p.x, p.z));
  m.onBeforeCompile = (sh) => {
    sh.uniforms.tH = {value: tH}; sh.uniforms.tB = {value: tB}; sh.uniforms.uA = {value: v2(CARRILES[0])}; sh.uniforms.uB = {value: v2(CARRILES[1])};
    sh.uniforms.uEje = {value: new THREE.Vector2(EJE.x, EJE.z)}; sh.uniforms.uPit = {value: new THREE.Vector2(PIT.x, PIT.z)}; sh.uniforms.uPit2 = {value: new THREE.Vector2(PIT2.x, PIT2.z)};
    sh.uniforms.uF = {value: [new THREE.Vector2(BASES[0].nexo.x, BASES[0].nexo.z), new THREE.Vector2(BASES[1].nexo.x, BASES[1].nexo.z)]};
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWP; uniform sampler2D tH,tB; uniform vec2 uA[7]; uniform vec2 uB[7]; uniform vec2 uF[2]; uniform vec2 uEje, uPit, uPit2;
      float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}
      float dSeg(vec2 p,vec2 a,vec2 b){vec2 v=b-a;float t=clamp(dot(p-a,v)/dot(v,v),0.,1.);return length(p-a-v*t);}
      float dCar(vec2 p){float d=1e3;for(int i=0;i<6;i++){d=min(d,dSeg(p,uA[i],uA[i+1]));d=min(d,dSeg(p,uB[i],uB[i+1]));}return d;}`)
      .replace('#include <map_fragment>', `
      vec2 w=vWP.xz; vec2 rw=mat2(.8,-.6,.6,.8)*w;
      vec3 hi=mix(texture2D(tH,w*.15).rgb,texture2D(tH,rw*.067+.37).rgb,smoothstep(.3,.7,fbm(w*.1+5.)));
      vec3 ba=mix(texture2D(tB,w*.12).rgb,texture2D(tB,rw*.053+.61).rgb,smoothstep(.3,.7,fbm(w*.08+2.)))*vec3(.8,.74,.68);
      float dc=dCar(w);
      float carril=1.-smoothstep(3.4,5.4,dc+fbm(w*.3)*1.4);
      float base=1.-smoothstep(7.,11.,min(length(w-uF[0]),length(w-uF[1]))+fbm(w*.2)*2.);
      float mb=max(max(carril,base)*.88,smoothstep(.6,.78,fbm(w*.05+1.3))*.6);
      vec3 musgo=hi*vec3(.62,.78,.55)*(.75+.5*fbm(w*.2+9.));
      vec3 col=mix(musgo,ba,mb);
      /* el centro: un claro de barro y piedra donde duerme el Uruk Azul */
      col=mix(col,ba*vec3(.7,.72,.8),(1.-smoothstep(5.5,8.,length(w-uPit)+fbm(w*.5)*1.5))*.9); col=mix(col,ba*vec3(.78,.66,.6),(1.-smoothstep(5.5,8.,length(w-uPit2)+fbm(w*.5)*1.5))*.9);
      /* el vado: el río cruza de lado a lado por la mitad del mapa */
      float rio=1.-smoothstep(1.9,3.3,abs(dot(w,uEje)+sin(dot(w,vec2(-uEje.y,uEje.x))*.22)*.9)+fbm(w*.4)*.8);
      vec3 agua=mix(vec3(.004,.016,.026),vec3(.012,.04,.05),fbm(w*.5));
      col=mix(col,agua,rio*.9*(1.-(1.-smoothstep(5.,7.5,length(w-uPit))))*(1.-(1.-smoothstep(5.,7.5,length(w-uPit2)))));
      float borde=smoothstep(.0,1.,max(abs(w.x)-${MAPA.ancho.toFixed(1)},abs(w.y)-57.)/3.); col*=1.-clamp(borde,0.,1.)*.75;
      diffuseColor.rgb*=col;`);
  };
  const suelo = new THREE.Mesh(g, m); suelo.receiveShadow = true; scene_.add(suelo);
  const pon2 = (n, x, z, ry = 0, e = 1) => {if (!M[n]) return null; const o = M[n].scene.clone(true); o.position.set(x, 0, z); o.rotation.y = ry; o.scale.setScalar(e); o.traverse((q) => {if (q.isMesh) {q.castShadow = true; q.receiveShadow = true;}}); scene_.add(o); return o;};
  const semilla = {v: 7}; const al = () => {semilla.v = (semilla.v * 16807) % 2147483647; return semilla.v / 2147483647;};
  const enBase = (x, z) => BASES.some((b) => Math.hypot(b.fuente.x - x, b.fuente.z - z) < 10 || Math.hypot(b.nexo.x - x, b.nexo.z - z) < 9 || Math.hypot(b.torre.x - x, b.torre.z - z) < 6);
  /* senderos de la espesura: los mismos que usan los bots para moverse (sin árboles encima) */
  const sendas = NAV.aristas.filter(([a, b]) => !(NAV.nodos[a].carril && NAV.nodos[b].carril)).map(([a, b]) => [NAV.nodos[a], NAV.nodos[b]]);
  const arboles = {};
  const planta = (n, x, z, s, choque) => {(arboles[n] = arboles[n] || []).push({x, z, ry: al() * 6.28, s}); if (choque) ponArbolChoque(x, z, 0.75 * s);};
  for (let x = -44; x <= 44; x += 2.6) for (let z = -70; z <= 70; z += 2.6) {
    const px = x + (al() - 0.5) * 1.5, pz = z + (al() - 0.5) * 1.5, dc = distCarril(px, pz), juego = Math.abs(px) < MAPA.ancho + 1 && Math.abs(pz) < MAPA.largo + 1;
    if (dc < 4.7 || enBase(px, pz)) continue;
    if (juego) {
      if (Math.hypot(px - PIT.x, pz - PIT.z) < 8.5 || Math.hypot(px - PIT2.x, pz - PIT2.z) < 8.5 || PLANTAS.some((q) => Math.hypot(q.x - px, q.z - pz) < 2.6) || Math.abs(ladoDe({x: px, z: pz})) < 2.6 || CAMPOS.some((c) => Math.hypot(c.x - px, c.z - pz) < (NEUTRO[c.tipo].grande ? 7 : 5.5)) || HIERBAS.some((b) => Math.hypot(b.x - px, b.z - pz) < b.r + 1.3) || sendas.some(([a, b]) => distSeg(px, pz, a, b) < 3.2)) continue;
      if (TIPO_MAPA === 'linea' ? Math.abs(px) < 10.2 : dentroOjo(px, pz) && al() < 0.3) continue;
    }
    const isen = ladoDe({x: px, z: pz}) > 0, r = al();
    const n = isen ? (r < 0.3 ? 'arbol_muerto_0' + (1 + (r < 0.12 ? 1 : 0)) : 'pino_0' + (1 + Math.floor(al() * 4))) : (r < 0.45 ? 'roble_0' + (1 + Math.floor(al() * 3)) : 'pino_0' + (1 + Math.floor(al() * 4)));
    planta(n, px, pz, (n.startsWith('roble') ? 0.6 : 0.8) + al() * 0.35, juego);
  }
  for (const n in arboles) instancias('vado_arboles', n, arboles[n]);
  /* hierba alta, juncos del río, piedras de vadear y rocas */
  const matas = {}, mata = (n, x, z, s) => (matas[n] = matas[n] || []).push({x, z, ry: al() * 6.28, s});
  for (const b of HIERBAS) for (let i = 0; i < 9; i++) {const a = al() * 6.28, d = Math.sqrt(al()) * b.r * 0.85; mata('arbusto_0' + (1 + i % 4), b.x + Math.cos(a) * d, b.z + Math.sin(a) * d, 1.3 + al() * 0.5);}
  for (let i = 0; i < 90; i++) {const t = (al() - 0.5) * 70, o = (al() < 0.5 ? -1 : 1) * (2.4 + al() * 1.8), x = -t * EJE.z + o * EJE.x, z = t * EJE.x + o * EJE.z; if (Math.hypot(x - PIT.x, z - PIT.z) < 8 || Math.hypot(x - PIT2.x, z - PIT2.z) < 8 || distCarril(x, z) < 3 || Math.abs(x) > 33 || Math.abs(z) > 57) continue; mata('juncos_0' + (1 + i % 3), x, z, 0.9 + al() * 0.6);}
  for (const l of TIPO_MAPA === 'ojo' ? [0, 1] : [0]) {const L = CARRILES[l]; let mejor = 0; for (let f = 0; f <= 1; f += 0.01) {const p = puntoCarril(l, f); if (Math.abs(ladoDe(p)) < Math.abs(ladoDe(puntoCarril(l, mejor)))) mejor = f;} const c = puntoCarril(l, mejor); for (let i = 0; i < 8; i++) mata('piedra_vado_0' + (1 + i % 6), c.x + (al() - 0.5) * 5, c.z + (al() - 0.5) * 3, 0.5 + al() * 0.3);}
  for (let i = 0; i < 40; i++) {const x = (al() - 0.5) * 60, z = (al() - 0.5) * 100; if (!dentroOjo(x, z) || (TIPO_MAPA === 'linea' && Math.abs(x) < 9) || distCarril(x, z) < 5 || CAMPOS.some((c) => Math.hypot(c.x - x, c.z - z) < 4) || sendas.some(([a, b]) => distSeg(x, z, a, b) < 2.4)) continue; mata('roca_0' + (1 + i % 6), x, z, 0.35 + al() * 0.5);}
  for (const n in matas) instancias('vado_rocas', n, matas[n], !n.startsWith('juncos'));
  /* cubiles de las bestias, braseros y fuentes */
  for (const c of CAMPOS) {
    if (NEUTRO[c.tipo].pasiva || c.tipo === 'huorn' || c.tipo === 'draco') continue;
    const nd = NEUTRO[c.tipo], o = pieza('vado_cubiles', nd.grande ? 'cubil_troll' : 'cubil_huargo'), d = Math.hypot(c.x, c.z) || 1;
    o.position.set(c.x + (nd.grande ? c.x / d * 3.4 : 0), 0, c.z + (nd.grande ? c.z / d * 3.4 : 0)); o.rotation.y = Math.atan2(-c.x, -c.z); if (nd.jefe) {const l = Math.hypot(PIT.x, PIT.z) || 1; o.position.set(PIT.x + PIT.x / l * 5.5, 0, PIT.z + PIT.z / l * 5.5); o.rotation.y = Math.atan2(-PIT.x, -PIT.z); o.scale.setScalar(1.5);} scene_.add(o);
    const bx = c.x + (c.x / d) * 3 + 2.4, bz = c.z + (c.z / d) * 3; if (!nd.jefe) {pon2('brasero', bx, bz, 0, nd.grande ? 1.6 : 1.2); luzFuego(bx, bz);}
  }
  if (CAMPOS.some((c) => NEUTRO[c.tipo].jefe)) for (const P of [PIT, PIT2]) for (const x of [-5.5, 5.5]) {pon2('brasero', P.x + x, P.z - 4.5, 0, 1.8); luzFuego(P.x + x, P.z - 4.5);}
  /* braseros a lo largo del puente del Abismo */
  if (TIPO_MAPA === 'linea') for (const z of [-30, -12, 12, 30]) for (const x of [-9.4, 9.4]) {pon2('brasero', x, z, 0, 1.5); luzFuego(x, z);}
  for (const eq of [0, 1]) {
    const b = BASES[eq], o = pieza('vado_fuentes', eq ? 'fuente_isengard' : 'fuente_rohan'); o.position.set(b.fuente.x, 0, b.fuente.z); o.scale.setScalar(1.3); scene_.add(o);
    const s = signo(eq); pon2('tienda', b.fuente.x - 3 * s, b.fuente.z + 3.5 * s, eq ? 0 : Math.PI, 1.6);
    for (const [dx, dz] of [[4, -4], [-1, -6]]) {pon2('brasero', b.fuente.x + dx * s, b.fuente.z + dz * s, 0, 1.4); luzFuego(b.fuente.x + dx * s, b.fuente.z + dz * s);}
  }
}
/* fuegos: solo 4 luces de verdad que se colocan en los fuegos más cercanos a la cámara (en el móvil, muchas luces lo hunden) */
function luzFuego(x, z) {FUEGOS.push({x, z});}
function luces() {
  if (!LUCES.length) for (let i = 0; i < 4; i++) {const l = new THREE.PointLight('#ff9a4a', 12, 12, 1.6); l.position.set(0, -50, 0); scene.add(l); LUCES.push(l);}
  const cerca = FUEGOS.map((f) => [Math.hypot(f.x - camM.x, f.z - camM.z), f]).sort((a, b) => a[0] - b[0]).slice(0, 4);
  LUCES.forEach((l, i) => {const f = cerca[i]; if (f && f[0] < 30) l.position.set(f[1].x, 2, f[1].z); else l.position.set(0, -50, 0);});
}

/* ---------- la partida (estado) ---------- */
let S = null;          /* estado completo (solo lo tiene quien simula: el anfitrión o el modo contra la máquina) */
let VISTA = new Map(); /* lo que se dibuja: id → {k, eq, x, z, rot, vida, max, ...} */
let YO = null;         /* id de mi héroe */
let MI_EQ = 0;
const NET = {ws: null, soy: -1, anf: -1, online: false, jugadores: [], modo: '1v1', ping: 0};
let ESTADO = 'menu';   /* menu, sala, juego, fin */
let idSig = 1;

function nuevaPartida(jugadores, modo) {
  S = {t: 0, u: [], proy: [], zonas: [], dif: [], reliq: RELIQ.map((r) => ({...r, listo: r.t0})), bufEq: [{}, {}], plantas: PLANTAS.map((q) => ({...q, listo: 90})), santuarios: [], visiones: [], dracoSig: Math.random() < 0.5 ? 'f' : 'h', campos: CAMPOS.map((c) => ({...c, resp: NEUTRO[c.tipo].jefe ? 360 : NEUTRO[c.tipo].draco ? 150 : NEUTRO[c.tipo].pasiva ? 90 : NEUTRO[c.tipo].grande ? 75 : 30, vivos: 0})), ev: [], ola: 5, oleadaN: 0, muertes: [0, 0], fin: -1, modo};
  idSig = 1;
  const plazas = modo === '2v2' ? 4 : 2; S.carriles = modo === '2v2' ? [0, 1] : [0];
  for (let slot = 0; slot < plazas; slot++) {
    const j = jugadores.find((q) => q.slot === slot);
    const tipo = j ? j.heroe : Object.keys(HEROES)[(slot * 3 + 1) % 4];
    const eq = slot % 2, f = BASES[eq].fuente, x = f.x + (slot >= 2 ? 1.5 : -1.5), z0 = f.z - signo(eq) * 2.5;
    const b = HEROES[tipo] || HEROES.rohan;
    S.u.push({id: idSig++, k: 'h', eq, tipo, slot, bot: !j, nombre: j ? j.nombre : 'Bot ' + b.nombre.split(' ')[0], x, z: z0, rot: eq ? 0 : Math.PI, carril: slot >= 2 && modo === '2v2' ? 1 : 0,
      vida: b.vida, max: b.vida, nivel: 1, xp: 0, oro: 500, inv: [], enc: '', hf: j && j.hech === 'c' ? 'c' : 'f', modoAt: '', fijo: 0, cd: {q: 0, w: 0, e: 0, r: 0, a: 0, d: 0, f: 0}, rk: {q: 0, w: 0, e: 0, r: 0}, pts: 1, muertes: 0, asist: 0, cs: 0, racha: 0, hierba: -1, multi: 0, multiT: -99, danos: {}, buf: {}, resp: 0, muerto: false, ac: 0, hc: 0, hk: '', mueve: false, ataca: false, mx: 0, mz: 0, kills: 0, plan: 0});
  }
  for (const eq of [0, 1]) {
    /* «los soles» del dibujo: una torre en cada camino y otra delante del estandarte */
    for (const l of S.carriles) {const p = puntoCarril(l, eq ? 1 - TORRE_F : TORRE_F); const vt = modo === '2v2' ? 2000 : 1200; S.u.push({id: idSig++, k: 't', eq, n: 1, carril: l, x: p.x, z: p.z, vida: vt, max: vt, cd: 0, rad: 1.6});}
    const b = BASES[eq];
    const vb = modo === '2v2' ? 2600 : 1600, vn = modo === '2v2' ? 3000 : 2000;
    S.u.push({id: idSig++, k: 't', eq, n: 2, x: b.torre.x, z: b.torre.z, vida: vb, max: vb, cd: 0, rad: 1.6});
    S.u.push({id: idSig++, k: 'n', eq, x: b.nexo.x, z: b.nexo.z, vida: vn, max: vn, rad: 2});
  }
}
const heroes = () => S.u.filter((u) => u.k === 'h');
function stats(h) {
  const b = HEROES[h.tipo], n = h.nivel - 1, st = {vida: b.vida + b.crecV * n, dano: b.dano + b.crecD * n, vatq: b.vatq, alcance: b.alcance, vel: b.vel, reduc: 0, regen: 1.5, crit: 0, robo: 0, espinas: 0, esquiva: 0};
  let va = 0, ve = 0;
  for (const id of h.inv) {const o = OBJ[id].st; st.vida += o.vida || 0; st.dano += o.dano || 0; va += o.vatq || 0; ve += o.vel || 0; st.reduc += o.reduc || 0; st.regen += o.regen || 0; st.crit += o.crit || 0; st.robo += o.robo || 0; st.espinas += o.espinas || 0; st.esquiva += o.esquiva || 0;}
  const be = S && S.bufEq[h.eq] || {};
  if (be.drF) st.dano *= 1 + 0.06 * be.drF; if (be.drH) st.vida *= 1 + 0.06 * be.drH; if (be.alma) {st.dano *= 1.1; st.vida *= 1.1;}
  if (h.buf.huorn > 0) st.regen += 4;
  if (S && S.santuarios.some((z) => z.eq === h.eq && z.hasta > S.t && Math.hypot(h.x - z.x, h.z - z.z) < z.r)) ve += 0.3;
  if (h.buf.alfa > 0) {ve += 0.15; st.regen += 6;}
  if (be.uruk > S.t) {st.dano *= 1.2; st.regen += 8;}
  if (h.buf.rafaga > 0) va += 0.6;
  if (h.buf.suerte > 0) {ve += 0.5; st.dano *= 1.35;}
  if (h.buf.invis > 0) ve += 0.35;
  if (h.buf.azogue > 0) ve += 0.5;
  if (h.buf.gargola > 0) st.vida *= 1.4;
  if (h.buf.prisa > 0) ve += 0.3;
  if (h.buf.lento > 0) ve -= h.buf.lentoV || 0.35;
  st.vatq *= 1 + va; st.vel *= Math.max(0.3, 1 + ve);
  if (h.buf.reduce > 0) st.reduc += 0.45;
  st.reduc = Math.min(0.75, st.reduc);
  return st;
}
function xpNivel(n) {return 100 + 60 * (n - 1);}
function ganaXp(h, n) {
  if (h.nivel >= NIVEL_MAX) return; h.xp += n * (S.modo === '1v1' ? DUELO.botin : 1);
  while (h.nivel < NIVEL_MAX && h.xp >= xpNivel(h.nivel)) {h.xp -= xpNivel(h.nivel); const v0 = stats(h).vida; h.nivel++; h.pts++; const v1 = stats(h).vida; h.vida += v1 - v0; ev(['fx', 'onda', h.x, h.z, 3]); if (h.nivel === NIVEL_R) ev(['aviso', h.id, '¡Habilidad definitiva lista!']);}
}
function ev(e) {S.ev.push(e); efectoLocal(e);}

/* ---------- simulación (anfitrión) ---------- */
function oculto(u, quien) {if (u.k !== 'h' || u.hierba < 0 || u.revela > S.t) return false; return !(quien && (dist(quien, u) < 3.2 || quien.hierba === u.hierba));}
function enemigosDe(eq, quien) {return S.u.filter((u) => u.eq !== eq && !u.muerto && u.vida > 0 && !(u.k === 'h' && (u.buf.invis > 0 || u.buf.estasis > 0)) && !(eq === 2 && u.k !== 'h') && !(quien && oculto(u, quien)));}
function atacable(u) {
  if (u.k === 't' && u.n === 2) return S.u.some((q) => q.k === 't' && q.eq === u.eq && q.n === 1 && q.vida <= 0);
  if (u.k === 'n') return !S.u.some((q) => q.k === 't' && q.eq === u.eq && q.n === 2 && q.vida > 0);
  return true;
}
function radio(u) {return u.rad || (u.k === 'h' ? 0.6 : 0.5);}
/* protecciones de las torres del Wild Rift: las de camino llevan armadura extra al principio (300 que baja 50 por minuto)
   y ninguna estructura recibe más que un 25 % (el estandarte un 20 %) si no hay súbditos enemigos cerca (se quita a los 3 s) */
function protegida(d) {
  if (S.u.some((s) => s.k === 's' && !s.muerto && s.eq !== d.eq && dist(s, d) < 10)) d.subdT = S.t;
  return S.t - (d.subdT ?? -9) > 3;
}
function dana(o, d, n, tipo) {
  if (!d || d.vida <= 0 || d.muerto) return;
  if (o && o.k === 'h' && o.buf.gargola > 0) n *= 0.4;
  if (d.k === 't' || d.k === 'n') {
    if (d.k === 't' && d.n === 1) n *= 100 / (100 + Math.max(0, 300 - 50 * Math.floor(S.t / 60)));
    if (protegida(d)) n *= d.k === 'n' ? 0.2 : 0.25;
  }
  if (d.k === 's') {
    if (d.tipo === 'x' && o && o.k === 't') n = d.max * 0.07;
    else if (d.tipo !== 'x' && S.u.some((q) => q.k === 's' && q.tipo === 'x' && !q.muerto && q.eq === d.eq && dist(q, d) < 6)) n *= 0.75;
  }
  if (d.k === 'h') {
    if (d.buf.estasis > 0) return;
    const st = stats(d);
    if (tipo !== 'hab' && st.esquiva && Math.random() < st.esquiva) {ev(['num', d.x, d.z, '¡esquiva!', 'r']); return;}
    n *= 1 - st.reduc;
    if (d.buf.escudo > 0) {const a = Math.min(d.buf.escudoV || 0, n); d.buf.escudoV -= a; n -= a;}
    if (o && o.k === 'h') {d.agresor = o.id; d.agresorT = S.t + 3; o.atacoHeroeT = S.t + 2.5; d.danos[o.id] = S.t;}
    if (st.espinas && o && o.k !== 't' && tipo !== 'hab' && dist(o, d) < 3) dana(null, o, n * st.espinas, 'hab');
  }
  if (d.k === 'j' && o && o.k === 'h') {d.agro = o.id; d.agroT = S.t + 6;}
  if (o) {o.atacaA = d.id; o.atacaT = S.t + 2;}
  d.vida -= n; ev(['num', d.x, d.z, Math.round(n), tipo === 'crit' ? 'c' : '']);
  if (d.k === 'h' || (o && o.k === 'h') || (o && o.k === 't')) ev(['g', d.id, o ? o.id : 0, tipo === 'crit' || tipo === 'hab' || n > 150 ? 1 : 0]);
  if (o && o.k === 'h' && o.vida > 0) {const r = stats(o).robo; if (r) o.vida = Math.min(stats(o).vida, o.vida + n * r);}
  if (d.vida <= 0) muere(d, o);
}
function muere(d, o) {
  d.vida = 0;
  if (d.k === 's') {
    d.muerto = true; d.quitar = S.t + 1.6; ev(['muere', d.id]);
    const sd = SUBD[d.tipo];
    if (o && o.k === 'h') {const g = Math.round(sd.oro * (S.modo === '1v1' ? DUELO.botin : 1)); o.oro += g; o.cs++; ev(['num', d.x, d.z, '+' + g, 'o', o.id]);}
    for (const h of heroes()) if (h.eq !== d.eq && !h.muerto && dist(h, d) < 12) ganaXp(h, sd.xp);
  }
  if (d.k === 'j') {
    d.muerto = true; d.quitar = S.t + 2; ev(['muere', d.id]);
    const nd = NEUTRO[d.tipo], c = S.campos[d.campo]; c.vivos--; if (c.vivos <= 0) c.resp = S.t + (nd.jefe ? 240 : nd.draco ? 240 : nd.pasiva ? 150 : nd.grande ? 100 : 55);
    const eq = o && o.k === 'h' ? o.eq : null;
    if (o && o.k === 'h') {o.oro += nd.oro; o.cs++; ev(['num', d.x, d.z, '+' + nd.oro, 'o', o.id]);}
    if (eq !== null) for (const h of heroes()) if (h.eq === eq && !h.muerto && (h === o || dist(h, d) < 14)) ganaXp(h, nd.xp);
    if (nd.buff === 'uruk' && eq !== null) {S.bufEq[eq].uruk = S.t + 150; for (const h of heroes()) if (h.eq === eq) h.oro += 150; ev(['fx', 'onda', d.x, d.z, 9]); ev(['baja', o.id, d.id, (eq === 0 ? 'Rohan' : 'Isengard') + ' derriba al Uruk Azul']); ev(['aviso', 0, BUFF_TXT.uruk]);}
    else if (nd.draco && eq !== null) {
      const be = S.bufEq[eq]; be.drF = be.drF || 0; be.drH = be.drH || 0; if (d.elem === 'f') be.drF++; else be.drH++;
      S.dracoSig = S.dracoSig === 'f' ? 'h' : 'f'; ev(['fx', 'onda', d.x, d.z, 9]);
      ev(['baja', o.id, d.id, (eq === 0 ? 'Rohan' : 'Isengard') + (d.elem === 'f' ? ' caza al draco de fuego' : ' caza al draco frío')]);
      if (be.drF + be.drH >= 3 && !be.alma) {be.alma = 1; ev(['aviso', 0, '🐉 ' + (eq === 0 ? 'Rohan' : 'Isengard') + ' consigue el ALMA DEL DRACO']); for (const q of S.campos) if (NEUTRO[q.tipo].draco) q.resp = 1e9;}
      else ev(['aviso', 0, d.elem === 'f' ? 'Aliento de fuego: el equipo pega un 6 % más' : 'Aliento helado: el equipo tiene un 6 % más de vida']);
    }
    else if (nd.pasiva && eq !== null) {S.santuarios.push({x: d.x, z: d.z, r: 7, eq, hasta: S.t + 90}); ev(['aviso', 0, (eq === 0 ? 'Rohan' : 'Isengard') + ' caza a la nutria: santuario de velocidad y vista en el río']); ev(['fx', 'onda', d.x, d.z, 7]);}
    else if (nd.buff && o && o.k === 'h') {o.buf[nd.buff] = 90; ev(['fx', 'onda', d.x, d.z, 5]); ev(['aviso', o.id, BUFF_TXT[nd.buff]]);}
  }
  if (d.k === 'h') {
    d.muerto = true; d.resp = S.t + Math.min(45, 6 + d.nivel * 2 + Math.floor(S.t / 60) * 0.8); /* como en el LoL: cuanto más avanzada la partida, más cuesta morir */ d.buf = {}; ev(['muere', d.id]); S.muertes[1 - d.eq]++;
    d.muertes++; const rachaVictima = d.racha; d.racha = 0;
    if (S.modo === '1v1' && S.fin < 0 && S.muertes[1 - d.eq] >= (S.t >= DUELO.anillo ? 1 : 2) && !S.duelo) {S.duelo = 1; luego(1.2, () => {if (S.fin < 0) {S.fin = 1 - d.eq; ev(['fin', 1 - d.eq]);}});}
    const asesino = o && o.k === 'h' ? o : S.u.find((q) => q.id === d.agresor && d.agresorT > S.t);
    let txt = '';
    if (asesino) {
      asesino.kills++; asesino.racha++; asesino.multi = S.t - asesino.multiT < 10 ? asesino.multi + 1 : 1; asesino.multiT = S.t;
      let oro = 300 + (rachaVictima >= 3 ? 150 : 0); asesino.oro += oro; ganaXp(asesino, 120 + 25 * d.nivel);
      if (!S.primera) {S.primera = true; txt = '¡Primera sangre!'; asesino.oro += 100;}
      else if (asesino.multi >= 2) txt = ['', '', '¡Doble derribo!', '¡Triple derribo!', '¡Cuádruple derribo!'][Math.min(4, asesino.multi)];
      else if (rachaVictima >= 3) txt = '¡Racha cortada!';
      else if (asesino.racha >= 3) txt = asesino.racha >= 7 ? '¡Leyenda de la Marca!' : asesino.racha >= 5 ? '¡Imparable!' : '¡En racha!';
      for (const a of heroes()) if (a.eq === asesino.eq && a !== asesino && d.danos[a.id] > S.t - 8) {a.asist++; a.oro += 120; ganaXp(a, 60);}
      if (heroes().filter((q) => q.eq === d.eq).every((q) => q.muerto) && heroes().filter((q) => q.eq === d.eq).length > 1) txt = '¡Aniquilación!';
    }
    d.danos = {};
    ev(['baja', asesino ? asesino.id : 0, d.id, txt]);
  }
  if (d.k === 't') {ev(['fx', 'explosion', d.x, d.z, 5]); ev(['baja', o && o.k === 'h' ? o.id : 0, d.id, d.eq === 0 ? 'Torre de Rohan destruida' : 'Torre de Isengard destruida']); for (const h of heroes()) if (h.eq !== d.eq) {h.oro += d.inhib ? 50 : 150; ganaXp(h, 80);}
    if (S.modo === '1v1' && S.fin < 0) {S.fin = 1 - d.eq; luego(1.5, () => ev(['fin', 1 - d.eq]));}
    /* inhibidor (Wild Rift 4.0a): la torre de la base vuelve a los 4 min (5 desde el 13, 6 desde el 18) pero ya no dispara; mientras esté caída, supersúbditos */
    if (d.n === 2) {d.respInh = S.t + (S.t < 780 ? 240 : S.t < 1080 ? 300 : 360); ev(['aviso', 0, (d.eq ? '¡Isengard' : '¡Rohan') + ' ha perdido su torre de la base: supersúbditos!']);}}
  if (d.k === 'n' && S.fin < 0) {S.fin = 1 - d.eq; ev(['fx', 'explosion', d.x, d.z, 8]); ev(['fin', 1 - d.eq]);}
}
/* golpes con retraso dentro de la simulación (no con setTimeout: así va igual a cualquier velocidad) */
function luego(seg, fn) {S.dif.push({t: S.t + seg, fn});}
function golpea(o, d) {
  if (o.k === 'h') {
    if (o.buf.troll > 0 && d.k !== 't' && d.k !== 'n') {d.quema = {dps: 10 + 3 * o.nivel, hasta: S.t + 3, o: o.id, tick: 0}; if (d.k === 'h') {d.buf.lento = 1; d.buf.lentoV = 0.2;} else d.lento = S.t + 1;}
    const st = stats(o), crit = st.crit && Math.random() < st.crit, n = st.dano * (crit ? 2 : 1), b = HEROES[o.tipo];
    o.ac++;
    if (b.proy) lanzaProy(o, d, b.proy, n, crit ? 'crit' : 'at');
    else luego(0.18, () => {if (d.vida > 0 && !o.muerto) {dana(o, d, n, crit ? 'crit' : 'at'); ev(['fx', 'impacto', d.x, d.z, 1.4]);}});
    return;
  }
  if (o.k === 's') {o.ac++; const sd = SUBD[o.tipo]; if (o.tipo === 'r') lanzaProy(o, d, o.eq ? 'flecha_orca' : 'flecha_elfica', sd.dano * (o.fuerte ? 1.5 : 1) * (SUBD_X[d.k] || 1) * (d.k === 't' || d.k === 'n' ? asedio() : 1), 'at'); else luego(0.2, () => {if (d.vida > 0 && o.vida > 0) dana(o, d, sd.dano * (o.fuerte ? 1.5 : 1) * ((d.k === 't' || d.k === 'n') ? (sd.muros || SUBD_X.t) * asedio() : (SUBD_X[d.k] || 1)), 'at');}); return;}
  if (o.k === 'j') {o.ac++; const nd = NEUTRO[o.tipo], piso = nd.jefe && o.ac % 3 === 0; luego(0.3, () => {if (o.vida <= 0) return; if (piso) {for (const h of heroes()) if (!h.muerto && dist(h, o) < 4.2) dana(o, h, nd.dano * 0.8 * (1 + S.t / 900), 'at'); ev(['fx', 'onda', o.x, o.z, 8]); ev(['fx', 'explosion', o.x, o.z, 3]);} else if (d.vida > 0) {dana(o, d, nd.dano * (1 + S.t / 900), 'at'); if (nd.grande) ev(['fx', 'impacto', d.x, d.z, 2]);}}); return;}
  if (o.k === 't') {o.ac++; const n = d.k === 'h' ? 130 + 12 * Math.floor(S.t / 60) : 110; const p = lanzaProy(o, d, 'piedra', n, 'at', 2.6, 5); p.area = 2.4; p.v = 13;}
}
function lanzaProy(o, d, modelo, n, tipo, esc = 1, y = 1.2) {
  const p = {o, d, x: o.x, z: o.z, n, tipo, v: o.k === 't' ? 16 : 22};
  S.proy.push(p); ev(['proy', modelo, o.x, o.z, d.id, o.k === 't' ? 13 : p.v, esc, y]); return p;
}
function mueveHacia(u, tx, tz, vel, dt) {
  const dx = tx - u.x, dz = tz - u.z, l = Math.hypot(dx, dz); if (l < 0.05) return false;
  const p = Math.min(l, vel * dt); u.x += dx / l * p; u.z += dz / l * p; u.rot = Math.atan2(dx, dz); limita(u); return true;
}
function limita(u) {u.x = Math.max(-MAPA.ancho, Math.min(MAPA.ancho, u.x)); u.z = Math.max(-MAPA.largo, Math.min(MAPA.largo, u.z)); choca(u);}
function choca(u) {
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {const l = ARB.get((Math.floor(u.x / 4) + i) + ',' + (Math.floor(u.z / 4) + j)); if (l) for (const a of l) {const dx = u.x - a.x, dz = u.z - a.z, d = Math.hypot(dx, dz), m = a.r + 0.45; if (d < m && d > 0.001) {u.x = a.x + dx / d * m; u.z = a.z + dz / d * m;}}}
}
/* rumbo de un bot: recto si no hay árboles en medio; si los hay, por la red de sendas */
function rumbo(u, tx, tz) {
  const t = {x: tx, z: tz};
  if (Math.hypot(tx - u.x, tz - u.z) < 4 || lineaLibre(u, t)) {u.ruta = null; return [tx - u.x, tz - u.z];}
  if (!u.ruta || u.rutaT < S.t || Math.hypot(u.rutaD.x - tx, u.rutaD.z - tz) > 4) {u.ruta = camino(u, t); u.rutaT = S.t + 1.5; u.rutaD = t;}
  /* el punto más lejano de la ruta al que ya se ve recto */
  let obj = null; for (let i = u.ruta.length - 1; i >= 0; i--) if (lineaLibre(u, u.ruta[i])) {obj = u.ruta[i]; break;}
  if (!obj) obj = u.ruta[0] || t;
  return [obj.x - u.x, obj.z - u.z];
}
function ve(h, tx, tz) {const [x, z] = rumbo(h, tx, tz); h.mx = x; h.mz = z;}
function masCercano(u, lista, r) {let m = null, md = r; for (const q of lista) {const d0 = dist(u, q) - radio(q); if (d0 < md) {md = d0; m = q;}} return m;}

function oleada() {
  S.oleadaN++; if (S.oleadaN === 1) ev(['voz', 'hordas']);
  for (const eq of [0, 1]) for (const l of S.carriles) {
    const L = CARRILES[l], ini = eq ? L[L.length - 1] : L[0], sig = eq ? L[L.length - 2] : L[1], dl = Math.hypot(sig.x - ini.x, sig.z - ini.z), ux = (sig.x - ini.x) / dl, uz = (sig.z - ini.z) / dl;
    /* las hordas: cuerpo a cuerpo delante, arqueros detrás; desde el minuto 4 un ariete cada tercera oleada */
    const tipos = [...Array(ORDA).fill('m'), 'r', 'r']; if (S.t > 240 && S.oleadaN % 3 === 0) tipos.push('a'); if (S.t > 600) tipos.push('a');
    const furia = S.bufEq[eq].uruk > S.t;
    /* como el inhibidor del LoL: si cayó la torre de la base enemiga, tus hordas llevan un ariete más y van reforzadas */
    const rota = S.u.some((t) => t.k === 't' && t.n === 2 && t.eq !== eq && t.vida <= 0); if (rota) {for (let i = tipos.length - 1; i >= 0; i--) if (tipos[i] === 'a') tipos.splice(i, 1); tipos.unshift('x');}
    tipos.forEach((tipo, i) => {
      const sd = SUBD[tipo], refuerzo = (1 + 0.06 * Math.floor(S.t / 60)) * (furia ? 1.5 : 1), atras = tipo === 'x' ? -1.6 : tipo === 'm' ? 0 : tipo === 'r' ? 2.4 : 4.4, lat = tipo === 'a' || tipo === 'x' ? 0 : (((i - (tipos[0] === 'x' ? 1 : 0)) % ORDA) - (ORDA - 1) / 2) * 1.3;
      S.u.push({id: idSig++, k: 's', eq, tipo, carril: l, wp: eq ? L.length - 2 : 1, fuerte: furia, x: ini.x - ux * atras - uz * lat, z: ini.z - uz * atras + ux * lat, vida: sd.vida * refuerzo, max: sd.vida * refuerzo, cd: 0, ac: 0, rot: Math.atan2(ux, uz), rad: tipo === 'a' || tipo === 'x' ? 0.8 : 0.5});
    });
  }
}

function paso(dt) {
  S.t += dt; S.ola -= dt; S.porId = new Map(S.u.map((u) => [u.id, u]));
  for (let i = S.dif.length - 1; i >= 0; i--) if (S.dif[i].t <= S.t) {const f = S.dif[i].fn; S.dif.splice(i, 1); f();} if (S.ola <= 0) {S.ola = S.carriles.length > 1 ? 28 : 24; oleada();}
  /* quemadura de la brasa del troll */
  for (const u of S.u) if (u.quema) {if (S.t > u.quema.hasta || u.vida <= 0 || u.muerto) {u.quema = null; continue;} u.quema.tick -= dt; if (u.quema.tick <= 0) {u.quema.tick = 0.5; dana(S.porId.get(u.quema.o) || null, u, u.quema.dps * 0.5, 'hab');}}
  /* plantas de la espesura (como las del LoL): seta de humo lanza por los aires, baya cura, flor de elanor da vista */
  for (const q of S.plantas) if (S.t >= q.listo) for (const h of heroes()) if (!h.muerto && dist(h, q) < 1.4) {
    q.listo = S.t + (q.tipo === 'seta' ? 60 : 75); ev(['planta', q.tipo, q.x, q.z]);
    if (q.tipo === 'seta') for (const a of heroes()) if (!a.muerto && dist(a, q) < 3.4) {const dx = a.x - q.x, dz = a.z - q.z, l = Math.hypot(dx, dz) || 1, ux = l > 0.2 ? dx / l : Math.sin(a.rot || 0), uz = l > 0.2 ? dz / l : Math.cos(a.rot || 0); a.x = q.x + ux * 7.5; a.z = q.z + uz * 7.5; a.px = undefined; a.dash = null; limita(a); ev(['tp', a.id, a.x, a.z]);}
    if (q.tipo === 'baya') {const st = stats(h); const n = Math.min(st.vida - h.vida, st.vida * 0.12 + 40); h.vida += n; ev(['num', h.x, h.z, '+' + Math.round(n), 'v']);}
    if (q.tipo === 'flor') S.visiones.push({x: q.x, z: q.z, r: 11, eq: h.eq, hasta: S.t + 12});
    break;
  }
  for (const z of [...S.santuarios, ...S.visiones]) if (z.hasta > S.t) for (const e of heroes()) if (e.eq !== z.eq && Math.hypot(e.x - z.x, e.z - z.z) < z.r) e.revela = Math.max(e.revela || 0, S.t + 0.3);
  /* reliquias de vida: cura un 20 % + 30 por nivel al que pasa por encima */
  for (const r of S.reliq) if (S.t >= r.listo) for (const h of heroes()) if (!h.muerto && dist(h, r) < 1.6) {const st = stats(h); const n = Math.min(st.vida - h.vida, st.vida * 0.2 + 30 * h.nivel); h.vida += n; r.listo = S.t + 90; ev(['num', h.x, h.z, '+' + Math.round(n), 'v']); ev(['fx', 'onda', r.x, r.z, 3]); ev(['son', 'magia']); break;}
  /* anillo de fuego del Duelo */
  if (S.modo === '1v1') {
    const r = radioAnillo(S.t);
    if (r && !S.anilloAv) {S.anilloAv = 1; ev(['aviso', 0, '🔥 ¡El anillo de fuego! Desde ahora, un solo derribo gana']); ev(['voz', 'uruk_despierta']);}
    if (r) for (const h of heroes()) if (!h.muerto && Math.hypot(h.x, h.z) > r) {h.vida -= stats(h).vida * DUELO.quema * dt; h.quemaT = (h.quemaT || 0) - dt; if (h.quemaT <= 0) {h.quemaT = 0.5; ev(['num', h.x, h.z, '🔥', 'r']);} if (h.vida <= 0) muere(h, null);}
  }
  /* rendición: si se acaba el tiempo de la votación sin votos suficientes, falla */
  for (const eq of [0, 1]) {const R = S.voto && S.voto[eq]; if (R && S.t >= R.hasta) cierraVoto(eq, false);}
  const hs = heroes();
  for (const h of hs) {
    for (const k in h.cd) h.cd[k] = Math.max(0, h.cd[k] - dt);
    for (const k in h.buf) if (typeof h.buf[k] === 'number' && !k.endsWith('V')) h.buf[k] = Math.max(0, h.buf[k] - dt);
    if (h.muerto) {if (S.t >= h.resp) {h.muerto = false; const f = BASES[h.eq].fuente; h.x = f.x + (h.slot >= 2 ? 1.5 : -1.5); h.z = f.z - signo(h.eq) * 2.5; h.px = undefined; h.vida = stats(h).vida; ev(['vive', h.id]);} continue;}
    const st = stats(h); h.oro += 2.2 * dt;
    h.hierba = enHierba(h);
    const enFuente = dist(h, BASES[h.eq].fuente) < 8;
    h.vida = Math.min(st.vida, h.vida + (st.regen + (enFuente ? st.vida * 0.12 : 0)) * dt);
    if (h.bot) ia(h, dt, st);
    if (h.dash) {
      const d = h.dash; d.t -= dt; h.x += d.vx * dt; h.z += d.vz * dt; limita(h);
      if (d.n) for (const e of enemigosDe(h.eq)) if (!d.toc.has(e.id) && e.k !== 'n' && (e.k !== 't') && dist(h, e) < 1.6 + radio(e)) {d.toc.add(e.id); dana(h, e, d.n, 'hab'); if (d.aturde && e.k !== 't') {e.aturd = S.t + d.aturde;}}
      if (d.t <= 0) {if (d.cae) {for (const e of enemigosDe(h.eq)) if (e.k !== 't' && e.k !== 'n' && dist(e, d.cae) < d.cae.r) {dana(h, e, d.cae.n, 'hab'); e.buf ? (e.buf.lento = d.cae.dur, e.buf.lentoV = d.cae.l) : (e.lento = S.t + d.cae.dur);} ev(['fx', 'onda', h.x, h.z, d.cae.r * 1.6]);} h.dash = null;}
    } else if (h.buf.estasis > 0) {h.mueve = false;
    } else if (!(h.aturd > S.t)) {
      if (h.bot || h.local) {if (h.mx || h.mz) {const l = Math.hypot(h.mx, h.mz); h.x += h.mx / l * st.vel * Math.min(1, l) * dt; h.z += h.mz / l * st.vel * Math.min(1, l) * dt; h.rot = Math.atan2(h.mx, h.mz); limita(h); h.mueve = true;} else h.mueve = false;}
    }
    /* ataque básico */
    if (h.fijo) {const f = S.porId.get(h.fijo); if (!f || f.vida <= 0 || f.muerto || dist(h, f) > 16 || (f.k === 'h' && oculto(f, h))) h.fijo = 0;}
    if ((h.ataca || h.tap > S.t) && !h.dash && !(h.aturd > S.t) && !(h.buf.estasis > 0) && h.cd.a <= 0) {
      const en = enemigosDe(h.eq, h).filter(atacable), r = st.alcance + 0.6, aTiro = (e) => dist(h, e) - radio(e) < r;
      let obj = null; const hh = en.filter((e) => e.k === 'h' && aTiro(e)), f = h.fijo && en.find((e) => e.id === h.fijo);
      /* como en el Wild Rift: objetivo fijado (arrastrando el ataque o tocando su retrato), botón de torre (solo estructuras),
         botón de súbditos (el de menos vida, para rematar) y, si no, prioridad normal (héroes primero) */
      if (f) obj = aTiro(f) ? f : null;
      else if (h.modoAt === 't') obj = masCercano(h, en.filter((e) => e.k === 't' || e.k === 'n'), r);
      else if (h.modoAt === 's') obj = en.filter((e) => (e.k === 's' || e.k === 'j') && aTiro(e)).sort((a, b) => a.vida - b.vida)[0] || null;
      else obj = hh.length && (h.prioHeroe !== false) ? hh.sort((a, b) => a.vida - b.vida)[0] : masCercano(h, en.filter((e) => e.k !== 'j' || e.agro === h.id || !h.bot || h.ataca), r);
      if (obj) {h.cd.a = 1 / st.vatq; h.rot = Math.atan2(obj.x - h.x, obj.z - h.z); if (h.buf.invis) h.buf.invis = 0; h.revela = S.t + 1.2; golpea(h, obj); h.tap = 0;}
      /* pedido de Arturo: cada toque del ataque da un golpe SIEMPRE, aunque te muevas y no haya nadie (golpe al aire) */
      else if (!h.bot && (h.tap > S.t || !h.mueve)) {h.cd.a = 1 / st.vatq; h.ac++; h.tap = 0;}
    }
  }
  /* súbditos */
  for (const u of S.u) {
    if (u.k !== 's' || u.muerto) continue;
    const sd = SUBD[u.tipo]; u.cd = Math.max(0, u.cd - dt);
    if (u.aturd > S.t) continue;
    /* como en el LoL: siguen con su objetivo; prefieren súbditos y torres; a un héroe solo si ataca a un héroe de su bando cerca o si no queda otra cosa */
    const en = enemigosDe(u.eq).filter((e) => e.eq !== 2 && atacable(e)), rr = u.tipo === 'r' ? 7 : 6;
    /* prioridades del LoL / Wild Rift: 1 héroe que ataca a un héroe aliado, 2 súbdito que ataca a un héroe aliado, 3 súbdito que ataca a un súbdito aliado,
       4 torre que ataca a un súbdito aliado, 5 héroe que ataca a un súbdito aliado, 6 súbdito más cercano, 7 héroe más cercano. Las 1 y 2 interrumpen; el resto respeta el objetivo que ya tenía. */
    const victima = (e) => e.atacaT > S.t ? S.porId.get(e.atacaA) : null;
    const cerca = en.filter((e) => dist(u, e) - radio(e) < rr + 1.5);
    const prio = (e) => {const v = victima(e); if (v && v.eq === u.eq) {if (v.k === 'h') return e.k === 'h' ? 1 : 2; if (v.k === 's') return e.k === 's' ? 3 : e.k === 't' ? 4 : 5;} return e.k === 'h' ? 7 : 6;};
    let obj = null, mejor = 9;
    for (const e of cerca) {const p = prio(e); if (p < mejor || (p === mejor && obj && dist(u, e) < dist(u, obj))) {mejor = p; obj = e;}}
    if (mejor > 2 && u.objId) {const o2 = cerca.find((e) => e.id === u.objId); if (o2) obj = o2;}
    u.objId = obj ? obj.id : 0;
    const vel = sd.vel * (u.lento > S.t ? 0.6 : 1);
    if (obj) {
      const d0 = dist(u, obj) - radio(obj);
      if (d0 > sd.alcance) {mueveHacia(u, obj.x, obj.z, vel, dt); u.mueve = true;}
      else {u.mueve = false; u.rot = Math.atan2(obj.x - u.x, obj.z - u.z); if (u.cd <= 0) {u.cd = 1 / sd.vatq; golpea(u, obj);}}
    } else {
      const L = CARRILES[u.carril], paso0 = u.eq ? -1 : 1;
      if (u.wp >= 0 && u.wp < L.length) {
        const sig = L[u.wp + paso0]; if (sig && dist(u, sig) < dist(u, L[u.wp])) u.wp += paso0;
        const w = L[u.wp]; if (dist(u, w) < 2.2) u.wp += paso0;
      }
      const meta = u.wp >= 0 && u.wp < L.length ? L[u.wp] : BASES[1 - u.eq].nexo;
      u.mueve = mueveHacia(u, meta.x, meta.z, vel, dt);
    }
  }
  /* la espesura: campamentos que reaparecen y bestias que vuelven a su sitio si te alejas */
  S.campos.forEach((c, ci) => {
    if (c.vivos > 0 || S.t < c.resp) return;
    const nd = NEUTRO[c.tipo], k = 1 + S.t / 600; c.vivos = c.n;
    if (nd.draco) {c.elem = S.dracoSig; ev(['aviso', 0, c.elem === 'f' ? '🔥 Un draco de fuego ha despertado junto al río' : '❄ Un draco frío ha bajado de las Montañas Grises']);}
    for (let i = 0; i < c.n; i++) S.u.push({id: idSig++, k: 'j', eq: 2, tipo: c.tipo, campo: ci, elem: c.elem, x: c.x + (i - (c.n - 1) / 2) * 1.5, z: c.z, cx: c.x + (i - (c.n - 1) / 2) * 1.5, cz: c.z, vida: nd.vida * k, max: nd.vida * k, cd: 0, ac: 0, rot: Math.atan2(-c.x, -c.z) || 0, rad: nd.jefe ? 1.5 : nd.grande ? 1.1 : 0.6});
    if (nd.jefe) {ev(['aviso', 0, '¡El Uruk Azul ha despertado en su foso junto al río!']); ev(['voz', 'uruk_despierta']);}
  });
  for (const u of S.u) {
    if (u.k !== 'j' || u.muerto) continue;
    const nd = NEUTRO[u.tipo]; u.cd = Math.max(0, u.cd - dt);
    if (nd.pasiva) {
      const t = (u.ruta = u.ruta ?? 1), R = 9, dx = 0.906 * R * t, dz = 0.423 * R * t, huye = u.agro && S.t < u.agroT;
      u.mueve = mueveHacia(u, dx, dz, nd.vel * (huye ? 1.6 : 0.8), dt); if (!u.mueve) u.ruta = -t;
      continue;
    }
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
    if (t.k === 't' && t.vida <= 0 && t.respInh && S.t >= t.respInh && S.modo !== '1v1') {t.vida = t.max; t.inhib = true; t.respInh = 0; ev(['aviso', 0, 'La torre de la base de ' + (t.eq ? 'Isengard' : 'Rohan') + ' se ha alzado de nuevo (sin disparar)']);}
    if (t.k !== 't' || t.vida <= 0 || t.inhib) continue; t.cd = Math.max(0, t.cd - dt);
    const en = enemigosDe(t.eq).filter((e) => e.eq !== 2 && e.k !== 't' && e.k !== 'n' && dist(t, e) < 9.5);
    /* como en el Wild Rift: la torre sigue con su objetivo hasta que muere o sale; si un héroe enemigo pega a un héroe aliado dentro del alcance, va a por él */
    let obj = en.find((e) => {if (e.k !== 'h' || !(e.atacaT > S.t)) return false; const v = S.porId.get(e.atacaA); return v && v.k === 'h' && v.eq === t.eq && dist(v, t) < 10.5;});
    if (!obj && t.obj) obj = en.find((e) => e.id === t.obj);
    if (!obj) obj = masCercano(t, en.filter((e) => e.k === 's'), 9.5) || masCercano(t, en, 9.5);
    t.obj = obj ? obj.id : 0;
    if (obj && t.cd <= 0) {t.cd = 1.1; golpea(t, obj);}
  }
  /* proyectiles */
  for (let i = S.proy.length - 1; i >= 0; i--) {
    const p = S.proy[i], d = p.d;
    if (!d || d.vida <= 0) {S.proy.splice(i, 1); continue;}
    const dx = d.x - p.x, dz = d.z - p.z, l = Math.hypot(dx, dz);
    if (l < 0.6) {dana(p.o, d, p.n, p.tipo); if (p.area) {for (const e of enemigosDe(p.o.eq)) if (e !== d && e.eq !== 2 && e.k !== 't' && e.k !== 'n' && dist(e, d) < p.area) dana(p.o, e, p.n * (e.k === 'h' ? 0.5 : 0.25), 'at'); ev(['fx', 'explosion', d.x, d.z, 3.2]);} S.proy.splice(i, 1); continue;}
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
  if (!h || h.muerto || h.aturd > S.t || h.cd[k] > 0 || !(h.rk[k] > 0)) return false;
  const H = HEROES[h.tipo].hab[k], st = stats(h), escala = 1 + 0.22 * (h.rk[k] - 1) + 0.03 * (h.nivel - 1) + (st.dano - HEROES[h.tipo].dano) / 150;
  const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; h.rot = Math.atan2(dx, dz);
  h.cd[k] = H.cd * (1 - 0.08 * (h.rk[k] - 1)) * (h.buf.huorn > 0 ? 0.8 : 1); h.hc++; h.hk = k; h.revela = S.t + 1.2; if (h.buf.invis && H.tipo !== 'invis') h.buf.invis = 0;
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
  ev(['hb', h.id, k, +dx.toFixed(2), +dz.toFixed(2), +(px || 0).toFixed(1), +(pz || 0).toFixed(1)]);
  if (H.tipo === 'zona') {const d0 = Math.min(H.alc, Math.hypot(px - h.x, pz - h.z)), x = h.x + dx * d0, z = h.z + dz * d0; S.zonas.push({x, z, r: H.radio, t: H.dur, tick: 0, dps: H.dps * escala, l: H.lento, eq: h.eq, o: h}); ev(['zona', x, z, H.radio, H.dur]);}
  return true;
}

function usaEnc(h) {
  const e = ENC[h.enc]; if (!h || h.muerto || !e || (h.cd.enc || 0) > 0 || !tieneBotas(h.inv)) return false;
  if (h.enc !== 'azogue' && h.aturd > S.t) return false;
  h.cd.enc = e.cd;
  if (h.enc === 'estasis') {h.buf.estasis = 2.5; h.dash = null;}
  if (h.enc === 'gargola') {const v0 = stats(h).vida; h.buf.gargola = 4; h.vida += stats(h).vida - v0;}
  if (h.enc === 'azogue') {h.aturd = 0; h.buf.lento = 0; h.buf.azogue = 1.5;}
  if (h.enc === 'medallon') for (const a of heroes()) if (a.eq === h.eq && !a.muerto && dist(a, h) < 8) {a.buf.escudo = 2.5; a.buf.escudoV = (a.buf.escudoV || 0) + 30 + 11 * h.nivel; ev(['enc', a.id, 'medallon']);}
  if (h.enc !== 'medallon') ev(['enc', h.id, h.enc]);
  ev(['son', 'magia']); return true;
}
function usaHechizo(h, k, dx, dz) {
  if (!h || h.muerto || h.cd[k] > 0 || h.aturd > S.t) return false;
  if (k === 'f' && h.hf === 'c') {/* Castigo: golpe seco a la bestia o súbdito más cercano (como el Smite del LoL) */
    const t = masCercano(h, S.u.filter((u) => (u.k === 'j' || u.k === 's') && u.eq !== h.eq && !u.muerto && u.vida > 0), 5.5); if (!t) return false;
    h.cd.f = HECHIZOS.c.cd; dana(h, t, 380 + 45 * h.nivel, 'hab'); ev(['castigo', t.x, t.z]); return true;
  }
  h.cd[k] = HECHIZOS[k].cd;
  if (k === 'd') {const l = Math.hypot(dx, dz) || 1, r = h.rot || 0; if (!dx && !dz) {dx = Math.sin(r); dz = Math.cos(r);} else {dx /= l; dz /= l;} ev(['fx', 'onda', h.x, h.z, 2]); h.x += dx * 4.5; h.z += dz * 4.5; h.px = undefined; limita(h); h.rot = Math.atan2(dx, dz); ev(['fx', 'onda', h.x, h.z, 2.4]); ev(['tp', h.id, h.x, h.z]);}
  if (k === 'f') {for (const a of heroes()) if (a.eq === h.eq && !a.muerto && (a === h || dist(a, h) < 8)) {const st = stats(a); a.vida = Math.min(st.vida, a.vida + st.vida * 0.18 + 25 * h.nivel); a.buf.prisa = 1.5; ev(['fx', 'onda', a.x, a.z, 3]); ev(['num', a.x, a.z, '+' + Math.round(st.vida * 0.18 + 25 * h.nivel), 'v']);}}
  ev(['son', 'magia']); return true;
}

/* ---------- bots ---------- */
function heroeEn0(h, en) {return en.filter((e) => e.k === 'h').sort((a, b) => dist(h, a) - dist(h, b))[0];}
function ia(h, dt, st) {
  const en = enemigosDe(h.eq, h), F = BASES[h.eq].fuente, avanza = h.eq ? -1 : 1;
  h.iaT = (h.iaT || 0) - dt; h.mx = 0; h.mz = 0; h.ataca = false;
  {const rl = S.reliq.find((r) => S.t >= r.listo && dist(h, r) < 18); if (rl && h.vida < stats(h).vida * 0.6) {ve(h, rl.x, rl.z); return;}}
  if (S.modo === '1v1') {const r = radioAnillo(S.t); if (r && Math.hypot(h.x, h.z) > r - 3) {ve(h, 0, 0); h.ataca = true; return;}}
  if (h.enc === '' && tieneBotas(h.inv) && dist(h, F) < 8 && h.oro > 420) compra(h, ['gargola', 'estasis', 'azogue', 'medallon'][h.slot % 4]);
  if (h.enc && !(h.cd.enc > 0) && h.vida < stats(h).vida * 0.3 && en.some((e) => e.k === 'h' && dist(e, h) < 8)) usaEnc(h);
  /* compra en la fuente */
  if (dist(h, F) < 8) {const plan = PLAN_BOT[h.tipo] || []; const id = plan[h.plan]; if (id && compra(h, id) === '') h.plan++;}
  autoSube(h);
  const pv = h.vida / st.vida;
  if (pv < 0.3 && h.cd.f <= 0 && en.some((e) => e.k === 'h' && dist(e, h) < 9)) usaHechizo(h, 'f', 0, 0);
  if (pv < 0.18 && h.cd.d <= 0 && en.some((e) => e.k === 'h' && dist(e, h) < 5)) usaHechizo(h, 'd', F.x - h.x, F.z - h.z);
  if (pv < 0.28 || h.vuelve) {h.vuelve = pv < 0.92; ve(h, F.x, F.z); return;}
  const heroeEn = en.filter((e) => e.k === 'h').sort((a, b) => dist(h, a) - dist(h, b))[0];
  /* habilidades contra héroes cercanos */
  if (heroeEn && dist(h, heroeEn) < 9 && h.iaT <= 0) {
    h.iaT = 0.6;
    for (const k of ['r', 'q', 'e', 'w']) {
      const H = HEROES[h.tipo].hab[k]; if (h.cd[k] > 0 || !(h.rk[k] > 0)) continue;
      const d0 = dist(h, heroeEn), alc = H.alc || H.dist || H.radio || 4;
      if (['escudo', 'reduce', 'rafaga', 'suerte', 'invis'].includes(H.tipo)) {if (d0 < 6) {usaHab(h, k, heroeEn.x - h.x, heroeEn.z - h.z, heroeEn.x, heroeEn.z); break;} continue;}
      if (d0 < alc + 0.5) {usaHab(h, k, heroeEn.x - h.x, heroeEn.z - h.z, heroeEn.x, heroeEn.z); break;}
    }
  }
  /* si un compañero pelea con una bestia grande o con el Uruk, se va a ayudar */
  const bestiaAliada = S.u.find((u) => u.k === 'j' && !u.muerto && NEUTRO[u.tipo].grande && S.u.some((q) => q.k === 'h' && q.eq === h.eq && q !== h && q.id === u.agro && !q.bot));
  if (bestiaAliada && pv > 0.55 && dist(h, bestiaAliada) < 40) {if (dist(h, bestiaAliada) - radio(bestiaAliada) > st.alcance) ve(h, bestiaAliada.x, bestiaAliada.z); else h.ataca = true; return;}
  /* camino: en el 2 contra 2 cada uno el suyo; en el 1 contra 1 el que esté más apretado */
  if (S.carriles.length > 1 && S.u.filter((q) => q.k === 'h').length === 2 && (h.carrilT || 0) < S.t) {
    h.carrilT = S.t + 12;
    const peligro = [0, 1].map((l) => Math.max(0, ...S.u.filter((u) => u.k === 's' && u.eq !== h.eq && u.carril === l && !u.muerto).map((u) => h.eq ? progreso(l, u) : 1 - progreso(l, u))));
    h.carril = peligro[0] >= peligro[1] ? 0 : 1;
  }
  const l = h.carril;
  const aliados = S.u.filter((u) => u.eq === h.eq && u.k === 's' && !u.muerto && u.carril === l);
  const prog = (u) => h.eq ? 1 - progreso(l, u) : progreso(l, u);
  const frente = aliados.length ? aliados.reduce((m, u) => (prog(u) > prog(m) ? u : m)) : null;
  /* caza en la espesura cuando su camino está tranquilo */
  const empujando = S.u.some((t) => (t.k === 't' || t.k === 'n') && t.eq !== h.eq && t.vida > 0 && atacable(t) && aliados.some((a) => dist(a, t) < 13));
  const camTranquilo = !empujando && !S.u.some((u) => u.k === 's' && u.eq !== h.eq && !u.muerto && u.carril === l && dist(u, h) < 18);
  if (camTranquilo && pv > 0.6 && !(heroeEn && dist(h, heroeEn) < 10)) {
    const bestias = S.u.filter((u) => u.k === 'j' && !u.muerto && (NEUTRO[u.tipo].jefe ? h.nivel >= 8 && pv > 0.9 : NEUTRO[u.tipo].draco ? h.nivel >= 5 && pv > 0.85 : ladoDe(u) * avanza <= 4) && dist(h, u) < 26 && !en.some((e) => e.k === 'h' && dist(e, u) < 12));
    const b = bestias.sort((a, c) => dist(h, a) - dist(h, c))[0];
    if (b) {if (dist(h, b) - radio(b) > st.alcance) ve(h, b.x, b.z); else {h.ataca = true;} return;}
  }
  const torres = S.u.filter((t) => (t.k === 't' || t.k === 'n') && t.eq !== h.eq && t.vida > 0 && atacable(t));
  const torreEn = torres.sort((a, b) => dist(h, a) - dist(h, b))[0];
  const enTorre = (p) => S.u.some((t) => t.k === 't' && t.eq !== h.eq && t.vida > 0 && dist(t, p) < 10);
  let objetivo = null;
  if (heroeEn && dist(h, heroeEn) < st.alcance + 4 && (heroeEn.vida / stats(heroeEn).vida < pv + 0.15) && !enTorre(heroeEn)) objetivo = heroeEn;
  if (!objetivo) {const c = masCercano(h, en.filter((e) => e.k === 's' && !enTorre(e)), st.alcance + 3); if (c) objetivo = c;}
  const nadieDefiende = torreEn && !en.some((e) => e.k === 'h' && dist(e, torreEn) < 14);
  const torreOcupada = torreEn && torreEn.k === 't' && torreEn.obj && (S.porId.get(torreEn.obj) || {}).k === 's';
  if (torreOcupada && pv > 0.45 && dist(h, torreEn) < st.alcance + 8 && !(heroeEn && dist(heroeEn, h) < 6)) objetivo = torreEn;
  if (!objetivo && torreEn && (aliados.some((a) => dist(a, torreEn) < 10) || nadieDefiende) && (dist(h, torreEn) < st.alcance + 6 || nadieDefiende && dist(h, torreEn) < 22)) objetivo = torreEn;
  if (objetivo) {
    const d0 = dist(h, objetivo) - radio(objetivo);
    if (d0 > st.alcance) ve(h, objetivo.x, objetivo.z); else h.ataca = true;
  } else {
    /* espera un poco por detrás del súbdito más adelantado de su camino; sin súbditos, junto a su torre */
    let sitio;
    if (frente) {const f = Math.max(0, Math.min(1, progreso(l, frente) - avanza * 0.03)); sitio = puntoCarril(l, f);}
    else {const t = S.u.find((q) => q.k === 't' && q.eq === h.eq && q.carril === l && q.vida > 0); sitio = t ? puntoCarril(l, h.eq ? 1 - TORRE_F + 0.04 : TORRE_F - 0.04) : BASES[h.eq].torre;}
    if (dist(h, sitio) > 1.5) ve(h, sitio.x, sitio.z);
  }
}

/* ---------- rendirse (como en el Wild Rift: desde el minuto 5; hasta el 9 hace falta que voten sí todos,
   después más del 70 %; si falla, otra vez a los 2 minutos). Solo votan las personas, no los bots. ---------- */
const RINDE_T = 300, RINDE_MAYORIA = 540, VOTO_DUR = 15, VOTO_ESPERA = 120;
function votosNecesarios(eq) {const n = heroes().filter((h) => h.eq === eq && !h.bot).length || 1; return S.t < RINDE_MAYORIA ? n : Math.floor(n * 0.7) + 1;}
function rinde(h, si) {
  if (!S.voto) {S.voto = [null, null]; S.votoT = [0, 0];}
  const eq = h.eq; let R = S.voto[eq];
  if (!R) {
    if (!si) return;
    if (S.t < RINDE_T) {ev(['aviso', h.id, 'Podrás rendirte a partir del minuto 5']); return;}
    if (S.votoT[eq] > S.t) {ev(['aviso', h.id, 'Podrás volver a votar en ' + Math.ceil(S.votoT[eq] - S.t) + ' s']); return;}
    R = S.voto[eq] = {si: new Set(), no: new Set(), hasta: S.t + VOTO_DUR};
  }
  if (R.si.has(h.id) || R.no.has(h.id)) return;
  (si ? R.si : R.no).add(h.id);
  const n = heroes().filter((q) => q.eq === eq && !q.bot).length || 1, need = votosNecesarios(eq);
  ev(['voto', eq, h.id, R.si.size, R.no.size, need, n, Math.max(0, R.hasta - S.t)]);
  if (R.si.size >= need) cierraVoto(eq, true); else if (R.no.size > n - need) cierraVoto(eq, false);
}
function cierraVoto(eq, ok) {
  S.voto[eq] = null;
  if (ok) {S.fin = 1 - eq; ev(['aviso', 0, (eq ? 'Isengard' : 'Rohan') + ' se rinde']); ev(['fin', 1 - eq]);}
  else {S.votoT[eq] = S.t + VOTO_ESPERA; ev(['votoFin', eq]);}
}
/* ---------- tienda ---------- */
function puedeComprar(h) {return h.muerto || dist(h, BASES[h.eq].fuente) < 9;}
function falta(h, id) {const o = OBJ[id]; if (!o.rec) return []; const q = [...h.inv], f = []; for (const r of o.rec) {const k = q.indexOf(r); if (k >= 0) q.splice(k, 1); else f.push(r);} return f;}
function compra(h, id) {
  if (ENC[id]) {
    const e = ENC[id]; if (!puedeComprar(h)) return 'Solo se compra en tu fuente (o mientras esperas a volver)';
    if (!tieneBotas(h.inv)) return 'Antes necesitas unas botas'; if (h.enc === id) return 'Ya lo tienes';
    if (h.oro < e.c) return 'Te falta oro'; h.oro -= e.c; h.enc = id; h.cd.enc = Math.max(h.cd.enc || 0, 10); return '';
  }
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
    ? [q.id, 'h', q.eq, +q.x.toFixed(2), +q.z.toFixed(2), +(q.rot || 0).toFixed(2), Math.round(q.vida), Math.round(stats(q).vida), q.mueve || q.dash ? 1 : 0, q.ac, q.hc, q.hk, q.muerto ? Math.max(0, Math.ceil(q.resp - S.t)) : -1, q.tipo, q.nivel, Math.floor(q.oro), q.inv.join(','), ['q', 'w', 'e', 'r'].map((k) => +q.cd[k].toFixed(1)).join(','), (q.buf.invis > 0 ? 1 : 0) | (q.aturd > S.t ? 2 : 0) | (q.buf.escudo > 0 ? 4 : 0) | (q.hierba >= 0 && !(q.revela > S.t) ? 8 : 0), q.nombre, q.slot, +(q.xp / xpNivel(q.nivel)).toFixed(2), q.hierba ?? -1, ['q', 'w', 'e', 'r'].map((k) => q.rk[k]).join(''), q.pts, [q.kills, q.muertes, q.asist, q.cs].join('/'), +q.cd.d.toFixed(1), +q.cd.f.toFixed(1), Math.round(q.buf.troll || 0), Math.round(q.buf.huorn || 0), q.atacaT > S.t ? q.atacaA : 0, q.enc, +(q.cd.enc || 0).toFixed(1), (q.buf.estasis > 0 ? 1 : 0) | (q.buf.gargola > 0 ? 2 : 0), q.fijo || 0, q.hf]
    : [q.id, q.k, q.eq, +q.x.toFixed(2), +q.z.toFixed(2), +(q.rot || 0).toFixed(2), Math.round(q.vida), Math.round(q.max), q.mueve ? 1 : 0, q.ac || 0, q.obj || 0, (q.k === 't' || q.k === 'n') ? (q.vida > 0 && protegida(q) ? 'P' : '') + (q.inhib ? 'I' : '') : q.k === 'j' ? q.elem || '' : q.fuerte ? 'F' : '', q.muerto ? 0 : -1, q.tipo || q.n || 0]);
  const be = S.bufEq.map((b) => Math.max(0, Math.round((b.uruk || 0) - S.t))), dr = S.bufEq.map((b) => [b.drF || 0, b.drH || 0, b.alma || 0]);
  const cp = S.campos.map((c) => c.vivos > 0 ? -1 : Math.max(0, Math.round(c.resp - S.t)));
  return {t: +S.t.toFixed(2), u, m: S.muertes, be, cp, an: S.modo === '1v1' ? +radioAnillo(S.t).toFixed(1) : 0, rl: S.reliq.map((r) => S.t >= r.listo ? 1 : 0), dr, pl: S.plantas.map((q) => S.t >= q.listo ? 1 : 0), sa: S.santuarios.filter((z) => z.hasta > S.t).map((z) => [+z.x.toFixed(1), +z.z.toFixed(1), z.eq]), ev: S.ev.splice(0)};
}
function aplicaFila(f, t) {
  const [id, k, eq, x, z, rot, vida, max, mueve, ac, hc, hk, muerto, tipo] = f;
  let v = VISTA.get(id);
  if (!v) {v = {id, k, eq, x, z, rot, x0: x, z0: z, r0: rot, t0: t, t1: t}; VISTA.set(id, v);}
  else if (S) {v.x0 = v.x; v.z0 = v.z; v.r0 = v.rot;}   /* anfitrión: de un paso de la simulación al siguiente */
  else {v.x0 = v.xi ?? v.x; v.z0 = v.zi ?? v.z; v.r0 = v.ri ?? v.rot; v.t0 = performance.now();}
  Object.assign(v, {x, z, rot, vida, max, mueve, ac, hc, hk, muerto, tipo, visto: true, llega: performance.now()});
  if (k === 'h') Object.assign(v, {nivel: f[14], oro: f[15], inv: f[16] ? f[16].split(',') : [], cds: f[17].split(',').map(Number), flags: f[18], nombre: f[19], slot: f[20], xpP: f[21], hierba: f[22], rk: String(f[23]).split('').map(Number), pts: f[24], kda: f[25], cdD: f[26], cdF: f[27], bTroll: f[28], bAlfa: f[29], objAt: f[30], enc: f[31] || '', cdEnc: f[32] || 0, flagsE: f[33] || 0, fijo: f[34] || 0, hf: f[35] || 'f'});
}
function recibeFoto(o) {
  for (const v of VISTA.values()) v.visto = false;
  for (const f of o.u) aplicaFila(f, o.t);
  for (const [id, v] of VISTA) if (!v.visto) {quitaVis(id); VISTA.delete(id);}
  marcador(o.m, o.t); EXTRA.be = o.be; EXTRA.cp = o.cp; EXTRA.an = o.an || 0; EXTRA.rl = o.rl || []; EXTRA.dr = o.dr || [[0, 0, 0], [0, 0, 0]]; EXTRA.pl = o.pl || []; EXTRA.sa = o.sa || [];
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
  else if (v.k === 's') {
    o = montar(MODELO_SUBD[v.eq][v.tipo], ALTO_SUBD[v.tipo]); const col = v.eq === MI_EQ ? '#3d8bff' : '#ff3b30';
    tiñe(o.raiz, col, v.hk === 'F' ? 1 : 0.75);
    o.aro = aro(col, v.tipo === 'a' ? 1 : v.tipo === 'x' ? 1.25 : 0.62); o.aro.material.opacity = 0.95; scene.add(o.aro);
  }
  else if (v.k === 'j') {o = montar(NEUTRO[v.tipo].modelo, NEUTRO[v.tipo].alto); if (NEUTRO[v.tipo].azul) tiñe(o.raiz, '#4a7dff', 0.9); if (NEUTRO[v.tipo].draco) tiñe(o.raiz, v.hk === 'h' ? '#6fb8ff' : '#e0461e', 0.85); if (v.tipo === 'huorn') o.raiz.traverse((q) => {if (q.isMesh) {q.material.map = null; q.material.color.set('#7a5c38'); q.material.emissive && q.material.emissive.set('#16240a'); q.material.needsUpdate = true;}}); if (v.tipo === 'crebain') o.raiz.traverse((q) => {if (q.isMesh) q.material.color.set('#2a2a30');});}
  else if (v.k === 't') {
    const g = new THREE.Group(), lado = v.eq ? 'isengard' : 'rohan', est = [1, 2, 3].map((n) => {const p = pieza('vado_torres', 'torre_' + lado + '_' + n); p.visible = n === 1; g.add(p); return p;});
    g.rotation.y = v.eq ? 0 : Math.PI; g.scale.setScalar(0.82);
    const mats = []; g.traverse((q) => {if (q.isMesh) {q.material = q.material.clone(); q.material.transparent = true; mats.push(q.material);}});
    o = {raiz: g, est, mats}; luzFuego(1.6, v.z);
  } else if (v.k === 'n') {
    const g = new THREE.Group(), b = pieza('vado_nexos', v.eq ? 'nexo_isengard' : 'nexo_rohan'); b.scale.setScalar(1.35); g.add(b); g.rotation.y = v.eq ? 0 : Math.PI;
    o = {raiz: g}; luzFuego(0, v.z);
  }
  o.raiz.position.set(v.x, 0, v.z); scene.add(o.raiz); o.ac = v.ac; o.hc = v.hc;
  if (o.clips) pon(o, 'quieto');
  VIS.set(v.id, o); return o;
}
function materiales(o) {if (!o.mats) {o.mats = []; o.raiz.traverse((q) => {if (q.isMesh && q.material && q.material.emissive) o.mats.push({m: q.material, e: q.material.emissive.clone(), i: q.material.emissiveIntensity});});} return o.mats;}
let tiemblaCam = 0;
/* ---------- habilidades: cada una con su animación y su efecto (lo que en el LoL hace que «se note») ---------- */
const HAB_ANIM = {rohan: {q: 'atacar_3', w: 'celebrar', e: 'giro', r: 'golpe_cargado'}, enano: {q: 'giro', w: 'celebrar', e: 'esquivar', r: 'golpe_cargado'},
  elfo: {q: 'atacar_2', w: 'celebrar', e: 'esquivar', r: 'golpe_cargado'}, hobbit: {q: 'atacar_2', w: 'esquivar', e: 'atacar_3', r: 'celebrar'}};
const AURA_COL = {escudo: '#6fc8ff', reduce: '#c9b48a', rafaga: '#7dff6a', suerte: '#ffd24a'};
function animaClip(o, nombre, vel = 1) {
  const a = o.todos && o.todos[nombre]; if (!a) return 0;
  a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.timeScale = vel; a.reset().play();
  if (o.actual && o.actual !== a) o.actual.crossFadeTo(a, 0.06, false); o.actual = a; return a.getClip().duration / vel;
}
function aura(o, color, dur, tam = 1.6) {const m = indicador('ind_area', color); m.userData.tira = 1; m.visible = true; m.material.opacity = 0.75; (o.auras = o.auras || []).push({m, t: 0, dur, tam}); return m;}
/* efecto de hoja 4x4 que sigue a alguien: aparece (fotogramas 0-6), se mantiene (6-8) y se deshace (9-15) */
function auraFx(o, nombre, dur, tam, alto) {
  const [, c, r] = FB[nombre], m = fbObjeto(nombre, !alto);
  tam *= 1.25; m.scale.setScalar(tam); if (!alto) m.renderOrder = 3;
  scene.add(m); const a = {m, t: 0, dur, tam, hoja: {c, r}, alto}; (o.auras = o.auras || []).push(a); return a;
}
/* la definitiva: la pantalla se oscurece un instante, sale su nombre y la cámara da un tirón */
let camGolpe = 0;
function ultiFx(v, H, k, mio, cerca) {
  if (!cerca) return;
  const el = $('ulti'); el.className = (v.eq === MI_EQ ? 'az' : 'ro') + (mio ? ' mia' : '');
  el.innerHTML = '<div class="uF"><img src="ui/h_' + v.tipo + '_r.webp" alt=""><b>' + H.n + '</b></div>';
  void el.offsetWidth; el.classList.add('va'); clearTimeout(el._t); el._t = setTimeout(() => {el.className = '';}, 1300);
  if (mio) {camGolpe = 1; if (navigator.vibrate) try {navigator.vibrate([30, 40, 60]);} catch (e) {}}
  suena('cuerno', mio ? 0.75 : 0.5);
}
function habVisual(e) {
  const [, id, k, dx, dz, px, pz] = e, o = VIS.get(id), v = VISTA.get(id); if (!o || !v) return;
  const H = HEROES[v.tipo].hab[k], x = v.xi ?? v.x, z = v.zi ?? v.z, rot = Math.atan2(dx, dz), mio = id === YO;
  /* animación del héroe */
  const d = animaClip(o, HAB_ANIM[v.tipo][k], H.tipo === 'dash' || H.tipo === 'salto' ? 1.3 : 1.15); o.ocup = Math.min(0.9, d * 0.85); o.habYa = true;
  const cerca = mio || Math.hypot(x - camM.x, z - camM.z) < 16, temb = (n) => {if (cerca) tiemblaCam = Math.max(tiemblaCam, n);};
  const luego2 = (ms, fn) => setTimeout(() => {if (VIS.get(id) === o) fn();}, ms), rs = rot - Math.PI / 4;
  if (k === 'r') {ultiFx(v, H, k, mio, cerca); aura(o, v.eq === MI_EQ ? '#8fd0ff' : '#ff8a6a', 1.1, 2.6); if (H.tipo !== 'area') flip('ondaC', x, z, 7, true); o.flash = 0.13; o.punch = 1.6;}
  const anillo = (cx, cz, r, n, fx = 'polvo', tam = 1.6) => {for (let i = 0; i < n; i++) {const a = i / n * Math.PI * 2; flip(fx, cx + Math.cos(a) * r, cz + Math.sin(a) * r, tam);}};
  if (H.tipo === 'dash') {
    o.estela = {t: H.dist / 18 + 0.15, cada: 0, fx: k === 'r' ? 'fuego' : 'polvo', tam: k === 'r' ? 2.4 : 1.5}; flip('polvoA', x, z, 3.4, true); suena('viento', 0.5);
    if (v.tipo === 'elfo') flip('hojas', x, z, 3.2, true); else if (k !== 'r') flip('tArco', x + dx * H.dist * 0.5, z + dz * H.dist * 0.5, 4.2, true, rs);
    if (k === 'r') {/* Carga de los Rohirrim: tajos a lo largo de la carga y el suelo reventado al final */
      temb(0.45); const n = Math.floor(H.dist / 2.2);
      for (let i = 1; i <= n; i++) luego2(i * 55, () => {const f = i / n * H.dist; flip('tArco', x + dx * f, z + dz * f, 5.5, true, rs + (i % 2 ? 0 : Math.PI)); flip('fuego', x + dx * f + rnd(-1, 1), z + dz * f + rnd(-1, 1), 2.2);});
      luego2(H.dist / 18 * 1000, () => {const p = o.raiz.position; flip('grietas', p.x, p.z, 7, true); flip('ondaC', p.x, p.z, 8, true); flip('polvoA', p.x, p.z, 7, true); flip('explosion', p.x, p.z, 3.2); temb(0.65); suena('explosion', 0.7);});
    }
  }
  if (H.tipo === 'salto') {const dist0 = Math.min(H.dist, Math.hypot(px - x, pz - z) || H.dist); o.salto = {t: 0, dur: 0.45, alto: 2.2 + dist0 * 0.12, cx: x + dx * dist0, cz: z + dz * dist0, r: H.radio}; flip('polvoA', x, z, 3.2, true); suena('viento', 0.5);}
  if (H.tipo === 'cono') {
    const fx = v.tipo === 'enano' ? 'tajoFuego' : 'polvo', tam = H.alc * 2.2;
    if (fx === 'polvo') {for (let i = 0; i < 5; i++) {const a = rot + (i - 2) * H.ang / 5; flip('polvo', x + Math.sin(a) * H.alc * 0.6, z + Math.cos(a) * H.alc * 0.6, 1.8);}}
    else {flip('tFuego', x + dx * 0.6, z + dz * 0.6, H.alc * 2.5, true, rs); flip('tArco', x + dx * H.alc * 0.35, z + dz * H.alc * 0.35, H.alc * 1.7, true, rs, 0.16);}
    for (let i = 0; i < 3; i++) {const a = rot + (i - 1) * H.ang / 3; flip('impacto', x + Math.sin(a) * H.alc * 0.8, z + Math.cos(a) * H.alc * 0.8, 2.2);}
    flip('explosion', x + dx * H.alc * 0.55, z + dz * H.alc * 0.55, 2.4, false, undefined, 1);
    suena('espada', 0.7); temb(0.18);
  }
  if (H.tipo === 'area') {
    flip('ondaC', x, z, H.radio * 2.6, true); flip('polvoA', x, z, H.radio * 2.2, true); flip('explosion', x, z, H.radio * 1.2);
    if (k === 'r') {/* Furia de Durin: el suelo se abre bajo el enano y luego alrededor, en dos oleadas */
      flip('grietas', x, z, H.radio * 2.7, true, rot, 0.13, 1.5); anillo(x, z, H.radio * 0.8, 8, 'fuego', 2.2);
      luego2(150, () => {for (let i = 0; i < 6; i++) {const a = i / 6 * Math.PI * 2 + rot; flip('grietas', x + Math.cos(a) * H.radio * 0.72, z + Math.sin(a) * H.radio * 0.72, 3.4, true, a, 0.14, 1.1); flip('explosion', x + Math.cos(a) * H.radio * 0.72, z + Math.sin(a) * H.radio * 0.72, 1.8);} temb(0.5);});
      luego2(330, () => {flip('ondaC', x, z, H.radio * 3.6, true); flip('polvoA', x, z, H.radio * 3.2, true); auraFx(o, 'piedra', 0.9, H.radio * 1.6); temb(0.6); suena('explosion', 0.6);});
    }
    temb(k === 'r' ? 0.75 : 0.22); suena(k === 'r' ? 'explosion' : 'cuerno', 0.6);
  }
  if (H.tipo === 'linea') {o.estelaTiro = {x, z, dx, dz, t: 0, alc: H.alc, verde: v.tipo === 'elfo'}; flip('impacto', x + dx * 1.2, z + dz * 1.2, 1.8); suena('arco', 0.6);}
  if (H.tipo === 'zona') {const d0 = Math.min(H.alc, Math.hypot(px - x, pz - z)), cx = x + dx * d0, cz = z + dz * d0; LLUVIAS.push({x: cx, z: cz, r: H.radio, t: 0, dur: H.dur, cada: 0}); flip('ondaC', cx, cz, H.radio * 2.6, true); flip('hojas', cx, cz, H.radio * 2.5, true, 0, 0.13, H.dur); luego2(H.dur * 500, () => flip('hojas', cx, cz, H.radio * 2, true, 1, 0.13, H.dur * 0.5)); temb(0.3);}
  if (AURA_COL[H.tipo]) {
    const du = H.dur || 3; flip('onda', x, z, 3.2, true);
    if (H.tipo === 'escudo') auraFx(o, 'escudo', du, 3.8);
    else if (H.tipo === 'reduce') {auraFx(o, 'piedra', du, 3.6); flip('polvoA', x, z, 3.4, true);}
    else if (H.tipo === 'rafaga') auraFx(o, 'hojas', du, 3.4);
    else {/* Suerte de Bolsón: trébol de luz sobre la cabeza, aro dorado y estallido */
      aura(o, AURA_COL.suerte, du, 1.8); auraFx(o, 'suerte', du, 2.6, 2.7); flip('suerte', x, z, 5, true); flip('ondaC', x, z, 6, true); flip('explosion', x, z, 2.5, false, undefined, 1.6); anillo(x, z, 1.4, 8, 'impacto', 1.3); temb(0.3);
    }
    suena('magia', 0.5);
  }
  if (H.tipo === 'invis') {flip('humo', x, z, 4.2, false, undefined, 1.2); flip('humo', x, z, 4.6, true); suena('viento', 0.5);}
}
/* lluvia de flechas: caen flechas de verdad sobre la zona */
const LLUVIAS = [];
let ANILLO = null, anilloFx = 0;
const RELIQ_V = []; let RELIQ_MAT = null;
function pintaReliquias() {
  if (RELIQ_V.length !== RELIQ.length) {for (const o of RELIQ_V) {scene.remove(o.sp); scene.remove(o.aro);} RELIQ_V.length = 0;
    if (!RELIQ_MAT) {const tx = cargaTex('../batalla/ui/reliquia.webp'); tx.repeat.set(0.25, 0.25); RELIQ_MAT = new THREE.SpriteMaterial({map: tx, transparent: true, depthWrite: false});}
    for (const r of RELIQ) {const tx = RELIQ_MAT.map; const sp = new THREE.Sprite(RELIQ_MAT); sp.scale.setScalar(3); scene.add(sp); const a = aro('#5aff6a', 1.2); a.material.opacity = 0.35; scene.add(a); RELIQ_V.push({sp, aro: a, r, tx});}}
  const t = performance.now() / 1000;
  RELIQ_V.forEach((o, i) => {const on = !!(EXTRA.rl && EXTRA.rl[i]); o.sp.visible = o.aro.visible = on; if (on) {const f = Math.floor(t * 8) % 16; o.tx.offset.set((f % 4) / 4, 1 - (Math.floor(f / 4) + 1) / 4); o.sp.position.set(o.r.x, 1.05, o.r.z); o.aro.position.set(o.r.x, 0.06, o.r.z); o.aro.rotation.y = t;}});
}
const PLANTA_V = []; const PL_TAM = {seta: 3.4, baya: 2.8, flor: 2.4};
const SANT_V = [];
function pintaJungla() {
  if (PLANTA_V.length !== PLANTAS.length || (PLANTA_V[0] && PLANTA_V[0].q !== PLANTAS[0])) {for (const o of PLANTA_V) scene.remove(o.sp); PLANTA_V.length = 0;
    for (const q of PLANTAS) {const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: cargaTex('../batalla/ui/pl_' + q.tipo + '.webp'), transparent: true, depthWrite: false})); const t = PL_TAM[q.tipo]; sp.scale.setScalar(t); sp.center.set(0.5, 0.12); sp.position.set(q.x, 0, q.z); scene.add(sp); PLANTA_V.push({sp, q});}}
  PLANTA_V.forEach((o, i) => {o.sp.visible = !!(EXTRA.pl && EXTRA.pl[i]); if (o.q.tipo === 'seta') o.sp.scale.setScalar(PL_TAM.seta * (1 + 0.04 * Math.sin(performance.now() / 200)));});
  const sa = EXTRA.sa || []; while (SANT_V.length < sa.length) {const a = aro('#5ae0ff', 7); a.material.opacity = 0.35; scene.add(a); SANT_V.push(a);}
  SANT_V.forEach((a, i) => {a.visible = i < sa.length; if (a.visible) {a.position.set(sa[i][0], 0.08, sa[i][1]); a.material.color.set(sa[i][2] === MI_EQ ? '#5ae0ff' : '#ff6a5a'); a.rotation.y += 0.004;}});
}
function pintaAnillo(dt) {
  pintaReliquias(); pintaJungla();
  const r = MODO === '1v1' ? EXTRA.an || 0 : 0;
  if (!r) {if (ANILLO) ANILLO.visible = false; return;}
  if (!ANILLO) {
    const g = new THREE.RingGeometry(0.985, 1, 128, 1); g.rotateX(-Math.PI / 2);
    ANILLO = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: '#ff6a1a', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending}));
    const g2 = new THREE.RingGeometry(1, 3, 96, 1); g2.rotateX(-Math.PI / 2);
    ANILLO.add(new THREE.Mesh(g2, new THREE.MeshBasicMaterial({color: '#5a0a00', transparent: true, opacity: 0.45, depthWrite: false})));
    ANILLO.position.y = 0.25; ANILLO.renderOrder = 4; scene.add(ANILLO);
  }
  ANILLO.visible = true; ANILLO.scale.set(r, 1, r); ANILLO.material.opacity = 0.65 + 0.25 * Math.sin(performance.now() / 160);
  /* llamas a lo largo del borde, solo cerca de la cámara */
  anilloFx -= dt; if (anilloFx <= 0) {anilloFx = 0.05; const a0 = Math.atan2(camM.z, camM.x); for (let i = 0; i < 2; i++) {const a = a0 + (Math.random() - 0.5) * Math.min(Math.PI * 2, 40 / r); flip('fuego', Math.cos(a) * r, Math.sin(a) * r, 2.2 + Math.random());}}
}
function animaHabilidades(dt) {
  pintaAnillo(dt);
  for (const [id, o] of VIS) {
    const vv = VISTA.get(id), atur = vv && (vv.flags & 2) && (vv.k !== 'h' || vv.muerto < 0);
    if (atur && !o.estr) o.estr = auraFx(o, 'estrellas', 30, 1.9, vv.k === 'h' ? 2.5 : 2.2); else if (!atur && o.estr) {o.estr.t = Math.max(o.estr.t, o.estr.dur - 0.3); o.estr = null;}
    if (o.estela) {o.estela.t -= dt; o.estela.cada -= dt; if (o.estela.cada <= 0) {o.estela.cada = 0.045; flip(o.estela.fx, o.raiz.position.x, o.raiz.position.z, o.estela.tam);} if (o.estela.t <= 0) {flip('impacto', o.raiz.position.x, o.raiz.position.z, 2); o.estela = null;}}
    if (o.salto) {
      o.salto.t += dt; const k = Math.min(1, o.salto.t / o.salto.dur); o.raiz.position.y = Math.sin(k * Math.PI) * o.salto.alto;
      if (k >= 1) {const sx = o.raiz.position.x, sz = o.raiz.position.z; flip('ondaC', sx, sz, o.salto.r * 2.8, true); flip('grietas', sx, sz, o.salto.r * 2.2, true); flip('polvoA', sx, sz, o.salto.r * 2.8, true); flip('explosion', sx, sz, 2.4); if (Math.hypot(sx - camM.x, sz - camM.z) < 14) tiemblaCam = Math.max(tiemblaCam, 0.3); suena('explosion', 0.5); o.raiz.position.y = 0; o.salto = null;}
    }
    if (o.estelaTiro) {const t = o.estelaTiro; t.t += dt; const d0 = Math.min(t.alc, t.t * 26); if (Math.floor(t.t / 0.03) !== Math.floor((t.t - dt) / 0.03)) {if (t.verde) flip('estelaF', t.x + t.dx * d0, t.z + t.dz * d0, 3, true, Math.atan2(t.dx, t.dz) - Math.PI / 2, 0.9, 0.3); else flip('polvo', t.x + t.dx * d0, t.z + t.dz * d0, 0.9);} if (d0 >= t.alc) {flip('impacto', t.x + t.dx * d0, t.z + t.dz * d0, 1.8); o.estelaTiro = null;}}
    if (o.auras) for (let i = o.auras.length - 1; i >= 0; i--) {const a = o.auras[i]; a.t += dt; const k = a.t / a.dur; if (k >= 1 || !o.raiz.visible) {fuera(a.m); o.auras.splice(i, 1); continue;} if (a.hoja) {
        const fin = Math.min(0.45, a.dur * 0.4), f = a.t < 0.3 ? Math.floor(a.t / 0.3 * 6) : a.t > a.dur - fin ? 9 + Math.min(6, Math.floor((a.t - (a.dur - fin)) / fin * 7)) : 6 + Math.round(1 + Math.sin(a.t * 9));
        a.m.material.map.offset.set((f % a.hoja.c) / a.hoja.c, 1 - (Math.floor(f / a.hoja.c) + 1) / a.hoja.r);
        a.m.position.set(o.raiz.position.x, a.alto ? o.raiz.position.y + a.alto : 0.16, o.raiz.position.z); if (!a.alto) a.m.rotation.y += dt * 1.2; continue;
      }
      a.m.position.set(o.raiz.position.x, 0.17, o.raiz.position.z); a.m.scale.setScalar(2 * a.tam * (1 + 0.08 * Math.sin(a.t * 8))); a.m.rotation.y += dt * 1.5; a.m.material.opacity = 0.75 * Math.min(1, (1 - k) * 4);}
  }
  for (let i = LLUVIAS.length - 1; i >= 0; i--) {
    const l = LLUVIAS[i]; l.t += dt; l.cada -= dt; if (l.t > l.dur) {LLUVIAS.splice(i, 1); continue;}
    if (l.cada <= 0) {l.cada = 0.045; const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * l.r, fx = l.x + Math.cos(a) * r, fz = l.z + Math.sin(a) * r, f = modeloProy('flecha_elfica'); f.scale.multiplyScalar(1.4); f.rotation.x = Math.PI / 2; scene.add(f); FXP.push({tipo: 'cae', o: f, x: fx, z: fz, y: 9, t: 0});}
  }
}
function golpeVisual(id, de, fuerte) {
  const o = VIS.get(id), v = VISTA.get(id); if (!o || !v) return;
  o.flash = 0.13; o.punch = fuerte ? 1 : 0.6;
  const yoPego = de === YO, meDan = id === YO;
  if (yoPego || meDan || v.k === 'h') {flip('impacto', (v.xi ?? v.x) + rnd(-0.3, 0.3), (v.zi ?? v.z) + rnd(-0.3, 0.3), fuerte ? 2 : 1.3); suena(fuerte ? 'espada' : 'golpe', yoPego ? 0.55 : 0.3);}
  if (meDan) tiemblaCam = Math.max(tiemblaCam, fuerte ? 0.35 : 0.18);
  else if (yoPego && (fuerte || v.k === 'h')) tiemblaCam = Math.max(tiemblaCam, fuerte ? 0.22 : 0.1);
  if (meDan) {const d = $('dolor'); d.style.opacity = 1; clearTimeout(d._t); d._t = setTimeout(() => {d.style.opacity = 0;}, 140);}
}
function tiñe(raiz, color, k) {const c = new THREE.Color(color); raiz.traverse((q) => {if (q.isMesh && q.material) {q.material.color.lerp(c, k * 0.6); if (q.material.emissive) {q.material.emissive.copy(c); q.material.emissiveIntensity = 0.25 * k;}}});}
function quitaVis(id) {const o = VIS.get(id); if (!o) return; scene.remove(o.raiz); o.raiz.traverse((q) => {if (q.isMesh && q.material && q.material.dispose) q.material.dispose();}); if (o.aro) {scene.remove(o.aro); o.aro.geometry.dispose(); o.aro.material.dispose();} VIS.delete(id); const b = BARRAS.get(id); if (b) {b.remove(); BARRAS.delete(id);}}
const BARRAS = new Map();
const _p = new THREE.Vector3();
function dibuja(dt) {
  const ahora = performance.now();
  for (const v of VISTA.values()) {
    let o = VIS.get(v.id); if (!o) o = creaVis(v);
    /* interpolación: de la posición anterior a la nueva en el tiempo entre fotos */
    let x = v.x, z = v.z, r = v.rot;
    if (!(v.id === YO && !S)) {const k = S ? ALFA : Math.min(1, (ahora - v.t0) / 90); x = v.x0 + (v.x - v.x0) * k; z = v.z0 + (v.z - v.z0) * k; let dr = v.rot - v.r0; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); r = v.r0 + dr * k;}
    v.xi = x; v.zi = z; v.ri = r;
    const muerto = v.k === 'h' ? v.muerto >= 0 : v.muerto === 0;
    o.raiz.position.set(x, o.salto ? o.raiz.position.y : 0, z);
    if (o.clips) {
      let dr = r - (o.rv ?? r); dr = Math.atan2(Math.sin(dr), Math.cos(dr)); o.rv = (o.rv ?? r) + dr * Math.min(1, dt * 14); o.raiz.rotation.y = o.rv;
      if (muerto) pon(o, 'morir', 0.1);
      else {
        if (v.hc !== o.hc) {o.hc = v.hc; if (!o.habYa) {otraVez(o, 'hab'); o.ocup = 0.45;} o.habYa = false;}
        else if (v.ac !== o.ac) {o.ac = v.ac; otraVez(o, 'atacar'); o.ocup = 0.35; if (v.id === YO && !HEROES[v.tipo].proy) suena('espada', 0.25);}
        o.ocup = (o.ocup || 0) - dt;
        const vel = o.lx === undefined ? 0 : Math.hypot(x - o.lx, z - o.lz) / Math.max(dt, 0.001); o.lx = x; o.lz = z; o.vel = (o.vel || 0) + (Math.min(vel, 12) - (o.vel || 0)) * Math.min(1, dt * 10);
        const corre = v.mueve || o.vel > 0.6;
        if (o.ocup <= 0) pon(o, v.flags & 2 ? 'aturdido' : corre ? 'correr' : 'quieto');
        if (o.clips.correr) o.clips.correr.timeScale = Math.max(0.6, Math.min(1.7, o.vel / (v.k === 'h' ? 4.2 : v.k === 'j' ? 4 : 2.9)));
      }
      /* los que están lejos de la cámara se animan a saltos (ahorra en peleas grandes) */
      o.mdt = (o.mdt || 0) + dt; if (Math.hypot(x - camM.x, z - camM.z) < 28 || o.mdt > 0.1) {o.mixer.update(o.mdt); o.mdt = 0;}
      /* destello blanco y pequeño bote al recibir un golpe */
      const dorado = v.k === "h" && (v.flagsE & 1);
      if (dorado) {for (const m of materiales(o)) {m.m.emissive.setRGB(1, 0.72, 0.15); m.m.emissiveIntensity = 0.75 + 0.2 * Math.sin(performance.now() / 90);} o.doradoOn = true;}
      else if (o.doradoOn) {o.doradoOn = false; for (const m of materiales(o)) {m.m.emissive.copy(m.e); m.m.emissiveIntensity = m.i;}}
      if (!dorado && (o.flash > 0 || o.flashOn)) {
        o.flash = Math.max(0, (o.flash || 0) - dt); const k = o.flash / 0.13;
        for (const m of materiales(o)) {if (k > 0) {m.m.emissive.setRGB(1, 0.95, 0.85); m.m.emissiveIntensity = 0.9 * k;} else {m.m.emissive.copy(m.e); m.m.emissiveIntensity = m.i;}}
        o.flashOn = k > 0;
        if (o.escala === undefined) o.escala = o.raiz.scale.x;
        o.raiz.scale.setScalar(o.escala * (1 + 0.1 * (o.punch || 0) * Math.sin(k * Math.PI)));
      }
      const invis = v.k === 'h' && (v.flags & 1 || (v.flags & 8 && v.eq === MI_EQ)), escondido = v.k === 'h' && v.eq !== MI_EQ && ((v.flags & 1) || ((v.flags & 8) && !veoHierba(v))); v.escondido = escondido; o.raiz.visible = !escondido && !(v.k === 'h' && muerto && v.muerto > 3);
      if (invis && v.eq === MI_EQ) o.raiz.traverse((q) => {if (q.isMesh) {q.material.transparent = true; q.material.opacity = 0.4;}}); else if (o.semi) o.raiz.traverse((q) => {if (q.isMesh) q.material.opacity = 1;});
      o.semi = invis;
    } else if (v.k === 't') {
      const n = v.vida <= 0 ? 2 : v.vida < v.max * 0.5 ? 1 : 0; o.est.forEach((p, i) => {p.visible = i === n;});
      /* si tu héroe queda detrás de la torre, la torre se vuelve medio transparente (como en el Wild Rift) */
      const yo = VISTA.get(YO), ej = ejes(), hx = (yo ? (yo.xi ?? yo.x) : 0) - x, hz = (yo ? (yo.zi ?? yo.z) : 0) - z, delante = hx * ej.F.x + hz * ej.F.z, tapa = yo && Math.abs(hx * ej.R.x + hz * ej.R.z) < 3.2 && delante > -1 && delante < 6.5;
      const op = tapa ? 0.35 : 1; if (o.op !== op) {o.op = op; for (const m of o.mats) {m.opacity = op; m.depthWrite = op === 1;}}
    }
    else if (v.k === 'n') o.raiz.visible = v.vida > 0;
    if (o.aro) {o.aro.position.set(x, 0.05, z); o.aro.visible = o.raiz.visible && !muerto; if (v.k === 'h') o.aro.rotation.y += dt * 0.6;}
    /* barra de vida */
    let b = BARRAS.get(v.id);
    if (!b) {b = document.createElement('div'); b.className = 'bv ' + {h: 'h', s: 'm', t: 't', n: 't', j: NEUTRO[v.tipo] && NEUTRO[v.tipo].grande ? 't' : 'm'}[v.k] + ' e' + (v.eq === 2 ? 2 : v.eq === MI_EQ ? 0 : 1); b.innerHTML = (v.k === 'h' ? '<b></b>' : '') + '<i><u></u></i>'; $('barras').appendChild(b); BARRAS.set(v.id, b);}
    const altoB = v.k === 'h' ? 2.6 : v.k === 's' ? 2 : v.k === 'j' ? NEUTRO[v.tipo].alto + 0.6 : v.k === 't' ? 8 : 8.4;
    _p.set(x, altoB, z).project(camera);
    const vis = o.raiz.visible && !muerto && v.vida > 0 && _p.z < 1 && Math.abs(_p.x) < 1.2 && Math.abs(_p.y) < 1.2 && (v.k !== 'j' || v.vida < v.max || NEUTRO[v.tipo].grande);
    b.style.display = vis ? 'flex' : 'none'; if (v.k === 't' || v.k === 'n') {b.classList.toggle('prot', String(v.hk).includes('P')); b.classList.toggle('inh', String(v.hk).includes('I'));}
    if (vis) {b.style.left = ((_p.x + 1) / 2 * VW) + 'px'; b.style.top = ((1 - _p.y) / 2 * VH) + 'px'; b.querySelector('u').style.width = Math.max(0, v.vida / v.max * 100) + '%'; if (v.k === 'h' && b.dataset.max !== String(v.max)) {b.dataset.max = v.max; b.querySelector('i').style.setProperty('--seg', (100 / v.max * 100) + '%');} if (v.k === 'h') b.querySelector('b').innerHTML = '<em>' + v.nivel + '</em>' + (v.nombre || '');}
  }
  /* proyectiles y efectos */
  for (let i = FXP.length - 1; i >= 0; i--) {
    const p = FXP[i]; p.t += dt;
    if (p.tipo === 'proy') {const d = VISTA.get(p.d); const tx = d ? (d.xi ?? d.x) : p.tx, tz = d ? (d.zi ?? d.z) : p.tz; p.tx = tx; p.tz = tz; const dx = tx - p.x, dz = tz - p.z, l = Math.hypot(dx, dz); if (l < 0.5 || p.t > 2) {scene.remove(p.o); FXP.splice(i, 1); continue;} p.x += dx / l * Math.min(l, p.v * dt); p.z += dz / l * Math.min(l, p.v * dt); p.o.position.set(p.x, p.y, p.z); p.o.rotation.y = Math.atan2(dx, dz);}
    else if (p.tipo === 'cae') {p.y -= dt * 26; p.o.position.set(p.x, p.y, p.z); if (p.y <= 0.2) {scene.remove(p.o); FXP.splice(i, 1); flip('impacto', p.x, p.z, 0.9);}}
    else if (p.tipo === 'tiro') {const k = Math.min(1, p.t / p.dur); p.o.position.set(p.x + (p.tx - p.x) * k, 1.2, p.z + (p.tz - p.z) * k); if (k >= 1) {scene.remove(p.o); FXP.splice(i, 1);}}
    else {const k = p.t / p.dur; if (k >= 1) {fuera(p.o); FXP.splice(i, 1); continue;} if (p.flip) {const f = Math.min(p.flip.n - 1, Math.floor(k * p.flip.n)); p.o.material.map.offset.set((f % p.flip.c) / p.flip.c, 1 - (Math.floor(f / p.flip.c) + 1) / p.flip.r);} if (p.crece) p.o.scale.setScalar(p.esc * (0.6 + 0.6 * k)); if (p.o.material) p.o.material.opacity = (p.op || 1) * (1 - k * k);}
  }
  for (let i = NUMS.length - 1; i >= 0; i--) {
    const n = NUMS[i]; n.t += dt; if (n.t > 0.8) {n.el.remove(); NUMS.splice(i, 1); continue;}
    _p.set(n.x, 2.2 + n.t * 1.6, n.z).project(camera); n.el.style.left = ((_p.x + 1) / 2 * VW) + 'px'; n.el.style.top = ((1 - _p.y) / 2 * VH) + 'px'; n.el.style.opacity = 1 - Math.max(0, n.t - 0.5) / 0.3;
  }
}
/* un enemigo en la hierba se ve si uno de mi equipo está a su lado o en la misma mata */
function veoHierba(v) {for (const q of VISTA.values()) if (q.k === 'h' && q.eq === MI_EQ && q.muerto < 0 && (Math.hypot((q.xi ?? q.x) - v.x, (q.zi ?? q.z) - v.z) < 3.2 || (q.hierba >= 0 && q.hierba === v.hierba))) return true; return false;}
/* efectos que llegan como avisos de la simulación (se ven igual en todos los móviles) */
const FXP = [], NUMS = [];
const FB = {impacto: ['texturas/fx_impacto.webp', 2, 2], onda: ['texturas/fx_onda.webp', 4, 1], explosion: ['texturas/fx_explosion.webp', 4, 4], tajo: ['texturas/fx_tajo.webp', 4, 1], polvo: ['texturas/fx_humo.webp', 4, 2], fuego: ['texturas/fx_fuego.webp', 4, 2], tajoOro: ['texturas/fx_tajo_oro.webp', 4, 1], tajoFuego: ['texturas/fx_tajo_fuego.webp', 4, 1],
  /* Pack Vado 5 (ChatGPT): 4x4 fotogramas; 'n' = mezcla normal (humo, polvo, piedra) */
  tArco: ['../batalla/fx/tajo_arco.webp', 4, 4], tFuego: ['../batalla/fx/tajo_fuego.webp', 4, 4], ondaC: ['../batalla/fx/onda_choque.webp', 4, 4], grietas: ['../batalla/fx/grietas.webp', 4, 4], polvoA: ['../batalla/fx/polvo.webp', 4, 4, 'n'], escudo: ['../batalla/fx/escudo.webp', 4, 4], piedra: ['../batalla/fx/piedra.webp', 4, 4, 'n'], hojas: ['../batalla/fx/hojas.webp', 4, 4, 'n'], humo: ['../batalla/fx/humo.webp', 4, 4, 'n'], suerte: ['../batalla/fx/suerte.webp', 4, 4], estrellas: ['../batalla/fx/estrellas.webp', 4, 4], estelaF: ['../batalla/fx/estela_flecha.webp', 4, 4]};
const FB_TINTE = {polvoA: '#a88c6c', humo: '#a0a0a0', piedra: '#d0c8be'};
const FB_OP = {ondaC: 0.6, polvoA: 0.75, grietas: 1.2, tFuego: 1.1, hojas: 0.9, humo: 0.85};
const FB_DUR = {tArco: 0.5, tFuego: 0.6, ondaC: 0.7, grietas: 1.2, polvoA: 0.85, humo: 0.9, hojas: 0.9, estelaF: 0.4, suerte: 1, escudo: 0.9, piedra: 0.9, estrellas: 0.9};
const fbTex = {};
for (const n in FB) if (!fbTex[FB[n][0]]) fbTex[FB[n][0]] = cargaTex(FB[n][0]); /* cargadas de antemano: que el primer efecto no salga en blanco */
/* los efectos de hoja se reciclan: cada uno tiene su copia de la textura (para su fotograma) pero comparte la imagen en la tarjeta gráfica.
   Antes cada golpe volvía a subir la hoja entera a la GPU (needsUpdate) y creaba geometría nueva: eso calaba el juego en las peleas. */
const FB_POOL = {}, GEO_SUELO = (() => {const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g;})();
function fbObjeto(nombre, suelo, mezN) {
  const key = nombre + (suelo ? 's' : 'a') + (mezN ? 'n' : ''), pool = FB_POOL[key] || (FB_POOL[key] = []);
  const [f, c, r, mez] = FB[nombre]; const base = fbTex[f] || (fbTex[f] = cargaTex(f));
  let o = pool.pop();
  if (!o) {
    const sv = base.source.version, t = base.clone(); base.source.version = sv; t.repeat.set(1 / c, 1 / r); /* clone() marca la imagen como cambiada y la volvería a subir: se deja como estaba */
    const mat = new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, blending: mezN || mez === 'n' ? THREE.NormalBlending : THREE.AdditiveBlending});
    o = suelo ? new THREE.Mesh(GEO_SUELO, mat) : new THREE.Sprite(mat); o.userData.pool = key; o.userData.base = base;
  }
  const t = o.material.map; if (t.version !== base.version) t.version = base.version; /* misma imagen ya subida: no se vuelve a subir */
  o.material.color.set(FB_TINTE[nombre] || '#ffffff'); o.material.opacity = 1; o.rotation.set(0, 0, 0); o.renderOrder = suelo ? 3 : 0; o.visible = true;
  return o;
}
/* quitar un efecto: los reciclables vuelven a su montón; los de un solo uso sueltan su geometría y material */
function fuera(o) {
  scene.remove(o);
  if (o.userData.pool) {FB_POOL[o.userData.pool].push(o); return;}
  if (o.userData.tira) {o.geometry.dispose(); o.material.dispose();}
}
function flip(nombre, x, z, tam, suelo, rot, y, dur) {
  if (FB_DUR[nombre]) tam *= 1.3; /* las hojas del Pack 5 llevan margen en cada fotograma */
  const [, c, r] = FB[nombre], o = fbObjeto(nombre, suelo, nombre === 'polvo');
  o.scale.setScalar(tam);
  if (suelo) {o.position.set(x, y ?? 0.12, z); if (rot !== undefined) o.rotation.y = rot;} else o.position.set(x, y ?? 1.3, z);
  o.material.map.offset.set(0, 1 - 1 / r);
  scene.add(o); FXP.push({o, t: 0, dur: dur || FB_DUR[nombre] || (nombre === 'onda' ? 0.65 : nombre.startsWith('tajo') ? 0.5 : 0.55), flip: {c, r, n: c * r}, esc: tam, op: FB_OP[nombre] || 1});
  if (FXP.length > 140) {const v = FXP.findIndex((p) => p.flip); if (v >= 0) {fuera(FXP[v].o); FXP.splice(v, 1);}} /* tope: en una pelea gorda no se acumulan sin fin */
  return o;
}
/* sonido con WebAudio: cada archivo se descodifica una vez y se reproduce sin crear reproductores nuevos */
let AC = null; const SON = {}, SON_T = {};
/* el anunciador (voz «Gala» de ElevenLabs, cortada en voces/): las frases se ponen en cola para no pisarse */
const VOCES = ['primera', 'doble', 'triple', 'racha', 'imparable', 'leyenda', 'cortada', 'aniquilacion', 'torre_enemiga', 'torre_nuestra', 'uruk_despierta', 'uruk_muerto', 'hordas', 'victoria', 'derrota'];
let vozLibre = 0;
function precargaVoces() {try {if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); for (const n of VOCES) {const f = 'voces/' + n + '.mp3'; if (!SON[f]) {SON[f] = 'cargando'; fetch(f).then((r) => r.arrayBuffer()).then((b) => AC.decodeAudioData(b)).then((buf) => {SON[f] = buf;}).catch(() => {SON[f] = null;});}}} catch (e) {}}
function voz(n) {
  try {
    const buf = SON['voces/' + n + '.mp3']; if (!AC || !(buf instanceof AudioBuffer)) return;
    if (AC.state === 'suspended') AC.resume();
    const t = Math.max(AC.currentTime, vozLibre); if (t - AC.currentTime > 3) return;
    const src = AC.createBufferSource(), g = AC.createGain(); g.gain.value = 0.95; src.buffer = buf; src.connect(g).connect(AC.destination); src.start(t); vozLibre = t + buf.duration + 0.15;
  } catch (e) {}
}
function vozDeTexto(txt, mio) {
  if (!txt) return;
  const t = {'¡Primera sangre!': 'primera', '¡Doble derribo!': 'doble', '¡Triple derribo!': 'triple', '¡Cuádruple derribo!': 'triple', '¡En racha!': 'racha', '¡Imparable!': 'imparable', '¡Leyenda de la Marca!': 'leyenda', '¡Racha cortada!': 'cortada', '¡Aniquilación!': 'aniquilacion'}[txt];
  if (t) voz(t); else if (/Torre de/.test(txt)) voz(mio ? 'torre_nuestra' : 'torre_enemiga'); else if (/Uruk Azul/.test(txt)) voz('uruk_muerto');
}
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
function numero(x, z, txt, cls) {if (cls === 'v') cls = 'cur'; if (NUMS.length > 24) {NUMS[0].el.remove(); NUMS.shift();}const el = document.createElement('div'); el.className = 'num ' + (cls || ''); el.textContent = txt; $('barras').appendChild(el); NUMS.push({el, x: x + rnd(-0.3, 0.3), z, t: 0});}
function efectoLocal(e) {
  const t = e[0];
  if (t === 'num') {if (e[4] === 'o' && e[5] !== YO) return; numero(e[1], e[2], e[3], e[4]); if (e[4] === 'o') suena('moneda', 0.3);}
  if (t === 'fx') {if (e[1] === 'onda') flip('onda', e[2], e[3], e[4], true); else flip(e[1], e[2], e[3], e[4], e[1] === 'tajo'); if (e[1] === 'explosion') suena('explosion', 0.6); if (e[1] === 'onda') suena('viento', 0.4);}
  if (t === 'proy') {const o = modeloProy(e[1]); o.scale.multiplyScalar(e[6] || 1); scene.add(o); FXP.push({tipo: 'proy', o, x: e[2], z: e[3], y: e[7] || 1.2, d: e[4], v: e[5], t: 0}); suena(e[1] === 'piedra' ? 'golpe' : 'arco', 0.25);}
  if (t === 'tiro') {const o = modeloProy(e[1]); o.scale.multiplyScalar(1.6); o.rotation.y = Math.atan2(e[4] - e[2], e[5] - e[3]); scene.add(o); FXP.push({tipo: 'tiro', o, x: e[2], z: e[3], tx: e[4], tz: e[5], dur: Math.hypot(e[4] - e[2], e[5] - e[3]) / e[6], t: 0}); suena('arco', 0.5);}
  if (t === 'zona') {const a = aro('#ffd9a0', e[3]); a.userData.tira = 1; a.position.set(e[1], 0.08, e[2]); scene.add(a); FXP.push({o: a, t: 0, dur: e[4], op: 0.9}); for (let i = 0; i < 8; i++) setTimeout(() => flip('impacto', e[1] + rnd(-e[3], e[3]) * 0.7, e[2] + rnd(-e[3], e[3]) * 0.7, 1.2), i * 350); suena('arco', 0.5);}
  if (t === 'muere') suena('muerte', 0.35);
  if (t === 'son') suena(e[1], 0.5);
  if (t === 'g') golpeVisual(e[1], e[2], e[3]);
  if (t === 'hb') habVisual(e);
  if (t === 'planta') {const [, tp, x, z] = e; if (tp === 'seta') {flip('humo', x, z, 6, false, undefined, 1.2); flip('ondaC', x, z, 7, true); flip('explosion', x, z, 3); suena('explosion', 0.6); if (Math.hypot(x - camM.x, z - camM.z) < 16) tiemblaCam = Math.max(tiemblaCam, 0.5);} if (tp === 'baya') {flip('hojas', x, z, 3, true); suena('magia', 0.4);} if (tp === 'flor') {flip('ondaC', x, z, 22, true, 0, 0.13, 1.4); flip('suerte', x, z, 3); suena('magia', 0.5);}}
  if (t === 'castigo') {const [, x, z] = e; flip('ondaC', x, z, 4, true); flip('explosion', x, z, 2.6); flip('impacto', x, z, 2.2); suena('explosion', 0.5); if (Math.hypot(x - camM.x, z - camM.z) < 16) tiemblaCam = Math.max(tiemblaCam, 0.35);}
  if (t === 'enc') {const o = VIS.get(e[1]), v = VISTA.get(e[1]); if (o && v) {const x = v.xi ?? v.x, z = v.zi ?? v.z;
    if (e[2] === 'estasis') {auraFx(o, 'suerte', 2.5, 2.4, 1.3); auraFx(o, 'escudo', 2.5, 3.2); flip('ondaC', x, z, 4, true); o.oro = 2.5;}
    if (e[2] === 'gargola') {auraFx(o, 'piedra', 4, 3.6); flip('polvoA', x, z, 3.6, true); o.punch = 1.3;}
    if (e[2] === 'azogue') {flip('ondaC', x, z, 3.4, true); flip('humo', x, z, 3); o.estela = {t: 1.5, cada: 0, fx: 'polvo', tam: 1.3};}
    if (e[2] === 'medallon') auraFx(o, 'escudo', 2.5, 3.4);
    if (e[1] === YO || e[1] === MIO.id) aviso('✨ ' + ENC[e[2]].t);}}
  if (t === 'ping' && e[1] === MI_EQ) {const q = VISTA.get(e[2]), txt = {ataca: '⚔ ¡Atacad!', retira: '🛡 ¡Retirada!', voy: '🏃 ¡Voy!', cuidado: '⚠ ¡Cuidado!'}[e[3]]; aviso((q && q.id !== YO ? q.nombre + ': ' : '') + txt); PINGS.push({x: e[4], z: e[5], t: performance.now(), k: e[3]}); flip('onda', e[4], e[5], 4, true); suena('cuerno', 0.25);}
  if (t === 'voz') voz(e[1]);
  if (t === 'tp' && e[1] === YO && !S) {MIO.x = e[2]; MIO.z = e[3]; MIO.dash = null;}
  if (t === 'baja') anuncio(e[1], e[2], e[3]);
  if (t === 'aviso' && (e[1] === 0 || e[1] === YO)) aviso(e[2]);
  if (t === 'fin') acaba(e[1]);
  if (t === 'voto' && e[1] === MI_EQ) pintaVoto(e);
  if (t === 'votoFin' && e[1] === MI_EQ) {$('voto').classList.add('hidden'); aviso('No ha salido la rendición');}
}
let avisoT = 0;
/* cartel de baja al estilo Wild Rift: retrato del que derriba ⚔ retrato del derribado, y el grito si lo hay */
let anuncioT = 0;
function retratoDe(id) {const q = VISTA.get(id); if (!q) return ''; if (q.k === 'h') return '../abismo/ui/' + HEROES[q.tipo].retrato + '.webp'; return q.eq === 0 ? 'ui/b_armeria.webp' : 'ui/buff_troll.webp';}
let ULTIMA_BAJA = 0;
function anuncio(a, d, txt) {
  if (d === YO) ULTIMA_BAJA = a || 0;
  const el = $('anuncio'), va = VISTA.get(a), vd = VISTA.get(d); if (!vd) return;
  const mio = (q) => q && q.eq === MI_EQ;
  if (vd.k === 't') {el.innerHTML = '<div class="anT ' + (mio(vd) ? 'malo' : 'bueno') + '">' + txt + '</div>';}
  else el.innerHTML = '<div class="anF"><img class="' + (mio(va) ? 'az' : 'ro') + '" src="' + (va ? retratoDe(a) : '../abismo/iconos/torre.webp') + '" alt=""><b>⚔</b><img class="' + (mio(vd) ? 'az' : 'ro') + ' muerto" src="' + retratoDe(d) + '" alt=""></div>' + (txt ? '<div class="anT ' + (mio(va) ? 'bueno' : 'malo') + '">' + txt + '</div>' : '');
  el.classList.remove('hidden'); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(anuncioT); anuncioT = setTimeout(() => el.classList.add('hidden'), 2600);
  if (txt) {suena('cuerno', 0.3); vozDeTexto(txt, vd.k === 't' && mio(vd));}
}
/* panel de ajustes y votación */
function votaMio(si) {if (S) rinde(S.u.find((q) => q.id === YO), si); else NET.manda({t: 'rinde', si});}
function abreAjustes() {
  const t = +($('marcador').dataset.t || 0), a = $('ajustes'), falta = Math.ceil(RINDE_T - t);
  a.innerHTML = '<div class="ajC"><b>Partida</b><button class="bt" id="ajSeguir">Seguir jugando</button><button class="bt s" id="ajRinde"' + (falta > 0 ? ' disabled' : '') + '>🏳 Rendirse' + (falta > 0 ? ' (en ' + Math.floor(falta / 60) + ':' + String(falta % 60).padStart(2, '0') + ')' : '') + '</button>' +
    '<p>' + (MODO === '2v2' ? 'Hasta el minuto 9 hace falta que votéis sí los dos.' : 'Te rindes y gana el rival.') + '</p></div>';
  a.classList.remove('hidden');
  $('ajSeguir').onclick = () => a.classList.add('hidden');
  $('ajRinde').onclick = () => {a.classList.add('hidden'); votaMio(true);};
}
function pintaVoto(e) {
  const [, , quien, si, no, need, n, quedan] = e, v = $('voto'), yaVote = quien === YO || v.dataset.vote === '1';
  if (quien === YO) v.dataset.vote = '1';
  const cajas = Array.from({length: n}, (_, i) => '<i class="' + (i < si ? 'si' : i < si + no ? 'no' : '') + '"></i>').join('');
  v.innerHTML = '<b>🏳 ¿Rendirse?</b><div class="vC">' + cajas + '</div><small>Hacen falta ' + need + ' de ' + n + '</small>' + (yaVote ? '' : '<div class="vB"><button class="bt" id="vSi">Sí</button><button class="bt s" id="vNo">No</button></div>');
  v.classList.remove('hidden'); clearTimeout(v._t); v._t = setTimeout(() => {v.classList.add('hidden'); v.dataset.vote = '';}, (quedan + 1) * 1000);
  if (!yaVote) {$('vSi').onclick = () => {v.dataset.vote = '1'; votaMio(true);}; $('vNo').onclick = () => {v.dataset.vote = '1'; votaMio(false);};}
}
function aviso(txt) {const a = $('aviso'); a.textContent = txt; a.style.opacity = 1; clearTimeout(avisoT); avisoT = setTimeout(() => {a.style.opacity = 0;}, 2200);}

/* ---------- cámara ---------- */
const camM = new THREE.Vector3();
/* se juega en horizontal: «adelante» (hacia el enemigo) es la derecha de la pantalla. En vertical, hacia arriba.
   F = hacia dónde mira la cámara (arriba en pantalla), R = la derecha de la pantalla, en coordenadas del mundo. */
let APAI = VW > VH;
function ejes() {const s = signo(MI_EQ); return APAI ? {F: {x: -s, z: 0}, R: {x: 0, z: -s}} : {F: {x: 0, z: -s}, R: {x: s, z: 0}};}
const ZOOMS = [[24, 14], [31, 18], [40, 23]]; let zoomI = +(localStorage.getItem('vado.zoom') ?? 1);
function camara(dt) {
  const v = VISTA.get(YO); if (!v) return;
  const {F} = ejes(), x = v.xi ?? v.x, z = v.zi ?? v.z, ade = APAI ? 5 : 3;
  camM.x += (x + F.x * ade - camM.x) * Math.min(1, dt * 6); camM.z += (z + F.z * ade - camM.z) * Math.min(1, dt * 6);
  camGolpe = Math.max(0, camGolpe - dt * 1.5); const zg = 1 - 0.16 * Math.sin(Math.min(1, camGolpe) * Math.PI), z0 = ZOOMS[zoomI], zz = [z0[0] * zg, z0[1] * zg]; tiemblaCam = Math.max(0, tiemblaCam - dt * 1.6); const tb = tiemblaCam * tiemblaCam * 1.6, ox = (Math.random() - 0.5) * tb, oz = (Math.random() - 0.5) * tb;
  camera.position.set(camM.x - F.x * zz[1] + ox, zz[0], camM.z - F.z * zz[1] + oz); camera.lookAt(camM.x + ox, 0, camM.z + oz);
  luces(); sol.position.set(camM.x + 10, 40, camM.z + 8); sol.target.position.set(camM.x, 0, camM.z);
}

/* ---------- mandos ---------- */
const MANDO = {mx: 0, mz: 0, ataca: false, modo: '', modoHasta: 0, fijo: 0};
/* botón de torre (encima del ataque) y de súbditos (debajo), como en el Wild Rift: mientras los pulsas, solo atacas eso */
const modoAtaque = () => (MANDO.modoPuls || performance.now() < MANDO.modoHasta) ? MANDO.modo : '';
let aroFijo = null;
function puntoPantalla(q) {_p.set(q.xi ?? q.x, 1, q.zi ?? q.z).project(camera); return {x: (_p.x + 1) / 2 * VW, y: (1 - _p.y) / 2 * VH, ok: _p.z < 1};}
/* arrastrar el botón de ataque hacia un enemigo lo fija (Wild Rift): el más cercano a la dirección del arrastre, a menos de 14 m */
function candidatoFijo(dx, dy) {
  const v = VISTA.get(YO); if (!v) return null; const {F, R} = ejes(), wx = dx * R.x - dy * F.x, wz = dx * R.z - dy * F.z, l = Math.hypot(wx, wz) || 1;
  let mejor = null, mv = -1;
  for (const q of VISTA.values()) {
    if (q.eq === MI_EQ || q.vida <= 0 || (q.k === 'h' && (q.muerto >= 0 || q.escondido)) || ((q.k === 's' || q.k === 'j') && q.muerto === 0)) continue;
    const ex = q.x - v.x, ez = q.z - v.z, d = Math.hypot(ex, ez); if (d > 14 || d < 0.1) continue;
    const c = (ex * wx + ez * wz) / (d * l); if (c < 0.8) continue;
    const val = c * 2 - d / 14 + (q.k === 'h' ? 0.4 : 0); if (val > mv) {mv = val; mejor = q;}
  }
  return mejor;
}
function fija(id) {MANDO.fijo = id; MANDO.fijoT = performance.now(); if (id) suena('golpe', 0.2);}
const joy = {id: null, x0: 0, y0: 0};
function preparaMandos() {
  const toca = (el, fn) => {el.addEventListener('pointerdown', (e) => {e.preventDefault(); e.stopPropagation(); fn(e);}); el.addEventListener('click', (e) => e.preventDefault());};
  const J = $('joy'), bola = J.querySelector('b'), dedo = bola.querySelector('i');
  J.addEventListener('pointerdown', (e) => {joy.id = e.pointerId; joy.x0 = PX(e); joy.y0 = PY(e); bola.style.display = 'block'; bola.style.left = PX(e) + 'px'; bola.style.top = (PY(e) - topC(J)) + 'px'; J.setPointerCapture(e.pointerId);});
  J.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joy.id) return; let dx = (PX(e) - joy.x0) / 50, dy = (PY(e) - joy.y0) / 50; const l = Math.hypot(dx, dy); if (l > 1) {dx /= l; dy /= l;}
    dedo.style.transform = 'translate(' + dx * 35 + 'px,' + dy * 35 + 'px)'; const {F, R} = ejes(); MANDO.mx = dx * R.x - dy * F.x; MANDO.mz = dx * R.z - dy * F.z;
  });
  const suelta = (e) => {if (e.pointerId !== joy.id) return; joy.id = null; bola.style.display = 'none'; dedo.style.transform = ''; MANDO.mx = 0; MANDO.mz = 0;};
  J.addEventListener('pointerup', suelta); J.addEventListener('pointercancel', suelta);
  const at = $('bAt'); let atP = null, cand = null;
  at.addEventListener('pointerdown', (e) => {MANDO.golpes = (MANDO.golpes || 0) + 1; MANDO.ataca = true; MANDO.hasta = performance.now() + 350; atP = {x: PX(e), y: PY(e), id: e.pointerId}; cand = null; at.setPointerCapture(e.pointerId); at.classList.add('pulsado');});
  at.addEventListener('pointermove', (e) => {if (!atP || e.pointerId !== atP.id) return; const dx = PX(e) - atP.x, dy = PY(e) - atP.y; if (Math.hypot(dx, dy) > 24) {cand = candidatoFijo(dx, dy); MANDO.cand = cand ? cand.id : 0;}});
  for (const t of ['pointerup', 'pointercancel']) at.addEventListener(t, () => {if (cand) {fija(cand.id); MANDO.hasta = performance.now() + 700;} atP = null; cand = null; MANDO.cand = 0; MANDO.ataca = false; MANDO.hasta = Math.max(MANDO.hasta || 0, performance.now() + 120); at.classList.remove('pulsado');});
  for (const [id, modo] of [['bAtT', 't'], ['bAtS', 's']]) {
    const b = $(id);
    b.addEventListener('pointerdown', (e) => {e.preventDefault(); e.stopPropagation(); MANDO.modo = modo; MANDO.modoPuls = true; MANDO.fijo = 0; MANDO.ataca = true; MANDO.hasta = performance.now() + 350; b.setPointerCapture(e.pointerId); b.classList.add('pulsado');});
    for (const t of ['pointerup', 'pointercancel']) b.addEventListener(t, () => {MANDO.modoPuls = false; MANDO.modoHasta = performance.now() + 350; MANDO.ataca = false; MANDO.hasta = Math.max(MANDO.hasta || 0, performance.now() + 120); b.classList.remove('pulsado');});
  }
  /* retratos de los héroes enemigos cercanos junto al ataque: tocar uno lo fija (y otra vez, lo suelta) */
  $('retratos').addEventListener('pointerdown', (e) => {const b = e.target.closest('[data-id]'); if (!b) return; e.preventDefault(); e.stopPropagation(); const id = +b.dataset.id; fija(MANDO.fijo === id ? 0 : id); if (MANDO.fijo) {MANDO.hasta = performance.now() + 700;}});
  toca($('bEnc'), () => {
    const v = VISTA.get(YO); if (!v || v.muerto >= 0 || !v.enc || v.cdEnc > 0) return;
    if (S) usaEnc(S.u.find((q) => q.id === YO)); else NET.manda({t: 'enc'});
  });
  for (const k of ['q', 'w', 'e', 'r']) {
    const b = $('b' + k.toUpperCase()); let p0 = null, apunta = null;
    b.addEventListener('pointerdown', (e) => {p0 = {x: PX(e), y: PY(e), id: e.pointerId}; b.setPointerCapture(e.pointerId);});
    b.addEventListener('pointermove', (e) => {if (!p0 || e.pointerId !== p0.id) return; const dx = PX(e) - p0.x, dy = PY(e) - p0.y; if (Math.hypot(dx, dy) > 18) {apunta = {dx, dy}; muestraMira(k, dx, dy);}});
    b.addEventListener('pointerup', (e) => {if (!p0) return; const a = apunta; p0 = null; apunta = null; ocultaMira(); lanzaMia(k, a);});
    b.addEventListener('pointercancel', () => {p0 = null; apunta = null; ocultaMira();});
  }
  toca($('bTienda'), abreTienda);
  toca($('bAjustes'), abreAjustes);
  for (const k of ['q', 'w', 'e', 'r']) toca($('m' + k), () => subeMia(k));
  for (const k of ['d', 'f']) toca($('b' + k.toUpperCase()), () => {
    const v = VISTA.get(YO); if (!v || v.muerto >= 0 || (k === 'd' ? v.cdD : v.cdF) > 0) return;
    const dx = MANDO.mx || Math.sin(v.rot || 0), dz = MANDO.mz || Math.cos(v.rot || 0);
    if (S) usaHechizo(S.u.find((q) => q.id === YO), k, dx, dz);
    else {NET.manda({t: 'hech', k, dx, dz, x: MIO.x, z: MIO.z}); if (k === 'd') {const l = Math.hypot(dx, dz) || 1; MIO.x += dx / l * 4.5; MIO.z += dz / l * 4.5; MIO.px = undefined; limita(MIO);}}
  });
  for (const b of document.querySelectorAll('#pings button[data-p]')) toca(b, () => {$('pings').classList.remove('abierto'); const v = VISTA.get(YO); if (!v) return; const k = b.dataset.p; if (S) {S.ev.push(['ping', MI_EQ, YO, k, v.x, v.z]); efectoLocal(['ping', MI_EQ, YO, k, v.x, v.z]);} else NET.manda({t: 'ping', k, x: v.x, z: v.z});});
  toca($('bPing'), () => $('pings').classList.toggle('abierto'));
  toca($('compraRapida'), () => {const id = $('compraRapida').dataset.id; if (id) compraMia(id);});
  $('marcador').onclick = () => {$('tabla').classList.toggle('hidden'); pintaTabla();};
  $('tabla').onclick = () => $('tabla').classList.add('hidden');
  toca($('bZoom'), () => {zoomI = (zoomI + 1) % ZOOMS.length; localStorage.setItem('vado.zoom', zoomI);});
  toca($('bBase'), () => {const v = VISTA.get(YO); if (!v || v.muerto >= 0) return; volverBase = VOLVER_T; volverVida = v.vida; suena('magia', 0.35);});
}
/* subir de rango una habilidad (el + verde, o tocar la propia habilidad si aún no la tienes) */
function subeMia(k) {
  const v = VISTA.get(YO), i = 'qwer'.indexOf(k); if (!v || !(v.pts > 0) || (v.rk ? v.rk[i] : 0) >= rangoMax(v.nivel, k)) return false;
  if (S) subeHab(S.u.find((q) => q.id === YO), k); else NET.manda({t: 'sube', k});
  suena('nivel', 0.4); const b = $('b' + k.toUpperCase()); b.classList.remove('subida'); void b.offsetWidth; b.classList.add('subida'); return true;
}
let volverBase = 0, volverVida = 0, circVuelta = null; const VOLVER_T = 4.5;
let mira = null;
/* miras en el suelo con los indicadores de ChatGPT (blancos, se tiñen): alcance alrededor del héroe + flecha, cono o círculo */
const IND = {};
function indicador(n, color) {
  if (!IND[n]) {const t = cargaTex('../batalla/ui/' + n + '.webp'); IND[n] = t;}
  const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2);
  if (n === 'ind_cono') g.translate(0, 0, -(418 - 256) / 512);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({map: IND[n], color, transparent: true, depthWrite: false, opacity: 1, blending: THREE.AdditiveBlending}));
  m.renderOrder = 4; m.visible = false; scene.add(m); return m;
}
function muestraMira(k, dx, dy) {
  const v = VISTA.get(YO); if (!v) return; const H = HEROES[v.tipo].hab[k], {F, R} = ejes(), l = Math.hypot(dx, dy), wx = (dx * R.x - dy * F.x) / l, wz = (dx * R.z - dy * F.z) / l, alc = H.alc || H.dist || H.radio || 4;
  if (!mira) mira = {alc: indicador('ind_alcance', '#ffffff'), area: indicador('ind_area', '#ffe9a8'), flecha: indicador('ind_flecha', '#ffe9a8'), cono: indicador('ind_cono', '#ffe9a8')};
  const x = v.xi ?? v.x, z = v.zi ?? v.z, k2 = Math.min(1, l / 90);
  for (const n of ['area', 'flecha', 'cono']) mira[n].visible = false;
  mira.alc.visible = true; mira.alc.position.set(x, 0.09, z); mira.alc.scale.setScalar(2 * (H.tipo === 'area' ? H.radio : alc) * 256 / 235);
  if (H.tipo === 'zona' || H.tipo === 'salto') {const a = mira.area; a.visible = true; a.scale.setScalar(2 * H.radio * 256 / 231); a.position.set(x + wx * alc * k2, 0.11, z + wz * alc * k2);}
  else if (H.tipo === 'area') {const a = mira.area; a.visible = true; a.scale.setScalar(2 * H.radio * 256 / 231); a.position.set(x, 0.11, z);}
  else if (H.tipo === 'cono') {const c = mira.cono, tam = H.alc * 512 / 325; c.visible = true; c.scale.set(tam * Math.min(1.2, H.ang / (Math.PI / 2)), 1, tam); c.position.set(x, 0.11, z); c.rotation.y = Math.atan2(-wx, -wz);}
  else {const f = mira.flecha; f.visible = true; f.scale.set(alc, 1, (H.ancho ? H.ancho * 2 : 1.4) * 2); f.position.set(x + wx * alc / 2, 0.11, z + wz * alc / 2); f.rotation.y = Math.atan2(-wz, wx);}
  mira.dir = {wx, wz, px: x + wx * alc * k2, pz: z + wz * alc * k2};
}
function ocultaMira() {if (mira) for (const n of ['alc', 'area', 'flecha', 'cono']) mira[n].visible = false;}
function lanzaMia(k, apunta) {
  const v = VISTA.get(YO); if (!v || v.muerto >= 0) return;
  const i = 'qwer'.indexOf(k); if (v.cds && v.cds[i] > 0) return; if (!(v.rk && v.rk[i] > 0)) {if (subeMia(k)) return; aviso(v.pts > 0 ? 'Pulsa el + de encima para aprender esta habilidad' : k === 'r' ? 'La definitiva se aprende a nivel 4' : 'Aún no la has aprendido: sube de nivel'); return;}
  const H = HEROES[v.tipo].hab[k], x = v.xi ?? v.x, z = v.zi ?? v.z; let dx, dz, px, pz;
  if (apunta && mira && mira.dir) {dx = mira.dir.wx; dz = mira.dir.wz; px = mira.dir.px; pz = mira.dir.pz;}
  else {/* toque: apunta solo al héroe enemigo más cercano (o a lo que tengas delante) */
    let mejor = null, md = (H.alc || H.dist || 6) + 4; for (const q of VISTA.values()) if (q.eq !== MI_EQ && (q.k === 'h' ? q.muerto < 0 && !q.escondido : (q.k === 's' || q.k === 'j') && q.muerto !== 0)) {const d0 = Math.hypot(q.x - x, q.z - z) - (q.k === 'h' ? 0 : 3); if (d0 < md) {md = d0; mejor = q;}}
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
const atacando = () => MANDO.ataca || performance.now() < (MANDO.hasta || 0);
/* con el ataque pulsado y sin mover el joystick: si no hay nadie a tiro, camina hacia el enemigo más cercano (hasta 5 m más allá de su alcance) */
const RADIO_V = {h: 0.6, s: 0.5, t: 1.6, n: 2};
function acercaAtaque(px, pz) {
  const v = VISTA.get(YO); if (!v || v.muerto >= 0 || !atacando() || MANDO.mx || MANDO.mz) return null;
  const alc = HEROES[v.tipo].alcance + 0.5, modo = modoAtaque(), fj = MANDO.fijo && VISTA.get(MANDO.fijo); let mejor = null, md = 1e9, enAlcance = false;
  if (fj && fj.vida > 0 && !(fj.k === 'h' && (fj.muerto >= 0 || fj.escondido))) {const d = Math.hypot(fj.x - px, fj.z - pz) - (RADIO_V[fj.k] || 0.6); return d <= alc || d > 16 ? null : {x: fj.x - px, z: fj.z - pz};}
  for (const q of VISTA.values()) {
    if (q.eq === MI_EQ || q.vida <= 0) continue;
    if (modo === 't' ? !(q.k === 't' || q.k === 'n') : modo === 's' ? !(q.k === 's' || q.k === 'j') : false) continue;
    if (q.k === 'h' ? q.muerto >= 0 || q.escondido : q.k === 's' || q.k === 'j' ? q.muerto === 0 : false) continue;
    const r = q.k === 'j' ? (NEUTRO[q.tipo].jefe ? 1.5 : NEUTRO[q.tipo].grande ? 1.1 : 0.6) : RADIO_V[q.k] || 0.5;
    const d = Math.hypot(q.x - px, q.z - pz) - r; if (d <= alc) {enAlcance = true; break;}
    const peso = d + (!modo && (q.k === 't' || q.k === 'n') ? 3 : 0); if (d < alc + (modo ? 9 : 5) && peso < md) {md = peso; mejor = q;}
  }
  if (enAlcance || !mejor) return null;
  return {x: mejor.x - px, z: mejor.z - pz};
}
function mueveMio(dt) {
  const v = VISTA.get(YO); if (!v) return;
  if (v.flagsE & 1) {MIO.x = v.x; MIO.z = v.z; return;}
  if (!MIO.listo || v.muerto >= 0) {MIO.x = v.x; MIO.z = v.z; MIO.listo = v.muerto < 0; return;}
  const st = {vel: HEROES[v.tipo].vel * (v.inv.includes('botas') ? 1.12 : 1) * (v.inv.includes('capa') ? 1.18 : 1)};
  if (MIO.dash) {MIO.x += MIO.dash.vx * dt; MIO.z += MIO.dash.vz * dt; MIO.dash.t -= dt; if (MIO.dash.t <= 0) MIO.dash = null;}
  else {const ac = acercaAtaque(MIO.x, MIO.z), mx = ac ? ac.x : MANDO.mx, mz = ac ? ac.z : MANDO.mz; MIO.mueve = !!(mx || mz) && !(v.flags & 2); if (MIO.mueve) {const l = Math.hypot(mx, mz), k = ac ? 1 : Math.min(1, l); MIO.x += mx / l * st.vel * k * dt; MIO.z += mz / l * st.vel * k * dt; MIO.rot = Math.atan2(mx, mz);}}
  limita(MIO);
  /* si el anfitrión me ve muy lejos (me han empujado, he reaparecido), manda él */
  if (Math.hypot(v.x - MIO.x, v.z - MIO.z) > 6 && !MIO.dash) {MIO.x = v.x; MIO.z = v.z;}
  v.xi = MIO.x; v.zi = MIO.z; v.x = MIO.x; v.z = MIO.z; v.rot = MIO.mueve ? MIO.rot : v.rot; v.mueve = !!(MIO.mueve || MIO.dash);
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
    if (o.t === 'in') {if (!h.muerto && !h.dash && !(h.aturd > S.t)) {h.x = o.x; h.z = o.z; h.rot = o.rot; h.mueve = o.m;} h.ataca = o.a; h.prioHeroe = true; h.modoAt = o.mo || ''; h.fijo = o.fi || 0; if ((o.g || 0) > (h.gVisto || 0)) {h.gVisto = o.g; h.tap = S.t + 1.5;}}
    if (o.t === 'hab') {h.x = o.x; h.z = o.z; usaHab(h, o.k, o.dx, o.dz, o.px, o.pz);}
    if (o.t === 'compra') {const r = compra(h, o.id); if (r) S.ev.push(['aviso', h.id, r]);}
    if (o.t === 'sube') subeHab(h, o.k);
    if (o.t === 'rinde') rinde(h, !!o.si);
    if (o.t === 'enc') usaEnc(h);
    if (o.t === 'hech1') h.hf = o.v === 'c' ? 'c' : 'f';
    if (o.t === 'ping') {const e = ['ping', h.eq, h.id, o.k, o.x, o.z]; S.ev.push(e); efectoLocal(e);}
    if (o.t === 'hech') {h.x = o.x; h.z = o.z; usaHechizo(h, o.k, o.dx, o.dz);}
    if (o.t === 'volver') {if (!h.muerto) {const f = BASES[h.eq].fuente; h.x = f.x; h.z = f.z - signo(h.eq) * 2.5; h.px = undefined;}}
  }
  if (o.t === 'se_fue') {
    if (S) {const h = S.u.find((q) => q.k === 'h' && q.slot === o.slot); if (h) {h.bot = true; h.nombre += ' (bot)';} aviso(o.nombre + ' se ha ido: lo lleva la máquina');}
    else if (o.slot === NET.anf) {aviso('El anfitrión se ha ido'); setTimeout(() => acaba(-1), 1500);}
  }
}

/* ---------- partida ---------- */
let fotoT = 0, inT = 0, pingT = 0, reloj0 = 0;
let MODO = '1v1';
function empieza(jugadores, modo, simulo) {
  MODO = modo; if (ponMapa(modo)) construyeMapa();
  precargaVoces(); document.body.classList.add('jugando'); ESTADO = 'juego'; precargaVoces(); $('menu').classList.add('hidden'); ['hud', 'joy', 'mandos', 'bTienda', 'bBase', 'bZoom', 'bAjustes', 'mini', 'objetivo'].forEach((i) => $(i).classList.remove('hidden'));
  VISTA = new Map(); for (const id of [...VIS.keys()]) quitaVis(id);
  const yo = jugadores.find((j) => j.slot === NET.soy) || jugadores[0]; MI_EQ = yo.slot % 2;
  if (simulo) {nuevaPartida(jugadores, modo); const h = S.u.find((q) => q.k === 'h' && q.slot === yo.slot); h.local = true; YO = h.id; h.hf = hechElegido; recibeFoto(foto());}
  else {S = null; YO = null; const pide = setInterval(() => {const v = [...VISTA.values()].find((q) => q.k === 'h' && q.slot === yo.slot); if (v) {YO = v.id; MIO.listo = false; clearInterval(pide); iconosHab(v.tipo); NET.manda({t: 'hech1', v: hechElegido});}}, 100);}
  if (simulo) iconosHab(yo.heroe);
  $('yoImg').src = '../abismo/ui/' + HEROES[yo.heroe].retrato + '.webp';
  camM.set(BASES[MI_EQ].fuente.x, 0, BASES[MI_EQ].fuente.z); reloj0 = performance.now();
  pantallaVS(jugadores, modo);
  $('pings').classList.toggle('hidden', !(NET.online && modo === '2v2'));
  aviso('¡Al vado! Derriba las torres y el estandarte enemigo'); suena('cuerno', 0.7);
}
function pantallaVS(jugadores, modo) {
  /* calentar: durante el VS se dibuja una vez cada efecto bajo el suelo, así la textura sube y el sombreador se compila antes de la primera pelea */
  try {for (const n in FB) {flip(n, 0, 0, 0.01, false, 0, -40, 0.3); flip(n, 0, 0, 0.01, true, 0, -40, 0.3);}} catch (e) {}
  const plazas = modo === '2v2' ? 4 : 2, el = $('vs'), lado = (eq) => {let h = ''; for (let s = eq; s < plazas; s += 2) {const j = jugadores.find((q) => q.slot === s), tipo = j ? j.heroe : Object.keys(HEROES)[(s * 3 + 1) % 4]; h += '<div class="vsH"><img class="spl" src="ui/splash_' + tipo + '.webp" alt=""><b>' + (j ? j.nombre : 'Máquina') + '</b><span>' + HEROES[tipo].nombre + '</span></div>';} return h;};
  el.innerHTML = '<div class="vsLado az"><i>Rohan</i>' + lado(0) + '</div><div class="vsX">VS</div><div class="vsLado ro"><i>Isengard</i>' + lado(1) + '</div>';
  el.classList.remove('hidden'); setTimeout(() => el.classList.add('fuera'), 2300); setTimeout(() => {el.classList.add('hidden'); el.classList.remove('fuera');}, 2900);
}
const ARMA = {rohan: 'lanza', enano: 'hacha', elfo: 'arco', hobbit: 'honda'};
function iconosHab(tipo) {
  $('bAt').querySelector('img').src = 'ui/at_' + tipo + '.webp'; $('bAt').classList.remove('arma');for (const k of ['q', 'w', 'e', 'r']) {const b = $('b' + k.toUpperCase()); b.querySelector('img').src = 'ui/h_' + tipo + '_' + k + '.webp'; b.title = HEROES[tipo].hab[k].n;}}
function subeNivelFx(v) {
  flip('onda', v.xi ?? v.x, v.zi ?? v.z, 5, true); flip('explosion', v.xi ?? v.x, v.zi ?? v.z, 2.2); suena('nivel', 0.6);
  const n = document.createElement('div'); n.className = 'nivelSube'; n.textContent = '¡Nivel ' + v.nivel + '!'; document.body.appendChild(n); setTimeout(() => n.remove(), 1400);
  $('yo').classList.remove('brilla'); void $('yo').offsetWidth; $('yo').classList.add('brilla');
}
function marcador(m, t) {$('marcador').dataset.t = t;$('marcador').innerHTML = '<span class="a">' + m[MI_EQ] + '</span> · <span class="b">' + m[1 - MI_EQ] + '</span><div style="font-size:11px;color:#d9c49a">' + Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') + '</div>';}
let miniT = 0, consejoI = 0;
const CONSEJOS = ['Pulsa el + verde encima de una habilidad para aprenderla: cada nivel te da un punto', 'Mueve con el joystick y mantén ⚔ para atacar. Toca una habilidad para lanzarla sola; arrástrala para apuntar tú', 'Dentro de la hierba alta los enemigos no te ven (salvo que estén a tu lado)', 'Los botones pequeños son Destello (un salto corto) y Curar (a ti y a tu compañero)', 'Las torres pegan muy fuerte: entra con tus súbditos delante, que reciban ellos', 'En la espesura (a los lados, cruzando los huecos de la empalizada) hay huargos: dan oro y experiencia', 'El troll (oeste) y el huargo alfa (este) dan una bendición a todo tu equipo durante 90 s', 'Con poca vida pulsa ⌂: vuelves a la fuente, te curas y compras en la armería'];
function consejos(t) {if (localStorage.getItem('vado.consejos') === '3') return; const i = Math.floor((t - 2) / 14); if (i >= 0 && i < CONSEJOS.length && i >= consejoI) {consejoI = i + 1; aviso('💡 ' + CONSEJOS[i]); if (i === CONSEJOS.length - 1) localStorage.setItem('vado.consejos', String(+(localStorage.getItem('vado.consejos') || 0) + 1));}}
function objetivoTxt() {
  if (MODO === '1v1') {const t = +($('marcador').dataset.t || 0); return t >= DUELO.anillo ? '🔥 Anillo de fuego: el próximo derribo gana' : 'Duelo: 2 derribos o la primera torre · anillo en ' + Math.max(0, Math.ceil((DUELO.anillo - t) / 60)) + ' min';}
  const en = (k, n) => [...VISTA.values()].find((q) => q.k === k && q.eq === 1 - MI_EQ && (n === undefined || q.tipo === n) && q.vida > 0);
  const caidas = [...VISTA.values()].filter((q) => q.k === 't' && q.eq === 1 - MI_EQ && q.tipo === 1 && q.vida <= 0).length;
  if (!caidas) return 'Objetivo: una torre de camino enemiga';
  if (en('t', 2)) return 'Objetivo: la torre de su base';
  return '¡Objetivo: el estandarte enemigo!';
}
const PINGS = [];
const MARCAS = {}; for (const n of ['m_huargo', 'm_troll', 'm_torre0', 'm_torre1']) {MARCAS[n] = new Image(); MARCAS[n].src = 'ui/' + n + '.webp';}
const marca = (g, n, x, z, t) => {const im = MARCAS[n]; if (im.complete && im.naturalWidth) g.drawImage(im, x - t / 2, z - t / 2, t, t); else return false; return true;};
const MM_IMG = {};
function marcaMm(g, n, x, y, t) {let im = MM_IMG[n]; if (!im) {im = MM_IMG[n] = new Image(); im.src = 'ui/' + n + '.webp';} if (!im.complete || !im.naturalWidth) return false; g.drawImage(im, x - t / 2, y - t / 2, t, t); return true;}
function minimapa() {
  const c = $('mini'); if (APAI !== (c.width > c.height)) {c.width = APAI ? 196 : 96; c.height = APAI ? 96 : 196;}
  const W = 96, H = 196, g = c.getContext('2d'), s = signo(MI_EQ);
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); if (APAI) g.setTransform(0, 1, -1, 0, 196, 0);
  const KX = TIPO_MAPA === 'linea' ? 16 : 34, px = (x) => W / 2 + s * x / KX * (W / 2), pz = (z) => H / 2 + s * z / 59 * (H / 2);
  g.clearRect(0, 0, W, H); g.fillStyle = '#16210f'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#2b4a5a'; g.lineWidth = 5; g.beginPath(); if (TIPO_MAPA === 'linea') {g.moveTo(px(-40), pz(0)); g.lineTo(px(40), pz(0));} else {g.moveTo(px(-40 * 0.906), pz(-40 * 0.423)); g.lineTo(px(40 * 0.906), pz(40 * 0.423));} g.stroke();
  g.strokeStyle = '#7a5a36'; g.lineWidth = 6; g.lineCap = g.lineJoin = 'round';
  CARRILES.forEach((L, l) => {g.globalAlpha = MODO === '2v2' || l === 0 ? 1 : 0.3; g.beginPath(); L.forEach((p, i) => i ? g.lineTo(px(p.x), pz(p.z)) : g.moveTo(px(p.x), pz(p.z))); g.stroke();}); g.globalAlpha = 1;
  for (const b of BASES) {g.fillStyle = b === BASES[0] ? '#35552a' : '#4a2220'; g.beginPath(); g.arc(px(b.nexo.x), pz(b.nexo.z), 11, 0, 7); g.fill();}
  const MM = {warg: 'huargo', crebain: 'crebain', troll: 'troll', huorn: 'huorn', uruk: 'uruk', draco: 'draco', nutria: 'nutria', sapo: 'huargo', orco: 'huargo', alfa: 'huargo'};
  CAMPOS.forEach((cp, i) => {
    const t = EXTRA.cp[i], nd = NEUTRO[cp.tipo], tam = nd.jefe || nd.draco ? 17 : nd.grande ? 15 : 11, x = px(cp.x), y = pz(cp.z);
    if (t === -1) {if (!marcaMm(g, 'mm_' + MM[cp.tipo], x, y, tam)) {g.fillStyle = '#e8d27a'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill();}}
    else if (!(t > 900)) {g.globalAlpha = 0.45; marcaMm(g, 'mm_' + MM[cp.tipo], x, y, tam * 0.75); g.globalAlpha = 1; if (t > 0) {g.save(); g.translate(x, y); if (APAI) g.rotate(-Math.PI / 2); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.font = 'bold 8px system-ui'; g.textAlign = 'center'; g.strokeText(t, 0, 3); g.fillText(t, 0, 3); g.restore();}}
  });
  PLANTAS.forEach((q, i) => {if (EXTRA.pl && EXTRA.pl[i]) {if (q.tipo === 'baya') {g.fillStyle = '#ff4a5a'; g.beginPath(); g.arc(px(q.x), pz(q.z), 2.4, 0, 7); g.fill();} else marcaMm(g, 'mm_' + q.tipo, px(q.x), pz(q.z), 9);}});
  RELIQ.forEach((r, i) => {if (EXTRA.rl && EXTRA.rl[i]) {g.fillStyle = '#5aff6a'; g.beginPath(); g.arc(px(r.x), pz(r.z), 2.6, 0, 7); g.fill();}});
  if (MODO === '1v1' && EXTRA.an) {g.strokeStyle = '#ff6a1a'; g.lineWidth = 2; g.beginPath(); g.ellipse(px(0), pz(0), EXTRA.an / KX * W / 2, EXTRA.an / 59 * H / 2, 0, 0, 7); g.stroke();}
  for (const q of VISTA.values()) {
    if (q.k === 'j') continue;
    const mio = q.eq === MI_EQ, col = mio ? '#5fb6ff' : '#ff5a4a', x = px(q.xi ?? q.x), z = pz(q.zi ?? q.z);
    if (q.k === 't' || q.k === 'n') {if (q.vida <= 0) continue; if (q.k === 't' && marca(g, 'm_torre' + q.eq, x, z, 15)) continue; g.fillStyle = col; const r = q.k === 'n' ? 5 : 4; g.fillRect(x - r, z - r, r * 2, r * 2); g.strokeStyle = '#000'; g.lineWidth = 1; g.strokeRect(x - r, z - r, r * 2, r * 2);}
    else if (q.k === 's') {if (q.muerto === 0) continue; g.fillStyle = col; g.fillRect(x - 1.2, z - 1.2, 2.4, 2.4);}
    else if (q.k === 'h') {if (q.muerto >= 0 || (!mio && q.escondido)) continue; g.fillStyle = q.id === YO ? '#ffd24a' : col; g.beginPath(); g.arc(x, z, q.id === YO ? 5 : 4, 0, 7); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1.5; g.stroke();}
  }
  /* lo que ve la cámara */
  const ahoraP = performance.now(); for (let i = PINGS.length - 1; i >= 0; i--) {const p = PINGS[i], k = (ahoraP - p.t) / 3000; if (k > 1) {PINGS.splice(i, 1); continue;} g.strokeStyle = p.k === 'retira' || p.k === 'cuidado' ? '#ffcf3a' : '#ff5a3a'; g.lineWidth = 2; g.beginPath(); g.arc(px(p.x), pz(p.z), 4 + 10 * ((k * 3) % 1), 0, 7); g.stroke();}
  g.setTransform(1, 0, 0, 1, 0, 0); return;
  const vw = ZOOMS[zoomI][0] * 0.5, vh = ZOOMS[zoomI][0] * 0.85; g.strokeStyle = '#ffffffaa'; g.lineWidth = 1; g.strokeRect(Math.min(px(camM.x - vw), px(camM.x + vw)), Math.min(pz(camM.z - vh), pz(camM.z + vh * 0.5)), Math.abs(px(camM.x + vw) - px(camM.x - vw)), Math.abs(pz(camM.z + vh * 0.5) - pz(camM.z - vh)));
}
function hud() {
  const v = VISTA.get(YO); if (!v || v.k !== 'h') return;
  miniT -= 1 / 60; if (miniT <= 0) {miniT = 0.15; minimapa(); $('objetivo').textContent = objetivoTxt(); const bu = EXTRA.be[MI_EQ] || 0; $('buffs').innerHTML = (bu ? '<span class="azul"><img src="ui/bend_furia.webp" alt="">' + bu + ' s</span>' : '') + (v.bTroll ? '<span><img src="ui/bend_brasa.webp" alt="">' + v.bTroll + ' s</span>' : '') + (v.bAlfa ? '<span><img src="ui/bend_savia.webp" alt="">' + v.bAlfa + ' s</span>' : '') + (() => {const d = (EXTRA.dr || [])[MI_EQ] || [0, 0, 0]; return d[2] ? '<span><img src="ui/bend_alma.webp" alt="">Alma</span>' : (d[0] ? '<span><img src="ui/bend_fuego.webp" alt="">×' + d[0] + '</span>' : '') + (d[1] ? '<span><img src="ui/bend_hielo.webp" alt="">×' + d[1] + '</span>' : '');})(); consejos(+($('marcador').dataset.t || 0));}
  $('yoNv').textContent = 'Nv ' + v.nivel; $('oro').textContent = '🪙 ' + v.oro; $('xpBar').style.width = (v.nivel >= NIVEL_MAX ? 100 : (v.xpP || 0) * 100) + '%';
  if (hud.nv !== undefined && v.nivel > hud.nv) subeNivelFx(v); hud.nv = v.nivel;
  $('kda').textContent = (v.kda || '0/0/0/0').split('/').slice(0, 3).join(' / ') + '  ·  🗡 ' + (v.kda || '0/0/0/0').split('/')[3];
  ['q', 'w', 'e', 'r'].forEach((k, i) => {const mas = $('m' + k), rk = v.rk ? v.rk[i] : 0, max = rangoMax(v.nivel, k); mas.classList.toggle('hidden', !(v.pts > 0 && rk < max) || v.muerto >= 0 && false); $('p' + k).innerHTML = Array.from({length: k === 'r' ? 2 : 4}, (_, j) => '<i class="' + (j < rk ? 'on' : '') + '"></i>').join(''); $('b' + k.toUpperCase()).classList.toggle('sinAprender', !rk);});
  {const be = $('bEnc'), e = ENC[v.enc]; be.classList.toggle('hidden', !e); if (e) {if (be.dataset.e !== v.enc) {be.dataset.e = v.enc; be.querySelector('img').src = e.i;} const c = be.querySelector('.cd'), cd = v.cdEnc; c.classList.toggle('hidden', !(cd > 0)); c.textContent = cd > 0 ? Math.ceil(cd) : ''; c.style.setProperty('--f', cd > 0 ? Math.min(100, cd / e.cd * 100) + '%' : '0%');}}
  {const r = $('retratos'), cerca = [...VISTA.values()].filter((q) => q.k === 'h' && q.eq !== MI_EQ && q.muerto < 0 && !q.escondido && Math.hypot(q.x - v.x, q.z - v.z) < 13).slice(0, 2);
   const key = cerca.map((q) => q.id + (q.id === MANDO.fijo ? 'f' : '')).join(','); if (r.dataset.k !== key) {r.dataset.k = key; r.innerHTML = cerca.map((q) => '<button data-id="' + q.id + '"' + (q.id === MANDO.fijo ? ' class="on"' : '') + '><img src="../abismo/ui/' + HEROES[q.tipo].retrato + '.webp" alt=""></button>').join('');}
   if (MANDO.fijo) {const f = VISTA.get(MANDO.fijo); if (!f || f.vida <= 0 || (f.k === 'h' && (f.muerto >= 0 || f.escondido)) || Math.hypot(f.x - v.x, f.z - v.z) > 16) MANDO.fijo = 0;}
   if (!aroFijo) {aroFijo = indicador('ind_alcance', '#ffd24a'); aroFijo.renderOrder = 6;}
   const af = VISTA.get(MANDO.cand || MANDO.fijo); aroFijo.visible = !!af && v.muerto < 0;
   if (af) {const rr = af.k === 't' ? 2.4 : af.k === 'n' ? 2.8 : af.k === 'h' ? 1.3 : 1.1; aroFijo.position.set(af.xi ?? af.x, 0.18, af.zi ?? af.z); aroFijo.scale.setScalar(2 * rr * 256 / 235 * (1 + 0.1 * Math.sin(performance.now() / 70))); aroFijo.material.color.set(MANDO.cand ? '#ffffff' : '#ffd24a');}}
  {const bf = $('bF').querySelector('img'), src = v.hf === 'c' ? 'ui/hz_castigo.webp' : 'ui/hz_curar.webp'; if (!bf.src.endsWith(src)) bf.src = src; const bd = $('bD').querySelector('img'); if (!bd.src.endsWith('hz_destello.webp')) bd.src = 'ui/hz_destello.webp';}
  for (const [k, cd] of [['d', v.cdD], ['f', v.cdF]]) {const c = $('b' + k.toUpperCase()).querySelector('.cd'); c.classList.toggle('hidden', !(cd > 0)); c.textContent = cd > 0 ? Math.ceil(cd) : ''; c.style.setProperty('--f', cd > 0 ? Math.min(100, cd / HECHIZOS[k === 'f' && v.hf === 'c' ? 'c' : k].cd * 100) + '%' : '0%');}
  /* volver a la fuente: el botón se va llenando */
  $('bBase').style.setProperty('--p', volverBase > 0 ? (1 - volverBase / VOLVER_T) * 100 + '%' : '0%'); $('bBase').classList.toggle('cargando', volverBase > 0);
  const cn = $('canal'); cn.classList.toggle('hidden', !(volverBase > 0)); if (volverBase > 0) cn.innerHTML = 'Volviendo a la base… <b>' + Math.ceil(volverBase) + '</b><i style="width:' + (1 - volverBase / VOLVER_T) * 100 + '%"></i>';
  if (!circVuelta) circVuelta = indicador('ind_area', '#5fb6ff');
  circVuelta.visible = volverBase > 0; if (circVuelta.visible) {circVuelta.position.set(v.xi ?? v.x, 0.13, v.zi ?? v.z); circVuelta.scale.setScalar(2.6 + Math.sin(performance.now() / 160) * 0.2);}
  /* compra rápida en la fuente */
  const sug = sugerencia(v), cr = $('compraRapida'), enF = Math.hypot(v.x - BASES[MI_EQ].fuente.x, v.z - BASES[MI_EQ].fuente.z) < 9 || v.muerto >= 0;
  if (sug && enF) {const o = OBJ[sug], fl = falta({inv: v.inv}, sug); cr.classList.remove('hidden'); if (cr.dataset.id !== sug || cr.dataset.oro !== String(v.oro >= o.c && !fl.length)) {cr.dataset.id = sug; cr.dataset.oro = String(v.oro >= o.c && !fl.length); cr.innerHTML = '<img src="' + ICO(o.i) + '" alt=""><span>' + o.t + '</span><b>' + o.c + '</b>'; cr.classList.toggle('caro', !(v.oro >= o.c && !fl.length));}} else cr.classList.add('hidden');
  renderer.domElement.style.filter = v.muerto >= 0 ? 'grayscale(.85) brightness(.8)' : '';
  aroTorre(v);
  if (!marcaObj) {marcaObj = indicador('ind_alcance', '#ff4a3a'); marcaObj.renderOrder = 5;}
  const ob = v.objAt && VISTA.get(v.objAt); marcaObj.visible = !!ob && v.muerto < 0 && ob.vida > 0 && !ob.escondido;
  if (marcaObj.visible) {const r = ob.k === 't' ? 2.2 : ob.k === 'n' ? 2.6 : ob.k === 'j' && NEUTRO[ob.tipo].grande ? 1.8 : 1; marcaObj.position.set(ob.xi ?? ob.x, 0.16, ob.zi ?? ob.z); marcaObj.scale.setScalar(2 * r * 256 / 235 * (1 + 0.06 * Math.sin(performance.now() / 90)));}
  ['q', 'w', 'e', 'r'].forEach((k, i) => {
    const b = $('b' + k.toUpperCase()), c = b.querySelector('.cd'), cd = v.cds ? v.cds[i] : 0, rk = v.rk ? v.rk[i] : 1, tot = HEROES[v.tipo].hab[k].cd * (1 - 0.08 * Math.max(0, rk - 1));
    c.classList.toggle('hidden', !(cd > 0)); c.textContent = cd > 0 ? (cd < 1 ? cd.toFixed(1) : Math.ceil(cd)) : ''; c.style.setProperty('--f', cd > 0 ? Math.min(100, cd / tot * 100) + '%' : '0%');
    if (b._cd > 0 && !(cd > 0)) {b.classList.remove('lista'); void b.offsetWidth; b.classList.add('lista');} b._cd = cd;
  });;
  const m = $('muerto'); if (v.muerto >= 0) {m.classList.remove('hidden'); const k = ULTIMA_BAJA && VISTA.get(ULTIMA_BAJA); m.innerHTML = (k ? '<div class="mRec"><img src="' + retratoDe(ULTIMA_BAJA) + '" alt=""><span>Te ha derribado<b>' + (k.nombre || (k.k === 't' ? 'una torre' : k.k === 'j' ? NEUTRO[k.tipo].nombre : 'una horda')) + '</b></span></div>' : '') + '<div class="mVuelta">Vuelves en <b>' + v.muerto + '</b> s</div><small>Mientras, puedes comprar en la armería</small>';} else m.classList.add('hidden');
  const enFuente = enF;
  $('bTienda').style.opacity = enFuente ? 1 : 0.45;
}
/* aro de alcance de la torre enemiga cuando te acercas (rojo si te está apuntando) */
/* alcance de las torres enemigas: zona roja suave en el suelo + borde; si te apunta, se enciende y sale un rayo hacia ti */
const AROS = new Map(); let marcaObj = null;
function aroTorre(v) {
  const hx = v.xi ?? v.x, hz = v.zi ?? v.z;
  for (const q of VISTA.values()) {
    if (q.k !== 't') continue;
    let a = AROS.get(q.id);
    if (!a) {
      a = {borde: indicador('ind_alcance', '#ff5a3a'), zona: indicador('ind_area', '#ff3a1a'), rayo: new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 1), new THREE.MeshBasicMaterial({color: '#ff3a1a', transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending}))};
      a.borde.scale.setScalar(2 * 9.5 * 256 / 235); a.zona.scale.setScalar(2 * 9.5 * 256 / 231); a.borde.position.set(q.x, 0.14, q.z); a.zona.position.set(q.x, 0.12, q.z); a.rayo.renderOrder = 6; a.rayo.visible = false; scene.add(a.rayo); AROS.set(q.id, a);
    }
    const d = Math.hypot(q.x - hx, q.z - hz), enemiga = q.eq !== MI_EQ && q.vida > 0, ver = enemiga && v.muerto < 0 && d < 24, mira = enemiga && q.hc === YO;
    a.borde.visible = a.zona.visible = ver;
    if (ver) {const cerca = Math.max(0, Math.min(1, (24 - d) / 10)); a.borde.material.opacity = mira ? 1 : 0.45 + 0.4 * cerca; a.zona.material.opacity = mira ? 0.55 : 0.12 + 0.13 * cerca; a.borde.material.color.set(mira ? '#ff2a1a' : '#ff8a5a');}
    a.rayo.visible = mira && v.muerto < 0;
    if (a.rayo.visible) {const ox = q.x, oz = q.z, oy = 5.6, l = Math.hypot(hx - ox, 1.2 - oy, hz - oz); a.rayo.position.set((ox + hx) / 2, (oy + 1.2) / 2, (oz + hz) / 2); a.rayo.scale.set(1, 1, l); a.rayo.lookAt(hx, 1.2, hz);}
  }
}
function pintaTabla() {
  const fil = [...VISTA.values()].filter((q) => q.k === 'h').sort((a, b) => (a.eq !== MI_EQ) - (b.eq !== MI_EQ) || a.slot - b.slot);
  $('tabla').innerHTML = '<div class="tbCaja"><b>Marcador</b>' + fil.map((q) => {const [k, d, a, cs] = (q.kda || '0/0/0/0').split('/'); return '<div class="tbFila ' + (q.eq === MI_EQ ? 'az' : 'ro') + '"><img src="../abismo/ui/' + HEROES[q.tipo].retrato + '.webp" alt=""><span class="n">' + q.nombre + '<small>Nv ' + q.nivel + '</small></span><span class="k">' + k + '/' + d + '/' + a + '</span><span class="c">🗡 ' + cs + '</span><span class="o">' + q.inv.map((i) => '<img src="' + ICO(OBJ[i].i) + '" alt="">').join('') + '</span></div>';}).join('') + '<small>Toca para cerrar</small></div>';
}
function acaba(ganador) {
  if (ESTADO === 'fin') return; ESTADO = 'fin'; if (ganador >= 0) voz(ganador === MI_EQ ? 'victoria' : 'derrota');
  const f = $('fin'); f.classList.remove('hidden');
  pintaTabla(); const resumen = $('tabla').innerHTML.replace('<small>Toca para cerrar</small>', '');
  const yo = VISTA.get(YO), duelo = MODO === '1v1';
  f.innerHTML = (yo ? '<img class="finSpl" src="ui/splash_' + yo.tipo + '.webp" alt="">' : '') + '<h2 class="' + (ganador === MI_EQ ? 'gana' : 'pierde') + '">' + (ganador === MI_EQ ? '¡VICTORIA!' : ganador === -1 ? 'Partida terminada' : 'DERROTA') + '</h2><p>' + (ganador === -1 ? '' : duelo ? (ganador === MI_EQ ? 'Has ganado el duelo.' : 'Has perdido el duelo.') : ganador === MI_EQ ? 'El estandarte enemigo ha caído.' : 'Han derribado vuestro estandarte.') + '</p>' + resumen + '<button class="bt" id="bOtra">Volver al menú</button>';
  $('bOtra').onclick = () => location.reload();
  document.body.classList.remove('jugando');
  suena('cuerno', 0.8);
}

/* ---------- bucle ---------- */
const reloj = new THREE.Clock(); let acum = 0, ALFA = 1;
/* medidor para pruebas: window._vado.PERF (ms acumulados por parte) */
const PERF = {n: 0, sim: 0, dib: 0, hud: 0, ren: 0, tot: 0, max: 0};
function bucle() {
  requestAnimationFrame(bucle); const t0b = performance.now();
  const dtR = reloj.getDelta(), dt = Math.min(0.05, dtR); if (ESTADO === 'juego') ajustaResolucion(Math.min(0.25, dtR));
  try {
    if (ESTADO === 'juego' || ESTADO === 'fin') {
      if (S && ESTADO === 'juego') {
        const h = S.u.find((q) => q.id === YO);
        if (h) {const ac = acercaAtaque(h.x, h.z); h.mx = ac ? ac.x : MANDO.mx; h.mz = ac ? ac.z : MANDO.mz; h.ataca = atacando(); if ((MANDO.golpes || 0) > (h.gVisto || 0)) {h.gVisto = MANDO.golpes; h.tap = S.t + 1.5;} h.prioHeroe = true; h.modoAt = modoAtaque(); h.fijo = MANDO.fijo || 0;}
        if (volverBase > 0) {volverBase -= dt; const vv = VISTA.get(YO); if (MANDO.mx || MANDO.mz || (vv && vv.vida < volverVida - 1)) {volverBase = 0; aviso('Vuelta a la fuente cancelada');} else if (volverBase <= 0 && h && !h.muerto) {const f = BASES[h.eq].fuente; h.x = f.x; h.z = f.z - signo(h.eq) * 2.5; h.px = undefined; aviso('En la fuente: ya puedes comprar');}}
        acum += dt; let pasos = 0; const ts = performance.now(); while (acum >= 1 / 30 && pasos < 4) {paso(1 / 30); acum -= 1 / 30; pasos++;} if (acum > 0.1) acum = 0; ALFA = Math.min(1, acum * 30);
        fotoT -= dt;
        if (pasos) {const f = foto(); recibeFotoLocal(f); PERF.sim += performance.now() - ts; if (NET.online && fotoT <= 0) {fotoT = 1 / 12; NET.manda({t: 'foto', f: {...f, ev: ENVIAR.splice(0)}});}}
      } else if (!S && ESTADO === 'juego') {
        mueveMio(dt);
        if (volverBase > 0) {volverBase -= dt; const vv = VISTA.get(YO); if (MANDO.mx || MANDO.mz || (vv && vv.vida < volverVida - 1)) {volverBase = 0; aviso('Vuelta a la fuente cancelada');} else if (volverBase <= 0) {NET.manda({t: 'volver'}); MIO.listo = false;}}
        inT -= dt; if (inT <= 0 && MIO.listo) {inT = 1 / 15; NET.manda({t: 'in', x: +MIO.x.toFixed(2), z: +MIO.z.toFixed(2), rot: +MIO.rot.toFixed(2), m: !!(MANDO.mx || MANDO.mz), a: atacando(), mo: modoAtaque(), fi: MANDO.fijo || 0, g: MANDO.golpes || 0});}
      }
      if (NET.online) {pingT -= dt; if (pingT <= 0) {pingT = 2; NET.manda({t: 'ping', c: performance.now()});}}
      const t1 = performance.now(); camara(dt); dibuja(dt); animaHabilidades(dt); const t2 = performance.now(); hud(); PERF.dib += t2 - t1; PERF.hud += performance.now() - t2;
    }
  } catch (err) {console.error(err); if (!window._errVisto) {window._errVisto = 1; aviso('⚠ ' + String(err.message || err).slice(0, 80));}}
  const t3 = performance.now(); if (ESTADO === 'juego' || ESTADO === 'fin') renderer.render(scene, camera); /* en el menú no se dibuja el mapa: lo tapa el menú y solo calentaba el móvil */ PERF.ren += performance.now() - t3; PERF.n++; PERF.tot += performance.now() - t0b; PERF.max = Math.max(PERF.max, performance.now() - t0b);
}
/* el anfitrión dibuja de su propio estado: los avisos ya los pinta al crearlos; los que se mandan, se guardan */
const ENVIAR = [];
function recibeFotoLocal(f) {ENVIAR.push(...f.ev); f.ev = []; for (const v of VISTA.values()) v.visto = false; for (const fila of f.u) aplicaFila(fila, f.t); for (const [id, v] of VISTA) if (!v.visto) {quitaVis(id); VISTA.delete(id);} marcador(f.m, f.t); EXTRA.be = f.be; EXTRA.cp = f.cp; EXTRA.an = f.an || 0; EXTRA.rl = f.rl || []; EXTRA.dr = f.dr || [[0, 0, 0], [0, 0, 0]]; EXTRA.pl = f.pl || []; EXTRA.sa = f.sa || [];}
const EXTRA = {be: [0, 0], cp: []};

/* ---------- tienda (en la fuente) ---------- */
let tSel = 'hoja';
function compraMia(id) {
  const v = VISTA.get(YO); if (!v) return;
  if (S) {const hh = S.u.find((q) => q.id === YO), r = compra(hh, id); if (r) aviso(r); else {suena('moneda'); recibeFotoLocal(foto());}}
  else {NET.manda({t: 'compra', id}); suena('moneda'); v.oro -= OBJ[id].c;}
}
/* lo siguiente que conviene comprar (la ruta recomendada de cada héroe, como la compra rápida del Wild Rift) */
function sugerencia(v) {
  const plan = PLAN_BOT[v.tipo] || [], tengo = [...v.inv], hecho = plan.map(() => false);
  plan.forEach((id, i) => {const k = tengo.indexOf(id); if (k >= 0) {tengo.splice(k, 1); hecho[i] = true; if (OBJ[id].rec) for (const r of OBJ[id].rec) {for (let j = i - 1; j >= 0; j--) if (!hecho[j] && plan[j] === r) {hecho[j] = true; break;}}}});
  const i = hecho.indexOf(false); return i >= 0 ? plan[i] : null;
}
function abreTienda() {
  const v = VISTA.get(YO); if (!v) return;
  if (!(Math.hypot(v.x - BASES[MI_EQ].fuente.x, v.z - BASES[MI_EQ].fuente.z) < 9 || v.muerto >= 0)) {aviso('La armería está en tu fuente (botón ⌂ para volver)'); return;}
  $('tienda').classList.remove('hidden'); pintaTienda();
}
/* encantamientos de botas en la armería */
function encGrid(v) {
  const hay = tieneBotas(v.inv);
  return '<h4>Encantamientos de botas ' + (hay ? '' : '(antes compra unas botas)') + '</h4><div class="tGrid">' + Object.entries(ENC).map(([id, e]) => '<button class="tObj ' + (!hay ? 'bloq' : v.enc === id ? 'forja' : v.oro < e.c ? 'caro' : '') + (id === tSel ? ' sel' : '') + '" data-id="' + id + '"><img src="' + e.i + '" alt="">' + (!hay ? '<i>🔒</i>' : v.enc === id ? '<i>✓</i>' : '') + '<span>' + e.t + '</span><b>' + e.c + '</b></button>').join('') + '</div>';
}
function pintaTiendaEnc(v, t) {
  const e = ENC[tSel], hay = tieneBotas(v.inv), ya = v.enc === tSel, puede = hay && !ya && v.oro >= e.c;
  const listaB = (ids) => ids.map((id) => {const x = OBJ[id]; return '<button class="tObj' + (x.leg ? ' leg' : '') + '" data-id="' + id + '"><img src="' + ICO(x.i) + '" alt=""><span>' + x.t + '</span><b>' + x.c + '</b></button>';}).join('');
  t.innerHTML = '<div class="tCab"><button class="tX" id="tX">←</button><b>Armería</b><span class="tOro">🪙 ' + v.oro + '</span></div>' +
    '<div class="tInv">' + Array.from({length: 6}, (_, i) => v.inv[i] ? '<span class="tHueco lleno"><img src="' + ICO(OBJ[v.inv[i]].i) + '" alt=""></span>' : '<span class="tHueco"></span>').join('') + '</div>' +
    '<div class="tLista"><h4>Básicos</h4><div class="tGrid">' + listaB(Object.keys(OBJ).filter((k) => !OBJ[k].leg)) + '</div><h4>Legendarios (se forjan con sus básicos)</h4><div class="tGrid">' + listaB(Object.keys(OBJ).filter((k) => OBJ[k].leg)) + '</div>' + encGrid(v) + '</div>' +
    '<div class="tDet"><b class="n">' + e.t + '</b><p>' + e.d + '</p><p>Recarga: ' + e.cd + ' s · Mejora tus botas y te da un botón propio. Solo uno a la vez: si compras otro, cambia.</p>' +
    '<button class="tComprar" id="tComprar"' + (puede ? '' : ' disabled') + '>' + (!hay ? 'Antes: unas botas' : ya ? 'Ya lo llevas' : v.oro < e.c ? 'Te faltan ' + (e.c - v.oro) + ' de oro' : 'Encantar · ' + e.c) + '</button></div>';
  t.querySelectorAll('[data-id]').forEach((b) => b.onclick = () => {tSel = b.dataset.id; pintaTienda();});
  $('tX').onclick = () => t.classList.add('hidden');
  $('tComprar').onclick = () => {compraMia(tSel); setTimeout(pintaTienda, 150);};
}
function pintaTienda() {
  const v = VISTA.get(YO), t = $('tienda'); if (!v) return;
  if (ENC[tSel]) return pintaTiendaEnc(v, t);
  const o = OBJ[tSel], h = {inv: v.inv}, fl = falta(h, tSel), puede = !fl.length && v.oro >= o.c;
  const carta = (id) => {const x = OBJ[id], f = falta(h, id), st = f.length ? 'bloq' : v.oro < x.c ? 'caro' : x.leg ? 'forja' : ''; return '<button class="tObj ' + st + (x.leg ? ' leg' : '') + (id === tSel ? ' sel' : '') + '" data-id="' + id + '"><img src="' + ICO(x.i) + '" alt="">' + (f.length ? '<i>🔒</i>' : '') + '<span>' + x.t + '</span><b>' + x.c + '</b></button>';};
  const st = Object.entries(o.st).map(([k, val]) => '<li>' + ({dano: '+' + val + ' de daño', vatq: '+' + Math.round(val * 100) + ' % de velocidad de ataque', vida: '+' + val + ' de vida', reduc: '−' + Math.round(val * 100) + ' % de daño recibido', vel: '+' + Math.round(val * 100) + ' % de velocidad', regen: '+' + val + ' de vida por segundo', crit: Math.round(val * 100) + ' % de críticos', espinas: 'Devuelve ' + Math.round(val * 100) + ' % del daño', esquiva: Math.round(val * 100) + ' % de esquiva', robo: Math.round(val * 100) + ' % de robo de vida'}[k]) + '</li>').join('');
  t.innerHTML = '<div class="tCab"><button class="tX" id="tX">←</button><b>Armería</b><span class="tOro">🪙 ' + v.oro + '</span></div>' +
    '<div class="tInv">' + Array.from({length: 6}, (_, i) => v.inv[i] ? '<span class="tHueco lleno"><img src="' + ICO(OBJ[v.inv[i]].i) + '" alt=""></span>' : '<span class="tHueco"></span>').join('') + '</div>' +
    '<div class="tLista"><h4>Básicos</h4><div class="tGrid">' + Object.keys(OBJ).filter((k) => !OBJ[k].leg).map(carta).join('') + '</div><h4>Legendarios (se forjan con sus básicos)</h4><div class="tGrid">' + Object.keys(OBJ).filter((k) => OBJ[k].leg).map(carta).join('') + '</div>' + encGrid(v) + '</div>' +
    '<div class="tDet"><b class="n">' + o.t + '</b><ul>' + st + '</ul>' + (o.p ? '<p>' + o.p + '</p>' : '') + (o.rec ? '<p>Receta: ' + o.rec.map((r) => (v.inv.includes(r) ? '✓ ' : '') + OBJ[r].t).join(' + ') + ' + ' + o.c + ' de oro</p>' : '') +
    '<button class="tComprar" id="tComprar"' + (puede ? '' : ' disabled') + '>' + (fl.length ? 'Antes: ' + fl.map((f) => OBJ[f].t).join(' y ') : v.oro < o.c ? 'Te faltan ' + (o.c - v.oro) + ' de oro' : 'Comprar · ' + o.c) + '</button></div>';
  t.querySelectorAll('[data-id]').forEach((b) => b.onclick = () => {tSel = b.dataset.id; pintaTienda();});
  $('tX').onclick = () => t.classList.add('hidden');
  $('tComprar').onclick = () => {compraMia(tSel); setTimeout(pintaTienda, 150);};
}

/* ---------- horizontal ---------- */
async function apaisa() {
  try {const d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) await d.requestFullscreen({navigationUI: 'hide'});} catch (e) {}
  try {if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');} catch (e) {}
}
function sueltaApaisado() {try {if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();} catch (e) {} try {if (document.fullscreenElement) document.exitFullscreen();} catch (e) {}}

/* ---------- menú y sala ---------- */
let hechElegido = localStorage.getItem('vado.hech') || 'f', heroeElegido = localStorage.getItem('vado.heroe') || 'rohan', modoElegido = localStorage.getItem('vado.modo') || '1v1';
const ROL_H = {rohan: 'Luchador', enano: 'Tanque', elfo: 'Tirador', hobbit: 'Asesino'};
let eligeSel = null;
function eligeHeroe(titulo, listo) {
  const el = $('elige'); eligeSel = heroeElegido; el.classList.remove('hidden');
  const pinta = () => {
    const H = HEROES[eligeSel], max = {vida: 740, dano: 62, alcance: 7, vel: 5.8};
    const barra = (n, v, m) => '<div class="eB"><span>' + n + '</span><i><u style="width:' + Math.round(v / m * 100) + '%"></u></i></div>';
    el.innerHTML = '<div class="eTit">' + titulo + '</div>' +
      '<div class="eLista">' + Object.entries(HEROES).map(([k, h]) => '<button class="eH' + (k === eligeSel ? ' on' : '') + '" data-h="' + k + '"><img src="ui/splash_' + k + '.webp" alt=""><span>' + h.nombre.split(' ')[0] + '</span></button>').join('') + '</div>' +
      '<div class="eFicha"><div class="eRet"><img src="ui/splash_' + eligeSel + '.webp" alt=""><b>' + H.nombre + '</b><em>' + ROL_H[eligeSel] + '</em></div>' +
      '<div class="eDatos">' + barra('Vida', H.vida, max.vida) + barra('Daño', H.dano, max.dano) + barra('Alcance', H.alcance, max.alcance) + barra('Velocidad', H.vel, max.vel) +
      '<div class="eHabs">' + ['q', 'w', 'e', 'r'].map((k) => '<div class="eHab' + (k === 'r' ? ' ult' : '') + '"><img src="ui/h_' + eligeSel + '_' + k + '.webp" alt=""><div><b>' + H.hab[k].n + (k === 'r' ? ' · definitiva' : '') + '</b><small>' + H.hab[k].d + '</small></div></div>').join('') + '<div class="eHech"><span>Hechizos:</span><b><img src="ui/hz_destello.webp" alt="">Destello</b>' + ['f', 'c'].map((k) => '<button data-hz="' + k + '"' + (hechElegido === k ? ' class="on"' : '') + '><img src="' + HECHIZOS[k].icono + '" alt="">' + HECHIZOS[k].n + '</button>').join('') + '<small>' + (hechElegido === 'c' ? 'Castigo: golpe seco a una bestia o súbdito (para cazar en la espesura y robar el draco o el Uruk).' : 'Curar: te cura a ti y a un aliado cercano.') + '</small></div>' + '</div></div></div>' +
      '<div class="eBot"><button class="bt s" id="eVolver">← Volver</button><button class="bt" id="eOk">¡Confirmar!</button></div>';
    el.querySelectorAll('[data-h]').forEach((b) => b.onclick = () => {eligeSel = b.dataset.h; pinta();});
    el.querySelectorAll('[data-hz]').forEach((b) => b.onclick = () => {hechElegido = b.dataset.hz; localStorage.setItem('vado.hech', hechElegido); pinta();});
    $('eVolver').onclick = () => el.classList.add('hidden');
    $('eOk').onclick = () => {heroeElegido = eligeSel; localStorage.setItem('vado.heroe', heroeElegido); el.classList.add('hidden'); pintaMenu(); listo();};
  };
  pinta();
}
function msg(t) {$('msg').textContent = t || '';}
function pintaMenu() {
  $('heroes').style.display = 'none'; $('menu').classList.toggle('enSala', ESTADO === 'sala');
  const sp = 'ui/splash_' + heroeElegido + '.webp'; if (!$('mSplash').src.endsWith(sp)) $('mSplash').src = sp;
  $('mHeroNom').textContent = HEROES[heroeElegido].nombre; $('mHeroRol').textContent = ROL_H[heroeElegido];
  $('mCambiar').onclick = () => eligeHeroe('Elige a tu héroe', () => {if (ESTADO === 'sala') NET.manda({t: 'heroe', heroe: heroeElegido});});
  $('heroes').innerHTML = Object.entries(HEROES).map(([k, h]) => '<button class="heroe' + (k === heroeElegido ? ' on' : '') + '" data-h="' + k + '"><img src="ui/splash_' + k + '.webp" alt=""><span>' + h.nombre + '</span></button>').join('');
  $('heroes').querySelectorAll('[data-h]').forEach((b) => b.onclick = () => {heroeElegido = b.dataset.h; localStorage.setItem('vado.heroe', heroeElegido); pintaMenu(); if (ESTADO === 'sala') NET.manda({t: 'heroe', heroe: heroeElegido});});
  document.querySelectorAll('.modos button').forEach((b) => {b.classList.toggle('on', b.dataset.m === modoElegido); b.onclick = () => {modoElegido = b.dataset.m; localStorage.setItem('vado.modo', modoElegido); pintaMenu(); pintaCarga();};});
}
function pintaSala() {
  const s = $('sala'); s.classList.remove('hidden'); $('menu').classList.add('enSala');
  const plazas = NET.modo === '2v2' ? 4 : 2, soyAnf = NET.soy === NET.anf;
  const plaza = (i) => {const j = NET.jugadores.find((q) => q.slot === i); return '<div class="jug eq' + (i % 2) + '">' + (j ? '<img src="ui/splash_' + j.heroe + '.webp" alt=""><div>' + j.nombre + (j.slot === NET.anf ? ' 👑' : '') + '<small>' + HEROES[j.heroe].nombre + '</small></div>' : '<i>Libre · la máquina</i>') + '</div>';};
  let col = (eq) => {let h = ''; for (let i = eq; i < plazas; i += 2) h += plaza(i); return '<div style="display:flex;flex-direction:column;gap:5px">' + h + '</div>';};
  s.innerHTML = '<div class="cab"><span>Código de la sala · ' + (NET.modo === '2v2' ? 'Batalla 2 contra 2' : 'Duelo') + '</span><div class="cod">' + NET.codigo + '</div></div>' +
    '<div class="bandos">' + col(0) + col(1) + '</div>' +
    (soyAnf ? '<button class="bt v" id="bEmpezar">⚔ Empezar</button>' : '<div style="font-size:13px;text-align:center;color:#d9c49a">Esperando a que el anfitrión empiece…</div>');
  if (soyAnf) $('bEmpezar').onclick = () => NET.manda({t: 'empezar'});
}
function nombreJugador() {let n = localStorage.getItem('vado.nombre'); if (!n) {try {const a = JSON.parse(localStorage.getItem('loc.yo') || 'null'); n = a && a.nombre;} catch (e) {} } return n || 'Hobbit' + Math.floor(Math.random() * 90 + 10);}
function preparaMenu() {
  pintaMenu();
  $('bGirar').onclick = apaisa;
  $('bBots').onclick = () => eligeHeroe('Elige a tu héroe · ' + (modoElegido === '2v2' ? '2 contra 2' : 'Duelo'), () => {apaisa(); trasCarga(() => {NET.soy = 0; NET.anf = 0; const js = [{slot: 0, nombre: nombreJugador(), heroe: heroeElegido, hech: hechElegido}]; empieza(js, modoElegido, true);});});
  $('bCrear').onclick = () => eligeHeroe('Elige a tu héroe', () => {apaisa(); trasCarga(() => {const c = Array.from({length: 4}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join(''); conecta(c, modoElegido, nombreJugador(), heroeElegido);});});
  $('bUnir').onclick = () => {const c = $('codigo').value.trim().toUpperCase(); if (c.length < 3) {msg('Escribe el código que te han pasado'); return;} eligeHeroe('Elige a tu héroe', () => {apaisa(); trasCarga(() => conecta(c, modoElegido, nombreJugador(), heroeElegido));});};
  $('bSalir').onclick = () => {sueltaApaisado(); location.href = '../';};
}

/* ---------- arranque ----------
   El menú sale al momento; los modelos (unos 16 MB) se cargan detrás con una barrita en JUGAR.
   Si pulsas antes de que acabe, se espera con el porcentaje en pantalla. */
let LISTO = null, CARGA = 0;
function pintaCarga() {const b = $('bBots'); b.style.setProperty('--carga', Math.round(CARGA * 100) + '%'); b.classList.toggle('listo', CARGA >= 1); $('bBotsSub').textContent = CARGA >= 1 ? (modoElegido === '2v2' ? '2 contra 2 contra la máquina' : 'contra la máquina') : 'preparando el campo… ' + Math.round(CARGA * 100) + ' %';}
function cargaTodo() {
  if (LISTO) return LISTO;
  LISTO = (async () => {
    let n = 0; const gl = await Promise.all(NOMBRES.map(async (k) => {const g = await cargaModelo(k); n++; CARGA = n / NOMBRES.length * 0.95; pintaCarga(); return g;}));
    NOMBRES.forEach((k, i) => M[k] = gl[i]);
    /* algunos modelos del Pack 9 vienen sin normales: sin ellas la luz no les da */
    for (const k of ['huorn', 'nutria', 'crebain', 'sapo', 'draco']) M[k].scene.traverse((q) => {if (q.isMesh && !q.geometry.attributes.normal) q.geometry.computeVertexNormals();});
    await new Promise((r) => setTimeout(r, 30));
    ponMapa(modoElegido); construyeMapa(); CARGA = 1; pintaCarga();
  })();
  LISTO.catch((e) => {LISTO = null; msg('No se pudo cargar: ' + e.message + ' · toca JUGAR para reintentar');});
  return LISTO;
}
/* espera a que esté todo cargado antes de empezar (con un velo y el porcentaje) */
async function trasCarga(fn) {
  if (CARGA < 1) {const ve = $('cargaVelo'); ve.classList.remove('hidden'); const t = setInterval(() => {ve.querySelector('b').textContent = Math.round(CARGA * 100) + ' %';}, 120);
    try {await cargaTodo();} catch (e) {clearInterval(t); ve.classList.add('hidden'); return;} clearInterval(t); ve.classList.add('hidden');}
  fn();
}
preparaMenu(); preparaMandos(); pintaCarga();
camera.position.set(0, 19, 60); camera.lookAt(0, 0, 46);
bucle();
cargaTodo();
window._vado = {PR, PERF, AROS, flip, FXP, rinde, RELIQ_V, M, alto, VIS, THREE, get mira() {return mira;}, get S() {return S;}, get VISTA() {return VISTA;}, get YO() {return YO;}, MIO, HEROES, usaHab, compra, empieza, NET, paso, foto, recibeFotoLocal, get ESTADO() {return ESTADO;}};
