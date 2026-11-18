import {creaSim} from '/home/claude/la-otra-comunidad/sim_ap.js';
const sim = creaSim(); sim.montaMapa('2v2');
sim.nuevaPartida([{slot: 0, nombre: 'A', heroe: 'elfo', bot: true}, {slot: 1, nombre: 'B', heroe: 'hobbit', bot: true}, {slot: 2, nombre: 'C', heroe: 'orco', bot: true}, {slot: 3, nombre: 'D', heroe: 'enano', bot: true}], '2v2');
const t0 = Date.now(); const avisos = new Set(); let muertesJ = {};
for (let i = 0; i < 30 * 1500 && sim.S.fin < 0; i++) {sim.paso(1 / 30); for (const e of sim.S.ev || []) if (e[0] === 'aviso' || e[0] === 'baja') avisos.add(String(e[2] || e[3]).slice(0, 70));}
console.log('t', Math.round(sim.S.t), 'fin', sim.S.fin, 'ms/paso', ((Date.now() - t0) / (sim.S.t * 30)).toFixed(2));
console.log([...avisos].filter(a=>/Nasor|lagarto|rata|toro|coloso|Castigo|ALMA/i.test(a)).slice(0,20));
