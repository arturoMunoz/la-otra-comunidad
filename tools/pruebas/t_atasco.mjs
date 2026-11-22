// Héroes bot que quieren andar y no se mueven (2 s seguidos) en la Batalla 2v2 de A-6: node tools/pruebas/t_atasco.mjs [partidas]
const {creaSim} = await import('/home/claude/la-otra-comunidad/sim_ap.js');
const P = +(process.argv[2] || 4), L = [['elfo','hobbit','orco','enano'],['gandalf','rohan','gollum','elfo'],['enano','orco','hobbit','gandalf'],['visor','elfo','rohan','orco']];
const donde = {}; let tot = 0, fins = [];
for (let g = 0; g < P; g++) {
  const sim = creaSim(); sim.montaMapa('2v2'); sim.nuevaPartida(L[g % 4].map((h, i) => ({slot: i, nombre: 'B' + i, heroe: h, bot: true})), '2v2');
  const ult = {};
  for (let i = 0; i < 30 * 1100 && sim.S.fin < 0; i++) {sim.paso(1 / 30); sim.S.ev.length = 0;
    if (i % 60) continue;
    for (const h of sim.S.u) {if (h.k !== 'h' || h.muerto || h.vida <= 0) continue; const q = ult[h.id]; ult[h.id] = {x: h.x, z: h.z};
      const quiere = Math.hypot(h.mx || 0, h.mz || 0) > 0.3;
      if (q && quiere && Math.hypot(h.x - q.x, h.z - q.z) < 0.15) {tot++; const k = Math.round(h.x / 2) * 2 + ',' + Math.round(h.z / 2) * 2; donde[k] = (donde[k] || 0) + 1;}}
  }
  fins.push(Math.round(sim.S.t) + 's/' + sim.S.fin);
}
console.log('atascos (2 s)', tot, 'partidas', fins.join(' '));
console.log(Object.entries(donde).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => k + ' ×' + v).join('  '));
