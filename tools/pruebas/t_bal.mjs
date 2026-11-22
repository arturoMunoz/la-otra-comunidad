// Equilibrio entre héroes de A-6: duelos 1v1 entre bots, cada pareja en los dos lados. node tools/pruebas/t_bal.mjs [veces] [heroes,coma] [sim]
// Saca: % de victorias por héroe, derribos por partida, duración media y la matriz.
const N = +(process.argv[2] || 2), SIM = process.argv[4] || '/home/claude/la-otra-comunidad/sim_ap.js';
const {creaSim} = await import(SIM);
const H = (process.argv[3] || 'enano,gandalf,orco,elfo,hobbit,gollum,visor,rohan').split(',');
const gan = {}, jug = {}, der = {}, mue = {}, M = {}, dur = [];
for (const h of H) {gan[h] = 0; jug[h] = 0; der[h] = 0; mue[h] = 0; M[h] = {};}
for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) for (let k = 0; k < N; k++) for (const [a, b] of [[H[i], H[j]], [H[j], H[i]]]) {
  const sim = creaSim(); sim.montaMapa('1v1');
  sim.nuevaPartida([{slot: 0, nombre: 'A', heroe: a, bot: true}, {slot: 1, nombre: 'B', heroe: b, bot: true}], '1v1');
  for (let s = 0; s < 30 * 1500 && sim.S.fin < 0; s++) {sim.paso(1 / 30); sim.S.ev.length = 0;}
  const hs = sim.S.u.filter((u) => u.k === 'h'), ha = hs.find((u) => u.eq === 0), hb = hs.find((u) => u.eq === 1);
  jug[a]++; jug[b]++; dur.push(sim.S.t);
  der[a] += ha.k_ ?? ha.kills ?? 0; der[b] += hb.k_ ?? hb.kills ?? 0;
  const w = sim.S.fin === 0 ? a : sim.S.fin === 1 ? b : null; if (w) {gan[w]++; M[w][w === a ? b : a] = (M[w][w === a ? b : a] || 0) + 1;}
}
const med = dur.reduce((x, y) => x + y, 0) / dur.length;
console.log('duración media', Math.round(med / 6) / 10, 'min · sin acabar', dur.filter((t) => t >= 1499).length);
for (const h of H.sort((x, y) => gan[y] / jug[y] - gan[x] / jug[x])) console.log(h.padEnd(8), (100 * gan[h] / jug[h]).toFixed(0).padStart(3) + ' %', ' derribos/partida', (der[h] / jug[h]).toFixed(1), ' ganó a:', Object.entries(M[h]).map(([k, v]) => k + '×' + v).join(' '));
