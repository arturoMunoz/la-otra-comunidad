/* ---------- LA CIUDAD (22/11, Henar: «un mapa de autopistas sin ríos, del que sentirme orgulloso»): la Batalla 2 contra 2 de A-6 ----------
   Dos autopistas casi paralelas (34 m de una a otra) de peaje a peaje; entre ellas el barrio (la jungla): manzanas de edificios con calles,
   solares y plazas donde viven las bestias; una avenida cruza por la mitad con una glorieta (la rata). Fuera de las autopistas, el colector
   de Nasor (oeste) y la central del lagarto (este), cada uno con una sola boca a su autopista. Simétrico girando 180°.
   Los edificios son rectángulos sólidos (RECTS): choque exacto, sin las paredes a trompicones de los árboles. */
let RECTS = [];
const CIU = {
  carril: [{x: 0, z: 46}, {x: -9, z: 39}, {x: -17, z: 28}, {x: -17, z: 0}, {x: -17, z: -28}, {x: -9, z: -39}, {x: 0, z: -46}],
  base: {fuente: {x: 0, z: 56}, nexo: {x: 0, z: 51}, torre: {x: 0, z: 42.5}},
  /* manzanas del lado azul [x0, z0, x1, z1]; las del rojo salen girando */
  bloques: [[-12, 3, -8.5, 10], [-12, 14.5, -8.5, 23.5], [-8.5, 3, -3, 6.5], [-8.5, 17, -2.5, 21], [-8.5, 28.5, -3.5, 31.5], [-5.5, 31.5, -3, 35.5],
    [8.5, 3, 12, 6.5], [8.5, 10.5, 12, 17.5], [8.5, 22, 12, 26.5], [2.5, 13, 8.5, 17], [3.5, 27, 8.5, 31], [3, 31, 5.5, 35.5],
    [-34, 8, -22, 40], [-24, 3, -22, 8], [22, 12, 34, 40], [22, 7, 24, 12], [-34, 40, -14.5, 60], [14.5, 40, 34, 60]],
  campos: [{x: -5.5, z: 12, tipo: 'huorn', n: 1}, {x: -5.5, z: 25, tipo: 'warg', n: 2}, {x: 5.5, z: 9, tipo: 'crebain', n: 4}, {x: 5.5, z: 22, tipo: 'troll', n: 1}, {x: 0, z: 31, tipo: 'sapo', n: 1}],
  plantas: [{x: 5.5, z: 4.6, tipo: 'baya'}, {x: -1, z: 24.5, tipo: 'flor'}, {x: -5.5, z: 16, tipo: 'seta'}],
  hierbas: [{x: -10.3, z: 12.25, r: 2.4}, {x: -10.3, z: 26, r: 2.4}, {x: 10.3, z: 8.5, r: 2.4}, {x: 10.3, z: 19.75, r: 2.4}, {x: -9, z: 1.3, r: 2.4}, {x: 0, z: 18, r: 2.2}],
  /* calles para los bots (del lado azul; 'L' = a la autopista más cercana) */
  nodos: {rot: {x: 0, z: 0}, avO: {x: -9, z: 0}, c6: {x: 0, z: 6.5}, c12: {x: 0, z: 12}, c19: {x: 0, z: 18.5}, c25: {x: 0, z: 24.5}, pO1: {x: -10.3, z: 12.25}, pO2: {x: -10.3, z: 26}, pE1: {x: 10.3, z: 8.5}, pE2: {x: 10.3, z: 19.75}, bC: {x: 0, z: 37.5}},
  calles: [['rot', 'avO'], ['avO', 'L'], ['rot', 'c6'], ['c6', 'c12'], ['c12', 'c19'], ['c19', 'c25'], ['c25', 'sapo'], ['sapo', 'bC'], ['bC', 'L'],
    ['huorn', 'c12'], ['huorn', 'pO1'], ['pO1', 'L'], ['warg', 'c25'], ['warg', 'pO2'], ['pO2', 'L'], ['crebain', 'c6'], ['crebain', 'pE1'], ['crebain', 'rot'], ['pE1', 'L'], ['troll', 'c19'], ['troll', 'pE2'], ['pE2', 'L']],
};
function ponCiudad() {
  MAPA = {ancho: 34, largo: 58}; SIM = gira; EJE = {x: 0, z: -1}; PIT = {x: -28, z: -2}; PIT2 = gira(PIT);
  const A = CIU.carril; CARRILES = [A, A.map(gira).reverse()];
  const R = CIU.base; BASES = [R, {fuente: gira(R.fuente), nexo: gira(R.nexo), torre: gira(R.torre)}];
  const C = CIU.campos; CAMPOS = [...C, ...C.map((c) => ({...c, ...gira(c)})), {x: PIT.x, z: PIT.z, tipo: 'uruk', n: 1}, {x: PIT2.x, z: PIT2.z, tipo: 'draco', n: 1}, {x: 0, z: 0, tipo: 'nutria', n: 1}];
  PLANTAS = [...CIU.plantas, ...CIU.plantas.map((q) => ({...q, ...gira(q)}))];
  ORILLA = [];
  RECTS = [...CIU.bloques, ...CIU.bloques.map((b) => [-b[2], -b[3], -b[0], -b[1]])];
  /* 23/11 (Pack 63 WORK): los muros de los fosos de Nasor y del lagarto (franja de 1,5 m al fondo y a los lados, como los modelos); el 5.º número
     marca que no son manzanas (no llevan edificios, zócalo ni suelo de acera) */
  const F = PIT, fo = [[F.x - 6, F.z - 10, F.x - 4.5, F.z + 10], [F.x - 6, F.z + 8.5, F.x + 6, F.z + 10], [F.x - 6, F.z - 10, F.x + 6, F.z - 8.5]];
  for (const r of fo) RECTS.push([...r, 1], [-r[2], -r[3], -r[0], -r[1], 1]);
}
/* empuja fuera de las manzanas (por el lado más corto) */
function chocaRects(u, m) {
  for (let i = 0; i < RECTS.length; i++) {const r = RECTS[i];
    if (u.x <= r[0] - m || u.x >= r[2] + m || u.z <= r[1] - m || u.z >= r[3] + m) continue;
    const a = u.x - (r[0] - m), b = r[2] + m - u.x, c = u.z - (r[1] - m), d = r[3] + m - u.z, k = Math.min(a, b, c, d);
    if (k === a) u.x = r[0] - m; else if (k === b) u.x = r[2] + m; else if (k === c) u.z = r[1] - m; else u.z = r[3] + m;}
}
/* ¿cruza una manzana el segmento a-b? (con margen) — también los núcleos y las torres de las bases, que están en medio del paso */
function cortaRects(a, b, m) {
  for (const B of BASES) for (let j = 0; j < 2; j++) {const q = j ? B.torre : B.nexo, r = j ? 1.9 : 2.4; if (distSeg(q.x, q.z, a, b) < r + m + 0.2 && Math.hypot(a.x - q.x, a.z - q.z) > r + 0.3) return true;}
  const dx = b.x - a.x, dz = b.z - a.z;
  for (let i = 0; i < RECTS.length; i++) {const r = RECTS[i]; let t0 = 0, t1 = 1, fuera = false;
    for (let k = 0; k < 4 && !fuera; k++) {const p = k === 0 ? -dx : k === 1 ? dx : k === 2 ? -dz : dz, q = k === 0 ? a.x - (r[0] - m) : k === 1 ? r[2] + m - a.x : k === 2 ? a.z - (r[1] - m) : r[3] + m - a.z;
      if (p === 0) {if (q < 0) fuera = true;} else {const t = q / p; if (p < 0) {if (t > t1) fuera = true; else if (t > t0) t0 = t;} else {if (t < t0) fuera = true; else if (t < t1) t1 = t;}}}
    if (!fuera && t0 <= t1) return true;}
  return false;
}
function navCiudad() {
  const nodos = [], aristas = [], idx = new Map(), add = (p, extra) => {nodos.push({x: p.x, z: p.z, ...extra}); return nodos.length - 1;};
  const ruta = CARRILES.map(() => []);
  CARRILES.forEach((L, l) => L.forEach((p, i) => {const k = p.x + ',' + p.z; if (!idx.has(k)) idx.set(k, add(p, {carril: true})); ruta[l].push(idx.get(k));}));
  for (const r of ruta) for (let i = 1; i < r.length; i++) aristas.push([r[i - 1], r[i]]);
  const camp = CAMPOS.map((c) => add(c, {campo: true}));
  const d = (a, b) => Math.hypot(nodos[a].x - nodos[b].x, nodos[a].z - nodos[b].z);
  /* puerta a la autopista: el punto más cercano del carril, metido en él */
  const aLinea = (c) => {let m = null; CARRILES.forEach((L) => {for (let i = 1; i < L.length; i++) {const a = L[i - 1], b = L[i], vx = b.x - a.x, vz = b.z - a.z, t = Math.max(0, Math.min(1, ((nodos[c].x - a.x) * vx + (nodos[c].z - a.z) * vz) / (vx * vx + vz * vz))), x = a.x + vx * t, z = a.z + vz * t, dd = Math.hypot(nodos[c].x - x, nodos[c].z - z); if (!m || dd < m.d) m = {d: dd, x, z, a: idx.get(a.x + ',' + a.z), b: idx.get(b.x + ',' + b.z)};}}); const n = add({x: m.x, z: m.z}, {carril: true, puerta: true}); aristas.push([m.a, n], [n, m.b], [c, n]);};
  for (const s of [0, 1]) {
    const T = s ? gira : (p) => p, mio = new Map();
    for (const k in CIU.nodos) {const p = T(CIU.nodos[k]), key = p.x + ',' + p.z; if (!idx.has(key)) idx.set(key, add(p, {})); mio.set(k, idx.get(key));}
    CIU.campos.forEach((c, i) => mio.set(c.tipo, camp[i + s * CIU.campos.length]));
    for (const [a, b] of CIU.calles) {const ia = mio.get(a); if (b === 'L') {aLinea(ia); continue;} const ib = mio.get(b); if (!aristas.some(([x, y]) => (x === ia && y === ib) || (x === ib && y === ia))) aristas.push([ia, ib]);}
  }
  const iU = camp[CAMPOS.findIndex((c) => c.tipo === 'uruk')], iD = camp[CAMPOS.findIndex((c) => c.tipo === 'draco')], iN = camp[CAMPOS.findIndex((c) => c.tipo === 'nutria')];
  aLinea(iU); aLinea(iD); aristas.push([iN, idx.get('0,0')]);
  /* de la fuente a la autopista rodeando el núcleo (está en medio): dos pasos a los lados */
  for (const b of BASES) {const p = CARRILES[0][b === BASES[0] ? 0 : CARRILES[0].length - 1], f = add(b.fuente, {}), n = idx.get(p.x + ',' + p.z);
    for (const sg of [1, -1]) {const l = add({x: b.nexo.x + sg * 4.3, z: b.nexo.z}, {}); aristas.push([f, l], [l, n]);}}
  const vec = nodos.map(() => []); for (const [a, b] of aristas) {vec[a].push(b); vec[b].push(a);}
  return {nodos, aristas, vec, d};
}
