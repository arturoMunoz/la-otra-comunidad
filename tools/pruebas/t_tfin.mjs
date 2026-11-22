// El disparo en línea se para donde da (evento tfin) y el cono da a quien lo toca con el cuerpo: node tools/pruebas/t_tfin.mjs
const {creaSim} = await import(process.argv[2] || '/home/claude/la-otra-comunidad/sim_ap.js');
const prueba = (heroe, k, bx, bz) => {
  const sim = creaSim(); sim.montaMapa('1v1');
  sim.nuevaPartida([{slot: 0, nombre: 'A', heroe}, {slot: 1, nombre: 'B', heroe: 'enano'}], '1v1');
  const S = sim.S, [a, b] = S.u.filter((u) => u.k === 'h'); for (const u of S.u) if (u.k === 's') u.vida = 0;
  a.x = 0; a.z = -6; b.x = bx; b.z = -6 + bz; a.rk[k] = 1; a.mana = 999; a.cd[k] = 0; S.t = 30; const v0 = b.vida, ev = [];
  sim.aplicaMando(a, {t: 'hab', k, x: a.x, z: a.z, dx: 0, dz: 1, px: 0, pz: 0});
  for (let i = 0; i < 30; i++) {b.x = bx; b.z = -6 + bz; sim.paso(1 / 30); ev.push(...sim.foto().ev.filter((e) => e[0] === 'tiro' || e[0] === 'tfin'));}
  return {da: b.vida < v0 - 1, ev: ev.map((e) => e.slice(0, 6).map((x) => typeof x === 'number' ? +x.toFixed(2) : x).join(' '))};
};
let mal = 0;
const r1 = prueba('hobbit', 'q', 0, 5); console.log('Birdie Q, rival a 5 m en medio:', r1.da ? 'le da' : 'NO', '|', r1.ev.join(' || ')); if (!r1.da || !r1.ev.some((e) => e.startsWith('tfin'))) mal++;
const r2 = prueba('hobbit', 'q', 1.4, 5); console.log('Birdie Q, rival a 1,4 m del eje (0,6 + 0,75 = 1,35):', r2.da ? 'le da (MAL)' : 'no le da', '|', r2.ev.join(' || ')); if (r2.da) mal++;
const r3 = prueba('hobbit', 'q', 1.3, 5); console.log('Birdie Q, rival a 1,3 m del eje:', r3.da ? 'le da' : 'NO (MAL)'); if (!r3.da) mal++;
// cono de Grub (W, 3,4 m y 1,2 rad): rival a 2 m de distancia y 40° fuera del eje: su centro está fuera del ángulo (34°) pero su cuerpo lo toca
const a40 = 40 * Math.PI / 180, r4 = prueba('orco', 'w', 2 * Math.sin(a40), 2 * Math.cos(a40)); console.log('Grub W, rival a 40° (cuerpo dentro, centro fuera):', r4.da ? 'le da' : 'NO (MAL)'); if (!r4.da) mal++;
const a70 = 70 * Math.PI / 180, r5 = prueba('orco', 'w', 2 * Math.sin(a70), 2 * Math.cos(a70)); console.log('Grub W, rival a 70° (fuera):', r5.da ? 'le da (MAL)' : 'no le da'); if (r5.da) mal++;
console.log('MAL:', mal);
