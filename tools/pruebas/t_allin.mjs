// Peleas «a muerte» entre dos héroes de A-6 al mismo nivel y con el mismo oro, sin súbditos ni torres: mide la fuerza del kit
// en un todo-o-nada (los bots no huyen y van a por el otro). node tools/pruebas/t_allin.mjs [heroes,coma] [niveles,coma] [veces]
import fs from 'fs';
let src = fs.readFileSync('/home/claude/la-otra-comunidad/sim_ap.js', 'utf8');
const rep = (a, b) => {if (!src.includes(a)) throw new Error('no está: ' + a.slice(0, 60)); src = src.replace(a, b);};
rep('if (pv < 0.28 || h.vuelve) {', 'if (!globalThis.ALLIN && (pv < 0.28 || h.vuelve)) {');
rep('if (heroeEn && dist(h, heroeEn) < alcEnt && (', 'if (heroeEn && (globalThis.ALLIN || dist(h, heroeEn) < alcEnt) && (globalThis.ALLIN || ');
rep('return {montaMapa, nuevaPartida, paso,', 'return {compra, autoSube, stats, PLAN_BOT, OBJ, precio, montaMapa, nuevaPartida, paso,');
fs.writeFileSync('/tmp/sim_allin.mjs', src);
globalThis.ALLIN = true;
const {creaSim} = await import('/tmp/sim_allin.mjs?' + Date.now());
const H = (process.argv[2] || 'enano,gandalf,orco,elfo,hobbit,gollum,visor,rohan').split(','), NIV = (process.argv[3] || '3,6,9').split(',').map(Number), V = +(process.argv[4] || 2);
const ORO = {1: 650, 2: 900, 3: 1300, 4: 1800, 5: 2400, 6: 3100, 7: 3900, 8: 4800, 9: 5800};
const pelea = (a, b, L, sep) => {
  const sim = creaSim(); sim.montaMapa('1v1'); sim.nuevaPartida([{slot: 0, nombre: 'A', heroe: a, bot: true}, {slot: 1, nombre: 'B', heroe: b, bot: true}], '1v1');
  const S = sim.S, hs = S.u.filter((u) => u.k === 'h');
  for (const h of hs) {
    h.nivel = L; h.pts = L; h.xp = 0; sim.autoSube(h); h.oro = ORO[L];
    for (const id of sim.PLAN_BOT[h.tipo] || []) {if (sim.compra(h, id) !== '') break;}
    const st = sim.stats(h); h.vida = st.vida; h.mana = st.mana;
  }
  S.u = S.u.filter((u) => u.k === 'h'); S.porId && S.porId.clear && S.porId.clear();
  hs[0].x = -0.1; hs[0].z = sep / 2; hs[1].x = 0.1; hs[1].z = -sep / 2;
  let t = 0; for (; t < 30 * 40; t++) {S.u = S.u.filter((u) => u.k === 'h' || u.k === 'p'); sim.paso(1 / 30); S.ev.length = 0; if (hs.some((h) => h.muerto)) break;}
  const [A, B] = hs, w = A.muerto && !B.muerto ? 1 : B.muerto && !A.muerto ? 0 : -1;
  return {w, t: t / 30, resto: w >= 0 ? hs[w].vida / sim.stats(hs[w]).vida : 0};
};
for (const sep of [3, 7]) for (const L of NIV) {
  const g = {}, j = {}, M = {};
  for (const h of H) {g[h] = 0; j[h] = 0; M[h] = [];}
  for (let i = 0; i < H.length; i++) for (let k = i + 1; k < H.length; k++) for (let v = 0; v < V; v++) for (const [a, b] of [[H[i], H[k]], [H[k], H[i]]]) {
    const r = pelea(a, b, L, sep); j[a]++; j[b]++;
    if (r.w === 0) {g[a]++; M[a].push(b);} else if (r.w === 1) {g[b]++; M[b].push(a);} else {g[a] += 0.5; g[b] += 0.5;}
  }
  console.log(`— nivel ${L}, empiezan a ${sep} m —`);
  for (const h of [...H].sort((x, y) => g[y] / j[y] - g[x] / j[x])) console.log('  ' + h.padEnd(8), (100 * g[h] / j[h]).toFixed(0).padStart(3) + ' %');
}
