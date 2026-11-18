import {creaSim} from '/home/claude/la-otra-comunidad/sim_ap.js';
for (const modo of ['1v1', '2v2']) {
const sim = creaSim(); sim.montaMapa(modo);
const js = modo === '1v1' ? [{slot: 0, nombre: 'A', heroe: 'elfo', bot: true}, {slot: 1, nombre: 'B', heroe: 'enano', bot: true}] : [0,1,2,3].map(s => ({slot: s, nombre: 'J' + s, heroe: ['visor','hobbit','orco','enano'][s], bot: true}));
sim.nuevaPartida(js, modo); let placas = 0, oro = 0, jungla = 0, nasor = 0;
for (let i = 0; i < 30 * 900 && sim.S.fin < 0; i++) {sim.paso(1 / 30); for (const e of sim.S.ev) {if (e[0] === 'aviso' && String(e[2]).startsWith('Placa')) {placas++; oro += +String(e[2]).match(/\+(\d+)/)[1];} if (e[0] === 'baja' && /Nasor|Uruk/.test(e[3])) nasor++;} sim.S.ev.length = 0;}
const tor = sim.S.u.filter(u => u.k === 't' && u.n === 1).map(t => t.placas);
console.log(modo, 'fin', sim.S.fin, 't', (sim.S.t / 60).toFixed(1), 'min | avisos de placa', placas, 'oro', oro, '| placas que quedan', tor, '| cs héroes', sim.S.u.filter(u => u.k === 'h').map(h => h.cs + '/' + Math.round(h.oro)));
}
