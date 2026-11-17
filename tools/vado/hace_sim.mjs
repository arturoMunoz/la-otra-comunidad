// Saca la simulación de La Brecha (lo que va entre /*SIM{*/ y /*}SIM*/ en public/batalla/juego.js)
// y la envuelve en creaSim() para que el servidor (worker.js, Durable Object Sala) calcule la partida.
// Uso: node tools/vado/hace_sim.mjs   (se lanza solo antes de subir; el resultado es sim_vado.js en la raíz)
import fs from 'node:fs';
const raiz = new URL('../../', import.meta.url);
// node tools/vado/hace_sim.mjs            → sim_vado.js (La Brecha, de juego.js)
// node tools/vado/hace_sim.mjs autopista  → sim_ap.js (A-6, de autopista.js)
const AP = process.argv[2] === 'autopista';
const js = fs.readFileSync(new URL(AP ? 'public/batalla/autopista.js' : 'public/batalla/juego.js', raiz), 'utf8');
const trozos = [...js.matchAll(/\/\*SIM\{\*\/([\s\S]*?)\/\*\}SIM\*\//g)].map((m) => m[1]);
if (trozos.length < 2) throw new Error('faltan las marcas SIM');
const pre = `let S = null, VISTA = new Map(), YO = null, MI_EQ = 0, ESTADO = 'juego';
  const EN_SERVIDOR = true, INTERP_MS = 100, NET = {online: true}, hechElegido = 'f';
  const document = {getElementById: () => null}, localStorage = {getItem: () => null, setItem() {}};
  const window = {}; function efectoLocal() {}`;
const out = `// GENERADO por tools/vado/hace_sim.mjs a partir de public/batalla/juego.js: no tocar a mano.
export function creaSim() {
  ${pre}
${trozos.join('\n')}
  /* monta el mapa como en el móvil: trazado y árboles con choque (misma semilla que construyeMapa) */
  function montaMapa(modo) {ponMapa(modo); const semilla = {v: 7}; const al = () => {semilla.v = (semilla.v * 16807) % 2147483647; return semilla.v / 2147483647;}; plantaBosque(al, (n, x, z, s, choque) => {al(); if (choque) ponArbolChoque(x, z, 0.75 * s);});}
  return {montaMapa, nuevaPartida, paso, foto, aplicaMando, get S() {return S;}, set S(v) {S = v;}};
}
`;
const nom = AP ? 'sim_ap.js' : 'sim_vado.js';
fs.writeFileSync(new URL(nom, raiz), out);
console.log(nom, out.length, 'bytes,', trozos.length, 'trozos');
