import {creaSim} from '/home/claude/la-otra-comunidad/sim_ap.js';
import {performance} from 'node:perf_hooks';
const sim = creaSim(); sim.montaMapa('2v2');
sim.nuevaPartida([{slot: 0, nombre: 'A', heroe: 'visor'}, {slot: 1, nombre: 'B', heroe: 'hobbit'}, {slot: 2, nombre: 'C', heroe: 'orco'}, {slot: 3, nombre: 'D', heroe: 'enano'}].map(j => ({...j, bot: true})), '2v2');
const ts = [];
for (let i = 0; i < 30 * 900 && sim.S.fin < 0; i++) {const a = performance.now(); sim.paso(1 / 30); ts.push([performance.now() - a, sim.S.t, sim.S.u.length]);}
const d = ts.map(x => x[0]).sort((a, b) => a - b), q = f => d[Math.floor(f * d.length)].toFixed(2);
console.log('pasos', d.length, 'mediana', q(.5), 'p99', q(.99), 'p999', q(.999), 'max', d[d.length - 1].toFixed(1));
console.log('picos >4ms:', ts.filter(x => x[0] > 4).slice(0, 30).map(x => x[0].toFixed(1) + '@' + x[1].toFixed(1) + 's/' + x[2]).join(' '));
