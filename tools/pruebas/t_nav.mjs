// Comprueba la ciudad de A-6: calles de los bots sin atravesar manzanas, nada dentro de una manzana y el resto del mapa alcanzable.
// uso: node tools/pruebas/t_nav.mjs
import fs from 'fs';
let src = fs.readFileSync('/home/claude/la-otra-comunidad/sim_ap.js', 'utf8').replace('return {montaMapa, nuevaPartida, paso,', 'return {get NAV() {return NAV;}, get RECTS() {return RECTS;}, cortaRects, lineaLibre, CAMPOS: () => CAMPOS, PLANTAS: () => PLANTAS, HIERBAS: () => HIERBAS, BASES: () => BASES, montaMapa, nuevaPartida, paso,');
fs.writeFileSync('/tmp/sim_ap_t.mjs', src);
const {creaSim} = await import('/tmp/sim_ap_t.mjs?' + Date.now());
const sim = creaSim(); sim.montaMapa('2v2');
const N = sim.NAV, R = sim.RECTS; let mal = 0;
for (const [a, b] of N.aristas) {const A = N.nodos[a], B = N.nodos[b]; if (sim.cortaRects(A, B, 0.25)) {mal++; console.log('calle cortada', A.x.toFixed(1), A.z.toFixed(1), '->', B.x.toFixed(1), B.z.toFixed(1));}}
const dentro = (p, m = 0) => R.some((r) => p.x > r[0] - m && p.x < r[2] + m && p.z > r[1] - m && p.z < r[3] + m);
for (const n of N.nodos) if (dentro(n, 0.3)) {mal++; console.log('nodo en manzana', n.x, n.z);}
for (const c of sim.CAMPOS()) if (dentro(c, 1.5)) {mal++; console.log('campo pegado a manzana', c.tipo, c.x, c.z);}
for (const q of sim.PLANTAS()) if (dentro(q, 0.8)) {mal++; console.log('planta en manzana', q.tipo, q.x, q.z);}
for (const q of sim.HIERBAS()) if (dentro(q, 0)) console.log('(hierba toca manzana)', q.x, q.z);
// conectividad del grafo
const vis = new Set([0]), st = [0]; while (st.length) {const u = st.pop(); for (const v of N.vec[u]) if (!vis.has(v)) {vis.add(v); st.push(v);}}
if (vis.size !== N.nodos.length) {mal++; console.log('grafo partido', vis.size, '/', N.nodos.length);}
console.log('nodos', N.nodos.length, 'calles', N.aristas.length, 'manzanas', R.length, mal ? 'FALLOS ' + mal : 'todo bien');
