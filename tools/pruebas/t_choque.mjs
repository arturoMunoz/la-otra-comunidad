const f = process.argv[2] || '/home/claude/la-otra-comunidad/sim_ap.js';
const {creaSim} = await import(f);
const tipos = ['enano','gandalf','orco','elfo','hobbit','gollum','rohan'];
for (let k = 0; k < 6; k++) {
  const sim = creaSim(); sim.montaMapa('1v1');
  const a = tipos[k % 7], b = tipos[(k + 3) % 7];
  sim.nuevaPartida([{slot:0,nombre:'A',heroe:a,bot:true},{slot:1,nombre:'B',heroe:b,bot:true}], '1v1'); for (const u of sim.S.u) if (u.k === 'h') u.bot = true;
  let min = 99, cerca = 0, n = 0;
  for (let i = 0; i < 30 * 60 * 25 && sim.S.fin < 0; i++) {
    sim.paso(1/30);
    const hs = sim.S.u.filter((u) => u.k === 'h' && !u.muerto);
    if (hs.length === 2 && !hs[0].dash && !hs[1].dash) {const d = Math.hypot(hs[0].x-hs[1].x, hs[0].z-hs[1].z); n++; if (d < min) min = d; if (d < 1.0) cerca++;}
  }
  console.log(a, 'vs', b, 'fin', sim.S.fin, 't', (sim.S.t/60).toFixed(1)+' min', 'dist mín', min.toFixed(2), 'pasos <1,0 m', cerca, '/', n);
}
