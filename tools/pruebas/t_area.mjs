// Prueba de las habilidades de área, cono y salto de A-6: el enemigo a varias distancias, ¿le da? node tools/pruebas/t_area.mjs [sim]
const ruta = process.argv[2] || '/home/claude/la-otra-comunidad/sim_ap.js';
const {creaSim} = await import(ruta);
const CASOS = [['enano', 'r'], ['orco', 'q'], ['rohan', 'e'], ['enano', 'e'], ['gollum', 'q'], ['gandalf', 'e'], ['elfo', 'r'], ['enano', 'q'], ['orco', 'w'], ['hobbit', 'e'], ['visor', 'e']];
for (const [heroe, k] of CASOS) {
  const fila = [];
  for (const d of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const sim = creaSim(); sim.montaMapa('1v1');
    sim.nuevaPartida([{slot: 0, nombre: 'A', heroe}, {slot: 1, nombre: 'B', heroe: 'elfo'}], '1v1');
    const S = sim.S, [a, b] = S.u.filter((u) => u.k === 'h');
    for (const u of S.u) if (u.k === 's') u.vida = 0;
    a.x = 0; a.z = -6; b.x = 0; b.z = -6 + d; a.nivel = b.nivel = 9; a.rk[k] = 1; a.mana = 999; a.cd[k] = 0; S.t = 30;
    const H = sim.S && null;
    const v0 = b.vida;
    sim.aplicaMando(a, {t: 'hab', k, x: a.x, z: a.z, dx: 0, dz: 1, px: b.x, pz: b.z});
    for (let i = 0; i < 30 * 2; i++) {b.x = 0; b.z = -6 + d; sim.paso(1 / 30);}
    fila.push(d + 'm:' + (b.vida < v0 - 1 ? 'SÍ' : 'no'));
  }
  console.log(heroe.padEnd(8), k, fila.join(' '));
}
