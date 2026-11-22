const ruta = process.argv[2] || '/home/claude/la-otra-comunidad/sim_ap.js';
const {creaSim} = await import(ruta);
let tot = {muertesB: 0, atasco: 0, pasos: 0, fin: []};
for (const [a,b,c,d] of [['elfo','hobbit','orco','enano'],['gandalf','rohan','gollum','elfo'],['enano','orco','hobbit','gandalf']]) {
  const sim = creaSim(); sim.montaMapa('2v2');
  sim.nuevaPartida([{slot:0,nombre:'A',heroe:a,bot:true},{slot:1,nombre:'B',heroe:b,bot:true},{slot:2,nombre:'C',heroe:c,bot:true},{slot:3,nombre:'D',heroe:d,bot:true}], '2v2');
  const last = {}, quieto = {}; const vivosB = new Set();
  for (let i = 0; i < 30*900 && sim.S.fin < 0; i++) {
    sim.paso(1/30);
    for (const u of sim.S.u) {
      if (u.k === 'j') { if (u.vida > 0) vivosB.add(u); }
      if (u.k !== 'h' || u.muerto > 0 || u.vida <= 0) continue;
      const p = last[u.id]; last[u.id] = [u.x, u.z];
      if (p && Math.hypot(u.x-p[0], u.z-p[1]) < 0.002 && !(u.at > 0)) quieto[u.id] = (quieto[u.id]||0)+1; else quieto[u.id] = 0;
      if (quieto[u.id] === 150 && Math.min(Math.hypot(u.x,u.z+54),Math.hypot(u.x,u.z-54)) > 12) {tot.atasco++; (tot.donde = tot.donde || []).push(u.tipo+'@'+u.x.toFixed(0)+','+u.z.toFixed(0)+' t'+Math.round(sim.S.t));}
      tot.pasos++;
    }
  }
  const muertas = [...vivosB].filter(u => u.vida <= 0 || !sim.S.u.includes(u)).length;
  tot.muertesB += muertas; tot.fin.push(Math.round(sim.S.t) + 's fin ' + sim.S.fin + ' bestias ' + muertas);
}
console.log(tot);
