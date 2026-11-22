// Bots que esquivan: cuántas veces de 200 se libra un bot de la Q de Birdie a 9 m (tiene que ser bastantes, no todas). node tools/pruebas/t_esquiva.mjs
const {creaSim} = await import(process.argv[2] || '/home/claude/la-otra-comunidad/sim_ap.js');
let libra = 0, da = 0, esqN = 0; const N = 200;
for (let n = 0; n < N; n++) {
  const sim = creaSim(); sim.montaMapa('1v1');
  sim.nuevaPartida([{slot: 0, nombre: 'A', heroe: 'hobbit'}, {slot: 1, nombre: 'B', heroe: 'enano', bot: true}], '1v1');
  const S = sim.S, [a, b] = S.u.filter((u) => u.k === 'h'); for (const u of S.u) if (u.k === 's' || u.k === 't') u.vida = 0;
  const D = +(process.env.D || 9); a.x = 0; a.z = -1 - D; b.x = 0; b.z = -1; a.rk.q = 1; a.mana = 999; a.cd.q = 0; S.t = 30; const v0 = b.vida;
  sim.aplicaMando(a, {t: 'hab', k: 'q', x: a.x, z: a.z, dx: 0, dz: 1, px: 0, pz: 0});
  let esq = 0; for (let i = 0; i < 40; i++) {sim.paso(1 / 30); if (b.esq) esq = 1;} esqN += esq;
  if (b.vida < v0 - 1) da++; else libra++;
}
console.log("esquiva intentada", esqN, "· de", N, 'disparos: le dan', da, '· se libra', libra, '(' + Math.round(libra / N * 100) + ' %)');
