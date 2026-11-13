import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as clonar} from 'three/addons/utils/SkeletonUtils.js';
import {creaGraficos} from './grafico.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/* ============ El Abismo de Helm · motor (v3) ============
   Coordenadas: norte = -Z (explanada y muro del Bajo en z≈-20), sur = +Z (puerta en z≈37).
   Todo choca en el plano XZ con círculos (hitboxes); la altura solo es visual.
   Golpes: héroes a 0,25 s, enemigos a 0,35 s, con aviso rojo en los golpes fuertes. */

const $ = (id) => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const azar = (l) => l[(Math.random() * l.length) | 0];
/* tres toques seguidos en el marcador de arriba: muestra u oculta los fotogramas por segundo */
{let tq = 0, tqT = 0; document.addEventListener('pointerdown', (ev) => {const hr = document.getElementById('hud').getBoundingClientRect(); if (ev.clientY > hr.bottom || ev.clientY < hr.top) return; const t = performance.now(); tq = t - tqT < 450 ? tq + 1 : 1; tqT = t; if (tq >= 3) {tq = 0; const f = document.getElementById('fps'); f.style.display = f.style.display === 'none' ? 'block' : 'none';}}, true);}
const DURO = 1.9, MAX_ENEMIGOS = 42;
const DURACION = 360, T_DESAGUE = 150, T_JEFE = 300;
/* la noche en 5 oleadas; entre una y otra, tregua para reparar el muro */
/* oleadas: la tregua (15 s) empieza cuando cae el último enemigo de la oleada */
const NOLAS = 5, TREGUA_S = 15, TAM_OLA = [0, 16, 22, 28, 34, 42];
const enTregua = () => (J && J.tregua) ? [J.tregua.ini, J.tregua.fin] : null;
/* «tiempo de batalla» equivalente, para que la dificultad suba con las oleadas y no con el reloj */
const tE = () => J ? Math.max(0, (J.ola - 1) * 72 + Math.min(70, J.t - (J.olaIni || 0))) : 0;
const COSTE = {reparar: 10, reconstruir: 30, reforzar: 25};
const PATIO = {x0: -17.2, x1: 17.2, z0: -15.5, z1: 35.6};
const Z_MURO_FUERA = -22.3, Z_MURO_ARRIBA = -19.95, Y_MURO = 7.35;
const zSuelo = PATIO.z0 + 0.3;
/* en el adarve: franja por la que se mueve el héroe mientras defiende arriba */
const ADARVE = {x0: -16.6, x1: 16.6, z0: -20.6, z1: -18.2};
const LX0 = () => J && J.enMuro ? ADARVE.x0 : PATIO.x0, LX1 = () => J && J.enMuro ? ADARVE.x1 : PATIO.x1;
const LZ0 = () => J && J.enMuro ? ADARVE.z0 : PATIO.z0, LZ1 = () => J && J.enMuro ? ADARVE.z1 : PATIO.z1;
const enFranja = (z) => J && J.enMuro && z > -21.6 && z < -17.4;
const BRECHA = {x: 0, z: -15.2};

/* ---------- datos ---------- */
const HEROES = {
  rohan: {nombre: 'Soldado de Rohan', desc: 'Lanza y escudo. Barre lo que tiene delante.', modelo: 'rohan_kk', icono: 'lanza', cuerpo: true, vida: 120, vel: 5.2, dano: 2, alcance: 3.3, arco: 2.3, cadencia: 0.7},
  enano: {nombre: 'Enano de Erebor', desc: 'Hacha pesada. Lento pero aguanta mucho.', modelo: 'enano_kk', icono: 'hacha', cuerpo: true, vida: 170, vel: 4.4, dano: 4, alcance: 2.7, arco: 2.0, cadencia: 1.0},
  elfo: {nombre: 'Arquero elfo', desc: 'Flechas de muy lejos que atraviesan.', modelo: 'elfo_kk', icono: 'arco', cuerpo: false, vida: 85, vel: 5.4, dano: 2, alcance: 13, cadencia: 0.55, proyectil: 'flecha_elfica', velProy: 26, atraviesa: 1, multi: 1},
  hobbit: {nombre: 'Hobbit con honda', desc: 'Rápido y escurridizo. Piedras certeras.', modelo: 'hobbit_kk', icono: 'honda', cuerpo: false, vida: 80, vel: 6.2, dano: 2.4, alcance: 9.5, cadencia: 0.6, proyectil: 'piedra', velProy: 18, atraviesa: 0, multi: 1},
};
const ENEMIGOS = {
  orco: {vida: 3, vel: 3.3, dano: 6, danoPuerta: 1.5, radio: .5, xp: 1, pts: 10, modelo: 'orco'},
  uruk: {vida: 6, vel: 2.7, dano: 10, danoPuerta: 2.5, radio: .6, xp: 2, pts: 20, modelo: 'uruk'},
  berserker: {vida: 8, vel: 4.4, dano: 9, danoPuerta: 35, radio: .6, xp: 3, pts: 30, modelo: 'berserker', correr: true},
  warg: {salta: true, vida: 5, vel: 6.2, dano: 8, danoPuerta: 1.5, radio: .8, xp: 2, pts: 25, modelo: 'warg', correr: true},
  ballestero: {vida: 7, vel: 2.6, dano: 12, danoPuerta: 2, radio: .6, xp: 4, pts: 35, modelo: 'ballestero', distancia: true},
  portaestandarte: {vida: 22, vel: 2.4, dano: 10, danoPuerta: 3, radio: .7, xp: 8, pts: 60, modelo: 'portaestandarte'},
  troll: {vida: 70, vel: 1.7, dano: 28, danoPuerta: 18, radio: 1.4, xp: 25, pts: 200, modelo: 'troll', pesado: true, golpe: 'golpear_suelo'},
  troll_acorazado: {vida: 170, vel: 1.5, dano: 34, danoPuerta: 22, radio: 1.5, xp: 50, pts: 400, modelo: 'troll_acorazado', pesado: true, golpe: 'barrido', armadura: 12},
  uruk_acorazado: {vida: 16, vel: 2.3, dano: 13, danoPuerta: 3, radio: .7, xp: 5, pts: 50, modelo: 'uruk_acorazado', armadura: 5},
  antorchero: {vida: 7, vel: 2.4, dano: 0, danoPuerta: 0, radio: .6, xp: 6, pts: 90, modelo: 'antorchero', correr: true, antorcha: true},
  huargo_jinete: {vida: 9, vel: 5.2, dano: 8, danoPuerta: 2, radio: .8, xp: 4, pts: 45, modelo: 'huargo_jinete', correr: true, distancia: true, salta: true, clipDisparo: 'disparar_montado', tDisparo: 0.4, alcanceDisparo: 11},
  huargo_alfa: {vida: 45, vel: 5.6, dano: 16, danoPuerta: 4, radio: 1.1, xp: 14, pts: 180, modelo: 'huargo_alfa', correr: true},
  dunlendino: {vida: 8, vel: 3.1, dano: 11, danoPuerta: 2.5, radio: .6, xp: 3, pts: 30, modelo: 'q_arquero', correr: true},
  uruk_piquero: {vida: 11, vel: 2.4, dano: 15, danoPuerta: 3, radio: .95, xp: 4, pts: 45, modelo: 'uruk_piquero', armadura: 2},
  orco_arquero: {vida: 4, vel: 2.9, dano: 9, danoPuerta: 1, radio: .5, xp: 3, pts: 35, modelo: 'q_arquero', distancia: true, tDisparo: 0.45, alcanceDisparo: 13},
  chaman_isengard: {vida: 16, vel: 2.2, dano: 16, danoPuerta: 2, radio: .6, xp: 9, pts: 110, modelo: 'q_brujo', distancia: true, clipDisparo: 'invocar', tDisparo: 0.8, alcanceDisparo: 12},
  ariete: {vida: 300, vel: 1.3, dano: 0, danoPuerta: 70, radio: 2.0, xp: 40, pts: 500, modelo: 'ariete', pesado: true, ariete: true, armadura: 8},
  tronco: {vida: 40, vel: 5.4, dano: 0, danoPuerta: 70, radio: 1.8, xp: 20, pts: 400, modelo: 'tronco', tronco: true, marca: true},
  capitan: {vida: 800, vel: 3.0, dano: 30, danoPuerta: 30, radio: 1.1, xp: 125, pts: 2000, modelo: 'capitan', jefe: true, escala: 1.2},
};
/* armas automáticas: 5 niveles y una evolución con su pasiva pareja */
const ARMAS = {
  cuchillos: {clases: ['elfo', 'hobbit'], nombre: 'Cuchillos de Lórien', icono: 'cuchillos', pareja: 'botas', d: ['Lanza un cuchillo al enemigo más cercano.', '+1 cuchillo.', 'Más daño.', '+1 cuchillo y más rápido.', 'Atraviesan.'], evo: 'Tormenta de Lórien: 7 cuchillos que lo atraviesan todo.'},
  antorcha: {nombre: 'Antorchas de Cuernavilla', icono: 'antorcha', pareja: 'corazon', d: ['Una antorcha gira a tu alrededor y quema.', '+1 antorcha.', 'Más daño y más radio.', '+1 antorcha.', '+1 antorcha y más daño.'], evo: 'Llama élfica: 6 antorchas azules que abrasan.'},
  cuerno: {clases: ['rohan'], nombre: 'Cuerno de Helm', icono: 'cuerno', pareja: 'escudo', d: ['Una onda que daña y aparta a los cercanos.', 'Más radio.', 'Más daño.', 'Más a menudo.', 'Mucho más radio.'], evo: 'El cuerno de Helm Mano de Martillo: onda enorme que aturde.'},
  flecha: {clases: ['elfo'], nombre: 'Flechas de fuego', icono: 'flecha_fuego', pareja: 'estrella', d: ['Una flecha que estalla al impactar.', 'Explosión mayor.', '+1 flecha.', 'Más daño.', '+1 flecha.'], evo: 'Lluvia de fuego: 5 flechas con gran explosión.'},
  martillo: {clases: ['enano'], nombre: 'Martillo enano', icono: 'martillo', pareja: 'lembas', d: ['Lanzas un martillo que vuelve a tu mano.', 'Más daño.', 'Más alcance.', 'Más daño y más rápido.', '+1 martillo.'], evo: 'Martillo de Durin: 3 martillos que lo arrasan todo.'},
  caldero: {nombre: 'Caldero de aceite', icono: 'caldero', pareja: 'gema', d: ['Prende un charco de aceite bajo los enemigos.', 'Charco más grande.', 'Más daño.', 'Más a menudo.', 'Dura más.'], evo: 'Fuego de Orthanc: charcos verdes enormes.'},
};
Object.assign(ARMAS, {
  lanzas: {clases: ['rohan'], nombre: 'Lanzas de los Rohirrim', icono: 'i_lanzas', pareja: 'botas', d: ['Arrojas una lanza que atraviesa en línea.', 'Más daño.', '+1 lanza.', 'Más daño y más a menudo.', '+1 lanza.'], evo: 'Éored: 5 lanzas en abanico que atraviesan todo.'},
  hachas: {clases: ['enano'], nombre: 'Hachas arrojadizas', icono: 'i_hachas', pareja: 'escudo', d: ['Lanzas hachas que giran a tu alrededor.', '+1 hacha.', 'Más daño.', '+1 hacha y más alcance.', 'Atraviesan.'], evo: 'Tormenta de Erebor: 8 hachas en todas direcciones.'},
  abanico: {clases: ['elfo'], nombre: 'Abanico élfico', icono: 'i_abanico', pareja: 'gema', d: ['Disparas 3 flechas en abanico.', '+1 flecha.', 'Más daño.', '+1 flecha y más rápido.', '+1 flecha.'], evo: 'Arcos de los Galadhrim: 11 flechas que atraviesan.'},
  piedras: {clases: ['hobbit'], nombre: 'Piedras de la Comarca', icono: 'i_piedras', pareja: 'estrella', d: ['Una piedra que rebota de enemigo en enemigo.', '+1 rebote.', 'Más daño.', '+2 rebotes.', '+1 piedra.'], evo: 'Granizada: 3 piedras con 8 rebotes.'},
  humo: {clases: ['hobbit'], nombre: 'Hierba para pipa', icono: 'i_humo', pareja: 'lembas', d: ['Una nube de humo que frena y aturde a los enemigos.', 'Nube mayor.', 'Más daño.', 'Más a menudo.', 'Dura más.'], evo: 'Hoja del Valle Largo: nube enorme que los deja quietos.'},
});
Object.assign(ARMAS, {
  rayo: {nombre: 'Ira de la tormenta', icono: 'i_cargado', pareja: 'estrella', d: ['Un rayo cae sobre un enemigo cercano.', 'Más daño.', '+1 rayo.', 'Más a menudo.', '+2 rayos.'], evo: 'Tormenta de Isengard vuelta contra ellos: 7 rayos que aturden.'},
  viento: {nombre: 'Viento del Oeste', icono: 'oleada', pareja: 'corazon', d: ['Una ráfaga te rodea y aparta a los enemigos.', 'Más radio.', 'Más daño y los frena.', 'Más a menudo.', 'Más radio.'], evo: 'Vendaval de Manwë: barre todo y los deja aturdidos.'},
});
const HABILIDAD = {
  rohan: {t: '¡Carga de Rohan!', d: 'Embistes hacia delante y apartas a todo lo que pillas.', cd: 9},
  enano: {t: 'Furia de Khazad-dûm', d: 'Giras con el hacha durante 3 segundos golpeando a todos.', cd: 13},
  elfo: {t: 'Lluvia de flechas', d: 'Una lluvia de flechas cae sobre el grupo más grande.', cd: 11},
  hobbit: {t: 'Escabullirse', d: 'Desapareces 3,5 s: no te ven y tu siguiente golpe hace el triple.', cd: 13},
};
const PASIVAS = {
  botas: {nombre: 'Botas de los Rohirrim', icono: 'botas', d: '+15 % de velocidad.'},
  corazon: {nombre: 'Corazón de piedra', icono: 'corazon', d: 'Regeneras 1,5 de vida por segundo.'},
  escudo: {nombre: 'Escudo de Rohan', icono: 'escudo', d: 'Recibes un 15 % menos de daño.'},
  estrella: {nombre: 'Estrella élfica', icono: 'estrella', d: 'Todas tus armas atacan un 15 % más rápido.'},
  lembas: {nombre: 'Lembas', icono: 'lembas', d: '+35 de vida máxima y te curas del todo.'},
  gema: {nombre: 'Ojo élfico', icono: 'gema', d: 'Atraes gemas desde el doble de lejos y ganas un 20 % más de experiencia.'},
};
const num = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
/* talentos: se cogen una vez y cambian cómo juegas */
const TALENTOS = {
  sangre: {t: 'Sed de batalla', icono: 'corazon', d: 'Cada baja te cura <b>2 de vida</b>.'},
  esquiva: {t: 'Esquiva de guerrero', icono: 'i_esquivar', d: 'Al esquivar, <b>onda que aparta y hiere</b>.'},
  aturde: {t: 'Golpe aturdidor', icono: 'i_remate', d: 'Uno de cada 4 golpes <b>aturde 1 s</b>.'},
  aliento: {t: 'Último aliento', icono: 'escudo', d: 'Con poca vida: <b>3 s invencible</b> y furia. Una vez por oleada.'},
  botin: {t: 'Botín de Isengard', icono: 'moneda', d: '<b>+50 % de oro</b> en cada moneda.'},
  ira: {t: 'Ira creciente', icono: 'i_cargado', d: 'Cada 8 bajas sin que te den: <b>+10 % daño</b>. Si te dan, se pierde.'},
};
/* ---------- árbol de evolución (cada nivel): 3 ramas por héroe, una puede llegar al 5 y otra al 2 ---------- */
const tag = (h, t) => {h.tags = (h.tags || '') + ' ' + t;};
const RAMA_AGUANTE = (t, icono) => ({id: 'aguante', t, icono, contra: 'Te mantiene en pie cuando te rodean', n: [
  ['Cota de malla', '+25 % de vida máxima', (h) => {h.vidaMax *= 1.25; h.vida = Math.min(h.vidaMax, h.vida * 1.25);}],
  ['Escudo bien sujeto', 'Recibes un 15 % menos de daño', (h) => {h.armadura = Math.min(0.6, h.armadura + 0.15);}],
  ['Segundo aire', 'Regeneras 1,5 de vida por segundo', (h) => {h.regen = (h.regen || 0) + 1.5;}],
  ['Sed de batalla', 'Cada baja te cura 2 de vida', (h) => {h.tal.sangre = true;}],
  ['Último aliento', 'Con poca vida, 3 s invencible y furia (una vez por oleada) y +25 % de vida', (h) => {h.tal.aliento = true; h.vidaMax *= 1.25;}],
]});
const RAMAS = {
  rohan: [
    {id: 'lanza', t: 'Lanza de la Marca', icono: 'lanza', contra: 'Contra uruk acorazados y trolls', n: [
      ['Punta de acero', '+30 % de daño', (h) => {h.dano *= 1.3;}],
      ['Perforar armaduras', 'Tu lanza atraviesa las corazas de los uruk acorazados', (h) => tag(h, 'perfora')],
      ['Golpe certero', '+50 % de daño', (h) => {h.dano *= 1.5;}],
      ['Golpe aturdidor', 'Uno de cada 4 golpes aturde 1 s', (h) => {h.tal.aturde = true;}],
      ['Lanza de Eorl', 'Estocada en línea: atraviesa a todos los que tienes delante, el doble de lejos. Aplasta trolls y arietes', (h) => {h.dano *= 1.35; tag(h, 'pesado fuego'); (h.esp = h.esp || {}).linea = true;}]]},
    RAMA_AGUANTE('Escudo de Edoras', 'escudo'),
    {id: 'jinete', t: 'Jinete de la Marca', icono: 'botas', contra: 'Contra hordas y huargos', n: [
      ['Caballos de Rohan', '+12 % de velocidad', (h) => {h.vel *= 1.12;}],
      ['Barrido', 'Golpeas en un ángulo mucho más ancho', (h) => {h.arco = Math.min(Math.PI * 2, h.arco * 1.6);}],
      ['Golpes rápidos', 'Atacas un 20 % más rápido y los huargos ya no te esquivan', (h) => {h.cadencia *= 0.8; tag(h, 'rapido');}],
      ['Lanza larga', '+25 % de alcance', (h) => {h.alcance *= 1.25;}],
      ['Carga de los Rohirrim', 'Cada 6 s embistes solo contra el grupo más cercano y arrollas a todos a tu paso', (h) => {tag(h, 'area'); (h.esp = h.esp || {}).carga = true;}]]},
  ],
  enano: [
    {id: 'hacha', t: 'Hacha de Erebor', icono: 'hacha', contra: 'Contra trolls, arietes y acorazados', n: [
      ['Filo enano', '+35 % de daño', (h) => {h.dano *= 1.35;}],
      ['Golpe aturdidor', 'Uno de cada 4 golpes aturde 1 s', (h) => {h.tal.aturde = true;}],
      ['Rompecorazas', '+40 % de daño y atraviesas las corazas', (h) => {h.dano *= 1.4; tag(h, 'perfora');}],
      ['Fuego de la forja', 'Tus golpes queman: el ariete arde', (h) => tag(h, 'fuego')],
      ['Furia de Durin', 'Daño ×1,4 y cada cuarto golpe hace temblar el suelo y derriba a todos alrededor', (h) => {h.dano *= 1.4; tag(h, 'area'); (h.esp = h.esp || {}).onda = true;}]]},
    RAMA_AGUANTE('Piedra de la Montaña', 'escudo'),
    {id: 'paso', t: 'Paso enano', icono: 'botas', contra: 'Contra hordas y huargos', n: [
      ['Botas herradas', '+15 % de velocidad', (h) => {h.vel *= 1.15;}],
      ['Golpes rápidos', 'Atacas un 20 % más rápido', (h) => {h.cadencia *= 0.8;}],
      ['Doble tajo', 'Más ángulo y los huargos ya no te esquivan', (h) => {h.arco = Math.min(Math.PI * 2, h.arco * 1.5); tag(h, 'rapido');}],
      ['Mango largo', '+25 % de alcance', (h) => {h.alcance *= 1.25;}],
      ['Torbellino de Khazad', 'Giras con el hacha y das a todos; cada 6 s cargas contra el grupo más cercano', (h) => {h.arco = Math.PI * 2; h.cadencia *= 0.85; tag(h, 'area'); (h.esp = h.esp || {}).carga = true;}]]},
  ],
  elfo: [
    {id: 'flecha', t: 'Flecha de Lórien', icono: 'arco', contra: 'Contra acorazados, arietes y antorchas', n: [
      ['Punta élfica', '+30 % de daño', (h) => {h.dano *= 1.3;}],
      ['Atravesar', 'Cada flecha atraviesa a uno más', (h) => {h.atraviesa++;}],
      ['Flechas de fuego', 'Arden: el ariete y los trolls sufren el doble', (h) => tag(h, 'fuego')],
      ['Ojo de Legolas', '+50 % de daño', (h) => {h.dano *= 1.5;}],
      ['Arco de los Galadrim', 'Daño ×1,5 y atraviesan a dos más', (h) => {h.dano *= 1.5; h.atraviesa += 2;}]]},
    {id: 'lluvia', t: 'Lluvia de flechas', icono: 'i_abanico', contra: 'Contra hordas y huargos', n: [
      ['Mano rápida', 'Disparas un 15 % más rápido', (h) => {h.cadencia *= 0.85;}],
      ['Abanico', 'Dos flechas más en abanico', (h) => {h.multi += 2;}],
      ['Flechas ligeras', 'Los huargos ya no te esquivan', (h) => tag(h, 'rapido')],
      ['Ráfaga', 'Disparas un 20 % más rápido', (h) => {h.cadencia *= 0.8;}],
      ['Cielo de flechas', 'Cada 5 s cae una lluvia de flechas sobre el grupo más grande', (h) => {h.multi += 1; tag(h, 'area'); (h.esp = h.esp || {}).lluvia = true;}]]},
    {id: 'gracia', t: 'Gracia élfica', icono: 'i_esquivar', contra: 'Para sobrevivir y moverte', n: [
      ['Pies ligeros', '+12 % de velocidad', (h) => {h.vel *= 1.12;}],
      ['Capa de Lórien', '+25 % de vida máxima', (h) => {h.vidaMax *= 1.25; h.vida = Math.min(h.vidaMax, h.vida * 1.25);}],
      ['Esquiva de guerrero', 'Al esquivar, una onda aparta y hiere', (h) => {h.tal.esquiva = true;}],
      ['Vista élfica', '+25 % de alcance', (h) => {h.alcance *= 1.25;}],
      ['Lembas', 'Regeneras 2 de vida por segundo y último aliento', (h) => {h.regen = (h.regen || 0) + 2; h.tal.aliento = true;}]]},
  ],
  hobbit: [
    {id: 'piedra', t: 'Piedra certera', icono: 'honda', contra: 'Contra acorazados y trolls', n: [
      ['Piedra de río', '+30 % de daño', (h) => {h.dano *= 1.3;}],
      ['Pedrusco', 'Piedras pesadas: hacen mella en las corazas', (h) => tag(h, 'pesado')],
      ['Puntería de la Comarca', '+50 % de daño', (h) => {h.dano *= 1.5;}],
      ['Golpe aturdidor', 'Uno de cada 4 golpes aturde 1 s', (h) => {h.tal.aturde = true;}],
      ['Tiro de Bolsón', 'Daño ×1,6 y atraviesa a uno más', (h) => {h.dano *= 1.6; h.atraviesa++;}]]},
    {id: 'punado', t: 'Puñado de piedras', icono: 'i_piedras', contra: 'Contra hordas y huargos', n: [
      ['Brazo suelto', 'Lanzas un 15 % más rápido', (h) => {h.cadencia *= 0.85;}],
      ['Tres a la vez', 'Dos piedras más en abanico', (h) => {h.multi += 2;}],
      ['Rebote', 'Cada piedra atraviesa a uno más', (h) => {h.atraviesa++;}],
      ['Bolsillos llenos', 'Lanzas un 20 % más rápido', (h) => {h.cadencia *= 0.8;}],
      ['Granizada', 'Cada 5 s cae una granizada de piedras sobre el grupo más grande', (h) => {h.multi += 1; tag(h, 'area'); (h.esp = h.esp || {}).lluvia = true;}]]},
    {id: 'pies', t: 'Pies de hobbit', icono: 'botas', contra: 'Para sobrevivir y coger botín', n: [
      ['Pies ligeros', '+15 % de velocidad', (h) => {h.vel *= 1.15;}],
      ['Desapercibido', '+25 % de vida máxima', (h) => {h.vidaMax *= 1.25; h.vida = Math.min(h.vidaMax, h.vida * 1.25);}],
      ['Esquiva de hobbit', 'Al esquivar, una onda aparta y hiere', (h) => {h.tal.esquiva = true;}],
      ['Bolsillos de hobbit', '+50 % de oro en cada moneda e imán más grande', (h) => {h.tal.botin = true; h.iman *= 1.5;}],
      ['Suerte de Bolsón', 'Regeneras 2 de vida por segundo y último aliento', (h) => {h.regen = (h.regen || 0) + 2; h.tal.aliento = true;}]]},
  ],
};
/* icono de cada nodo (iconos/nd_XX.webp, hoja de ChatGPT) */
const ND = {
  rohan: {lanza: [1, 2, 3, 4, 5], aguante: [6, 7, 8, 9, 10], jinete: [11, 12, 13, 14, 15]},
  enano: {hacha: [16, 4, 2, 18, 17], aguante: [6, 7, 8, 9, 10], paso: [11, 13, 12, 14, 12]},
  elfo: {flecha: [1, 2, 18, 3, 5], lluvia: [13, 19, 11, 13, 20], gracia: [11, 6, 12, 14, 8]},
  hobbit: {piedra: [3, 17, 1, 4, 5], punado: [13, 19, 2, 13, 20], pies: [11, 6, 12, 9, 8]},
};
const icoNodo = (tipo, rama, k) => {const n = ((ND[tipo] || {})[rama] || [])[k]; return n ? 'iconos/nd_' + String(n).padStart(2, '0') + '.webp' : null;};
/* regla de los dos caminos: solo una rama pasa del 2, y como mucho dos ramas tienen puntos */
/* nivel del héroe que pide cada nodo (I…V): no se sube una rama entera de golpe */
const NIVEL_NODO = [2, 3, 5, 7, 9];
function ramaLibre(rs, i, sinNivel) {
  const nv = rs.map((r) => r.nv), n = nv[i];
  if (n >= 5) return 'Al máximo';
  if (!sinNivel && J.nivel < NIVEL_NODO[n]) return 'Necesitas nivel ' + NIVEL_NODO[n] + ' (vas por el ' + J.nivel + ')';
  const otras = nv.filter((v, k) => k !== i);
  if (n === 0 && otras.filter((v) => v > 0).length >= 2) return 'Ya llevas dos ramas';
  if (n >= 2 && otras.some((v) => v > 2)) return 'Otra rama ya pasó del 2';
  return '';
}
function proximoNodo() {const rs = J.arbol; if (!rs) return 0; const ns = rs.map((r, i) => !ramaLibre(rs, i, true) ? NIVEL_NODO[r.nv] : 99).filter((n) => n > J.nivel && n < 99); return ns.length ? Math.min(...ns) : 0;}
function arbolDisponible() {const rs = J.arbol; return rs && rs.some((r, i) => !ramaLibre(rs, i));}
/* pantalla del árbol: 3 ramas en columnas, 5 nodos cada una (de abajo arriba), el siguiente de cada rama brilla */
function ofreceArbol() {
  J.pausa = true; const h = J.h, rs = J.arbol;
  $('mejT').textContent = '¡Subes de nivel!'; $('mejP').textContent = 'Elige un nodo del árbol. Una rama puede llegar al V; otra, solo al II.';
  const c = $('cartas'); c.innerHTML = '';
  const arbol = document.createElement('div'); arbol.className = 'arbol';
  let sel = null;
  const detalle = document.createElement('div'); detalle.className = 'arbDet';
  const elegir = (r, i) => {const sig = r.def.n[r.nv]; sig[2](h); r.nv++; h.ramas = rs.map((q) => q.nv); suena('nivel'); pintaArmas(); $('mejora').classList.add('hidden'); J.pausa = false; reloj.getDelta(); setTimeout(siguientePendiente, 50);};
  const pintaDet = () => {
    if (!sel) {detalle.innerHTML = '<p>Toca un nodo que brille.</p>'; return;}
    const [r, i, k] = sel, n = r.def.n[k], disp = k === r.nv && !ramaLibre(rs, i);
    detalle.innerHTML = '<div class="arbDT"><img src="' + (icoNodo(h.tipo, r.def.id, k) || ico(r.def.icono)) + '" alt=""><div><small>' + r.def.t + ' · nivel ' + ['I', 'II', 'III', 'IV', 'V'][k] + '</small><b>' + n[0] + '</b><span>' + n[1] + '.</span><em>' + r.def.contra + '</em></div></div>';
    if (disp) {const b = document.createElement('button'); b.className = 'carta arbOk'; b.innerHTML = '<span>Elegir</span>'; b.onclick = () => elegir(r, i); detalle.appendChild(b);}
    else {const p = document.createElement('p'); p.className = 'arbNo'; p.textContent = k < r.nv ? 'Ya lo tienes.' : k > r.nv ? 'Antes tienes que coger el nivel ' + ['I', 'II', 'III', 'IV', 'V'][k - 1] + ' de esta rama' + (J.nivel < NIVEL_NODO[k] ? ', y este pide nivel ' + NIVEL_NODO[k] + '.' : '.') : '🔒 ' + ramaLibre(rs, i) + '.'; detalle.appendChild(p);}
  };
  rs.forEach((r, i) => {
    const bloq = ramaLibre(rs, i), bloqRegla = ramaLibre(rs, i, true), col = document.createElement('div'); col.className = 'arbCol' + (bloqRegla && r.nv < 5 ? ' bloq' : '');
    col.innerHTML = '<div class="arbCab"><img src="' + ico(r.def.icono) + '" alt=""><b>' + r.def.t + '</b><small>' + r.def.contra + '</small></div>';
    const nodos = document.createElement('div'); nodos.className = 'arbNodos';
    for (let k = 4; k >= 0; k--) {
      const est = k < r.nv ? 'tengo' : k === r.nv && !bloq ? 'puedo' : 'luego', b = document.createElement('button');
      b.className = 'nodo ' + est + (k >= 2 ? ' alto' : ''); const im = icoNodo(h.tipo, r.def.id, k);
      b.innerHTML = '<i>' + (im ? '<img src="' + im + '" alt=""><u>' + ['I', 'II', 'III', 'IV', 'V'][k] + '</u>' : ['I', 'II', 'III', 'IV', 'V'][k]) + '</i><span>' + r.def.n[k][0] + '</span>' + (k >= r.nv && J.nivel < NIVEL_NODO[k] ? '<em class="nvReq">Nv ' + NIVEL_NODO[k] + '</em>' : '');
      b.onclick = () => {sel = [r, i, k]; arbol.querySelectorAll('.nodo').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); pintaDet(); suena('xp');};
      nodos.appendChild(b);
      if (est === 'puedo' && !sel) {sel = [r, i, k]; b.classList.add('sel');}
    }
    col.appendChild(nodos); arbol.appendChild(col);
  });
  c.appendChild(detalle); c.appendChild(arbol); pintaDet();   /* la explicación arriba: en el móvil abajo quedaba fuera de pantalla */
  $('mejora').classList.remove('hidden');
}
function ajustaCartas(c) {
  const f = () => c.querySelectorAll('.carta div, .carta-bloq div').forEach((d) => {let k = 1; d.style.setProperty('--k', 1); while ((d.scrollHeight > d.clientHeight + 1 || d.scrollWidth > d.clientWidth + 1) && k > 0.34) {k -= 0.04; d.style.setProperty('--k', k);}});
  f(); setTimeout(f, 450); setTimeout(f, 1200); if (document.fonts && document.fonts.ready) document.fonts.ready.then(f);
}
const BASE_MEJORAS = [
  {t: 'Filo afilado', d: (h) => `Daño <b>${num(danoH(h))} → ${num(danoH(h) * 1.4)}</b>`, f: (h) => h.dano *= 1.4},
  {t: 'Brazo incansable', d: (h) => `Golpes por segundo <b>${num(1 / (h.cadencia * h.velArmas))} → ${num(1 / (h.cadencia * h.velArmas * 0.8))}</b>`, f: (h) => h.cadencia *= 0.8},
  {t: 'Más alcance', d: (h) => `Alcance <b>${num(h.alcance)} m → ${num(h.alcance * 1.2)} m</b>`, f: (h) => h.alcance *= 1.2},
  {t: 'Barrido', d: 'Más ángulo. Al máximo, golpe giratorio.', solo: 'cuerpo', f: (h) => h.arco = Math.min(Math.PI * 2, h.arco * 1.6)},
  {t: 'Disparo triple', d: 'Dos proyectiles más en abanico.', solo: 'distancia', f: (h) => h.multi += 2},
  {t: 'Atravesar', d: 'Tus proyectiles atraviesan a uno más.', solo: 'distancia', f: (h) => h.atraviesa++},
];
const DEFENSAS = {
  abrojos: {nombre: 'Abrojos', icono: 'abrojos', coste: 10, d: 'Frenan y hieren.'},
  estacas: {nombre: 'Estacas', icono: 'estacas', coste: 15, d: 'Cortan el paso.'},
  aceite: {nombre: 'Aceite', icono: 'caldero', coste: 20, d: 'Arde al pisarlo.'},
  arquero: {nombre: 'Arquero', icono: 'arquero', coste: 35, d: 'Dispara solo.'},
  estandarte: {nombre: 'Estandarte', icono: 'escudo', coste: 40, d: 'Te da fuerza y cura.'},
  escorpion: {nombre: 'Escorpión', icono: 'escorpion', coste: 55, d: 'Virotes que atraviesan.'},
  catapulta: {nombre: 'Catapulta', icono: 'catapulta', coste: 75, d: 'Piedras en área.'},
};
/* ---------- Mercado de Edoras: equipo que se ve en el héroe y da ventajas (se compra con tesoro, se queda para siempre) ---------- */
const MERCADO = [
  {id: 'esc_redondo', slot: 'escudo', t: 'Escudo redondo', d: 'Recibes un 8 % menos de daño', coste: 60, pieza: 'shield_round', icono: 'escudo', ef: {armadura: 0.08}},
  {id: 'esc_marca', slot: 'escudo', t: 'Escudo de la Marca', d: 'Recibes un 14 % menos de daño', coste: 150, pieza: 'shield_badge_color', icono: 'escudo', ef: {armadura: 0.14}},
  {id: 'esc_puas', slot: 'escudo', t: 'Escudo de púas', d: '−12 % de daño y quien te pega se lleva un tercio', coste: 240, pieza: 'shield_spikes_color', icono: 'escudo', ef: {armadura: 0.12, espinas: 0.35}},
  {id: 'esc_torre', slot: 'escudo', t: 'Escudo de Cuernavilla', d: 'Recibes un 20 % menos de daño', coste: 320, pieza: 'shield_square_color', icono: 'escudo', ef: {armadura: 0.2}},
  {id: 'rh_espada', slot: 'arma', heroe: 'rohan', t: 'Espada de Edoras', d: '+12 % de daño', coste: 90, pieza: 'sword_1handed', icono: 'espada', ef: {dano: 0.12}},
  {id: 'rh_mandoble', slot: 'arma', heroe: 'rohan', t: 'Mandoble de la Marca', d: '+28 % de daño y aplasta corazas', coste: 300, pieza: 'sword_2handed_color', icono: 'espada', ef: {dano: 0.28, tags: 'pesado'}},
  {id: 'en_hachuela', slot: 'arma', heroe: 'enano', t: 'Hachuela de Erebor', d: 'Golpeas un 15 % más rápido', coste: 90, pieza: 'axe_1handed', icono: 'hacha', ef: {cadencia: 0.85}},
  {id: 'en_granhacha', slot: 'arma', heroe: 'enano', t: 'Gran hacha de las Colinas de Hierro', d: '+28 % de daño', coste: 300, pieza: 'axe_2handed', icono: 'hacha', ef: {dano: 0.28}},
  {id: 'en_jarra', slot: 'extra', heroe: 'enano', t: 'Jarra de cerveza', d: 'Regeneras 0,8 de vida por segundo', coste: 140, pieza: 'mug_full', icono: 'lembas', ef: {regen: 0.8}},
  {id: 'el_ballesta', slot: 'arma', heroe: 'elfo', t: 'Ballesta ligera de Lórien', d: 'Disparas un 15 % más rápido', coste: 110, pieza: 'crossbow_1handed', icono: 'ballesta', ef: {cadencia: 0.85}},
  {id: 'el_carcaj', slot: 'extra', heroe: 'elfo', t: 'Carcaj de los Galadrim', d: 'Cada flecha atraviesa a uno más', coste: 220, pieza: 'quiver', icono: 'arco', ef: {atraviesa: 1}},
  {id: 'hb_daga', slot: 'arma', heroe: 'hobbit', t: 'Daga de los Túmulos', d: '+15 % de daño y atraviesa corazas', coste: 180, pieza: 'dagger', icono: 'cuchillos', ef: {dano: 0.15, tags: 'perfora'}},
  {id: 'hb_piedras', slot: 'extra', heroe: 'hobbit', t: 'Saco de piedras de la Comarca', d: 'Lanzas una piedra más', coste: 200, pieza: 'arrow_bundle', icono: 'i_piedras', ef: {multi: 1}},
];
/* dónde va cada pieza en el esqueleto de KayKit y qué pieza de serie esconde */
const SLOT_HUESO = {arma: 'handslotr', escudo: 'handslotl', extra: 'chest'};   /* GLTFLoader quita los puntos de los nombres */
const DE_SERIE = {rohan: {arma: ['1H_Sword'], escudo: ['Round_Shield']}, enano: {arma: ['2H_Axe']}, elfo: {arma: ['2H_Crossbow']}, hobbit: {arma: ['Throwable']}};
function equipoDe(tipo) {const e = guardado.mercado.equipo[tipo] || {}; return Object.values(e).map((id) => MERCADO.find((m) => m.id === id)).filter(Boolean);}
function aplicaEquipo(h, tipo) {
  for (const m of equipoDe(tipo)) {
    const f = m.ef;
    if (f.armadura) h.armadura = Math.min(0.6, h.armadura + f.armadura);
    if (f.dano) h.dano *= 1 + f.dano;
    if (f.cadencia) h.cadencia *= f.cadencia;
    if (f.regen) h.regen += f.regen;
    if (f.atraviesa) h.atraviesa += f.atraviesa;
    if (f.multi) h.multi += f.multi;
    if (f.espinas) h.espinas = (h.espinas || 0) + f.espinas;
    if (f.tags) h.tags = (h.tags || '') + ' ' + f.tags;
  }
}
function vistePersonaje(raiz, tipo) {
  if (!M.equipo) return;
  raiz.traverse((o) => {if (o.userData.pieza) o.removeFromParent();});
  const eq = equipoDe(tipo), serie = DE_SERIE[tipo] || {};
  for (const slot of ['arma', 'escudo']) for (const n of serie[slot] || []) {const o = raiz.getObjectByName(n); if (o) o.visible = !eq.some((m) => m.slot === slot);}
  for (const m of eq) {
    const hueso = raiz.getObjectByName(SLOT_HUESO[m.slot]), base = M.equipo.scene.getObjectByName(m.pieza); if (!hueso || !base) continue;
    const p = base.clone(true); p.position.set(0, 0, 0); p.rotation.set(0, 0, 0); p.userData.pieza = true;
    if (m.slot === 'extra') {p.position.set(0, 0.05, -0.32); p.rotation.set(0.25, Math.PI, 0); p.scale.setScalar(0.8);}
    p.traverse((o) => {if (o.isMesh) {o.castShadow = true; o.material = o.material.clone(); o.material.roughness = 0.75;}});
    hueso.add(p);
  }
}
const PERMANENTES = [
  {id: 'vida', t: 'Cota de malla', d: '+10 % de vida', base: 30},
  {id: 'dano', t: 'Forja de Edoras', d: '+10 % de daño', base: 40},
  {id: 'oro', t: 'Arcas de Théoden', d: '+15 de oro inicial', base: 25},
  {id: 'vel', t: 'Caballos de Rohan', d: '+5 % de velocidad', base: 30},
];
const ico = (n) => 'iconos/' + n + '.webp';
/* qué hace cada arma: los enemigos especiales solo caen con ciertas armas */
const TAGS = {lanzas: 'perfora pesado', hachas: 'pesado', abanico: 'perfora rapido', piedras: 'pequeno rapido', humo: 'area', carga: 'pesado area', furia: 'pesado area', lluvia: 'perfora area', rayo: 'area fuego', viento: 'area empuje', cuchillos: 'rapido pequeno', antorcha: 'fuego', cuerno: 'area empuje', flecha: 'fuego perfora area', martillo: 'pesado', caldero: 'fuego area',
  lanza: 'pesado', hacha: 'pesado', arco: 'perfora', honda: 'pequeno rapido', abrojos: 'pequeno', estacas: 'pequeno', empalizada: 'pequeno', aceite: 'fuego area',
  arquero: 'perfora', torre: 'perfora', escorpion: 'perfora pesado', catapulta: 'pesado area', calderon: 'fuego area', explosion: 'pesado area', cargado: 'pesado area'};
let FUENTE = null;
const tiene = (t) => !!FUENTE && ((TAGS[FUENTE] || FUENTE).includes(t) || (J && FUENTE === J.h.icono && (J.h.tags || '').includes(t)));
/* amenazas que se anuncian una oleada antes, con sus armas buenas */
const AMENAZAS = {
  huargos: {t: 'HUARGOS Y JINETES DE HUARGO', d: 'Esquivan los golpes lentos. Les hacen daño las armas rápidas (cuchillos, piedras, abanico), las de área (cuerno, humo, antorchas) y el aceite.', armas: ['cuchillos', 'cuerno', 'antorcha', 'caldero', 'piedras', 'humo', 'abanico'], icono: 'huargo'},
  acorazados: {t: 'URUK ACORAZADOS y PORTADORES DE ANTORCHA', d: 'Las armaduras paran lo ligero: martillo, fuego o ballesta. Al de la antorcha hay que tumbarlo antes de que llegue al muro: ballestas y flechas.', armas: ['martillo', 'flecha', 'caldero', 'lanzas', 'hachas'], icono: 'uruk_acorazado'},
  trolls: {t: 'TROLLS ACORAZADOS y EL ARIETE', d: 'A los trolls solo les hacen mella el martillo, las ballestas, la catapulta y el fuego. El ariete golpea el muro desde fuera y luego la puerta: calderos, fuego y ballestas.', armas: ['martillo', 'caldero', 'flecha', 'lanzas', 'hachas'], icono: 'uruk_acorazado'},
  capitan: {t: 'EL CAPITÁN URUK', d: 'Último asalto antes del alba. Reforzad la puerta.', armas: [], icono: 'oleada'},
};
const AMENAZA_DE = [null, 'huargos', 'acorazados', 'trolls', 'capitan'];

/* ---------- guardado (tesoro y mejoras permanentes) ---------- */
const guardado = (() => {try {return JSON.parse(localStorage.getItem('abismo.guardado')) || {};} catch (e) {return {};}})();
guardado.tesoro = guardado.tesoro || 0; guardado.perm = guardado.perm || {}; guardado.record = guardado.record || 0;
guardado.mercado = guardado.mercado || {tiene: {}, equipo: {}};
const guarda = () => {try {localStorage.setItem('abismo.guardado', JSON.stringify(guardado));} catch (e) {}};

/* ---------- motor 3D ---------- */
const renderer = new THREE.WebGLRenderer({antialias: false, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0c1220');
scene.fog = new THREE.Fog('#0c1220', 32, 80);
const camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, 0.5, 200);
const hemi = new THREE.HemisphereLight('#6d7fa8', '#2a2018', 0.9); scene.add(hemi);
const luna = new THREE.DirectionalLight('#9fb4e0', 1.1);
luna.castShadow = true; luna.shadow.mapSize.set(1024, 1024);
Object.assign(luna.shadow.camera, {left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 90});
scene.add(luna, luna.target);
const GR = creaGraficos({renderer, scene, camera, luna, hemi}); window._G = GR;
GR.alRayo = () => {if (Math.random() < 0.7) setTimeout(() => suena('trueno', 0.6 + Math.random() * 0.4), 250 + Math.random() * 1400);};
addEventListener('resize', () => {camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);});

/* ---------- carga de modelos (módulos .js con el glb en base64) ---------- */
const loader = new GLTFLoader();
/* modelos en binario (.glb): sin descodificar base64 en el móvil (antes ~47 MB de texto y segundos de CPU) */
let cargados = 0;
async function cargaModelo(n) {
  const r = await fetch('modelos/' + n + '.glb'); if (!r.ok) throw new Error('modelo ' + n);
  const buf = await r.arrayBuffer();
  const g = await new Promise((res, rej) => loader.parse(buf, '', res, rej));
  cargados++; const j = $('jugar'); if (j && j.disabled) j.firstElementChild.textContent = 'Cargando… ' + Math.round(cargados / NOMBRES.length * 100) + ' %';
  return g;
}
const M = {}, marcas = {}, antorchas = [], P = {};
let desagueObj = null;
function piezas(gltf) {
  const out = {};
  gltf.scene.traverse((o) => {
    if (!o.name || o === gltf.scene || out[o.name]) return;
    if (o.isMesh && !o.children.length) {const g = o.geometry.clone(); g.computeBoundingBox(); const c = new THREE.Vector3(); g.boundingBox.getCenter(c); g.translate(-c.x, 0, -c.z); out[o.name] = new THREE.Mesh(g, o.material);}
    else {const c = o.clone(true); c.position.set(0, 0, 0); out[o.name] = c;}
  });
  return out;
}
const NOMBRES = ['tronco', 'equipo', 'casco_enano', 'escaleras_muro', 'entrada_cuevas', 'q_arquero', 'q_brujo', 'uruk_piquero', 'huargo_alfa', 'patio5', 'muralla_helm', 'cuernavilla_v2', 'muro_tramo', 'desague', 'torre_arqueros', 'barricada_puerta', 'empalizada', 'caldero_aceite', 'sitio_construccion', 'aldeano_rohan', 'puerta', 'atrezo', 'objetos', 'efectos', 'efectos2', 'efectos3', 'proyectiles', 'armas_auto', 'defensas', 'marcador_colocacion', 'botin', 'brillo_elite',
  'rohan_kk', 'enano_kk', 'elfo_kk', 'hobbit_kk', 'arquero_rohan', 'orco', 'uruk', 'berserker', 'warg', 'troll', 'ballestero', 'portaestandarte', 'troll_acorazado', 'capitan', 'uruk_acorazado', 'antorchero', 'ariete', 'huargo_jinete', 'ballesta_muro', 'catapulta_rohan', 'arquero_muralla', 'jinete_rohan', 'efectos4'];
async function cargarTodo() {
  const gl = await Promise.all(NOMBRES.map(cargaModelo));
  NOMBRES.forEach((n, i) => M[n] = gl[i]);
  M.patio5.scene.traverse((o) => {if (o.isMesh) o.receiveShadow = true; if (o.name) marcas[o.name] = o.position.clone();});
  GR.mejoraPatio4(M.patio5.scene);
  scene.add(M.patio5.scene);
  /* pack 18: Muro del Bajo con talud, Cuernavilla, paredes del desfiladero y campo de fuera */
  const MH = M.muralla_helm.scene; GR.mejoraPatio4(MH);
  MH.traverse((o) => {if (o.isMesh && o.material.name === 'llama') o.material = new THREE.MeshBasicMaterial({color: '#ffb45a', fog: false});});
  ['campo_fuera', 'suelo_lateral_roca', 'antorchas_muro'].forEach((n) => {const o = MH.getObjectByName(n); if (o) scene.add(o);});
  /* Cuernavilla v2: fortaleza redonda, torre del cuerno y desfiladero con volumen (sustituye a los del pack 18) */
  const CV = M.cuernavilla_v2.scene; GR.mejoraPatio4(CV);
  ['cuernavilla', 'acantilado_izq', 'acantilado_der'].forEach((n) => {const o = CV.getObjectByName(n); if (o) scene.add(o);});
  {const EM = M.escaleras_muro.scene; GR.mejoraPatio4(EM); EM.traverse((m) => {if (m.isMesh) {m.castShadow = true; m.receiveShadow = true;}}); scene.add(EM);}
  /* el fondo del patio: la entrada a las Cavernas Centelleantes, con la gente de Rohan refugiada dentro */
  {const EC = M.entrada_cuevas.scene; GR.mejoraPatio4(EC); scene.add(EC);
   setTimeout(() => EC.traverse((m) => {if (m.isMesh && m.material.name === 'roca') {m.material = m.material.clone(); m.material.emissive.set('#5a6280'); m.material.emissiveMap = m.material.map; m.material.emissiveIntensity = 0.55; m.material.needsUpdate = true;}}), 1500);
   const luz = new THREE.PointLight('#ffa050', 30, 14, 1.4); luz.position.set(0, 3.5, 41.5); scene.add(luz);
   const fondo = new THREE.DirectionalLight('#8a9ad0', 1.0); fondo.position.set(0, 24, 12); fondo.target.position.set(0, 10, 45); scene.add(fondo, fondo.target);}
  desagueObj = MH.getObjectByName('desague'); scene.add(desagueObj);
  M.objetos.scene.children.forEach((c) => P[c.name] = c);
  ['efectos', 'efectos2', 'efectos3', 'efectos4', 'proyectiles', 'atrezo', 'armas_auto', 'defensas', 'botin', 'brillo_elite', 'marcador_colocacion'].forEach((n) => Object.assign(P, piezas(M[n])));
  const v = M.ballestero.scene.getObjectByName('virote_orco'); if (v) {P.virote_orco = v.clone(); P.virote_orco.position.set(0, 0, 0);}
  const pu = M.puerta.scene; pu.position.copy(marcas.puerta); pu.scale.set(0.95, 0.62, 1); /* más baja: por encima se ve a la gente refugiada en la cueva */ pu.traverse((o) => {if (o.isMesh) {o.castShadow = true; o.receiveShadow = true; GR.cortaVista(o.material, false);}}); scene.add(pu);
  ponPuerta('puerta_ok');
  for (let i = 1; i <= 8; i++) {
    const p = marcas['antorcha_' + i]; if (!p) continue;
    const a = P.antorcha.clone(); a.position.copy(p); a.position.y -= 0.2;
    a.rotation.y = p.x < -1 ? Math.PI / 2 : p.x > 1 ? -Math.PI / 2 : (p.z > 0 ? Math.PI : 0); a.userData.fijo = true; scene.add(a);
    const ll = ponLlama(p.x, p.y + 0.45, p.z, 1.0);
    const l = new THREE.PointLight('#ffb35c', 14, 15, 1.7); l.position.copy(p); l.position.y += 0.6; scene.add(l);
    antorchas.push({l, ll, base: 14, fase: Math.random() * 9});
  }
  [[-12, 30], [12, 28], [-14, 6], [14, 14]].forEach(([x, z]) => {const b = P.barril.clone(); b.position.set(x, 0.15, z); b.userData.fijo = true; scene.add(b);});
  colocaAtrezo();
  calcos(); matas(); valle();
  preparaLluvia();
  preparaMarcas();
  GR.brasas(antorchas.map((a) => a.l.position));
  fusionaEstaticos([M.patio5.scene, ...['campo_fuera', 'suelo_lateral_roca', 'antorchas_muro', 'cuernavilla', 'acantilado_izq', 'acantilado_der'].map((n) => scene.getObjectByName(n)), M.escaleras_muro.scene, M.entrada_cuevas.scene, ...scene.children.filter((o) => o.userData.fijo)]);
  poolLuces(); preparaGemasInst();
  calienta();
}
/* ---------- motor: decorado fijo fusionado por material (de ~900 dibujos por fotograma a unos pocos cientos) ---------- */
function fusionaEstaticos(raices) {
  const grupos = new Map(); let antes = 0;
  scene.updateMatrixWorld(true);
  for (const r of raices) if (r) r.traverse((o) => {
    if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || !o.visible || Array.isArray(o.material) || o.userData.borde) return;
    const g = o.geometry; if (!g || Object.keys(g.morphAttributes || {}).length) return;
    const k = o.material.uuid + '|' + Object.keys(g.attributes).sort().join(',') + '|' + !!g.index + '|' + o.castShadow + o.receiveShadow + '|' + o.renderOrder;
    if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(o); antes++;
  });
  let despues = 0;
  for (const lista of grupos.values()) {
    if (lista.length < 2) {despues++; continue;}
    const geos = lista.map((o) => {const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); return g;});
    let mg = null; try {mg = mergeGeometries(geos, false);} catch (e) {mg = null;}
    geos.forEach((g) => g.dispose());
    if (!mg) {despues += lista.length; continue;}
    const m = new THREE.Mesh(mg, lista[0].material); m.castShadow = lista[0].castShadow; m.receiveShadow = lista[0].receiveShadow; m.renderOrder = lista[0].renderOrder;
    m.matrixAutoUpdate = false; m.updateMatrix(); scene.add(m);
    lista.forEach((o) => o.removeFromParent()); despues++;
  }
  console.log('decorado fusionado:', antes, '→', despues, 'mallas');
}
/* ---------- motor: solo 4 luces de punto encendidas, las de las antorchas más cercanas (antes 10: cada píxel pagaba las 10) ---------- */
const POOL = [];
function poolLuces() {
  const fuentes = []; scene.traverse((o) => {if (o.isPointLight) fuentes.push(o);});
  fuentes.forEach((l) => l.removeFromParent());
  for (let i = 0; i < 4; i++) {const l = new THREE.PointLight('#ffb35c', 0, 14, 1.7); scene.add(l); POOL.push({l, f: null});}
  POOL.fuentes = fuentes; POOL.t = 0;
}
function actualizaPool(dt, x, z) {
  if (!POOL.length) return;
  POOL.t -= dt;
  if (POOL.t <= 0) {
    POOL.t = 0.35;
    const orden = POOL.fuentes.slice().sort((a, b) => Math.hypot(a.position.x - x, a.position.z - z) - Math.hypot(b.position.x - x, b.position.z - z)).slice(0, POOL.length);
    /* las que siguen elegidas se quedan en su hueco (sin saltos de luz) */
    const libres = POOL.filter((p) => !orden.includes(p.f));
    for (const f of orden) if (!POOL.some((p) => p.f === f)) {const p = libres.shift(); if (p) {p.f = f; p.fade = 0;}}
  }
  for (const p of POOL) {
    if (!p.f) continue; p.fade = Math.min(1, (p.fade ?? 1) + dt * 4);
    p.l.position.copy(p.f.position); p.l.color.copy(p.f.color); p.l.distance = p.f.distance; p.l.decay = p.f.decay; p.l.intensity = p.f.intensity * p.fade;
  }
}
/* compila de antemano todos los shaders (personajes, piezas, efectos) para que no haya tirones la primera vez que sale algo */
function calienta() {
  const g = new THREE.Group(); let k = 0;
  const pon_ = (o) => {o.position.set(camera.position.x + (k % 8 - 4) * 1.5, 0.5, camera.position.z - 12 - ((k / 8) | 0) * 1.5); k++; o.traverse((q) => {q.frustumCulled = false; if (q.isMesh) q.castShadow = true;}); g.add(o);};
  const vistos = [];
  for (const n of NOMBRES) if (M[n].animations && M[n].animations.length) {const a = montar(n, true); vistos.push(a); const c = Object.values(a.clips)[0]; if (c) c.play(); a.mixer.update(0.01); pon_(a.raiz);}
  for (const n in P) if (P[n] && P[n].isObject3D) pon_(P[n].clone());
  for (const n in FB) for (const su of [true, false]) for (const sm of [true, false]) {const ms = fbMat(n, su, sm); const o = su ? new THREE.Mesh(fbGeo, ms[0]) : new THREE.Sprite(ms[0]); pon_(o);}
  partMat.forEach((m) => pon_(new THREE.Sprite(m)));
  scene.add(g);
  try {renderer.compile(scene, camera); GR.render(0.016, false);} catch (e) {console.warn(e);}
  scene.remove(g);
}

/* ---------- puerta con 3 estados ---------- */
let puertaEstado = '';
function ponPuerta(n) {
  if (n === puertaEstado) return; puertaEstado = n;
  ['puerta_ok', 'puerta_dañada', 'puerta_rota'].forEach((k) => {const o = M.puerta.scene.getObjectByName(k); if (o) o.visible = k === n;});
}
function actualizaPuerta() {
  const k = J.puerta / J.puertaMax, n = k > 0.6 ? 'puerta_ok' : k > 0.25 ? 'puerta_dañada' : 'puerta_rota';
  if (n !== puertaEstado) {ponPuerta(n); J.temblor = Math.max(J.temblor, 0.4); efecto('polvo', marcas.puerta.x, 0.2, marcas.puerta.z - 1, {escala: 3, vida: 0.8, crece: 1.6});}
}

/* ---------- calcomanías del suelo (hoja de ChatGPT, 4x4) ---------- */
/* 0-2 charcos, 3-4 grietas, 5-6 barro, 7-8 paja, 9 rejilla, 10 estandarte, 11-12 flechas, 13 escudo, 14-15 hollín */
function calcos() {
  const tex = new THREE.TextureLoader().load('texturas/calcos.webp'); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const geos = {seco: [], charco: []};
  const pon = (i, x, z, t) => {
    const g = new THREE.PlaneGeometry(t, t); g.rotateX(-Math.PI / 2); g.rotateY(Math.random() * Math.PI * 2);
    g.translate(x, 0.156 + geos.seco.length * 0.0004, z);
    const uv = g.attributes.uv, c = i % 4, f = 3 - ((i / 4) | 0);
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (c + uv.getX(k)) / 4, (f + uv.getY(k)) / 4);
    (i <= 2 ? geos.charco : geos.seco).push(g);
  };
  const libre = (x, z) => Math.abs(x) > 3.5 || z < -12;   /* el camino central queda limpio */
  const azarEn = (fn) => {for (let n = 0; n < 30; n++) {const x = rnd(PATIO.x0 + 1, PATIO.x1 - 1), z = rnd(PATIO.z0 + 1, PATIO.z1 - 1); if (fn(x, z)) return [x, z];} return [0, 0];};
  const reparto = [[5, 10, 2.2, 3], [6, 10, 2.2, 3], [14, 5, 2.6, 3.6], [15, 5, 2.6, 3.6], [0, 3, 2.6, 3.4], [1, 3, 2.6, 3.4], [2, 4, 2, 2.8],
    [11, 4, 1.4, 1.8], [12, 4, 1.4, 1.8], [10, 2, 2.2, 2.6], [13, 2, 1.6, 2]];
  for (const [i, n, a, b] of reparto) for (let k = 0; k < n; k++) {const [x, z] = azarEn(libre); pon(i, x, z, rnd(a, b));}
  for (let k = 0; k < 10; k++) {const lado = k % 2 ? 1 : -1; pon(7 + (k % 2), lado * rnd(14.5, 16.5), rnd(PATIO.z0 + 2, PATIO.z1 - 2), rnd(1.8, 2.6));}   /* paja junto a los muros */

  const mat = (charco) => new THREE.MeshStandardMaterial({map: tex, transparent: true, depthWrite: false, alphaTest: 0.04, roughness: charco ? 0.08 : 0.9, metalness: charco ? 0.2 : 0, envMapIntensity: charco ? 1.4 : 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2});
  for (const k of ['seco', 'charco']) {
    if (!geos[k].length) continue;
    const m = new THREE.Mesh(mergeGeometries(geos[k]), mat(k === 'charco')); m.receiveShadow = true; m.renderOrder = 1; scene.add(m);
  }
}

/* ---------- matas del campo (ChatGPT, 4x2) y el ejército en el valle ---------- */
function matas() {
  /* matas y piedras sueltas: 8 mallas instanciadas que miran a la cámara (antes ~90 sprites = 90 dibujos) */
  const tex = new THREE.TextureLoader().load('texturas/matas.webp'); tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, 0.46, 0);
  const pos = [[], [], [], [], [], [], [], []];
  const pon = (x, z, k) => {const t = [1.5, 1.1, 1.4, 1.5, 1.7, 1.3, 1.4, 1.1][k] * rnd(0.8, 1.2); pos[k].push([x, 0.12, z, t]);};
  for (let n = 0; n < 70; n++) {
    const lado = n % 2 ? 1 : -1, x = lado * rnd(12.5, 17.2), z = rnd(PATIO.z0 + 2, PATIO.z1 - 2);
    pon(x, z, [0, 1, 2, 3, 4, 6, 7][n % 7]);
  }
  for (let n = 0; n < 16; n++) pon(rnd(-17, 17), rnd(-15, -13.2), [0, 1, 4, 5][n % 4]);   /* al pie del muro */
  for (let n = 0; n < 6; n++) pon(rnd(-11, 11), rnd(-6, 28), 5);   /* alguna piedra suelta en el campo */
  pos.forEach((lista, k) => {
    if (!lista.length) return;
    const t = tex.clone(); t.repeat.set(0.25, 0.5); t.offset.set((k % 4) / 4, k < 4 ? 0.5 : 0); t.needsUpdate = true;
    const m = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({map: t, color: '#7d8a80', alphaTest: 0.35, fog: true, side: THREE.DoubleSide}), lista.length);
    m.userData.mata = lista; m.frustumCulled = false; scene.add(m); MATAS.push(m);
  });
}
const MATAS = [], _mq = new THREE.Quaternion(), _mp = new THREE.Vector3(), _ms = new THREE.Vector3(), _mm = new THREE.Matrix4();
function orientaMatas() {
  _mq.copy(camera.quaternion);
  for (const m of MATAS) {m.userData.mata.forEach(([x, y, z, t], i) => {_mp.set(x, y, z); _ms.set(t, t, 1); m.setMatrixAt(i, _mm.compose(_mp, _mq, _ms));}); m.instanceMatrix.needsUpdate = true;}
}
function valle() {
  const t = new THREE.TextureLoader().load('texturas/fondo_valle.webp'); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(220, 73), new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, fog: false, color: '#9aa0b0'}));
  m.position.set(0, 14, -95); scene.add(m);
}

/* ---------- atrezo ---------- */
const mezcladores = [];
function colocaAtrezo() {
  const pon1 = (n, x, z, ry = 0) => {
    if (!P[n]) return null;
    const o = P[n].clone(true); o.position.set(x, 0.15, z); o.rotation.y = ry;
    o.traverse((m) => {if (m.isMesh) {m.castShadow = true; m.receiveShadow = true;}}); o.userData.fijo = n !== 'hoguera_patio'; scene.add(o); return o;
  };
  pon1('carro', -13.5, 19, 0.4); pon1('pila_lanzas', 15, 22, -Math.PI / 2); pon1('armero', 16, 30, -Math.PI / 2);
  pon1('saco', -15.5, 11); pon1('saco', -14.6, 11.8, 1); pon1('saco', 15.4, 3, 2);
  pon1('caja', -15, -6); pon1('caja', -14.2, -4.9, 0.5); pon1('caja', 14.8, -9, 0.3); pon1('cadena', -16.5, 33, Math.PI / 2);
  if (pon1('hoguera_patio', -10, 29)) {const l = new THREE.PointLight('#ff9a3c', 18, 13, 1.7); l.position.set(-10, 1.4, 29); scene.add(l); antorchas.push({l, ll: null, base: 18, fase: 2});}
  const est = M.atrezo.scene.getObjectByName('estandarte_rohan_2'), clip = M.atrezo.animations.find((a) => a.name === 'ondear');
  [[-5, 34.6], [5, 34.6]].forEach(([x, z], i) => {
    if (!est) return;
    const o = est.clone(true); o.position.set(x, 0.15, z); o.rotation.y = Math.PI; scene.add(o);
    if (clip) {const mx = new THREE.AnimationMixer(o); const a = mx.clipAction(clip); a.time = i * 0.7; a.play(); mezcladores.push(mx);}
  });
}

/* ---------- lluvia instanciada ---------- */
const LL = {n: 150, gotas: null, salp: null, pos: [], sp: [], ns: 40, cs: 0};
function preparaLluvia() {
  if (!P.gota || !P.lluvia_salpicadura) return;
  const mg = P.gota.material.clone(); mg.depthWrite = false; mg.transparent = true; mg.opacity = 0.28;
  LL.gotas = new THREE.InstancedMesh(P.gota.geometry, mg, LL.n); LL.gotas.frustumCulled = false; scene.add(LL.gotas);
  const ms = P.lluvia_salpicadura.material.clone(); ms.depthWrite = false;
  LL.salp = new THREE.InstancedMesh(P.lluvia_salpicadura.geometry, ms, LL.ns); LL.salp.frustumCulled = false; scene.add(LL.salp);
  for (let i = 0; i < LL.n; i++) LL.pos.push({x: rnd(-15, 15), y: rnd(0, 22), z: rnd(-25, 15), v: rnd(18, 24)});
  for (let i = 0; i < LL.ns; i++) LL.sp.push({x: 0, z: 0, t: 1});
}
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0, 0.06)), _v = new THREE.Vector3(), _e = new THREE.Vector3(1, 1, 1), _q0 = new THREE.Quaternion();
function actualizaLluvia(dt, cx, cz) {
  if (!LL.gotas) return;
  for (let i = 0; i < LL.n; i++) {
    const g = LL.pos[i]; g.y -= g.v * dt; g.z += g.v * dt * 0.12;
    if (g.y < 0.1) {if (Math.random() < 0.5) {const s = LL.sp[LL.cs++ % LL.ns]; s.x = g.x; s.z = g.z; s.t = 0;} g.y = rnd(18, 24); g.x = cx + rnd(-15, 15); g.z = cz + rnd(-26, 14);}
    _m.compose(_v.set(g.x, g.y, g.z), _q, _e.set(0.22, 0.85, 0.22)); LL.gotas.setMatrixAt(i, _m);
  }
  LL.gotas.instanceMatrix.needsUpdate = true;
  for (let i = 0; i < LL.ns; i++) {
    const s = LL.sp[i]; s.t = Math.min(1, s.t + dt * 3.5); const k = s.t >= 1 ? 0 : 0.2 + s.t * 0.4;
    _m.compose(_v.set(s.x, 0.17, s.z), _q0, _e.set(k, k * (1 - s.t), k)); LL.salp.setMatrixAt(i, _m);
  }
  LL.salp.instanceMatrix.needsUpdate = true;
}

/* ---------- animación ---------- */
const UNA_VEZ = ['lanzar', 'invocar', 'disparar_fuego', 'recibir', 'morir', 'morir_2', 'morir_3', 'empujado', 'rugir', 'pasar_almena', 'aullar', 'saltar_ataque', 'golpear_suelo', 'entrada', 'golpe_combo', 'atacar_3', 'golpe_cargado', 'disparar_rapido', 'morir_jefe', 'atacar', 'atacar_2', 'giro', 'esquivar', 'recibir_golpe', 'saltar', 'saltar_muro', 'explotar', 'disparar', 'barrido', 'carga', 'golpe_area', 'grito', 'romperse', 'disparar_escorpion', 'disparar_catapulta', 'abrir', 'embestir', 'saltar_y_prender', 'disparar_montado', 'golpe_lanza', 'encabritarse', 'morir_caer', 'bloquear', 'empujar_escudo'];
const matBorde = new THREE.MeshBasicMaterial({color: '#140c08', side: THREE.BackSide, fog: false});
const uBorde = {value: new THREE.Vector2()};
const ponBorde = () => uBorde.value.set(2 * 2.1 / innerWidth, 2 * 2.1 / innerHeight); ponBorde(); addEventListener('resize', ponBorde);
matBorde.onBeforeCompile = (sh) => {
  sh.uniforms.uBorde = uBorde;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform vec2 uBorde;').replace('#include <project_vertex>', `#include <project_vertex>
    #ifdef USE_SKINNING
    vec3 nB = normalize(normalMatrix * objectNormal);
    #else
    vec3 nB = normalize(normalMatrix * normal);
    #endif
    gl_Position.xy += normalize(nB.xy + 1e-5) * uBorde * gl_Position.w;`);
};
function bordes(g) {
  if (g.conBorde) return; g.conBorde = true;
  const lista = []; g.scene.traverse((o) => {if (o.isMesh && !o.userData.borde && o.visible) lista.push(o);});
  for (const o of lista) {
    let b; if (o.isSkinnedMesh) {b = new THREE.SkinnedMesh(o.geometry, matBorde); b.bind(o.skeleton, o.bindMatrix);} else b = new THREE.Mesh(o.geometry, matBorde);
    b.userData.borde = true; b.position.copy(o.position); b.quaternion.copy(o.quaternion); b.scale.copy(o.scale); b.renderOrder = -1; o.parent.add(b);
  }
}
function montar(nombreModelo, sombra) {
  const g = M[nombreModelo];
  if (nombreModelo === 'enano_kk' && !g.conCasco && M.casco_enano) {
    g.conCasco = true; let cab = null; g.scene.traverse((o) => {if (!cab && o.isBone && /^head$/i.test(o.name)) cab = o;});
    const c = M.casco_enano.scene.getObjectByName('casco_enano'); if (cab && c) {c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); c.scale.set(1, 1, 1); cab.add(c);} else console.warn('sin hueso head para el casco');
  }
  if (!g.conBorde && g.animations && g.animations.length) bordes(g);
  const raiz = clonar(g.scene);
  const vo = raiz.getObjectByName('virote_orco'); if (vo) vo.visible = false;
  /* que el móvil no dibuje a los que están fuera de cámara: esfera de recorte ampliada (las animaciones mueven la malla) */
  raiz.traverse((o) => {if (o.isMesh && o.userData.borde) {o.castShadow = false; o.visible = GR.calidad > 0; if (o.isSkinnedMesh) {if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const b = o.geometry.boundingSphere.clone(); b.radius = b.radius * 1.8 + 0.5; o.boundingSphere = b;} return;}
    if (o.isMesh) {o.castShadow = !!sombra; o.material = o.material.clone();
    if (o.isSkinnedMesh) {if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const b = o.geometry.boundingSphere.clone(); b.radius = b.radius * 1.8 + 0.5; o.boundingSphere = b;}}});
  const ESC_KK = {rohan_kk: 0.86, enano_kk: 0.76, elfo_kk: 0.88, hobbit_kk: 0.66}; if (ESC_KK[nombreModelo]) raiz.scale.setScalar(ESC_KK[nombreModelo]);
  const mixer = new THREE.AnimationMixer(raiz);
  const clips = {};
  g.animations.forEach((c) => clips[c.name] = mixer.clipAction(c));
  /* modelos de Quaternius: sus clips se llaman distinto; se apuntan a los nombres que usa el juego */
  const alias = {recibir_golpe: 'recibir', trepar: 'andar', caer: 'saltar', saltar_muro: 'saltar', golpear_puerta: 'atacar', disparar: 'atacar'};
  for (const k in alias) if (!clips[k] && clips[alias[k]]) clips[k] = clips[alias[k]];
  UNA_VEZ.forEach((k) => {if (clips[k]) {clips[k].setLoop(THREE.LoopOnce, 1); clips[k].clampWhenFinished = true;}});
  return {raiz, mixer, clips, actual: null};
}
function pon(a, nombre, fundido = 0.15, forzar = false) {
  const nueva = a.clips[nombre]; if (!nueva) return;
  if (a.actual === nueva && !forzar) return;
  nueva.reset().play();
  if (a.actual && a.actual !== nueva) a.actual.crossFadeTo(nueva, fundido, false);
  a.actual = nueva;
}
const ocupada = (a) => a.actual && UNA_VEZ.includes(a.actual.getClip().name) && a.actual.isRunning();
function golpeVisual(a) {a.sq = 0.16; a.raiz.traverse((o) => {if (o.isMesh && o.material.emissive) {o.material.emissive.setRGB(1, 1, 1); o.material.emissiveIntensity = 0.9;}}); a.flash = 0.08;}
function apagaFlash(a, dt) {
  if (a.base === undefined) a.base = a.raiz.scale.x;
  if (a.sq > 0) {a.sq = Math.max(0, a.sq - dt); const k = Math.sin(a.sq / 0.16 * Math.PI) * 0.16; a.raiz.scale.set(a.base * (1 + k), a.base * (1 - k), a.base * (1 + k));} else if (a.sq === 0) {a.raiz.scale.setScalar(a.base); a.sq = -1;}
  if (!a.flash) return; a.flash -= dt;
  if (a.flash <= 0) {a.flash = 0; const em = a.emi || [0, 0, 0]; a.raiz.traverse((o) => {if (o.isMesh && o.material.emissive) {o.material.emissive.setRGB(...em); if (a.emi) o.material.emissiveIntensity = 0.7;}});}
}

/* ---------- efectos ---------- */
const efectos = [];
function efecto(nombre, x, y, z, {escala = 1, rot = 0, vida = 0.35, crece = 1.6, fijo = false, sigue = null} = {}) {
  if (nombre === 'chispa') {particula('destello', x, y, z, {vel: 0, sube: 0, vida: 0.16, escala: 0.9 * escala, crece: 1.4, disp: 0.15}); particula('chispa', x, y, z, {n: 2, vel: 3, sube: 2, vida: 0.3, escala: 0.4 * escala, grav: 9}); return null;}
  if (nombre === 'polvo') {particula('polvo', x, y + 0.3, z, {n: Math.min(6, 1 + Math.round(escala * 2)), vel: 1.4 * escala, sube: 0.6, vida: 0.7 + vida, escala: 1.1 * escala, crece: 1.8, disp: 0.4 * escala}); return null;}
  if (nombre === 'explosion' || nombre === 'explosion_grande' || nombre === 'explosion_muro') {
    const g = nombre === 'explosion' ? 1 : 1.6; flip('fx_explosion', x, y + 1.2 * g * escala, z, {tam: 3.4 * g * escala, dur: 0.55, suelo: false});
    particula('bocanada', x, y + 0.6, z, {n: 3, vel: 2 * escala, sube: 1.5, vida: 0.5, escala: 1.6 * escala * g, crece: 1.5, disp: 0.6 * escala});
    particula('humo_negro', x, y + 1, z, {n: 3, vel: 1.2 * escala, sube: 1.8, vida: 1.2, escala: 2 * escala * g, crece: 2, disp: 0.8 * escala});
    particula('chispa', x, y + 0.5, z, {n: 5, vel: 6, sube: 4, vida: 0.5, escala: 0.4, grav: 12});
    if (nombre === 'explosion_muro') particula('piedras', x, y + 1, z, {n: 6, vel: 5, sube: 5, vida: 0.9, escala: 0.8, grav: 14, crece: 1});
    if (nombre === 'explosion') return null;
  }
  if (!P[nombre]) return null;
  const o = P[nombre].clone(true);
  o.traverse((m) => {if (m.isMesh) {m.material = m.material.clone(); m.material.transparent = true; m.material.depthWrite = false; m.userData.op = m.material.opacity;}});
  o.position.set(x, y, z); o.rotation.y = rot; o.scale.setScalar(escala);
  scene.add(o);
  const f = {o, t: 0, vida, escala, crece, fijo, sigue}; efectos.push(f); return f;
}
/* ---------- sonido (sintetizado, sin archivos) ---------- */
let AC = null, mezcla = null;
function audio() {
  if (AC) return AC;
  try {AC = new (window.AudioContext || window.webkitAudioContext)(); mezcla = AC.createDynamicsCompressor(); const g = AC.createGain(); g.gain.value = 0.55; mezcla.connect(g); g.connect(AC.destination);} catch (e) {AC = null;}
  return AC;
}
addEventListener('pointerdown', () => {const a = audio(); if (!a) return; const go = () => {cargaSonidos(a); ambiente();}; if (a.state === 'suspended') a.resume().then(go); else go();}, {passive: true});
let ruidoBuf = null;
function ruido() {if (ruidoBuf) return ruidoBuf; const a = AC, n = a.sampleRate * 0.6; ruidoBuf = a.createBuffer(1, n, a.sampleRate); const d = ruidoBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return ruidoBuf;}
const ultimo = {};
/* sonidos: grabaciones CC0 (ver sonidos/CREDITOS_audio.txt). Varias tomas por acción y nunca la misma dos veces seguidas */
const SON = window._SON = {};
const VARIAS = {espada_corte: 3, espada_armadura: 3, golpe_carne: 3, flecha_clavada: 3, disparo_arco: 3, disparo_ballesta: [1, 3], muerte_orco: 6, grito_guerra_orco: 3, aullido_huargo: 3,
  recoger_moneda: 3, recoger_gema: 3, subir_nivel: 3, abrir_cofre: 3, explosion_piedras: 3, explosion_fuego: 3, derrumbe_muro: 3, madera_rota: 3, cuerno_lejano: 3, rayo_magico: 3, rafaga_viento: 3};
const SON_LISTA = [];
for (const k in VARIAS) (Array.isArray(VARIAS[k]) ? VARIAS[k] : [...Array(VARIAS[k]).keys()].map((i) => i + 1)).forEach((i) => SON_LISTA.push('fx/' + k + '_' + i));
SON_LISTA.push('amb/lluvia_truenos', 'amb/batalla_lejana', 'mus/tregua_tensa', 'mus/batalla_epica', 'mus/alba_triunfal');
let sonCargando = false, voces = 0, lluviaSon = null;
function cargaSonidos(a) {
  if (sonCargando) return; sonCargando = true;
  SON_LISTA.forEach((n) => fetch('sonidos/' + n + '.mp3').then((r) => r.arrayBuffer()).then((b) => new Promise((ok, ko) => a.decodeAudioData(b, ok, ko))).then((buf) => {SON[n] = buf; if (n.startsWith('amb/')) ambiente();}).catch(() => {}));
}
/* lluvia y batalla lejana en bucle, cada una con su volumen */
const AMB = {};
function ambiente() {
  const a = AC; if (!a || a.state !== 'running') return;
  [['amb/lluvia_truenos', 0.32], ['amb/batalla_lejana', 0.2]].forEach(([n, v]) => {
    if (AMB[n] || !SON[n]) return;
    const s = a.createBufferSource(); s.buffer = SON[n]; s.loop = true; const g = a.createGain(); g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(v, a.currentTime + 3);
    s.connect(g); g.connect(mezcla); s.start(); AMB[n] = {s, g, v};
  });
  lluviaSon = AMB['amb/lluvia_truenos'];
}
/* música: tensa en las treguas, épica en las oleadas y triunfal al alba, con fundido entre ellas */
let musica = null;
function ponMusica(n) {
  const a = AC; if (!a || a.state !== 'running' || !SON['mus/' + n] || (musica && musica.n === n)) return;
  const t = a.currentTime;
  if (musica) {const m = musica; m.g.gain.cancelScheduledValues(t); m.g.gain.setValueAtTime(m.g.gain.value, t); m.g.gain.linearRampToValueAtTime(0.0001, t + 2.5); setTimeout(() => {try {m.s.stop();} catch (e) {}}, 2700);}
  const s = a.createBufferSource(); s.buffer = SON['mus/' + n]; s.loop = n !== 'alba_triunfal'; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3, t + 2.5);
  s.connect(g); g.connect(AC.destination); s.start(); musica = {n, s, g};
}
function paraMusica() {if (musica) {const m = musica; musica = null; m.g.gain.linearRampToValueAtTime(0.0001, AC.currentTime + 1.5); setTimeout(() => {try {m.s.stop();} catch (e) {}}, 1700);}}
function muestra(n, vol, r0 = 0.97, r1 = 1.03, retraso = 0) {
  const a = AC, b = SON[n]; if (!b || voces > 22) return false;
  const s = a.createBufferSource(); s.buffer = b; s.playbackRate.value = r0 + Math.random() * (r1 - r0);
  const g = a.createGain(); g.gain.value = vol; s.connect(g); g.connect(mezcla); voces++; s.onended = () => voces--; s.start(a.currentTime + retraso); return true;
}
const ultimaToma = {};
function toma(k, vol, r0, r1, retraso) {
  const v = VARIAS[k], lista = Array.isArray(v) ? v : [...Array(v).keys()].map((i) => i + 1);
  let i; do {i = azar(lista);} while (lista.length > 1 && i === ultimaToma[k]); ultimaToma[k] = i;
  return muestra('fx/' + k + '_' + i, vol, r0, r1, retraso);
}
const MAPA_SON = {
  tajo: (f) => toma('espada_corte', 0.4 * f), golpe: (f) => toma('golpe_carne', 0.32 * f, 0.95, 1.1), metal: () => toma('espada_armadura', 0.35),
  muerte: () => Math.random() < 0.6 ? toma('muerte_orco', 0.32, 0.92, 1.08) : true, moneda: () => toma('recoger_moneda', 0.28), xp: () => toma('recoger_gema', 0.16, 0.98, 1.12),
  nivel: () => toma('subir_nivel', 0.5), cofre: () => toma('abrir_cofre', 0.5) && toma('subir_nivel', 0.35, 1, 1, 0.3), boom: () => toma('explosion_piedras', 0.75),
  fuego: () => toma('explosion_fuego', 0.6), disparo: () => toma('disparo_arco', 0.3), ballesta: () => toma('disparo_ballesta', 0.35), clavada: () => toma('flecha_clavada', 0.28), cuerno: () => toma('cuerno_lejano', 0.7, 1, 1),
  daño: () => toma('golpe_carne', 0.6, 0.75, 0.85), construir: () => toma('espada_armadura', 0.3, 0.7, 0.8) && toma('madera_rota', 0.25, 1.1, 1.2, 0.1),
  rugido: () => toma('grito_guerra_orco', 0.5), aullido: () => toma('aullido_huargo', 0.45), muro: () => toma('derrumbe_muro', 0.7), madera: () => toma('madera_rota', 0.5),
  trueno: (f) => toma('explosion_piedras', 0.16 * f, 0.45, 0.6), rayo: () => toma('rayo_magico', 0.45), viento: () => toma('rafaga_viento', 0.4)
};
/* gemas: un tintineo suave que sube de tono si recoges muchas seguidas */
let racha = 0, rachaT = 0;
function tintineo() {
  const a = AC, t = a.currentTime; racha = t - rachaT < 0.6 ? Math.min(racha + 1, 14) : 0; rachaT = t;
  const f = 1046 * Math.pow(2, (racha % 15) / 12 * 1.5);
  [[f, 0.05], [f * 2.01, 0.018]].forEach(([fr, v]) => {const o = a.createOscillator(); o.type = 'sine'; o.frequency.value = fr; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.connect(g); g.connect(mezcla); o.start(t); o.stop(t + 0.2);});
}
function suena(tipo, fuerza = 1) {
  const a = audio(); if (!a || a.state !== 'running') return;
  cargaSonidos(a); if (!lluviaSon) ambiente();
  const ahora = a.currentTime; if (ultimo[tipo] && ahora - ultimo[tipo] < ({golpe: 0.045, muerte: 0.12, moneda: 0.05, tajo: 0.08, xp: 0.07, rugido: 2.5, muro: 0.4, madera: 0.3, clavada: 0.05}[tipo] || 0.03)) return; ultimo[tipo] = ahora;
  if (MAPA_SON[tipo] && MAPA_SON[tipo](fuerza)) return;
  const env = (g, t0, at, dur, v) => {g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + at); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);};
  const ruidoF = (tipoF, f0, f1, dur, v, q = 1) => {const s = a.createBufferSource(); s.buffer = ruido(); s.playbackRate.value = 0.8 + Math.random() * 0.4; const f = a.createBiquadFilter(); f.type = tipoF; f.Q.value = q; f.frequency.setValueAtTime(f0, ahora); f.frequency.exponentialRampToValueAtTime(f1, ahora + dur); const g = a.createGain(); env(g, ahora, 0.005, dur, v); s.connect(f); f.connect(g); g.connect(mezcla); s.start(ahora); s.stop(ahora + dur + 0.05);};
  const tono = (forma, f0, f1, dur, v) => {const o = a.createOscillator(); o.type = forma; o.frequency.setValueAtTime(f0, ahora); o.frequency.exponentialRampToValueAtTime(f1, ahora + dur); const g = a.createGain(); env(g, ahora, 0.004, dur, v); o.connect(g); g.connect(mezcla); o.start(ahora); o.stop(ahora + dur + 0.05);};
  if (tipo === 'tajo') ruidoF('bandpass', 900, 3200, 0.16, 0.35 * fuerza, 1.4);
  if (tipo === 'golpe') {tono('sine', 140 * (0.9 + Math.random() * 0.2), 50, 0.14, 0.7 * fuerza); ruidoF('lowpass', 2400, 400, 0.08, 0.45 * fuerza);}
  if (tipo === 'metal') {tono('square', 1800, 1200, 0.08, 0.12); ruidoF('highpass', 3000, 5000, 0.1, 0.25);}
  if (tipo === 'muerte') {tono('sawtooth', 220, 60, 0.22, 0.12); ruidoF('lowpass', 1200, 200, 0.18, 0.3);}
  if (tipo === 'moneda') {tono('triangle', 1320, 1760, 0.09, 0.18); setTimeout(() => tono('triangle', 1760, 2200, 0.1, 0.12), 60);}
  if (tipo === 'xp') tono('sine', 880 + Math.random() * 200, 1400, 0.07, 0.06);
  if (tipo === 'nivel') [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tono('triangle', f, f * 1.01, 0.25, 0.22), i * 90));
  if (tipo === 'boom') {tono('sine', 90, 30, 0.6, 0.9); ruidoF('lowpass', 1800, 120, 0.6, 0.7);}
  if (tipo === 'disparo') ruidoF('bandpass', 2600, 900, 0.1, 0.25, 2);
  if (tipo === 'cuerno') {tono('sawtooth', 196, 190, 0.9, 0.18); tono('sawtooth', 294, 290, 0.9, 0.1);}
  if (tipo === 'daño') {tono('square', 300, 120, 0.15, 0.18); ruidoF('lowpass', 1500, 300, 0.12, 0.3);}
  if (tipo === 'construir') {tono('sine', 120, 70, 0.2, 0.5); ruidoF('lowpass', 900, 200, 0.25, 0.4); setTimeout(() => tono('triangle', 880, 1320, 0.15, 0.15), 120);}
}

/* ---------- efectos en tiras de fotogramas (flipbooks de ChatGPT) ---------- */
const FB = {fx_fuego: [4, 2], fx_impacto: [2, 2], fx_barro: [2, 2], fx_humo: [4, 2], fx_tajo: [4, 1], fx_tajo_oro: [4, 1], fx_tajo_fuego: [4, 1], fx_onda: [4, 1], fx_explosion: [4, 4]};
const fbTex = {}; for (const n in FB) {const t = new THREE.TextureLoader().load('texturas/' + n + '.webp'); t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / FB[n][0], 1 / FB[n][1]); fbTex[n] = t;}
const fbs = [];
const fbGeo = (() => {const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g;})();
const fbMats = {};
function fbMat(n, suelo, suma) {
  const key = n + (suelo ? 1 : 0) + (suma ? 1 : 0);
  if (fbMats[key]) return fbMats[key];
  const [cx, cy] = FB[n], arr = [];
  for (let k = 0; k < cx * cy; k++) {
    const t = fbTex[n].clone(); t.offset.set((k % cx) / cx, 1 - (Math.floor(k / cx) + 1) / cy);
    const o = {map: t, transparent: true, depthWrite: false, blending: suma ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: n === 'fx_humo' ? 0.6 : 1};
    arr.push(suelo ? new THREE.MeshBasicMaterial({...o, side: THREE.DoubleSide}) : new THREE.SpriteMaterial(o));
  }
  return (fbMats[key] = arr);
}
const fbLibres = {m: [], s: []};
function flip(n, x, y, z, {tam = 3, rot = 0, dur = 0.3, suelo = true, suma = true} = {}) {
  if (enFranja(z) && y < 2.5) y += Y_MURO;
  const mats = fbMat(n, suelo, suma);
  const o = (suelo ? fbLibres.m : fbLibres.s).pop() || (suelo ? new THREE.Mesh(fbGeo, mats[0]) : new THREE.Sprite(mats[0]));
  o.material = mats[0]; o.rotation.set(0, 0, 0);
  o.position.set(x, y, z); o.scale.set(tam, suelo ? 1 : tam, tam); if (suelo) o.rotation.y = rot + Math.PI; o.renderOrder = 3; scene.add(o);
  fbs.push({o, mats, suelo, n, dur, e: 0});
}
function actualizaFlips(dt) {
  for (let i = fbs.length - 1; i >= 0; i--) {
    const f = fbs[i]; f.e += dt; const tot = f.mats.length, k = Math.min(tot - 1, Math.floor(f.e / f.dur * tot));
    if (f.e >= f.dur) {scene.remove(f.o); (f.suelo ? fbLibres.m : fbLibres.s).push(f.o); fbs.splice(i, 1); continue;}
    f.o.material = f.mats[k];
  }
}

/* ---------- partículas pintadas (hoja de ChatGPT 4x4) ---------- */
const PART = {llama: 0, llama2: 1, bocanada: 2, chispa: 3, brasa: 4, humo: 5, humo_negro: 6, polvo: 7, gota: 8, sangre: 9, destello: 10, aro: 11, oro: 12, verde: 13, astillas: 14, piedras: 15};
const SUMA = [0, 1, 2, 3, 4, 10, 12, 13];
const partTex = new THREE.TextureLoader().load('texturas/particulas.webp'); partTex.colorSpace = THREE.SRGBColorSpace;
const partMat = Object.values(PART).map((i) => {
  const t = partTex.clone(); t.repeat.set(0.25, 0.25); t.offset.set((i % 4) / 4, 1 - ((i / 4) | 0) / 4 - 0.25); t.needsUpdate = true;
  return new THREE.SpriteMaterial({map: t, transparent: true, depthWrite: false, blending: SUMA.includes(i) ? THREE.AdditiveBlending : THREE.NormalBlending, fog: true});
});
const parts = [], partLibres = partMat.map(() => []);
function particula(tipo, x, y, z, {n = 1, vel = 1.5, sube = 1, vida = 0.6, escala = 0.8, crece = 1.6, grav = 0, disp = 0.3, giro = 1} = {}) {
  const i = PART[tipo]; if (i === undefined) return; if (enFranja(z) && y < 2.5) y += Y_MURO;
  for (let k = 0; k < n; k++) {
    if (parts.length > 260) {const v = parts.shift(); scene.remove(v.s); partLibres[v.i].push(v.s);}
    const sp = partLibres[i].pop() || new THREE.Sprite(partMat[i].clone()); sp.material.opacity = 0; const a = Math.random() * Math.PI * 2, v = vel * (0.4 + Math.random() * 0.8);
    sp.position.set(x + rnd(-disp, disp), y + rnd(-disp, disp) * 0.5, z + rnd(-disp, disp)); const e = escala * rnd(0.75, 1.25); sp.scale.setScalar(e);
    sp.material.rotation = Math.random() * Math.PI * 2; scene.add(sp);
    parts.push({i, op: (tipo === 'humo' || tipo === 'polvo' || tipo === 'humo_negro') ? 0.55 : 1, s: sp, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: sube * (0.6 + Math.random() * 0.8), t: 0, vida: vida * rnd(0.8, 1.2), e, crece, grav, giro: rnd(-giro, giro)});
  }
}
function actualizaParticulas(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.t += dt; const k = p.t / p.vida;
    if (k >= 1) {scene.remove(p.s); partLibres[p.i].push(p.s); parts.splice(i, 1); continue;}
    p.vy -= p.grav * dt; p.s.position.x += p.vx * dt; p.s.position.y = Math.max(0.12, p.s.position.y + p.vy * dt); p.s.position.z += p.vz * dt;
    p.vx *= 1 - dt * 1.5; p.vz *= 1 - dt * 1.5;
    p.s.scale.setScalar(p.e * (1 + (p.crece - 1) * k)); p.s.material.rotation += p.giro * dt; p.s.material.opacity = (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85) * (p.op || 1);
  }
}
/* llamas de antorcha vivas */
const llamas = [];
function ponLlama(x, y, z, esc = 0.9) {const t = fbTex.fx_fuego.clone(); t.needsUpdate = true; const s = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending})); s.userData.t = t; esc *= 1.25; s.position.set(x, y, z); s.scale.setScalar(esc); scene.add(s); llamas.push({s, f: Math.random() * 9, esc}); return s;}
function actualizaLlamas(dt) {
  for (const l of llamas) {
    l.f += dt * 12; const fr = (l.f | 0) % 8; l.s.userData.t.offset.set((fr % 4) / 4, fr < 4 ? 0.5 : 0);
    l.s.scale.set(l.esc * (0.9 + Math.sin(l.f * 1.7) * 0.08), l.esc * (1 + Math.sin(l.f * 2.3) * 0.12), 1);
    if (Math.random() < dt * 2.5) particula('brasa', l.s.position.x, l.s.position.y + 0.3, l.s.position.z, {vel: 0.3, sube: 1.4, vida: 1.2, escala: 0.25, crece: 0.6, disp: 0.1});
  }
}
function actualizaEfectos(dt) {
  actualizaFlips(dt); actualizaParticulas(dt); actualizaLlamas(dt);
  for (let i = efectos.length - 1; i >= 0; i--) {
    const f = efectos[i]; f.t += dt; const k = f.t / f.vida;
    if (k >= 1) {scene.remove(f.o); efectos.splice(i, 1); continue;}
    if (f.sigue) f.o.position.set(f.sigue.x, f.o.position.y, f.sigue.z);
    if (f.fijo) {const p = 0.55 + 0.35 * Math.sin(f.t * 22); f.o.traverse((m) => {if (m.isMesh) m.material.opacity = (m.userData.op || 1) * p;}); continue;}
    f.o.scale.setScalar(f.escala * (1 + (f.crece - 1) * k));
    f.o.traverse((m) => {if (m.isMesh) m.material.opacity = (m.userData.op || 1) * (1 - k * k);});
  }
}
/* manchas de sangre de orco (se borran solas) */
const manchas = [];
function mancha(x, z, s) {
  if (!P.sangre_orco || z < PATIO.z0) return;
  const o = P.sangre_orco.clone(true); o.traverse((m) => {if (m.isMesh) {m.material = m.material.clone(); m.material.transparent = true; m.material.depthWrite = false;}});
  o.position.set(x, 0.17, z); o.rotation.y = rnd(0, 6.3); o.scale.setScalar(s * rnd(0.7, 1.1)); scene.add(o);
  manchas.push({o, t: 0}); if (manchas.length > 40) scene.remove(manchas.shift().o);
}
function actualizaManchas(dt) {
  for (let i = manchas.length - 1; i >= 0; i--) {const m = manchas[i]; m.t += dt; if (m.t > 10) {const op = Math.max(0, 1 - (m.t - 10) / 3); m.o.traverse((k) => {if (k.isMesh) k.material.opacity = op;}); if (m.t > 13) {scene.remove(m.o); manchas.splice(i, 1);}}}
}
/* barras de vida de los enemigos: dos mallas instanciadas para todos (2 dibujos por fotograma, no cuesta rendimiento) */
const BARRAS = (() => {
  const N = 64, g = new THREE.PlaneGeometry(1, 1); g.translate(0.5, 0, 0);
  const mk = (color, ord) => {const m = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({color, depthTest: false, depthWrite: false, transparent: true, opacity: 0.92, toneMapped: false}), N); m.renderOrder = ord; m.frustumCulled = false; m.count = 0; scene.add(m); return m;};
  const r = {N, fondo: mk(0x0c0806, 20), vida: mk(0xffffff, 21)}; r.fondo.material.opacity = 0.62; return r;
})();
const _bq = new THREE.Quaternion(), _bs = new THREE.Vector3(), _bp = new THREE.Vector3(), _bm = new THREE.Matrix4(), _bd = new THREE.Vector3(), _bc = new THREE.Color();
function pintaBarras() {
  const {fondo, vida, N} = BARRAS; let n = 0;
  _bq.copy(camera.quaternion); _bd.set(1, 0, 0).applyQuaternion(_bq);
  if (J && !document.body.classList.contains('cine')) for (const e of J.enemigos) {
    if (n >= N) break;
    if (e.muerto || e.d.jefe || e.vida <= 0 || e.fase === 'hacia' && e.z < -40) continue;
    const pc = e.vida / e.vidaMax; if (pc >= 0.999 && !e.d.pesado && !e.elite) continue;
    const w = e.d.pesado ? 1.9 : e.elite ? 1.35 : 1.1, alto = (e.d.pesado ? 4.5 : 2.55) * (e.elite ? 1.25 : 1);
    _bp.set(e.x, e.y + alto, e.z).addScaledVector(_bd, -w / 2 - 0.05);
    _bs.set(w + 0.1, 0.27, 1); fondo.setMatrixAt(n, _bm.compose(_bp, _bq, _bs));
    _bp.addScaledVector(_bd, 0.05); _bs.set(Math.max(0.001, w * pc), 0.16, 1); vida.setMatrixAt(n, _bm.compose(_bp, _bq, _bs));
    vida.setColorAt(n, _bc.setHex(e.elite ? 0xffc23a : pc > 0.5 ? 0xe8432c : 0xff7a1a));
    n++;
  }
  fondo.count = vida.count = n; fondo.instanceMatrix.needsUpdate = vida.instanceMatrix.needsUpdate = true; if (vida.instanceColor) vida.instanceColor.needsUpdate = true;
}
/* números de daño */
const nums = [];
const _p = new THREE.Vector3();
function numero(x, y, z, txt, cls = '') {
  if (enFranja(z) && y < 4) y += Y_MURO;
  let n = nums.find((k) => k.t >= 1);
  if (!n) {if (nums.length >= 14) return; const el = document.createElement('div'); $('nums').appendChild(el); n = {el, t: 1}; nums.push(n);}
  n.el.className = 'num ' + cls; n.el.textContent = txt; n.x = x + rnd(-.3, .3); n.y = y; n.z = z; n.t = 0; n.el.style.display = 'block';
}
/* «juice»: la moneda sale volando hasta el marcador de oro y el marcador bota */
function monedaVuela(x, z) {
  const o = $('oro'); if (!o || document.querySelectorAll('.vuela').length > 8) return;
  _p.set(x, (J.h.y ?? 0.15) + 1, z).project(camera);
  const r = o.getBoundingClientRect(), el = document.createElement('img'); el.src = 'ui/moneda_hud.webp'; el.className = 'vuela';
  el.style.left = ((_p.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - _p.y) / 2 * innerHeight) + 'px'; document.body.appendChild(el);
  requestAnimationFrame(() => {el.style.left = (r.left + 8) + 'px'; el.style.top = (r.top + r.height / 2) + 'px'; el.style.transform = 'translate(-50%,-50%) scale(.6)';});
  setTimeout(() => {el.remove(); bota('oro');}, 480);
}
function bota(id) {const e = $(id); if (!e) return; e.classList.remove('bota'); void e.offsetWidth; e.classList.add('bota');}
function actualizaNumeros(dt) {
  for (const n of nums) {
    if (n.t >= 1) continue; n.t += dt / 0.7;
    if (n.t >= 1) {n.el.style.display = 'none'; continue;}
    _p.set(n.x, n.y + Math.sin(Math.min(1, n.t * 2.2) * Math.PI / 2) * 1.6, n.z).project(camera);
    const pop = n.t < 0.12 ? 1.7 - n.t / 0.12 * 0.7 : 1;
    n.el.style.left = ((_p.x + 1) / 2 * innerWidth) + 'px'; n.el.style.top = ((1 - _p.y) / 2 * innerHeight) + 'px'; n.el.style.opacity = n.t < 0.7 ? 1 : 1 - (n.t - 0.7) / 0.3;
    n.el.style.transform = 'translate(-50%,-50%) scale(' + pop.toFixed(2) + ')';
  }
}

/* ---------- estado ---------- */
let J = null;
const debug = {on: false, grupo: new THREE.Group()};
scene.add(debug.grupo);

function limpia() {
  if (!J) return;
  J.enemigos.forEach((e) => scene.remove(e.a.raiz)); J.gemas.forEach((g) => scene.remove(g.m));
  J.escalas.forEach((s) => s.obj && scene.remove(s.obj)); J.proy.forEach((p) => scene.remove(p.o)); J.eproy.forEach((p) => scene.remove(p.o));
  J.defensas.forEach((d) => scene.remove(d.o)); J.charcos.forEach((c) => scene.remove(c.o)); J.orbitales.forEach((o) => scene.remove(o.o));
  J.tramos.forEach((t) => {if (t.obj) scene.remove(t.obj); if (t.andamio) scene.remove(t.andamio); if (t.arq) scene.remove(t.arq.a.raiz);});
  (J.jinetes || []).forEach((j) => scene.remove(j.a.raiz)); (J.elfos || []).forEach((el) => scene.remove(el.a.raiz));
  (J.sitios || []).forEach((si) => {scene.remove(si.marca); if (si.obj) scene.remove(si.obj);});
  (J.aldeanos || []).forEach((al) => scene.remove(al.a.raiz));
  scene.remove(J.h.a.raiz);
}
function nuevaPartida(tipo) {
  limpia(); $('bEsq').classList.remove('hidden'); $('bHab').classList.remove('hidden'); $('bHab').querySelector('img').src = 'iconos/h_' + tipo + '.webp';
  const b = HEROES[tipo], pm = guardado.perm;
  const vida = Math.round(b.vida * (1 + 0.1 * (pm.vida || 0)));
  const h = {tal: {}, racha: 0, tipo, ...b, vida, vidaMax: vida, dano: b.dano * (1 + 0.1 * (pm.dano || 0)), vel: b.vel * (1 + 0.05 * (pm.vel || 0)), iman: 2.6, xpMul: 1, regen: 0, armadura: 0, velArmas: 1, danoEscala: 1, multi: b.multi || 1, atraviesa: b.atraviesa || 0,
    x: marcas.jugador_inicio.x, z: marcas.jugador_inicio.z, rot: Math.PI, cd: 0, golpe: 0, objetivo: null, alterna: 0, inv: 0, a: montar(b.modelos ? azar(b.modelos) : b.modelo, true)};
  aplicaEquipo(h, tipo); vistePersonaje(h.a.raiz, tipo);
  scene.add(h.a.raiz); pon(h.a, 'quieto');
  if (!window._aro) {const g = new THREE.PlaneGeometry(1.9, 1.9); g.rotateX(-Math.PI / 2); const tx = new THREE.TextureLoader().load('ui/aro_heroe.webp'); tx.colorSpace = THREE.SRGBColorSpace; window._aro = new THREE.Mesh(g, new THREE.MeshBasicMaterial({map: tx, transparent: true, opacity: 0.8, depthWrite: false})); window._aro.renderOrder = 2;}
  scene.add(window._aro);
  const escalas = [];
  for (let i = 1; i <= 6; i++) {const p = marcas['escala_' + i]; escalas.push({i, x: p.x, estado: 'nada', t: 0, vida: 0, obj: null, cola: 0});}
  J = {h, nubes: [], enemigos: [], gemas: [], escalas, tramos: escalas.map((e) => ({i: e.i - 1, x: (e.x = XT[e.i - 1]), vida: 100, max: 100, nivel: 0, roto: false})), treguaVista: -1, aldeanos: [], barr: {vida: 0, max: 0}, amenaza: null, desagueObj, proy: [], eproy: [], defensas: [], charcos: [], orbitales: [], armas: {}, pasivas: {}, evos: {},
    t: 0, spawnT: 1.5, puerta: 500, puertaMax: 500, nivel: 1, xp: 0, xpSig: 5, bajas: 0, puntos: 0, oro: 15 * (pm.oro || 0) + 10, oroTotal: 0,
    pausa: false, fin: false, temblor: 0, oleada: 60, parada: 0, brecha: 0, desague: false, jefe: null, jefeSale: false, cola: 0};
  J.arbol = (RAMAS[tipo] || RAMAS.rohan).map((def) => ({def, nv: 0}));
  J.enMuro = true; h.x = rnd(-2, 2); h.z = Z_MURO_ARRIBA + 0.9; h.y = Y_MURO; h.rot = Math.PI; J.ola = 0; J.olaIni = 0; J.porSalir = 0; J.olaTotal = 1; J.tregua = {ini: 0, fin: TREGUA_S + 3, n: 0}; J.dichos = {}; J.retoBajas = {gimli: 0, legolas: 0}; J.fuegoT = 95;
  J.tramos.forEach(ponTramo); montaSitios(); $('etiq').innerHTML = '';
  ponPuerta('puerta_ok'); GR.rompeTramo(-1, false); $('tregua').style.display = 'none'; document.body.classList.remove('tregua');
  pintaHud(); pintaArmas(); pintaMuro();
  (location.search.includes('dbg') ? ['hud', 'dbg'] : ['hud']).forEach((k) => $(k).classList.remove('hidden'));
  aviso('¡A la muralla! Golpea las escalas para tirarlas abajo'); setTimeout(() => J && !J.fin && habla('theoden', 'Detrás de la puerta del fondo están las mujeres y los niños, en las cuevas. Si esa puerta cae, todo está perdido.'), 14000); setTimeout(() => J && !J.fin && aviso('Las escaleras de las esquinas bajan al patio', 2600), 6000); setTimeout(() => J && !J.fin && habla('aragorn'), 2500);
}

/* ---------- enemigos ---------- */
function creaEnemigo(tipo, opc = {}) {
  if (tipo === 'huargo_alfa') suena('aullido');
  if (['troll', 'troll_acorazado', 'berserker', 'capitan'].includes(tipo)) suena('rugido'); else if (tipo === 'huargo_jinete' || (tipo === 'warg' && Math.random() < 0.15)) suena('aullido');
  const d = ENEMIGOS[tipo];
  const sp = marcas['spawn_' + (1 + ((Math.random() * 4) | 0))];
  const esc = J.escalas.slice().sort((a, b) => (a.cola - b.cola) || (Math.abs(a.x - sp.x) - Math.abs(b.x - sp.x)))[0];
  const elite = !d.jefe && !d.pesado && opc.elite;
  const e = {tipo, d, vida: d.vida * DURO * (1 + tE() / 300) * (elite ? 3 : 1), x: sp.x + rnd(-2, 2), z: sp.z + rnd(-2, 2), y: 0.3, fase: 'hacia', escala: esc, sube: 0, cd: rnd(0.3, 0.8), golpe: 0, muerto: 0, aturdido: 0, lento: 0, elite, a: montar(d.modelo, !!d.jefe)};
  e.vidaMax = e.vida;
  if (d.tinte) {const c = new THREE.Color(d.tinte); e.a.raiz.traverse((o) => {if (o.isMesh) {o.material.color.multiply(c); o.material.metalness = Math.max(o.material.metalness || 0, 0.45);}});}
  if (d.antorcha) {e.a.emi = [0.9, 0.35, 0.05]; e.a.raiz.traverse((o) => {if (o.isMesh && o.material.emissive) {o.material.emissive.setRGB(...e.a.emi); o.material.emissiveIntensity = 0.7;}});}
  const s = (d.escala || 1) * (elite ? 1.25 : 1); e.a.raiz.scale.setScalar(s); e.radio = d.radio * (elite ? 1.2 : 1);
  if (elite && P.brillo_elite) {const au = P.brillo_elite.clone(); au.scale.setScalar(0.8 / s); e.a.raiz.add(au);}
  if (opc.patio) {e.fase = 'patio'; e.x = opc.x; e.z = opc.z; e.y = 0.15; efecto('polvo', e.x, 0.15, e.z, {escala: 1.2, vida: 0.5});}
  else if (opc.brecha) {e.fase = 'brecha'; e.x = BRECHA.x + rnd(-5, 5); e.z = opc.z ?? (Z_MURO_FUERA - rnd(6, 12)); e.y = 0.15;}
  else esc.cola++;
  e.a.raiz.position.set(e.x, e.y, e.z);
  scene.add(e.a.raiz); pon(e.a, d.correr ? 'correr' : 'andar');
  J.enemigos.push(e);
  return e;
}
const olaDe = () => J ? J.ola : 0;
function eligeTipo() {
  const ola = olaDe(J.t), r = Math.random(), vivos = (k) => J.enemigos.filter((e) => e.tipo === k && !e.muerto).length;
  if (ola >= 2 && r < 0.07) return 'orco_arquero';
  if (ola >= 3 && r > 0.97 && vivos('chaman_isengard') < 2) return 'chaman_isengard';
  if (ola >= 3 && r > 0.9) return 'uruk_piquero';
  if (ola <= 1) return r < 0.25 ? 'uruk' : 'orco';
  if (ola === 2) return r < 0.14 ? 'warg' : r < 0.22 ? 'huargo_jinete' : r < 0.55 ? 'uruk' : 'orco';
  if (ola === 3) return r < 0.18 ? 'uruk_acorazado' : r < 0.3 ? 'ballestero' : r < 0.38 ? 'warg' : r < 0.46 ? 'berserker' : r < 0.76 ? 'uruk' : 'orco';
  if (ola === 4) return r < 0.22 ? 'uruk_acorazado' : r < 0.3 ? 'ballestero' : r < 0.45 ? 'berserker' : r < 0.53 ? 'warg' : r < 0.78 ? 'uruk' : 'orco';
  if (r < 0.04 && vivos('portaestandarte') < 2) return 'portaestandarte';
  return r < 0.2 ? 'uruk_acorazado' : r < 0.28 ? 'ballestero' : r < 0.34 ? 'huargo_jinete' : r < 0.42 ? 'warg' : r < 0.52 ? 'berserker' : r < 0.8 ? 'uruk' : 'orco';
}
function spawns(dt) {
  const tr = enTregua(J.t);
  if (tr) {if (J.treguaVista !== tr[0]) empiezaTregua(tr); if (J.t >= tr[1]) {J.tregua = null; acabaTregua();} return;}
  const vivos = J.enemigos.reduce((k, e) => k + (e.muerto ? 0 : 1), 0);
  if (vivos !== J.vivos || J.bajas !== J.bajasV) {J.bajasV = J.bajas; J.quietoT = J.t;} J.vivos = vivos;
  /* que una oleada no se quede atascada: si quedan pocos y llevan mucho sin caer, avisa y al rato huyen */
  if (J.porSalir <= 0 && vivos > 0 && vivos <= 3 && !J.alba) {
    if (J.t - J.quietoT > 20 && J.avisoUlt !== J.ola) {J.avisoUlt = J.ola; aviso('Quedan ' + vivos + '. ¡Búscalos, que no se escapen!', 1800);}
    if (J.t - J.quietoT > 45) {for (const e of J.enemigos) if (!e.muerto) {e.muerto = 0.6; e.vida = 0; pon(e.a, 'morir', 0.1, true);} aviso('Los últimos huyen hacia el valle', 1500);}
  }
  /* fin de oleada: no queda nadie por salir ni vivo */
  if (J.porSalir <= 0 && vivos === 0 && !J.alba) {
    if (J.ola >= NOLAS) {J.alba = J.t; return;}
    J.tregua = {ini: J.t, fin: J.t + TREGUA_S, n: J.ola}; aviso('¡Oleada ' + J.ola + ' rechazada!', 1800); suena('cuerno'); return;
  }
  /* el alba: en la última oleada, cuando quedan pocos, llegan los jinetes */
  if (J.ola >= NOLAS && J.porSalir <= 0 && vivos <= 6 && !J.alba) J.alba = J.t;
  J.spawnT -= dt;
  const enBrecha = J.brecha > 0, ola = olaDe(J.t);
  if (J.spawnT <= 0 && vivos < MAX_ENEMIGOS && J.porSalir > 0) {
    J.spawnT = Math.max(0.85, 2.4 - tE() / 200); J.porSalir--;
    const tipo = eligeTipo(), elite = tE() > 60 && Math.random() < 0.015;
    if (enBrecha && Math.random() < 0.45) creaEnemigo(tipo, {brecha: true, elite});
    else creaEnemigo(tipo, {elite});
  }
  /* golpes de cada oleada */
  if (J.t >= J.oleada && J.porSalir > 0) {
    J.oleada = J.t + 22;
    const n = Math.min(J.porSalir, 4 + (tE() / 45) | 0);
    for (let i = 0; i < n && vivos + i < MAX_ENEMIGOS + 8; i++) {J.porSalir--; creaEnemigo(eligeTipo(), {elite: Math.random() < 0.02});}
    if (J.olaEsp === J.ola) {} else {J.olaEsp = J.ola;
    if (ola === 2) {for (let i = 0; i < 3; i++) creaEnemigo('warg'); creaEnemigo('huargo_alfa'); aviso('¡Una manada de huargos con su jefe de manada!', 1600);}
    else if (ola === 3) {antorchero(); aviso('¡Uruk-hai acorazados en el muro!', 1400);}
    else if (ola >= 4) {creaEnemigo(ola === 4 ? 'troll_acorazado' : 'troll'); if (ola === 4) creaEnemigo('troll'); if (!J.arietes || J.arietes < ola - 3) {J.arietes = (J.arietes || 0) + 1; ariete();} else aviso('¡Trolls asaltan la muralla!', 1400);}
    else aviso('¡Una oleada se acerca!', 1200);
  }}
  if (!J.desague && J.ola >= 3 && J.t >= J.olaIni + 18) {J.desague = true; antorchero(true);}
  if (J.ola >= 3 && J.desague && !enTregua(J.t) && J.troncoOla !== J.ola && J.t >= J.olaIni + (J.ola === 3 ? 34 : 16) && !J.alba) {J.troncoOla = J.ola; tronco();}
  if (J.brecha > 0) J.brecha -= dt;
  /* fuego de Isengard: Saruman manda sus bombas; marcan el suelo y estallan al segundo y medio */
  if (J.cine) J.fuegoT = Math.max(J.fuegoT, J.t + 4);
  if (J.t > J.fuegoT) {J.fuegoT = J.t + rnd(18, 26); fuegoIsengard();}
  if (!J.jefeSale && J.ola >= NOLAS && J.t >= J.olaIni + 15) {J.jefeSale = true; J.jefe = creaEnemigo('capitan', {brecha: true, z: Z_MURO_FUERA - 6}); J.jefe.cdJefe = 2.5; $('bJefe').style.display = 'flex'; aviso('¡El capitán uruk entra en el patio!', 2400); J.temblor = 0.6;}
}
/* el ariete: golpea el tramo más débil desde fuera; cuando cae, entra y va a por la puerta */
function mueveAriete(e, dt) {
  portadores(e);
  if (e.embiste > 0) {
    e.embiste -= dt;
    if (e.embiste <= 0.7 && !e.golpeDado) {
      e.golpeDado = true; J.temblor = Math.max(J.temblor, 0.45);
      if (e.fase === 'patio') {golpeaPuerta(e.d.danoPuerta); efecto('polvo', e.x, 0.3, PATIO.z1, {escala: 2, vida: 0.6}); aviso('¡El ariete golpea la puerta!', 900);}
      else if (e.tramo && !e.tramo.roto) {dañaTramo(e.tramo, 28); efecto('polvo', e.tramo.x, 1, Z_MURO_FUERA - 0.3, {escala: 2.2, vida: 0.6});}
    }
    return;
  }
  if (e.fase !== 'patio') {
    if (!e.tramo || e.tramo.roto) {const rotos = J.tramos.filter((t) => t.roto); e.tramo = e.tramo && e.tramo.roto ? e.tramo : (rotos[0] || J.tramos.slice().sort((a, b) => a.vida - b.vida)[0]);}
    const tx = e.tramo.x, tz = e.tramo.roto ? BRECHA.z + 1.5 : Z_MURO_FUERA - 2.7, dx = tx - e.x, dz = tz - e.z, d = Math.hypot(dx, dz);
    if (e.tramo.roto && e.z > Z_MURO_FUERA - 3.0) {e.z += 1.3 * dt; e.x += Math.sign(dx) * Math.min(Math.abs(dx), dt); e.rot = 0; pon(e.a, 'avanzar'); if (e.z >= BRECHA.z + 1) {e.fase = 'patio'; aviso('¡El ariete entra en el patio! Va a por la puerta', 1800);} return;}
    if (d > 0.3) {e.x += dx / d * e.d.vel * dt; e.z += dz / d * e.d.vel * dt; e.rot = Math.atan2(dx, dz); pon(e.a, 'avanzar'); return;}
    e.rot = 0; e.embiste = 2.6; e.golpeDado = false; pon(e.a, 'embestir', 0.1, true); return;
  }
  const tz = PATIO.z1 - 3.0, dz = tz - e.z, dx = -e.x;
  if (Math.abs(dz) > 0.3 || Math.abs(dx) > 0.3) {const d = Math.hypot(dx, dz); e.x += dx / d * e.d.vel * dt; e.z += dz / d * e.d.vel * dt; e.rot = Math.atan2(dx, dz); pon(e.a, 'avanzar'); return;}
  e.rot = 0; e.embiste = 3.0; e.golpeDado = false; pon(e.a, 'embestir', 0.1, true);
}
/* «¡Traen un tronco!»: uruks a la carrera con un tronco a por la puerta. Hay que tumbarlos antes (focus) */
function tronco() {
  const rotos = J.tramos.filter((t) => t.roto), tr = rotos.length ? azar(rotos) : J.tramos.slice().sort((a, b) => a.vida - b.vida)[0];
  const e = creaEnemigo('tronco', {brecha: true}); e.x = tr.x + rnd(-1, 1); e.z = Z_MURO_FUERA - 16; e.fase = 'hacia'; e.tramo = tr; e.marcaT = 0;
  cartelOla('¡UN TRONCO!', 'Uruks a la carrera contra la puerta', 'Tumbadlos antes de que lleguen');
  setTimeout(() => J && habla('gimli', '¡A por los del tronco! ¡Que no lleguen a la puerta!'), 900);
}
function portadores(e) {
  if (!e.port) {e.port = []; for (let i = 1; i <= 8; i++) {const o = e.a.raiz.getObjectByName('portador_' + i); if (o) e.port.push(o);}}
  const n = e.port.length; if (!n) return;
  const quedan = Math.max(1, Math.ceil(n * e.vida / e.vidaMax));
  e.port.forEach((o, i) => {const ver = i < quedan; if (o.visible && !ver) {efecto('polvo', e.x, 0.4, e.z, {escala: 0.9, vida: 0.4}); if (Math.random() < 0.6) suena('muerte');} o.visible = ver;});
}
function mueveTronco(e, dt) {
  portadores(e);
  const pc = Math.max(0, e.vida / e.vidaMax), v = e.d.vel * (0.45 + 0.55 * pc) * (e.lento > 0 ? 0.6 : 1);
  if (e.lento > 0) e.lento -= dt;
  if (e.aturdido > 0) {e.aturdido -= dt; return;}
  if (e.embiste > 0) {
    e.embiste -= dt;
    if (e.embiste <= 0.75 && !e.golpeDado) {
      e.golpeDado = true; J.temblor = Math.max(J.temblor, 0.7); J.parada = Math.max(J.parada || 0, 0.08);
      if (e.fase === 'patio') {golpeaPuerta(e.d.danoPuerta * (0.5 + 0.5 * pc)); efecto('polvo', e.x, 0.3, PATIO.z1, {escala: 2.6, vida: 0.7, crece: 2}); particula('astillas', e.x, 2, PATIO.z1 - 0.5, {n: 10, vel: 5, sube: 4, vida: 0.7, escala: 0.7, grav: 12}); aviso('¡El tronco golpea la puerta!', 1000);}
      else if (e.tramo && !e.tramo.roto) {dañaTramo(e.tramo, 45); efecto('polvo', e.tramo.x, 1, Z_MURO_FUERA - 0.3, {escala: 2.4, vida: 0.6});}
    }
    if (e.embiste <= 0) {e.retro = 0.9;}
    return;
  }
  if (e.retro > 0) {e.retro -= dt; e.z -= dt * 2.4; pon(e.a, 'avanzar'); return;}   /* toma carrerilla */
  if (e.fase === 'hacia') {
    if (e.tramo.roto) {
      const dx = e.tramo.x - e.x, dz = BRECHA.z + 1.5 - e.z, d = Math.hypot(dx, dz);
      if (d < 0.6) {e.fase = 'patio'; aviso('¡El tronco ha entrado! ¡A por ellos!', 1400); return;}
      e.x += dx / d * v * dt; e.z += dz / d * v * dt; e.rot = Math.atan2(dx, dz); pon(e.a, 'avanzar'); e.y = 0.15; return;
    }
    const tz = Z_MURO_FUERA - 2.8, dx = e.tramo.x - e.x, dz = tz - e.z, d = Math.hypot(dx, dz);
    if (d > 0.4) {e.x += dx / d * v * dt; e.z += dz / d * v * dt; e.rot = Math.atan2(dx, dz); pon(e.a, 'avanzar'); return;}
    e.rot = 0; e.embiste = 1.6; e.golpeDado = false; pon(e.a, 'embestir', 0.1, true); return;
  }
  const tz = PATIO.z1 - 3.2, dz = tz - e.z, dx = -e.x * 0.9;
  if (Math.abs(dz) > 0.4 || Math.abs(dx) > 0.6) {const d = Math.hypot(dx, dz); e.x += dx / d * v * dt; e.z += dz / d * v * dt; e.rot = Math.atan2(dx, dz); pon(e.a, 'avanzar'); return;}
  e.rot = 0; e.embiste = 1.6; e.golpeDado = false; pon(e.a, 'embestir', 0.1, true);
}
function ariete() {
  const e = creaEnemigo('ariete'); e.x = rnd(-8, 8); e.z = -46; e.fase = 'hacia';
  if (e.escala) e.escala.cola = Math.max(0, e.escala.cola - 1); e.escala = null;
  aviso('¡Traen un ariete! Golpeará el muro y luego la puerta. Fuego, calderos y ballestas', 2800);
}
/* al alba bajan los jinetes de Rohan y barren el patio */
function cargaJinetes() {
  if (J.jinetes || !M.jinete_rohan) return;
  J.jinetes = [];
  aviso('¡Al alba! ¡Los jinetes de Rohan cargan!', 3000); J.temblor = 0.8; setTimeout(() => J && habla('eomer'), 2600);
  for (let i = 0; i < 9; i++) {
    const a = montar('jinete_rohan', true), x = -14 + i * 3.5 + rnd(-0.8, 0.8);
    a.raiz.position.set(x, 0.15, PATIO.z1 + 3 + rnd(0, 6)); a.raiz.rotation.y = Math.PI; scene.add(a.raiz); pon(a, 'galopar');
    J.jinetes.push({a, x, z: a.raiz.position.z, cd: 0});
  }
}
function actualizaJinetes(dt) {
  if (!J.jinetes && J.alba) cargaJinetes();
  if (!J.jinetes) return;
  for (const j of J.jinetes) {
    j.a.mixer.update(dt); j.cd -= dt;
    if (j.z > PATIO.z0 - 4) j.z -= 13 * dt;
    j.a.raiz.position.set(j.x, 0.15, j.z);
    for (const e of cercanos(j.x, j.z, 3)) if (!e.muerto && e.fase === 'patio' && Math.hypot(e.x - j.x, e.z - j.z) < 1.8 + e.radio) {
      if (j.cd <= 0) {j.cd = 0.5; pon(j.a, 'golpe_lanza', 0.05, true); setTimeout(() => pon(j.a, 'galopar', 0.15), 450);}
      FUENTE = 'lanza'; if (e.d.jefe || e.d.ariete) hiere(e, 25, 0, -1, 0); else {e.gdx = rnd(-1, 1); e.gdz = -2; e.gn = 9; e.vida = 0; mata(e, false);}
    }
  }
}
/* los elfos de Lórien: llegan tras la primera tregua, unos al muro y otros contigo */
function vanguardia() {
  J.elfos = [];
  for (const x of [-11, -2, 7]) {
    const a = montar('elfo_kk', true); a.raiz.position.set(x, Y_MURO, Z_MURO_ARRIBA + 0.6); a.raiz.rotation.y = Math.PI; scene.add(a.raiz); pon(a, 'quieto');
    J.elfos.push({a, muro: true, lento: true, x, z: Z_MURO_ARRIBA + 0.6, cd: rnd(1, 3)});
  }
}
function llegaElfos() {
  if (J.elfosTodos) return; J.elfosTodos = true; J.elfos = J.elfos || [];
  aviso('¡Llegan los elfos de Lórien! Vienen a luchar a vuestro lado', 3200); suena('cuerno'); habla('haldir');
  for (let i = 0; i < 6; i++) {
    const a = montar('elfo_kk', true), x = -15 + i * 6 + rnd(-1, 1);
    a.raiz.position.set(x, Y_MURO, Z_MURO_ARRIBA + 0.6); a.raiz.rotation.y = Math.PI; scene.add(a.raiz); pon(a, 'quieto');
    J.elfos.push({a, muro: true, x, z: Z_MURO_ARRIBA + 0.6, cd: rnd(0.5, 1.5)});
  }
  for (let i = 0; i < 3; i++) {
    const a = montar('elfo_kk', true); a.raiz.traverse((o) => {if (o.isMesh) o.material.color.multiplyScalar(0.92);});
    const el = {a, muro: false, x: rnd(-3, 3), z: PATIO.z1 - 1, cd: 1, vel: 5.2, ang: i * 2.1};
    scene.add(a.raiz); J.elfos.push(el);
  }
}
function actualizaElfos(dt) {
  if (!J.elfosTodos && J.ola >= 4 && J.t > J.olaIni + 2) llegaElfos();
  if (!J.elfos) vanguardia();
  const h = J.h;
  for (const el of J.elfos) {
    el.a.mixer.update(dt); el.cd -= dt;
    if (el.muro) {
      if (el.cd <= 0) {
        const ob = J.enemigos.filter((e) => !e.muerto && (e.fase === 'sube' || e.fase === 'hacia' || (e.d.marca && e.fase === 'patio')) && Math.abs(e.x - el.x) < (e.d.marca ? 30 : 9) && e.z > -40).sort((a, b) => (b.d.antorcha || b.d.marca ? 99 : 0) - (a.d.antorcha || a.d.marca ? 99 : 0) || Math.abs(a.x - el.x) - Math.abs(b.x - el.x))[0];
        if (ob) {el.cd = el.lento ? rnd(2.6, 3.6) : rnd(1.1, 1.6); pon(el.a, 'atacar', 0.05, true); el.a.raiz.rotation.y = Math.atan2(ob.x - el.x, ob.z - el.z); suena('disparo'); FUENTE = 'arquero'; if (ob.fase === 'sube' && Math.random() < 0.5) mata(ob, true); else hiere(ob, 3, 0, -1, 0.2);}
      }
      continue;
    }
    /* los de tierra te escoltan y disparan */
    const ob = masCercanos(el.x, el.z, 11, 1)[0];
    const tx = h.x + Math.cos(J.t * 0.3 + el.ang) * 2.6, tz = h.z + Math.sin(J.t * 0.3 + el.ang) * 2.6, dx = tx - el.x, dz = tz - el.z, d = Math.hypot(dx, dz);
    if (d > 0.6) {const v = Math.min(el.vel * 1.15, d * 3); el.x += dx / d * v * dt; el.z += dz / d * v * dt; if (!ocupada(el.a)) {el.rot = Math.atan2(dx, dz); pon(el.a, d > 3 ? 'correr' : 'andar');}}
    else if (!ocupada(el.a)) pon(el.a, 'quieto');
    if (ob && el.cd <= 0) {el.cd = rnd(0.9, 1.3); el.rot = Math.atan2(ob.x - el.x, ob.z - el.z); pon(el.a, 'atacar', 0.05, true); FUENTE = 'arquero'; lanza({fuera: true, modelo: 'flecha_elfica', x: el.x, z: el.z, ang: el.rot, vel: 26, alcance: 13, dano: 2.5 + J.nivel * 0.25, atraviesa: 1, escala: 1.1, emp: 0.4, tag: 'arquero'});}
    ritmo(el.a, el, el.vel, dt); el.a.raiz.position.set(el.x, 0.15, el.z); el.a.raiz.rotation.y = el.rot || 0;
  }
}
/* el portador de la antorcha: corre desde lejos hacia un tramo (o al desagüe) y lo vuela */
function antorchero(alDesague) {
  const vivos = J.tramos.filter((t) => !t.roto), tr = alDesague ? null : (vivos.length ? azar(vivos) : null);
  if (!alDesague && !tr) return;
  const tx = alDesague ? 0 : tr.x;
  const e = creaEnemigo('antorchero');
  e.x = tx + rnd(-6, 6); e.z = -50; e.voladura = {tx, tramo: tr, desague: !!alDesague};
  if (alDesague) {e.desagueHeroe = true; e.vidaMax = e.vida = Math.max(140, e.vida * 9); e.a.raiz.scale.multiplyScalar(1.25); e.a.base = undefined;}
  aviso(alDesague ? '¡Un berserker con una antorcha corre hacia el desagüe! ¡Tumbadlo antes de que llegue!' : '¡Un portador de antorcha va hacia el tramo ' + (tr.i + 1) + '! Ballestas y flechas', 2600);
}
function vuela(e) {
  suena('boom');
  const v = e.voladura; J.temblor = 1.0; J.parada = 0.1;
  efecto('explosion_grande', v.tx, 0, -21.5, {escala: 1.2, vida: 1.4, crece: 1.3});
  if (v.desague) explotaDesague(); else dañaTramo(v.tramo, 999);
  e.sinBotin = true; mata(e, true);
}

/* ---------- la fortaleza: tramos del Muro del Bajo ---------- */
const XT = [-14.333, -8.6, -2.867, 2.867, 8.6, 14.333];
function estadoTramo(tr) {
  const base = tr.roto ? 'tramo_brecha' : tr.vida < tr.max * 0.55 ? 'tramo_danado' : tr.nivel ? 'tramo_reforzado' : 'tramo_entero';
  if (base !== 'tramo_entero') return base;
  return ['tramo_extremo_izq', 'tramo_entero', 'tramo_central_izq', 'tramo_central_der', 'tramo_entero', 'tramo_extremo_der'][tr.i];
}
function ponTramo(tr) {
  const est = estadoTramo(tr); if (tr.est === est) return;
  if (tr.est && J && J.t > 1) suena('muro');
  tr.est = est; if (tr.obj) scene.remove(tr.obj);
  const plant = M.muralla_helm.scene.getObjectByName(est); if (!plant) return;
  const o = plant.clone(true); o.position.x = XT[tr.i];
  o.traverse((m) => {if (m.isMesh) {m.castShadow = true; m.receiveShadow = true;}});
  scene.add(o); tr.obj = o;
  if (J.desagueObj) J.desagueObj.visible = !J.tramos[2].roto && !J.tramos[3].roto;
}
function dañaTramo(tr, n) {
  if (tr.roto) return;
  tr.vida -= n * (1 - 0.12 * tr.nivel); if (Math.random() < 0.6) particula('piedras', tr.x + rnd(-2, 2), Y_MURO - 1, Z_MURO_ARRIBA + 1.5, {vel: 1.5, sube: 1, vida: 0.8, escala: 0.6, grav: 12, crece: 1});
  if (tr.vida <= 0) {
    tr.vida = 0; tr.roto = true; if (J.enMuro && Math.abs(J.h.x - tr.x) < 4) setTimeout(() => J && bajaAlPatio('¡El tramo se hunde bajo tus pies! ¡Al patio!'), 600);
    J.temblor = 0.9; J.parada = 0.08;
    efecto('explosion_grande', tr.x, 0, -18.5, {escala: 1, vida: 1.2, crece: 1.2}); efecto('polvo', tr.x, 0.2, BRECHA.z, {escala: 3, vida: 1});
    aviso('¡Se derrumba el tramo ' + (tr.i + 1) + ' del muro!', 2200); efecto('explosion_muro', tr.x, 0.2, -19.5, {escala: 1.6, vida: 1.3, crece: 1.2}); arqueroTramo(tr);
  } else if (tr.vida < tr.max * 0.35 && !tr.avisado) {tr.avisado = true; aviso('El tramo ' + (tr.i + 1) + ' del muro está a punto de caer', 1600);}
  ponTramo(tr); pintaMuro();
}
function pintaMuro() {
  const el = $('muro'); if (!el) return;
  if (el.children.length !== 6) el.innerHTML = '<i></i>'.repeat(6);
  J.tramos.forEach((tr, k) => {const c = el.children[k], pc = tr.vida / tr.max; c.style.setProperty('--v', pc); c.className = tr.roto ? 'roto' : pc < 0.35 ? 'mal' : tr.nivel ? 'fuerte' : '';});
  if ($('tregua').style.display !== 'none') pintaTregua();
}
function accionTramo(tr) {
  if (tr.roto) return ['reconstruir', COSTE.reconstruir, 'Reconstruir'];
  if (tr.vida < tr.max - 1) return ['reparar', COSTE.reparar * Math.ceil((tr.max - tr.vida) / 45), 'Reparar'];
  if (tr.nivel < 3) return ['reforzar', COSTE.reforzar * (tr.nivel + 1), 'Reforzar'];
  return [null, 0, 'Al máximo'];
}
function haceTramo(k) {
  const t = J.tramos[k], [acc, c] = accionTramo(t);
  if (!acc || J.oro < c) return;
  J.oro -= c;
  if (acc === 'reconstruir') {t.roto = false; t.vida = t.max * 0.6; t.avisado = false; aviso('Tramo ' + (k + 1) + ' reconstruido', 900);}
  if (acc === 'reparar') {t.vida = t.max; t.avisado = false;}
  if (acc === 'reforzar') {t.nivel++; t.max += 50; t.vida = t.max; aviso('Tramo ' + (k + 1) + ' reforzado', 900);}
  efecto('polvo', t.x, Y_MURO, Z_MURO_ARRIBA + 1, {escala: 1, vida: 0.5});
  andamio(t); aldeano(t.x + rnd(-1.5, 1.5), BRECHA.z + 0.6);
  ponTramo(t); arqueroTramo(t); pintaHud(); pintaMuro();
}
function arqueroTramo(t) {
  const quiere = t.nivel > 0 && !t.roto && M.arquero_muralla;
  if (quiere && !t.arq) {const a = montar('arquero_muralla', true); a.raiz.position.set(t.x + rnd(-1.5, 1.5), Y_MURO, Z_MURO_ARRIBA + 0.4); a.raiz.rotation.y = Math.PI; scene.add(a.raiz); pon(a, 'apuntar'); t.arq = {a, cd: rnd(0.5, 1.5)};}
  if (!quiere && t.arq) {const a = t.arq.a; t.arq = null; pon(a, a.clips.morir_caer ? 'morir_caer' : 'morir', 0.05, true); setTimeout(() => scene.remove(a.raiz), 1600); J.cayendo = (J.cayendo || []).concat([a]);}
}
function actualizaArqueros(dt) {
  for (const t of J.tramos) {
    if (!t.arq) continue;
    const q = t.arq; q.a.mixer.update(dt); q.cd -= dt;
    if (q.cd > 0) continue;
    const obj = J.enemigos.filter((e) => !e.muerto && (e.fase === 'hacia' || e.fase === 'sube') && Math.abs(e.x - t.x) < 10 && e.z > -40).sort((a, b) => (b.d.antorcha ? 99 : 0) - (a.d.antorcha ? 99 : 0) || Math.abs(a.x - t.x) - Math.abs(b.x - t.x))[0];
    if (!obj) continue;
    q.cd = 1.8 - 0.25 * t.nivel; pon(q.a, 'disparar_rapido', 0.05, true); setTimeout(() => {if (!J.fin && q.a) pon(q.a, 'apuntar', 0.2);}, 520);
    q.a.raiz.rotation.y = Math.atan2(obj.x - q.a.raiz.position.x, obj.z - q.a.raiz.position.z);
    if (obj.fase === 'sube' && Math.random() < 0.35 + 0.15 * t.nivel) {FUENTE = 'arquero'; mata(obj, true);}
    else {FUENTE = 'arquero'; hiere(obj, 2.2 * t.nivel, 0, -1, 0);}
  }
  (J.cayendo || []).forEach((a) => a.mixer.update(dt));
}
function andamio(t) {
  if (t.andamio) return;
  const pl = M.muro_tramo.scene.getObjectByName('andamio'); if (!pl) return;
  const o = pl.clone(true); o.position.x += t.x; GR.mejoraPatio4(o); scene.add(o); t.andamio = o;
}

/* ---------- sitios fijos de construcción ---------- */
const SITIOS = [
  {id: 'torre_i', tipo: 'torre', x: -14, z: 6, nombre: 'Torre de arqueros', icono: 'torre', coste: [35, 60, 90], d: 'Un arquero de Rohan dispara desde lo alto.'},
  {id: 'torre_d', tipo: 'torre', x: 14, z: 6, nombre: 'Torre de arqueros', icono: 'torre', coste: [35, 60, 90], d: 'Un arquero de Rohan dispara desde lo alto.'},
  {id: 'ballesta_i', tipo: 'ballesta', x: -9, z: -12.6, nombre: 'Ballesta', icono: 'ballesta', coste: [45, 70, 100], d: 'Virotes que atraviesan. Alcanza más allá del muro.'},
  {id: 'ballesta_d', tipo: 'ballesta', x: 9, z: -12.6, nombre: 'Ballesta', icono: 'ballesta', coste: [45, 70, 100], d: 'Virotes que atraviesan. Alcanza más allá del muro.'},
  {id: 'caldero_i', tipo: 'caldero', x: -12, z: -19.65, y: Y_MURO, nombre: 'Caldero de aceite', icono: 'caldero_def', coste: [40, 60, 90], d: 'Vuelca aceite ardiendo sobre los que trepan.'},
  {id: 'caldero_d', tipo: 'caldero', x: 12, z: -19.65, y: Y_MURO, nombre: 'Caldero de aceite', icono: 'caldero_def', coste: [40, 60, 90], d: 'Vuelca aceite ardiendo sobre los que trepan.'},
  {id: 'empal_i', tipo: 'empalizada', x: -9.5, z: -6, nombre: 'Empalizada', icono: 'empalizada', coste: [20, 35, 55], d: 'Cierra el paso: tienen que romperla.'},
  {id: 'empal_d', tipo: 'empalizada', x: 9.5, z: -6, nombre: 'Empalizada', icono: 'empalizada', coste: [20, 35, 55], d: 'Cierra el paso: tienen que romperla.'},
  {id: 'barricada', tipo: 'barricada', x: 0, z: 34.6, nombre: 'Barricada', icono: 'barricada', coste: [30, 50, 80], d: 'Recibe los golpes antes que la puerta.'},
  {id: 'catapulta', tipo: 'catapulta', x: 0, z: 23, nombre: 'Catapulta', icono: 'catapulta', coste: [70, 100, 140], d: 'Piedras en área sobre el patio.'},
];
const MODELO_SITIO = {torre: 'torre_arqueros', empalizada: 'empalizada', caldero: 'caldero_aceite', barricada: 'barricada_puerta'};
function modeloNivel(nombre, n) {
  const o = M[nombre].scene.clone(true);
  o.traverse((c) => {if (/^nivel_\d$/.test(c.name)) c.visible = c.name === 'nivel_' + n;});
  GR.mejoraPatio4(o); o.traverse((m) => {if (m.isMesh) {m.castShadow = true; m.receiveShadow = true;}});
  return o;
}
function montaSitios() {
  J.sitios = SITIOS.map((d) => ({...d, nivel: 0, obj: null, def: null, cd: 3}));
  for (const si of J.sitios) {
    const m = M.sitio_construccion.scene.clone(true); m.position.set(si.x, (si.y || 0) + 0.16, si.z); GR.mejoraPatio4(m);
    if (si.y) m.scale.setScalar(0.7);
    scene.add(m); si.marca = m; m.visible = false;
    const cl = M.sitio_construccion.animations[0]; if (cl) {si.mix = new THREE.AnimationMixer(m); si.mix.clipAction(cl).play();}
  }
}
function quitaSitio(si) {
  if (si.obj) scene.remove(si.obj); si.obj = null;
  if (si.def) {const k = J.defensas.indexOf(si.def); if (k >= 0) J.defensas.splice(k, 1); scene.remove(si.def.o); si.def = null;}
  if (si.tipo === 'barricada') J.barr = {vida: 0, max: 0};
  si.nivel = 0;
}
const subiendo = [];
function sube(o) {o.scale.y = 0.05; subiendo.push({o, t: 0});}
function actualizaSubidas(dt) {for (let i = subiendo.length - 1; i >= 0; i--) {const s = subiendo[i]; s.t += dt / 0.55; const k = Math.min(1, s.t); s.o.scale.y = k < 1 ? 0.05 + 1.12 * Math.sin(k * Math.PI / 2) - 0.12 * k * k : 1; if (k >= 1) subiendo.splice(i, 1);}}
function construye(si) {
  if (si.nivel >= 3) return;
  const c = si.coste[si.nivel]; if (J.oro < c) return;
  suena('construir');
  J.oro -= c; const n = ++si.nivel, mult = 1 + 0.6 * (n - 1);
  if (si.obj) scene.remove(si.obj); si.obj = null;
  const nm = MODELO_SITIO[si.tipo];
  if (nm) {si.obj = modeloNivel(nm, n); si.obj.position.set(si.x, si.y ? si.y : 0.15, si.z); scene.add(si.obj); sube(si.obj);}
  if (si.tipo === 'caldero') {const cl = M.caldero_aceite.animations; si.cmix = new THREE.AnimationMixer(si.obj); si.cq = cl.find((a) => a.name === 'quieto'); si.cv = cl.find((a) => a.name === 'volcar'); if (si.cq) si.cmix.clipAction(si.cq).play();}
  if (si.tipo === 'torre') {
    if (!si.def) {creaDefensa('arquero', si.x, si.z); si.def = J.defensas[J.defensas.length - 1]; const pa = M.torre_arqueros.scene.getObjectByName('punto_arquero'); si.def.o.position.y = 0.15 + (pa ? pa.position.y : 3.4);}
    Object.assign(si.def, {mult, rango: 15 + n * 2, flechas: n >= 3 ? 2 : 1});
  }
  if (si.tipo === 'ballesta' || si.tipo === 'catapulta') {
    const nm2 = si.tipo === 'ballesta' ? 'ballesta_muro' : 'catapulta_rohan', tp = si.tipo === 'ballesta' ? 'escorpion' : 'catapulta';
    const o = modeloNivel(nm2, n); o.position.set(si.x, 0.15, si.z); sube(o);
    if (si.def) {scene.remove(si.def.o); const k = J.defensas.indexOf(si.def); if (k >= 0) J.defensas.splice(k, 1);}
    scene.add(o);
    const mixer = new THREE.AnimationMixer(o), cl = M[nm2].animations.find((a) => a.name === 'disparar'), clips = {};
    if (cl) {const ac = mixer.clipAction(cl); ac.setLoop(THREE.LoopOnce, 1); clips['disparar_' + tp] = ac;}
    si.def = {tipo: tp, x: si.x, z: si.z, o, mixer, clips, mult, rango: si.tipo === 'ballesta' ? 20 + n * 2 : 20, cd: 0.5, estado: 'listo', t: 0, rot: Math.PI, vida: 60};
    J.defensas.push(si.def);
  }
  if (si.tipo === 'empalizada') {
    if (si.def) {const k = J.defensas.indexOf(si.def); if (k >= 0) J.defensas.splice(k, 1);}
    si.def = {tipo: 'empalizada', x: si.x, z: si.z, o: si.obj, mixer: null, clips: {}, bloquea: true, caja: {hx: 2.0, hz: 0.55}, vida: [80, 150, 240][n - 1], cd: 0, mult, sitio: si, rot: 0};
    J.defensas.push(si.def);
  }
  if (si.tipo === 'barricada') J.barr = {vida: [150, 260, 400][n - 1], max: [150, 260, 400][n - 1]};
  efecto('polvo', si.x, (si.y || 0) + 0.2, si.z, {escala: 1.6, vida: 0.6});
  if (!si.y) aldeano(si.x + 1.5, si.z + 1);
  aviso(si.nombre + (n > 1 ? ' · nivel ' + n : ' construida'), 900);
  pintaHud(); pintaTregua();
}
function golpeaPuerta(n) {
  if (J.barr && J.barr.vida > 0) {
    J.barr.vida -= n;
    if (J.barr.vida <= 0) {J.barr.vida = 0; const si = J.sitios.find((s) => s.tipo === 'barricada'); efecto('polvo', 0, 0.3, 34.6, {escala: 3, vida: 0.8}); aviso('¡Han roto la barricada!', 1400); if (si) quitaSitio(si);}
    return;
  }
  J.puerta -= n;
}
function actualizaFortaleza(dt) {
  const tregua = !!enTregua(J.t);
  for (const si of J.sitios) {
    if (si.mix) si.mix.update(dt); if (si.cmix) si.cmix.update(dt);
    si.marca.visible = tregua && si.nivel < 3 && !(si.tipo === 'barricada' && si.nivel > 0);
    if (si.tipo !== 'caldero' || !si.nivel) continue;
    si.cd -= dt; if (si.cd > 0) continue;
    const enRango = J.enemigos.filter((e) => !e.muerto && Math.abs(e.x - si.x) < 6.5 && (e.fase === 'sube' || (e.fase === 'hacia' && e.z > -25.5)));
    if (!enRango.length) continue;
    si.cd = [11, 8, 5.5][si.nivel - 1];
    if (si.cv) {const ac = si.cmix.clipAction(si.cv); ac.setLoop(THREE.LoopOnce, 1); ac.reset().play();}
    FUENTE = 'calderon';
    setTimeout(() => {
      if (!J || J.fin) return;
      for (const e of enRango) {if (e.muerto) continue; if (e.fase === 'sube') mata(e, true); else hiere(e, 12 * si.nivel, 0, -1, 0);}
      J.escalas.forEach((s) => {if (s.estado === 'arriba' && Math.abs(s.x - si.x) < 6.5) danaEscala(s, 8 * si.nivel);});
      efecto('cascada_aceite', si.x, 0.2, Z_MURO_FUERA - 0.4, {escala: 1.1, vida: 1.0, crece: 1.05}); efecto('explosion', si.x, 0.3, -23.5, {escala: 1.6, vida: 0.8, crece: 1.3}); charco(si.x, -24, 2.4, 4 * si.nivel, 3, false);
      J.temblor = Math.max(J.temblor, 0.25);
    }, 550);
  }
  /* aldeanos que reparan */
  for (let i = J.aldeanos.length - 1; i >= 0; i--) {
    const al = J.aldeanos[i]; al.a.mixer.update(dt);
    const dx = al.tx - al.x, dz = al.tz - al.z, d = Math.hypot(dx, dz);
    if (al.estado === 'va') {
      if (d < 0.4) {al.estado = 'trabaja'; pon(al.a, 'martillear'); al.piedra && (al.piedra.visible = false); al.martillo && (al.martillo.visible = true);}
      else {al.x += dx / d * 3.2 * dt; al.z += dz / d * 3.2 * dt; al.rot = Math.atan2(dx, dz);}
    }
    if (al.estado === 'trabaja' && !tregua) {al.estado = 'huye'; al.tx = al.x; al.tz = 36; pon(al.a, 'huir'); al.martillo && (al.martillo.visible = false);}
    if (al.estado === 'huye') {if (d < 0.6) {scene.remove(al.a.raiz); J.aldeanos.splice(i, 1); continue;} al.x += dx / d * 6 * dt; al.z += dz / d * 6 * dt; al.rot = Math.atan2(dx, dz);}
    al.a.raiz.position.set(al.x, 0.15, al.z); al.a.raiz.rotation.y = al.rot || 0;
  }
  if (!tregua) J.tramos.forEach((t) => {if (t.andamio) {scene.remove(t.andamio); t.andamio = null;}});
}
function aldeano(tx, tz) {
  if (!M.aldeano_rohan || J.aldeanos.length >= 6) return;
  const a = montar('aldeano_rohan', true), al = {a, x: rnd(-4, 4), z: 35, tx, tz, estado: 'va'};
  al.piedra = a.raiz.getObjectByName('piedra_cargada'); al.martillo = a.raiz.getObjectByName('martillo_reparacion');
  if (al.martillo) al.martillo.visible = false;
  scene.add(a.raiz); pon(a, 'cargar_piedra'); J.aldeanos.push(al);
}

/* ---------- construir tocando sobre el mapa (solo en la tregua) ---------- */
const _pe = new THREE.Vector3();
/* amenazas que hay que tumbar ya: etiqueta encima y, si están fuera de pantalla, flecha en el borde */
const _pm = new THREE.Vector3();
function marcasAmenaza() {
  const box = $('marcas'); if (!box) return;
  const lista = J.fin || document.body.classList.contains('cine') ? [] : J.enemigos.filter((e) => !e.muerto && (e.d.marca || e.d.antorcha || e.d.ariete) && !(e.fase === 'hacia' && e.z < -38));
  while (box.children.length < lista.length) {const d = document.createElement('div'); d.className = 'mk'; d.innerHTML = '<b></b><i></i>'; box.appendChild(d);}
  [...box.children].forEach((el, k) => {
    const e = lista[k]; if (!e) {el.style.display = 'none'; return;}
    el.style.display = 'block';
    const txt = e.d.tronco ? '¡TRONCO!' : e.d.ariete ? 'ARIETE' : e.desagueHeroe ? '¡AL DESAGÜE!' : '¡ANTORCHA!'; const b = el.firstChild; if (b.textContent !== txt) b.textContent = txt;
    _pm.set(e.x, e.y + (e.d.ariete || e.d.tronco ? 3.4 : 2.9), e.z).project(camera);
    const W = innerWidth, H = innerHeight, detras = _pm.z > 1;
    let x = (_pm.x + 1) / 2 * W, y = (1 - _pm.y) / 2 * H; if (detras) {x = W - x; y = H - 40;}
    const m = 34, fuera = detras || x < m || x > W - m || y < 90 || y > H - 120;
    if (fuera) {
      const cx = W / 2, cy = H / 2, ang = Math.atan2(y - cy, x - cx);
      x = Math.max(m, Math.min(W - m, x)); y = Math.max(96, Math.min(H - 126, y));
      el.className = 'mk fuera'; el.lastChild.style.transform = 'rotate(' + (ang * 180 / Math.PI - 90) + 'deg) translate(-8px, 16px)';
    } else {el.className = 'mk'; el.lastChild.style.transform = '';}
    el.style.left = x + 'px'; el.style.top = y + 'px';
  });
}
function etiquetas() {
  const box = $('etiq'), on = J && !J.fin && !!enTregua(J.t) && J.zoomT > 0.6;
  box.style.display = on ? 'block' : 'none'; if (!on) {if ($('hoja').style.display !== 'none' && !(J && J.tregua)) cierraHoja(); return;}
  if (!box.children.length) box.innerHTML = J.sitios.map((si, k) => `<button data-s="${k}" class="pin"><img src="${ico(si.icono)}" alt=""><em></em></button>`).join('');
  const W = innerWidth, H = innerHeight;
  [...box.children].forEach((b) => {
    const si = J.sitios[+b.dataset.s], c = si.coste[si.nivel];
    _pe.set(si.x, si.y ? si.y + 1.2 : 1.6, si.y ? -18.6 : si.z).project(camera);
    b.style.left = ((_pe.x + 1) / 2 * W) + 'px'; b.style.top = ((1 - _pe.y) / 2 * H) + 'px';
    const est = [1, 2, 3].map((k) => `<i class="${k <= si.nivel ? 'on' : ''}"></i>`).join(''); const em = b.querySelector('em'); if (em.dataset.v !== est) {em.dataset.v = est; em.innerHTML = est;}
    b.className = 'pin' + (si.nivel >= 3 ? ' max' : J.oro >= c ? ' puede' : '') + (si.nivel ? ' hecho' : '') + (hojaSi === si ? ' sel' : '');
  });
  if (hojaSi) pintaHoja();
}
/* hoja de abajo con la ficha de lo que tocas */
let hojaSi = null;
function abreHoja(si) {hojaSi = si; $('hoja').style.display = 'flex'; pintaHoja();}
function cierraHoja() {hojaSi = null; $('hoja').style.display = 'none';}
function pintaHoja() {
  const si = hojaSi, c = si.coste[si.nivel], b = $('hojaB');
  $('hojaI').src = ico(si.icono); $('hojaT').textContent = si.nombre + (si.nivel ? ' · nivel ' + si.nivel : '');
  $('hojaD').textContent = si.d + (si.nivel && si.nivel < 3 ? ' Al mejorar: más daño, más alcance y más vida.' : '');
  b.textContent = si.nivel >= 3 ? 'Al máximo' : (si.nivel ? 'Mejorar · ' : 'Construir · ') + c + ' oro';
  b.className = si.nivel >= 3 ? 'no' : J.oro >= c ? '' : 'no';
}
$('hojaX').addEventListener('click', cierraHoja);
$('hojaB').addEventListener('click', () => {
  const si = hojaSi; if (!si || !J || si.nivel >= 3) return;
  if (J.oro < si.coste[si.nivel]) {aviso('Te falta oro', 700); return;}
  construye(si); const pin = document.querySelector('.pin[data-s="' + J.sitios.indexOf(si) + '"]'); if (pin) celebra(si.x, si.y || 0.2, si.z, pin); pintaHoja();
});
/* el muro: reparar todo y reforzar, en dos botones del panel de la tregua */
function costeMuro() {
  let rep = 0, ref = null;
  for (const t of J.tramos) {const [a, c] = accionTramo(t); if (a === 'reparar' || a === 'reconstruir') rep += c; else if (a === 'reforzar' && (!ref || c < ref[1])) ref = [t, c];}
  return [rep, ref];
}
/* la muralla en la tregua: un botón por tramo, en el mismo orden que se ven, con su vida y lo que cuesta */
function pintaMuroBotones() {
  const [rep] = costeMuro(), a = $('trRep');
  a.innerHTML = rep ? '🔨 Reparar todo <b>' + rep + '</b>' : '✓ Muro entero'; a.className = rep && J.oro >= Math.min(rep, COSTE.reparar) ? '' : 'no';
  const el = $('trTramos'); if (el.children.length !== J.tramos.length) el.innerHTML = J.tramos.map((_, k) => '<button data-k="' + k + '"><i><u></u></i><em></em><small></small></button>').join('');
  J.tramos.forEach((t, k) => {
    const b = el.children[k], [acc, c] = accionTramo(t), pc = t.roto ? 0 : t.vida / t.max;
    b.className = (t.roto ? 'roto ' : pc < 0.55 ? 'mal ' : '') + (acc && J.oro < c ? 'no' : '');
    b.querySelector('u').style.width = Math.round(pc * 100) + '%';
    b.querySelector('em').textContent = '★'.repeat(t.nivel) || '·';
    b.querySelector('small').innerHTML = acc === 'reconstruir' ? '🧱 ' + c : acc === 'reparar' ? '🔨 ' + c : acc === 'reforzar' ? '⬆ ' + c : 'Máx';
  });
}
$('trRep').addEventListener('click', () => {
  if (!J) return; let hecho = 0;
  J.tramos.forEach((t, k) => {const [a, c] = accionTramo(t); if ((a === 'reparar' || a === 'reconstruir') && J.oro >= c) {haceTramo(k); hecho++;}});
  if (!hecho) aviso(costeMuro()[0] ? 'Te falta oro' : 'El muro está entero', 900); else {suena('construir'); pintaMuroBotones();}
});
$('trTramos').addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b || !J) return; const k = +b.dataset.k, t = J.tramos[k], [acc, c] = accionTramo(t);
  if (!acc) {aviso('Ese tramo ya está al máximo', 800); return;}
  if (J.oro < c) {noHay(b); return;}
  haceTramo(k); suena('construir'); pintaMuroBotones();
  particula('piedras', t.x, Y_MURO, Z_MURO_ARRIBA, {n: 8, vel: 2, sube: 3, vida: 0.7, escala: 0.6, grav: 12, crece: 1}); efecto('polvo', t.x, Y_MURO, Z_MURO_ARRIBA + 1, {escala: 1.6, vida: 0.6, crece: 1.6});
});
function noHay(b) {b.classList.remove('sacude'); void b.offsetWidth; b.classList.add('sacude'); aviso('Te falta oro', 700);}
$('etiq').addEventListener('pointerdown', (ev) => {
  const b = ev.target.closest('.pin'); if (!b || !J) return; ev.stopPropagation(); abreHoja(J.sitios[+b.dataset.s]);
});
function celebra(x, y, z, b) {
  particula('polvo', x, y + 0.4, z, {n: 6, vel: 3, sube: 1, vida: 1, escala: 1.6, crece: 2, disp: 1});
  particula('piedras', x, y + 1, z, {n: 4, vel: 3, sube: 4, vida: 0.8, escala: 0.6, grav: 14, crece: 1});
  particula('destello', x, y + 1.5, z, {vel: 0, sube: 0, vida: 0.35, escala: 3, crece: 1.5, disp: 0});
  J.temblor = Math.max(J.temblor, 0.25);
  b.classList.remove('hecho'); void b.offsetWidth; b.classList.add('hecho');
}

/* ---------- la tregua ---------- */
let pestana = 'muro';
function pintaTregua() {
  const tr = enTregua(J.t), q = tr ? Math.ceil(tr[1] - J.t) : 0;
  if (q >= 1 && q <= 3 && q !== J._cuentaQ) {J._cuentaQ = q; const c = $('cuenta'); c.textContent = q; c.classList.remove('sale'); void c.offsetWidth; c.classList.add('sale'); suena('xp');}
  $('trT').textContent = (J.ola === 0 ? 'Preparad la defensa · ' : 'Tregua · ') + q + ' s';
  $('trTabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.p === pestana));
  $('trAyuda').innerHTML = 'Tienes <b>' + J.oro + ' de oro</b>. Toca un medallón del patio para construir o mejorar.'; pintaMuroBotones();
  const am = AMENAZAS[J.amenaza];
  $('trAm').innerHTML = am ? `<img src="${ico(am.icono)}"><div><b>Próxima oleada: ${am.t}</b><span>${am.d}</span></div>` : '';
  const box = $('trB'); box.style.display = 'none'; $('trTabs').style.display = 'none';
  if (true) return;
  if (pestana === 'muro') {
    if (box.dataset.p !== 'muro') {box.dataset.p = 'muro'; box.innerHTML = J.tramos.map((_, k) => `<button data-k="${k}"><b>Tramo ${k + 1}</b><i><u></u></i><span></span></button>`).join('');}
    J.tramos.forEach((t, k) => {
      const b = box.children[k], [acc, c, txt] = accionTramo(t);
      b.querySelector('u').style.width = (t.vida / t.max * 100) + '%';
      b.querySelector('span').textContent = acc ? txt + ' · ' + c : txt;
      b.className = (t.roto ? 'roto ' : '') + (acc && J.oro >= c ? '' : 'no') + (t.nivel ? ' n' + t.nivel : '');
    });
  } else {
    if (box.dataset.p !== 'def') {box.dataset.p = 'def'; box.innerHTML = J.sitios.map((si, k) => `<button data-s="${k}" class="sit"><img src="${ico(si.icono)}"><b>${si.nombre}${si.x < 0 ? ' ←' : si.x > 0 ? ' →' : ''}</b><em></em><span></span></button>`).join('');}
    J.sitios.forEach((si, k) => {
      const b = box.children[k], c = si.coste[si.nivel];
      const em = b.querySelector('em'), est = si.nivel ? [1, 2, 3].map((k) => `<img class="est" src="ui/${k <= si.nivel ? (si.nivel === 3 ? 'estrella_brillo' : 'estrella_llena') : 'estrella_vacia'}.webp">`).join('') : si.d; if (em.dataset.v !== est) {em.dataset.v = est; em.innerHTML = est;}
      b.querySelector('span').textContent = si.nivel >= 3 ? 'Al máximo' : (si.nivel ? 'Mejorar · ' : 'Construir · ') + c;
      b.className = 'sit' + (si.nivel < 3 && J.oro >= c ? '' : ' no') + (si.nivel ? ' n' + si.nivel : '');
    });
  }
}
function empiezaTregua(tr) {
  J.treguaVista = tr[0];
  const n = J.tregua.n;
  J.amenaza = AMENAZA_DE[n] || null;
  J.botinPend = true; setTimeout(() => {if (J && J.botinPend && !J.pausa && !J.fin) {J.botinPend = false; ofreceMejoras('botin');}}, 700);
  if (n > 0) {J.oro += 8 + n * 4; aviso('Tregua: el enemigo se reagrupa. Repara y fortifica', 2200);}
  else {J.oro += 70; aviso('Théoden os da 70 de oro: construid antes de que suenen los cuernos', 3200);}
  pestana = n === 0 ? 'def' : 'muro';
  $('tregua').style.display = 'block'; document.body.classList.add('tregua'); pintaTregua(); pintaHud();
}
function acabaTregua() {
  cierraHoja();
  if (J.colaHabla && J.colaHabla.length) {const c = J.colaHabla.slice(-1)[0]; J.colaHabla = []; setTimeout(() => J && habla(c[0], c[1]), 1500);}
  $('tregua').style.display = 'none'; document.body.classList.remove('tregua');
  J.ola++; J.olaIni = J.t; J.porSalir = TAM_OLA[J.ola] || 40; J.olaTotal = J.porSalir;
  const n = J.ola;
  {const am = AMENAZAS[J.amenaza]; cartelOla(n === NOLAS ? 'ÚLTIMA OLEADA' : 'OLEADA ' + n + ' DE ' + NOLAS, am ? am.t.split(/ y /i)[0].toLowerCase().replace(/^./, (c) => c.toUpperCase()) : '¡Suenan los cuernos!', n === NOLAS ? 'Aguantad hasta el alba' : '');}
  J.oleada = J.t + 1;
}
$('trB').addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b || !J) return;
  if (b.dataset.k !== undefined) haceTramo(+b.dataset.k); else if (b.dataset.s !== undefined) construye(J.sitios[+b.dataset.s]);
});
$('trTabs').addEventListener('click', (ev) => {const b = ev.target.closest('button'); if (b && J) {pestana = b.dataset.p; pintaTregua();}});
$('trYa').addEventListener('click', () => {if (J && J.tregua) J.tregua.fin = J.t;});

function explotaDesague() {
  J.desague = true; J.brecha = 50; dañaTramo(J.tramos[2], 999); dañaTramo(J.tramos[3], 999); J.temblor = 1.2; J.parada = 0.12;
  efecto('explosion_grande', BRECHA.x, 0, BRECHA.z - 3, {escala: 1.3, vida: 1.6, crece: 1.3}); flip('fx_explosion', BRECHA.x, 4, BRECHA.z - 2, {tam: 14, dur: 1.1, suelo: false}); particula('piedras', BRECHA.x, 4, BRECHA.z - 2, {n: 14, vel: 9, sube: 8, vida: 1.4, escala: 1.1, grav: 14, crece: 1}); GR.flash = 1;
  efecto('explosion', BRECHA.x - 2, 1, BRECHA.z - 1, {escala: 2.5, vida: 0.9});
  aviso('¡Han volado el desagüe del muro!', 2600); if (J.enMuro) setTimeout(() => J && bajaAlPatio('¡El muro ha caído! ¡Atrás, a defender la puerta!'), 1300);
  for (const e of J.enemigos) if (!e.muerto && e.fase === 'patio' && Math.hypot(e.x - BRECHA.x, e.z - BRECHA.z) < 6) hiere(e, 50, e.x - BRECHA.x, e.z - BRECHA.z, 3);
  const h = J.h; if (Math.hypot(h.x - BRECHA.x, h.z - BRECHA.z) < 6) dañaHeroe(25);
  for (let i = 0; i < 8; i++) creaEnemigo(azar(['orco', 'uruk', 'uruk', 'berserker']), {brecha: true, z: Z_MURO_FUERA - 3 - i * 1.4});
}

function fuegoChaman() {
  const h = J.h, x = h.x + rnd(-1, 1), z = h.z + rnd(-1, 1), r = 2;
  aviso3D('aviso_area', x, z, 0, r / 2.15, 1.2);
  setTimeout(() => {if (!J || J.fin) return; efecto('explosion', x, enFranja(z) ? Y_MURO : 0, z, {escala: 1.1, vida: 0.6}); suena('fuego'); if (Math.hypot(h.x - x, h.z - z) < r) dañaHeroe(14 + J.t / 40);}, 1200);
}
function fuegoIsengard() {
  const h = J.h; aviso('¡Fuego de Isengard! Apártate de las marcas', 1500);
  for (let i = 0; i < 3; i++) {
    const x = Math.max(LX0(), Math.min(LX1(), h.x + rnd(-3.5, 3.5))), z = Math.max(LZ0(), Math.min(LZ1(), h.z + rnd(-3.5, 3.5))), r = 2.2;
    setTimeout(() => {
      if (!J || J.fin) return; aviso3D('aviso_area', x, z, 0, r / 2.15, 1.5);
      setTimeout(() => {
        if (!J || J.fin) return; const y = enFranja(z) ? Y_MURO : 0;
        efecto('explosion', x, y, z, {escala: 1.4, vida: 0.7}); suena('fuego'); J.temblor = Math.max(J.temblor, 0.35);
        if (Math.hypot(h.x - x, h.z - z) < r) dañaHeroe(18 + J.t / 30);
        for (const e of cercanos(x, z, r + 1)) if (!e.muerto && Math.hypot(e.x - x, e.z - z) < r) {FUENTE = 'caldero'; hiere(e, 15, e.x - x, e.z - z, 2);}
      }, 1500);
    }, i * 350);
  }
}
/* ---------- escalas ---------- */
function objEscala(s) {
  const o = P.escala.clone(true);
  o.scale.setScalar(1.25); o.rotation.order = 'YXZ'; o.rotation.y = Math.PI; o.position.set(s.x, 0.25, Z_MURO_FUERA);
  scene.add(o); return o;
}
function ponEscala(s) {
  const o = s.obj || objEscala(s); o.rotation.x = 0;
  efecto('polvo', s.x, Y_MURO, Z_MURO_FUERA - 0.3, {escala: 1.4, vida: 0.5, crece: 1.6}); suena('madera'); J.temblor = Math.max(J.temblor, 0.12);
  const mixer = new THREE.AnimationMixer(o);
  const caer = mixer.clipAction(M.objetos.animations[0]); caer.setLoop(THREE.LoopOnce, 1); caer.clampWhenFinished = true;
  Object.assign(s, {obj: o, mixer, caer, estado: 'arriba', vida: 10 + J.t / 30});
}
function danaEscala(s, n) {
  if (s.estado !== 'arriba') return;
  s.vida -= n; efecto('chispa', s.x, Y_MURO - 0.5, Z_MURO_ARRIBA + 0.4, {escala: 1.2});
  if (s.vida <= 0) {
    s.estado = 'cayendo'; s.t = 0.9; s.caer.reset().play();
    J.enemigos.forEach((e) => {if (e.escala === s && e.fase === 'sube' && !e.muerto && !(e.tipo === 'warg' || e.d.salta)) caeDeEscala(e);});
    J.puntos += 50; aviso('¡Escala derribada!', 900);
  }
}
const ESC_TUMBADA = -1.32;
function actualizaEscalas(dt) {
  J.escalas.forEach((s) => {
    if (s.mixer) s.mixer.update(dt);
    if (s.estado === 'poniendo') {
      /* la levantan entre varios: sale tumbada del suelo y se apoya contra el muro de golpe */
      if (!s.obj) {s.obj = objEscala(s); s.T = s.t;}
      s.t -= dt; const k = 1 - Math.max(0, s.t) / (s.T || 2.2), q = k < 0.25 ? 0 : (k - 0.25) / 0.75, ease = q * q * (3 - 2 * q);
      s.obj.rotation.x = ESC_TUMBADA * (1 - ease);
      if (s.t <= 0) ponEscala(s);
    }
    if (s.estado === 'cayendo') {s.t -= dt; if (s.t <= 0) {scene.remove(s.obj); s.obj = null; s.estado = 'nada';}}
  });
}

/* ---------- comportamiento de los enemigos ---------- */
/* vibración corta en Android (en iPhone el navegador no deja) */
const vibra = (ms) => {try {if (navigator.vibrate && !(J && J.pausa)) navigator.vibrate(ms);} catch (e) {}};
function dañaHeroe(n) {
  const h = J.h; if (h.inv > 0 || J.fin || h.oculto > 0) return;
  suena('daño');
  const real = n * (1 - h.armadura); h.vida -= real; bota('bVida'); vibra(real > 12 ? 40 : 18);
  if (h.tal.ira && h.racha >= 8) numero(h.x, 2.6, h.z, 'Ira perdida', 'malo'); h.racha = 0;
  if (h.tal.aliento && h.vida > 0 && h.vida < h.vidaMax * 0.3 && h.alientoOla !== J.ola) {h.alientoOla = J.ola; h.inv = 3; J.animo = Math.max(J.animo || 0, 5); aviso('¡Último aliento!', 1400); flip('fx_onda', h.x, (h.y ?? 0.15) + 0.3, h.z, {tam: 6, dur: 0.5}); J.lenta = 0.4;} h.inv = 0.35; J.temblor = Math.max(J.temblor, 0.25); golpeVisual(h.a); GR.golpe();
  efecto('chispa', h.x, 1.2, h.z); numero(h.x, 2.2, h.z, '-' + Math.round(real), 'malo');
}
function aviso3D(tipo, x, z, rot, sx, vida, sz) {const f = efecto(tipo, x, 0.18, z, {rot, escala: sx, vida, fijo: true}); if (f && sz) f.o.scale.set(sx, 1, sz); return f;}
/* al caer al patio: ruge, aúlla o hace su entrada */
function limitaE(e) {
  if (e.enMuro) {e.x = Math.max(ADARVE.x0, Math.min(ADARVE.x1, e.x)); e.z = Math.max(ADARVE.z0, Math.min(ADARVE.z1, e.z)); e.y = Y_MURO;}
  else {e.x = Math.max(PATIO.x0, Math.min(PATIO.x1, e.x)); e.z = Math.max(PATIO.z0, Math.min(PATIO.z1, e.z));}
}
/* «¡Atrás, al patio!»: el héroe salta del adarve y los que peleaban arriba bajan detrás */
/* escaleras: dos rampas de piedra pegadas a la cara de dentro del muro; se suben y se bajan andando */
const ESCALERAS = [{x0: -6, x1: -14.7, z: -16.3}, {x0: 6, x1: 14.7, z: -16.3}], LARGO_ESC = 11.3;
/* posición en la escalera: u de 0 (abajo) a 1 (arriba); de 1 a 1,2 es el descansillo que entra al adarve */
function posRampa(o, es, u) {
  const dir = Math.sign(es.x1 - es.x0);
  if (u <= 1) {o.x = es.x0 + (es.x1 - es.x0) * u; o.z = es.z; o.y = 0.15 + (Y_MURO - 0.15) * u;}
  else {const q = (u - 1) / 0.2; o.x = es.x1 + dir * 0.3 * q; o.z = es.z + (ADARVE.z1 - 0.2 - es.z) * q; o.y = Y_MURO;}
}
function sueltaMuro() {for (const e of J.enemigos) if (e.enMuro && !e.muerto) {e.enMuro = false; e.fase = 'adarve'; e.sube = 0; e.cayendo = false;}}
function escalera(h, mx, mz, dt) {
  if (h.baja > 0) return false;
  if (h.rampa) {
    const es = h.rampa, dir = Math.sign(es.x1 - es.x0), v = Math.max(-1, Math.min(1, mx * dir - mz * 0.8));
    h.tr = Math.max(0, Math.min(1.2, h.tr + v * h.vel * 0.85 * dt / LARGO_ESC));
    posRampa(h, es, h.tr);
    if (Math.abs(v) > 0.12) {h.rot = Math.atan2(v > 0 ? dir : -dir, 0); if (!ocupada(h.a)) pon(h.a, Math.abs(v) > 0.6 ? 'correr' : 'andar');} else if (!ocupada(h.a)) pon(h.a, 'quieto', 0.3);
    if (h.tr >= 1.2) {h.rampa = null; J.enMuro = true; h.y = Y_MURO;}
    else if (h.tr <= 0) {h.rampa = null; h.y = 0.15; h.z = PATIO.z0 + 0.3; h.x = es.x0 - dir * 0.4;}
    return true;
  }
  for (const es of ESCALERAS) {
    const dir = Math.sign(es.x1 - es.x0);
    if (!J.enMuro && Math.abs(h.x - es.x0) < 1.1 && h.z < PATIO.z0 + 1.2 && (mz < -0.4 || mx * dir > 0.5)) {h.rampa = es; h.tr = 0.02; return true;}
    if (J.enMuro && Math.abs(h.x - es.x1) < 1.3 && mz > 0.45) {
      const tr = J.tramos[dir < 0 ? 0 : 5]; if (tr.roto) return false;
      J.enMuro = false; sueltaMuro(); h.rampa = es; h.tr = 1.18; return true;
    }
  }
  return false;
}
function bajaAlPatio(porque, es) {
  if (!J.enMuro) return; J.enMuro = false;
  const h = J.h; h.bx = h.x; h.bz = h.z;
  {h.baja = 0.9; h.porEscalera = null; pon(h.a, h.a.clips.saltar ? 'saltar' : 'esquivar', 0.05, true); aviso(porque || '¡Retirada! ¡Todos al patio!', 2400); if (!J.dichos.theoden) habla('theoden'); suena('cuerno');}
  sueltaMuro();
}
/* atravesar el muro por un hueco real (desagüe o tramo caído), andando y por encima de los escombros */
function cruza(e, x1, alto) {
  const z1 = BRECHA.z + rnd(0, 1.2), xf = x1;
  e.fase = 'cruza'; e.cz = {x0: e.x, z0: e.z, x1: xf, z1, k: 0, alto, largo: Math.max(1, Math.hypot(xf - e.x, z1 - e.z))};
}
function llega(e) {
  if (Math.random() < 0.6) flip('fx_barro', e.x, 0.2, e.z, {tam: e.d.pesado ? 3.6 : 2.2, dur: 0.4, suma: false});
  const c = e.a.clips;
  if (e.d.jefe && c.entrada) {pon(e.a, 'entrada', 0.1, true); e.pausaT = c.entrada.getClip().duration; J.temblor = Math.max(J.temblor, 0.5);}
  else if (c.aullar && Math.random() < 0.3) {pon(e.a, 'aullar', 0.1, true); e.pausaT = 1.1;}
  else if (c.rugir && Math.random() < (e.d.pesado ? 0.8 : 0.22)) {pon(e.a, 'rugir', 0.1, true); e.pausaT = 0.9;}
}
function mueveEnemigo(e, dt) {
  if (J.cine && !e.desagueHeroe && !e.muerto) return;
  const h = J.h, s = e.escala, warg = e.tipo === 'warg' || !!e.d.salta, dd = e.d;
  if (dd.ariete) return mueveAriete(e, dt);
  if (dd.tronco) return mueveTronco(e, dt);
  const fuerza = e.animado ? 1.4 : 1, vel = dd.vel * (e.animado ? 1.3 : 1) * (e.lento > 0 ? 0.5 : 1);
  if (e.lento > 0) e.lento -= dt;
  if (e.golpe > 0) {
    e.golpe -= dt;
    if (e.golpe <= 0) {
      if (e.golpeA === 'heroe' && Math.hypot(h.x - e.x, h.z - e.z) < e.radio + 1.25 && Math.abs((e.y ?? 0.15) - (h.y ?? 0.15)) < 2.4) {dañaHeroe(dd.dano * fuerza * (e.enMuro ? 0.65 : 1)); if (h.espinas && !h.inv) {FUENTE = 'heroe'; hiere(e, dd.dano * fuerza * h.espinas, 0, 0, 0); efecto('chispa', e.x, 1.2, e.z, {escala: 0.8});}}
      if (e.golpeA === 'area') {J.temblor = 0.5; efecto('polvo', e.gx, 0.15, e.gz, {escala: e.gr / 0.68, vida: 0.5}); if (Math.hypot(h.x - e.gx, h.z - e.gz) < e.gr) dañaHeroe(dd.dano * fuerza); J.defensas.forEach((d) => {if (Math.hypot(d.x - e.gx, d.z - e.gz) < e.gr) dañaDefensa(d, 30);});}
      if (e.golpeA === 'puerta') {golpeaPuerta(dd.danoPuerta * fuerza); if (J.t - (J.avisoPuerta || -99) > 12 && Math.abs(h.z - PATIO.z1) > 14) {J.avisoPuerta = J.t; aviso('¡Atacan la puerta!', 1300);}}
      if (e.golpeA === 'explota') {golpeaPuerta(dd.danoPuerta); J.temblor = 0.6; efecto('explosion', e.x, 0.1, e.z + 0.8, {escala: 2.2, vida: 0.7, crece: 1.4}); aviso('¡La puerta tiembla!', 900); mata(e, false);}
      if (e.golpeA === 'virote') {if (e.tipo === 'chaman_isengard') fuegoChaman(); else disparaEnemigo(e, e.gang);}
      if (e.golpeA === 'defensa' && e.obj && !e.obj.roto) dañaDefensa(e.obj, dd.dano * 0.8);
    }
    return;
  }
  if (e.pausaT > 0) {e.pausaT -= dt; return;}
  if (e.aturdido > 0) {e.aturdido -= dt; if (e.aturdido > 0.3 && e.a.clips.aturdido && !ocupada(e.a)) pon(e.a, 'aturdido'); return;}
  if (e.desagueHeroe && e.fase === 'hacia' && !e.cineVisto && e.z > -44) {e.cineVisto = true; J.cine = {x: e.x, z: Z_MURO_FUERA - 1, t: 0}; J.lenta = 2.2; $('cineTxt').textContent = 'Un uruk corre hacia el desagüe con el fuego de Orthanc…';}
  if (e.cineVisto && J.cine) {J.cine.x = e.x; J.cine.z = e.z;}
  if (e.prende > 0) {e.prende -= dt; if (e.prende <= 0) {vuela(e); if (e.desagueHeroe) setTimeout(() => {if (J) J.cine = null;}, 1300);} return;}
  if (e.fase === 'brecha') {
    /* van hacia el desagüe reventado y entran por él */
    if (e.bx === undefined) e.bx = XT[e.x < 0 ? 2 : 3] + rnd(-0.9, 0.9);
    const tx = e.bx, dx = tx - e.x, dz = Z_MURO_FUERA - 0.6 - e.z, dist = Math.hypot(dx, dz);
    if (dist < 0.5) cruza(e, tx, 0.5);
    else {e.x += dx / dist * vel * dt; e.z += dz / dist * vel * dt; e.rot = Math.atan2(dx, dz); pon(e.a, dd.correr ? 'correr' : 'andar');}
    return;
  }
  if (e.fase === 'cruza') {
    const c = e.cz; c.k = Math.min(1, c.k + dt * vel / c.largo);
    e.x = c.x0 + (c.x1 - c.x0) * c.k; e.z = c.z0 + (c.z1 - c.z0) * c.k; e.y = 0.15 + c.alto * Math.sin(Math.PI * c.k); e.rot = Math.atan2(c.x1 - c.x0, c.z1 - c.z0);
    pon(e.a, dd.correr ? 'correr' : 'andar');
    if (c.k >= 1) {e.fase = 'patio'; e.y = 0.15; e.cz = null; llega(e);}
    return;
  }
  if (e.fase === 'hacia' && e.voladura) {
    const v = e.voladura, dx = v.tx - e.x, dz = Z_MURO_FUERA - 1.0 - e.z, dist = Math.hypot(dx, dz);
    if (v.tramo && v.tramo.roto) {v.tramo = null; v.desague = false;}
    if (dist < 0.7) {if (v.tramo || v.desague) {if (!e.prende) {e.prende = 0.9; pon(e.a, e.a.clips.saltar_y_prender ? 'saltar_y_prender' : 'explotar', 0.05, true);}} else cruza(e, (Math.abs(v.tx) < 0.5 ? XT[e.x < 0 ? 2 : 3] : v.tx) + rnd(-0.9, 0.9), 0.5); return;}
    e.x += dx / dist * vel * dt; e.z += dz / dist * vel * dt; e.rot = Math.atan2(dx, dz); pon(e.a, 'correr');
    if (Math.random() < dt * 10) particula('bocanada', e.x, 2.4, e.z, {vel: 0.3, sube: 1.2, vida: 0.4, escala: 0.8, crece: 1.3, disp: 0.2});
    return;
  }
  if (e.fase === 'hacia') {
    const tx = s.x + Math.sin(e.x * 7) * 0.6, tz = Z_MURO_FUERA - 1.2;
    const dx = tx - e.x, dz = tz - e.z, dist = Math.hypot(dx, dz);
    const tr = J.tramos[s.i - 1];
    if (tr.roto && dist < 1.2) {cruza(e, s.x + rnd(-0.9, 0.9), 0.5); return;}
    if (dist < 0.6) {
      if (warg) {e.fase = 'sube'; e.sube = 0; pon(e.a, e.a.clips.saltar_muro ? 'saltar_muro' : 'saltar', 0.05, true);}
      else if (s.estado === 'arriba') {
        /* de uno en uno: espera a que el de delante haya subido un trecho (no se apelotonan en la escala) */
        const ocupada_ = J.enemigos.some((o) => o !== e && !o.muerto && o.escala === s && o.fase === 'sube' && o.sube < 0.3);
        if (ocupada_) {e.rot = 0; pon(e.a, 'quieto');} else {e.fase = 'sube'; e.sube = 0; e.x = s.x; pon(e.a, 'trepar');}
      }
      else {if (s.estado === 'nada') {s.estado = 'poniendo'; s.t = 2.2;} e.rot = 0; pon(e.a, s.estado === 'poniendo' && e.a.clips.golpear_puerta ? 'golpear_puerta' : 'quieto');}
    } else {e.x += dx / dist * vel * dt; e.z += dz / dist * vel * dt; e.rot = Math.atan2(dx, dz); pon(e.a, dd.correr ? 'correr' : 'andar');}
  } else if (e.fase === 'sube') {
    if (!warg && s.estado !== 'arriba') {caeDeEscala(e); return;}
    e.sube += dt / (warg ? 1.2 : 2.4);
    const k = Math.min(1, e.sube);
    e.y = 0.3 + (Y_MURO - 0.3) * (warg ? Math.sin(k * Math.PI / 2) : k); e.rot = 0;
    /* pegado a la cara del muro (que tiene talud abajo y almenas arriba): nunca dentro de la piedra */
    e.z = warg ? Z_MURO_FUERA - 0.3 + (Z_MURO_ARRIBA - Z_MURO_FUERA + 0.3) * k : caraMuro(e.y) - 0.55;
    if (!warg && e.a.clips.trepar && !ocupada(e.a)) pon(e.a, 'trepar');
    if (k >= 1) {
      dañaTramo(J.tramos[s.i - 1], e.d.pesado ? 16 : e.d.jefe ? 30 : 4);
      if (warg) {e.fase = 'adarve'; e.sube = 0; pon(e.a, e.a.clips.saltar ? 'saltar' : 'correr', 0.05, true);}
      else {e.fase = 'almena'; e.alm = 0; e.z0 = e.z; pon(e.a, e.a.clips.pasar_almena ? 'pasar_almena' : 'saltar', 0.05, true);}
    }
  } else if (e.fase === 'almena') {
    /* salta por encima de la almena y cae en el adarve */
    e.alm += dt / 0.7; const k = Math.min(1, e.alm);
    e.z = e.z0 + (ADARVE.z0 + 0.5 - e.z0) * k; e.y = Y_MURO + Math.sin(k * Math.PI) * 1.15; e.rot = 0;
    if (k >= 1) {e.fase = 'adarve'; e.sube = 0; e.y = Y_MURO; efecto('polvo', e.x, Y_MURO + 0.2, e.z, {escala: 0.7, vida: 0.4});}
  } else if (e.fase === 'adarve') {
    if (J.enMuro && !e.yaMuro) {e.fase = 'patio'; e.enMuro = e.yaMuro = true; e.y = Y_MURO; e.z = rnd(ADARVE.z0, ADARVE.z1); s.cola = Math.max(0, s.cola - 1); return;}
    if (!e.d.salta) {
      /* camina por el adarve hasta la escalera más cercana y baja por ella */
      if (!e.esc) {e.esc = ESCALERAS.reduce((a, b) => Math.abs(b.x1 - e.x) < Math.abs(a.x1 - e.x) ? b : a); e.y = Y_MURO; e.u = 1.2; e.z = Math.max(ADARVE.z0, Math.min(ADARVE.z1, e.z)); s.cola = Math.max(0, s.cola - 1);}
      const es = e.esc, dir = Math.sign(es.x1 - es.x0), v = dd.vel * (dd.correr ? 1.15 : 1);
      if (Math.abs(e.x - (es.x1 + dir * 0.3)) > 0.25 && e.u >= 1.2) {const dx = es.x1 + dir * 0.3 - e.x; e.x += Math.sign(dx) * Math.min(Math.abs(dx), v * dt); e.z += (ADARVE.z1 - 0.2 - e.z) * Math.min(1, dt * 3); e.rot = Math.atan2(Math.sign(dx), 0); pon(e.a, dd.correr ? 'correr' : 'andar');}
      else {e.u -= v * 0.8 * dt / LARGO_ESC; posRampa(e, es, e.u); e.rot = Math.atan2(e.u > 1 ? 0 : -dir, e.u > 1 ? 1 : 0); pon(e.a, dd.correr ? 'correr' : 'andar');
        if (e.u <= 0) {e.fase = 'patio'; e.y = 0.15; e.z = PATIO.z0 + 0.4; e.x = es.x0 - dir * 0.5; e.esc = null; llega(e);}}
      return;
    }
    e.sube += dt / 0.9;
    const k = Math.min(1, e.sube);
    if (k > 0.35 && e.a.clips.caer && !e.cayendo) {e.cayendo = true; pon(e.a, 'caer', 0.1);}
    e.z = Z_MURO_ARRIBA + (zSuelo - Z_MURO_ARRIBA) * k; e.y = Y_MURO * (1 - k * k) + 0.15 * k * k;
    if (k >= 1) {e.fase = 'patio'; e.y = 0.15; s.cola = Math.max(0, s.cola - 1); llega(e); efecto('polvo', e.x, 0.15, e.z, {escala: dd.pesado ? 2.2 : 1, vida: 0.6, crece: 1.8});}
  } else if (e.fase === 'patio') {
    if (dd.jefe) return mueveJefe(e, dt);
    const dh = h.oculto > 0 ? 99 : Math.hypot(h.x - e.x, h.z - e.z);
    /* el ballestero se queda a distancia y dispara con aviso */
    if (dd.distancia && dh < (dd.alcanceDisparo || 13)) {
      e.rot = Math.atan2(h.x - e.x, h.z - e.z);
      e.cd -= dt;
      if (e.cd <= 0) {e.cd = 2.6; e.gang = e.rot; aviso3D('aviso_linea', e.x, e.z, e.gang, 0.3, 0.7, Math.min(13, Math.hypot(h.x - e.x, h.z - e.z) + 2) / 7.27); pon(e.a, dd.clipDisparo || 'disparar', 0.05, true); e.golpe = dd.tDisparo || 0.7; e.golpeA = 'virote'; return;}
      const lejos = dh > 9 ? 1 : dh < 6.5 ? -1 : 0;
      if (lejos) {const n = dh || 1; e.x += (h.x - e.x) / n * vel * lejos * dt; e.z += (h.z - e.z) / n * vel * lejos * dt; if (!ocupada(e.a)) pon(e.a, 'andar');}
      else if (!ocupada(e.a)) pon(e.a, 'quieto');
      limitaE(e);
      return;
    }
    let tx, tz, ataca = false, alPuerta = false;
    if (e.enMuro) {tx = h.x; tz = Math.max(ADARVE.z0, Math.min(ADARVE.z1, h.z)); ataca = dh < e.radio + (dd.pesado ? 2.2 : 0.9);}
    else if (dh < 8 || warg) {tx = h.x; tz = h.z; ataca = dh < e.radio + (dd.pesado ? 2.2 : 0.9);}
    else {tx = marcas.puerta.x + Math.sin(e.x * 3) * 4; tz = PATIO.z1 - 0.3; alPuerta = e.z > PATIO.z1 - 1.2;}
    /* una estaca en el camino: se para a romperla */
    const est = J.defensas.find((d) => d.bloquea && !d.roto && dCaja(d, e.x, e.z) < e.radio + 0.6);
    const dx = tx - e.x, dz = tz - e.z, dist = Math.hypot(dx, dz) || 1;
    e.rot = Math.atan2(dx, dz);
    if (est && !ataca) {
      e.rot = Math.atan2(cercaCaja(est, e.x, e.z)[0] - e.x, cercaCaja(est, e.x, e.z)[1] - e.z); e.cd -= dt;
      if (e.cd <= 0) {e.cd = 1.2; pon(e.a, 'atacar', 0.06, true); e.golpe = 0.35; e.golpeA = 'defensa'; e.obj = est;}
      return;
    }
    if (ataca || alPuerta) {
      e.cd -= dt;
      if (e.cd <= 0) {
        if (alPuerta && e.tipo === 'berserker') {pon(e.a, 'explotar', 0.05, true); e.golpe = 0.75; e.golpeA = 'explota'; return;}
        e.cd = alPuerta ? 1.6 : (dd.pesado ? 2.2 : 1.2);
        if (alPuerta) {pon(e.a, 'golpear_puerta'); e.golpe = 0.4; e.golpeA = 'puerta';}
        else if (dd.pesado) {
          e.gx = e.x + Math.sin(e.rot) * 1.8; e.gz = e.z + Math.cos(e.rot) * 1.8; e.gr = 3.0;
          aviso3D('aviso_area', e.gx, e.gz, 0, e.gr / 2.15, 0.7); pon(e.a, dd.golpe || 'atacar', 0.06, true); e.golpe = 0.7; e.golpeA = 'area';
        } else {const sa = e.a.clips.saltar_ataque; pon(e.a, sa ? 'saltar_ataque' : 'atacar', 0.06, true); e.golpe = sa ? 0.56 : 0.35; e.golpeA = 'heroe';}
      }
    } else {
      e.x += dx / dist * vel * dt; e.z += dz / dist * vel * dt;
      if (!ocupada(e.a)) pon(e.a, e.tipo === 'portaestandarte' ? 'animar' : (dd.correr ? 'correr' : 'andar'));
    }
    limitaE(e);
  }
}
/* el jefe: carga, golpe en área y grito que llama refuerzos */
function mueveJefe(e, dt) {
  const h = J.h, dh = Math.hypot(h.x - e.x, h.z - e.z);
  if (e.cargando > 0) {
    e.cargando -= dt; const v = 15;
    e.x += Math.sin(e.gang) * v * dt; e.z += Math.cos(e.gang) * v * dt;
    if (Math.hypot(h.x - e.x, h.z - e.z) < 1.8) dañaHeroe(e.d.dano);
    limitaE(e);
    return;
  }
  e.cdJefe -= dt; e.rot = Math.atan2(h.x - e.x, h.z - e.z);
  if (e.cdJefe <= 0) {
    const r = Math.random();
    if (dh > 6 && r < 0.45) {e.gang = e.rot; aviso3D('aviso_linea', e.x, e.z, e.gang, 1.0, 0.85, 13.5 / 7.27); pon(e.a, 'carga', 0.05, true); e.golpe = 0.85; e.golpeA = 'carga'; e.cdJefe = 3.2;}
    else if (r < 0.8) {e.gx = h.x; e.gz = h.z; e.gr = 3.6; aviso3D('aviso_area', e.gx, e.gz, 0, e.gr / 2.15, 0.95); pon(e.a, 'golpe_area', 0.05, true); e.golpe = 0.95; e.golpeA = 'area'; e.cdJefe = 3.0;}
    else {pon(e.a, 'grito', 0.05, true); e.golpe = 1.0; e.golpeA = 'grito'; e.cdJefe = 4.0; aviso('¡El capitán llama a sus uruks!', 1400);}
    return;
  }
  if (dh > 2.2) {e.x += Math.sin(e.rot) * e.d.vel * dt; e.z += Math.cos(e.rot) * e.d.vel * dt; if (!ocupada(e.a)) pon(e.a, 'andar');}
  else if (!ocupada(e.a)) {pon(e.a, 'atacar', 0.06, true); e.golpe = 0.35; e.golpeA = 'heroe'; e.cdJefe = Math.max(e.cdJefe, 1.2);}
}
function finGolpeJefe(e) {
  if (e.golpeA === 'carga') {e.cargando = 0.9;}
  if (e.golpeA === 'grito') {for (let i = 0; i < 6; i++) creaEnemigo(azar(['uruk', 'uruk', 'orco', 'ballestero']), {brecha: true, z: Z_MURO_FUERA - 4 - i * 1.5});}
}
function disparaEnemigo(e, ang) {
  if (!P.virote_orco) return;
  const o = P.virote_orco.clone(); o.position.set(e.x, 1.3, e.z); o.rotation.y = ang; scene.add(o);
  J.eproy.push({o, x: e.x, z: e.z, vx: Math.sin(ang) * 17, vz: Math.cos(ang) * 17, vida: 1.2, dano: e.d.dano * (e.animado ? 1.4 : 1)});
}
function actualizaEproy(dt) {
  const h = J.h;
  for (let i = J.eproy.length - 1; i >= 0; i--) {
    const p = J.eproy[i]; p.vida -= dt; p.x += p.vx * dt; p.z += p.vz * dt; p.o.position.set(p.x, 1.3, p.z);
    let fuera = p.vida <= 0;
    if (!fuera && Math.hypot(h.x - p.x, h.z - p.z) < 0.65) {dañaHeroe(p.dano); fuera = true;}
    if (fuera) {scene.remove(p.o); J.eproy.splice(i, 1);}
  }
}

/* ---------- rejilla para choques ---------- */
const CELDA = 2;
let rejilla = new Map();
function llenaRejilla() {
  rejilla = new Map();
  for (const e of J.enemigos) {
    if (e.muerto || e.fase !== 'patio') continue;
    const k = Math.floor(e.x / CELDA) + ',' + Math.floor(e.z / CELDA);
    (rejilla.get(k) || rejilla.set(k, []).get(k)).push(e);
  }
}
function cercanos(x, z, r) {
  const out = [], c0 = Math.floor((x - r) / CELDA), c1 = Math.floor((x + r) / CELDA), f0 = Math.floor((z - r) / CELDA), f1 = Math.floor((z + r) / CELDA);
  for (let i = c0; i <= c1; i++) for (let j = f0; j <= f1; j++) {const l = rejilla.get(i + ',' + j); if (l) for (const e of l) out.push(e);}
  return out;
}
function separa() {
  const h = J.h;
  for (const e of J.enemigos) {
    if (e.muerto || e.fase !== 'patio') continue;
    for (const o of cercanos(e.x, e.z, 2)) {
      if (o === e || o.muerto) continue;
      const dx = e.x - o.x, dz = e.z - o.z, d = Math.hypot(dx, dz), m = e.radio + o.radio;
      if (d > 0 && d < m) {const p = (m - d) * 0.5; e.x += dx / d * p; e.z += dz / d * p;}
    }
    const dx = e.x - h.x, dz = e.z - h.z, d = Math.hypot(dx, dz), m = e.radio + 0.55;
    if (d > 0 && d < m && !e.cargando) {e.x += dx / d * (m - d); e.z += dz / d * (m - d);}
    for (const df of J.defensas) if (df.bloquea && !df.roto) empujaCaja(e, df, e.radio + 0.1);
  }
  /* auras: portaestandarte anima a los suyos */
  for (const e of J.enemigos) e.animado = false;
  for (const p of J.enemigos) if (p.tipo === 'portaestandarte' && !p.muerto && p.fase === 'patio') for (const o of cercanos(p.x, p.z, 5)) if (Math.hypot(o.x - p.x, o.z - p.z) < 5) o.animado = true;
}

/* ---------- mando ---------- */
const mando = {x: 0, z: 0, activo: false, ox: 0, oy: 0, id: null};
const teclas = {};
addEventListener('keydown', (e) => teclas[e.key.toLowerCase()] = true);
addEventListener('keyup', (e) => teclas[e.key.toLowerCase()] = false);
renderer.domElement.addEventListener('pointerdown', (e) => {
  if (coloca.activo) {colocaToque(e); return;}
  mando.activo = true; mando.id = e.pointerId; mando.ox = e.clientX; mando.oy = e.clientY; mando.x = mando.z = 0;
  const j = $('joy'); j.style.display = 'block'; j.style.left = e.clientX + 'px'; j.style.top = e.clientY + 'px'; j.firstElementChild.style.transform = '';
});
addEventListener('pointermove', (e) => {
  if (coloca.activo) {colocaMueve(e); return;}
  if (!mando.activo || e.pointerId !== mando.id) return;
  let dx = e.clientX - mando.ox, dy = e.clientY - mando.oy; const d = Math.hypot(dx, dy), max = 46;
  if (d > max) {dx = dx / d * max; dy = dy / d * max;}
  mando.x = dx / max; mando.z = dy / max;
  $('joy').firstElementChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
});
const sueltaMando = (e) => {if (e.pointerId === mando.id) {mando.activo = false; mando.x = mando.z = 0; $('joy').style.display = 'none';}};
addEventListener('pointerup', sueltaMando); addEventListener('pointercancel', sueltaMando);

/* ---------- héroe y su arma propia ---------- */
function mueveHeroe(dt) {
  const h = J.h;
  if (J.cine) {h.inv = Math.max(h.inv, 0.3); if (!ocupada(h.a)) pon(h.a, 'quieto', 0.2); return;}
  if (h.baja > 0) {
    h.baja -= dt; const k = 1 - Math.max(0, h.baja) / 0.9, es = h.porEscalera;
    if (es) {h.x = h.bx + (es.x - h.bx) * Math.min(1, k * 3); h.z = h.bz + (es.abajo - h.bz) * k; h.y = Y_MURO * (1 - k) + 0.15 * k; h.rot = 0;}
    else {h.x = h.bx * (1 - k) + Math.max(-12, Math.min(12, h.bx)) * k; h.z = h.bz + (PATIO.z0 + 2.5 - h.bz) * k; h.y = Y_MURO * (1 - k * k) + 0.15 * k * k;}
    if (h.baja <= 0) {h.y = 0.15; if (!es) {efecto('polvo', h.x, 0.15, h.z, {escala: 1.6, vida: 0.6, crece: 1.8}); J.temblor = Math.max(J.temblor, 0.4);}}
    h.inv = Math.max(h.inv, 0.2); return;
  }

  let mx = mando.x, mz = mando.z;
  if (teclas.a || teclas.arrowleft) mx = -1; if (teclas.d || teclas.arrowright) mx = 1;
  if (teclas.w || teclas.arrowup) mz = -1; if (teclas.s || teclas.arrowdown) mz = 1;
  const m = Math.min(1, Math.hypot(mx, mz)), atacando = ocupada(h.a) && h.a.actual.getClip().name !== 'esquivar';
  h.cdEsq = Math.max(0, (h.cdEsq || 0) - dt); h.mdT = Math.max(0, (h.mdT || 0) - dt);
  if (teclas[' ']) {teclas[' '] = false; J.pideEsq = true;}
  if (J.pideEsq) {
    J.pideEsq = false;
    if (h.cdEsq <= 0 && !(h.dash > 0)) {
      let ex = mx, ez = mz; if (Math.hypot(ex, ez) < 0.12) {ex = Math.sin(h.rot); ez = Math.cos(h.rot);}
      const n2 = Math.hypot(ex, ez) || 1; h.edx = ex / n2; h.edz = ez / n2;
      if (h.tal.esquiva) {flip('fx_onda', h.x, (h.y ?? 0.15) + 0.3, h.z, {tam: 6, dur: 0.4}); for (const e of cercanos(h.x, h.z, 3.5)) if (!e.muerto && Math.abs((e.y ?? 0.15) - (h.y ?? 0.15)) < 2.2 && Math.hypot(e.x - h.x, e.z - h.z) < 3 + e.radio) {FUENTE = 'carga'; hiere(e, danoH(h) * 1.3, e.x - h.x, e.z - h.z, 3);}}
      h.dash = 0.32; h.cdEsq = 2.2; h.inv = Math.max(h.inv, 0.5); h.golpe = 0; h.rot = Math.atan2(h.edx, h.edz);
      pon(h.a, 'esquivar', 0.04, true); flip('fx_barro', h.x, 0.2, h.z, {tam: 2.2, dur: 0.4, suma: false});
    }
  }
  $('bEsq').style.setProperty('--cd', (h.cdEsq / 2.2 * 100).toFixed(0) + '%');
  if (escalera(h, mx, mz, dt)) {if (h.inv > 0) h.inv -= dt; h.cd -= dt; if (h.golpe > 0) {h.golpe -= dt; if (h.golpe <= 0) impacta(h);} else if (h.cd <= 0) empiezaAtaque(h); return;}
  habilidades(h, dt, mx, mz);
  if (h.carga > 0 || h.furia > 0) return;
  if (h.dash > 0) {
    h.dash -= dt; const v = h.vel * 3.1 * (0.4 + h.dash / 0.32);
    h.x = Math.max(LX0(), Math.min(LX1(), h.x + h.edx * v * dt));
    h.z = Math.max(LZ0(), Math.min(LZ1(), h.z + h.edz * v * dt));
    if (Math.random() < dt * 30) efecto('polvo', h.x, 0.12, h.z, {escala: 0.5, vida: 0.35, crece: 1.4});
    if (h.inv > 0) h.inv -= dt; h.cd = Math.max(h.cd, 0.1);
    return;
  }
  if (m > 0.12) {
    const n = Math.hypot(mx, mz) || 1, dx = mx / n, dz = mz / n, lento = atacando ? 0.8 : 1; h.mdx = dx; h.mdz = dz; h.mdT = 0.35;
    h.x = Math.max(LX0(), Math.min(LX1(), h.x + dx * h.vel * m * lento * dt));
    h.z = Math.max(LZ0(), Math.min(LZ1(), h.z + dz * h.vel * m * lento * dt));
    for (const df of J.defensas) if (df.bloquea && !df.roto) empujaCaja(h, df, 0.5);
    h.parado = 0; if (!atacando) {h.rot = Math.atan2(dx, dz); pon(h.a, m > 0.6 ? 'correr' : 'andar');} else if (h.golpe <= 0 && m > 0.5) {h.rot = Math.atan2(dx, dz);}
  } else if (!atacando) {h.parado = (h.parado || 0) + dt; pon(h.a, h.a.clips.quieto_2 && h.parado % 9 > 6 ? 'quieto_2' : 'quieto', 0.3);}
  if (h.inv > 0) h.inv -= dt;
  const aura = J.defensas.some((d) => d.tipo === 'estandarte' && Math.hypot(d.x - h.x, d.z - h.z) < 5);
  h.aura = aura;
  if (h.regen || aura) h.vida = Math.min(h.vidaMax, h.vida + (h.regen + (aura ? 1.2 : 0)) * dt);
  h.cd -= dt;
  if (h.golpe > 0) {h.golpe -= dt; if (h.golpe <= 0) impacta(h);}
  else if (h.cd <= 0) empiezaAtaque(h);
}
const danoH = (h) => h.dano * (h.aura ? 1.3 : 1) * (J.animo > 0 ? 1.25 : 1) * (h.tal && h.tal.ira ? 1 + Math.min(0.5, Math.floor((h.racha || 0) / 8) * 0.1) : 1);
function buscaObjetivo(h) {
  let obj = null, mejor = 1e9;
  for (const e of h.cuerpo ? cercanos(h.x, h.z, h.alcance + 1.5) : J.enemigos) {
    if (e.muerto) continue;
    if (h.cuerpo ? !(e.fase === 'patio' || (J.enMuro && e.fase === 'sube' && e.sube > 0.55)) : (e.fase !== 'patio' && e.fase !== 'sube' && e.fase !== 'adarve' && !((e.d.antorcha || e.d.ariete || e.d.tronco || J.enMuro) && e.fase === 'hacia' && e.z > -48))) continue;
    if (h.cuerpo && Math.abs((e.y ?? 0.15) - (h.y ?? 0.15)) > 2.2) continue;
    const dx = e.x - h.x, dz = e.z - h.z, d0 = Math.hypot(dx, dz), d = d0 - e.radio;
    /* prefiere a los que tienes delante según hacia dónde mueves el dedo */
    const delante = h.mdT > 0 ? (dx * h.mdx + dz * h.mdz) / (d0 || 1) : 0, nota = d - delante * 1.6;
    if (d < h.alcance && nota < mejor) {mejor = nota; obj = e;}
  }
  if (obj) return {tipo: 'enemigo', e: obj, x: obj.x, z: obj.z};
  for (const s of J.escalas) {
    if (s.estado !== 'arriba') continue;
    const z = h.cuerpo ? zSuelo : Z_MURO_ARRIBA;
    if (Math.hypot(s.x - h.x, z - h.z) < h.alcance + (h.cuerpo ? 0.8 : 0)) return {tipo: 'escala', s, x: s.x, z: Z_MURO_ARRIBA};
  }
  return null;
}
/* ---------- habilidad propia de cada clase ---------- */
/* mecánicas de los nodos V: embestida automática y lluvia sobre el grupo más grande */
function especiales(h, dt) {
  const es = h.esp; if (!es || J.cine || J.pausa) return;
  if (h.dash) {
    const d = h.dash; d.t -= dt; const pa = Math.min(1, dt * 14);
    h.x = Math.max(LX0(), Math.min(LX1(), h.x + d.vx * dt)); h.z = Math.max(LZ0(), Math.min(LZ1(), h.z + d.vz * dt));
    for (const e of cercanos(h.x, h.z, 2.4)) if (!e.muerto && e.fase === 'patio' && !d.tocados.has(e) && Math.hypot(e.x - h.x, e.z - h.z) < 1.6 + e.radio) {d.tocados.add(e); FUENTE = h.icono; hiere(e, danoH(h) * 2, e.x - h.x, e.z - h.z, 3.2); J.parada = Math.max(J.parada, 0.03);}
    if (Math.random() < pa) efecto('polvo', h.x, 0.2, h.z, {escala: 0.8, vida: 0.35});
    if (d.t <= 0) {h.dash = null; h.inv = Math.max(h.inv, 0.2);}
  }
  if (es.carga) {
    h.cargaT = (h.cargaT ?? 4) - dt;
    if (h.cargaT <= 0 && !h.dash && !J.enMuro) {
      const ob = cercanos(h.x, h.z, 9).filter((e) => !e.muerto && e.fase === 'patio').sort((a, b) => Math.hypot(a.x - h.x, a.z - h.z) - Math.hypot(b.x - h.x, b.z - h.z))[0];
      if (ob) {
        const dx = ob.x - h.x, dz = ob.z - h.z, d = Math.hypot(dx, dz) || 1, v = 17;
        h.dash = {vx: dx / d * v, vz: dz / d * v, t: Math.min(0.5, (d + 2.5) / v), tocados: new Set()}; h.rot = Math.atan2(dx, dz); h.inv = Math.max(h.inv, 0.5);
        h.cargaT = 6; suena('cuerno'); J.temblor = Math.max(J.temblor, 0.25); pon(h.a, h.a.clips.correr ? 'correr' : 'atacar', 0.05, true);
      } else h.cargaT = 0.5;
    }
  }
  if (es.lluvia) {
    h.lluviaT = (h.lluviaT ?? 3) - dt;
    if (h.lluviaT <= 0) {
      h.lluviaT = 5;
      let mejor = null, n = 0;
      for (const e of J.enemigos) {if (e.muerto || e.fase !== 'patio' || Math.hypot(e.x - h.x, e.z - h.z) > 16) continue; const c = cercanos(e.x, e.z, 3.2).filter((o) => !o.muerto && o.fase === 'patio').length; if (c > n) {n = c; mejor = e;}}
      if (mejor) {
        const x = mejor.x, z = mejor.z; flip('fx_onda', x, 0.25, z, {tam: 7, dur: 0.6});
        setTimeout(() => {
          if (!J || J.fin) return;
          suena(h.tipo === 'hobbit' ? 'piedra' : 'clavada'); efecto('polvo', x, 0.2, z, {escala: 2.2, vida: 0.5, crece: 1.6}); J.temblor = Math.max(J.temblor, 0.15);
          FUENTE = h.icono; for (const e of cercanos(x, z, 4)) if (!e.muerto && e.fase === 'patio' && Math.hypot(e.x - x, e.z - z) < 3.3 + e.radio) hiere(e, danoH(h) * 2.5, e.x - x, e.z - z, 1.2);
        }, 550);
      }
    }
  }
}
function habilidades(h, dt, mx, mz) {
  especiales(h, dt);
  const hb = HABILIDAD[h.tipo]; h.cdHab = Math.max(0, (h.cdHab || 0) - dt);
  $('bHab').style.setProperty('--cd', (h.cdHab / hb.cd * 100).toFixed(0) + '%');
  if (J.pideHab) {
    J.pideHab = false;
    if (h.cdHab <= 0) {
      h.cdHab = hb.cd; aviso(hb.t, 900);
      if (h.tipo === 'rohan') {let ex = mx, ez = mz; if (Math.hypot(ex, ez) < 0.12) {ex = Math.sin(h.rot); ez = Math.cos(h.rot);} const l = Math.hypot(ex, ez) || 1; h.cdx = ex / l; h.cdz = ez / l; h.carga = 0.5; h.cargados = new Set(); h.inv = Math.max(h.inv, 0.6); h.rot = Math.atan2(h.cdx, h.cdz); pon(h.a, 'correr', 0.05); J.temblor = 0.3;}
      if (h.tipo === 'enano') {h.furia = 3; h.furiaT = 0; h.inv = Math.max(h.inv, 0.3);}
      if (h.tipo === 'elfo') lluvia(h);
      if (h.tipo === 'hobbit') {h.oculto = 3.5; h.emboscada = true; h.a.raiz.traverse((o) => {if (o.isMesh) {o.material.transparent = true; o.material.opacity = 0.35;}}); particula('humo', h.x, 0.8, h.z, {n: 6, vel: 2, sube: 0.6, vida: 0.9, escala: 1.4, crece: 1.6});}
    }
  }
  if (h.carga > 0) {
    h.carga -= dt; const v = h.vel * 3.4;
    h.x = Math.max(LX0(), Math.min(LX1(), h.x + h.cdx * v * dt)); h.z = Math.max(LZ0(), Math.min(LZ1(), h.z + h.cdz * v * dt));
    if (Math.random() < dt * 14) particula('polvo', h.x, 0.9, h.z, {vel: 0.8, sube: 0.3, vida: 0.45, escala: 0.6, crece: 1.4});
    FUENTE = 'carga';
    for (const e of cercanos(h.x, h.z, 3)) if (!e.muerto && e.fase === 'patio' && !h.cargados.has(e) && Math.hypot(e.x - h.x, e.z - h.z) < 1.7 + e.radio) {h.cargados.add(e); hiere(e, danoH(h) * 4, h.cdx, h.cdz, 3.2); J.parada = Math.max(J.parada, 0.03);}
    if (h.carga <= 0) {pon(h.a, h.a.clips.golpe_cargado ? 'golpe_cargado' : 'atacar', 0.05, true); flip('fx_onda', h.x, 0.3, h.z, {tam: 6, dur: 0.35});}
  }
  if (h.furia > 0) {
    h.furia -= dt; h.furiaT -= dt;
    const n = Math.hypot(mx, mz); if (n > 0.12) {h.x = Math.max(LX0(), Math.min(LX1(), h.x + mx / n * h.vel * 1.25 * dt)); h.z = Math.max(LZ0(), Math.min(LZ1(), h.z + mz / n * h.vel * 1.25 * dt));}
    h.rot += dt * 14;
    if (h.furiaT <= 0) {
      h.furiaT = 0.25; FUENTE = 'furia'; if (!ocupada(h.a)) pon(h.a, h.a.clips.giro ? 'giro' : 'atacar', 0.05, true);
      efecto(P.corte_dorado ? 'corte_dorado' : 'corte', h.x, 0.9, h.z, {escala: 2.4, rot: h.rot, vida: 0.22, crece: 1.1});
      for (const e of cercanos(h.x, h.z, 4.5)) if (!e.muerto && e.fase === 'patio' && Math.hypot(e.x - h.x, e.z - h.z) < 3.2 + e.radio) hiere(e, danoH(h) * 1.3, e.x - h.x, e.z - h.z, 1.2);
    }
  }
  if (h.oculto > 0) {h.oculto -= dt; if (h.oculto <= 0) finOculto();}
}
function finOculto() {
  const h = J.h; if (!h.emboscada && !(h.oculto > 0)) return;
  h.oculto = 0; h.emboscada = false;
  h.a.raiz.traverse((o) => {if (o.isMesh) {o.material.opacity = 1; o.material.transparent = false;}});
}
function lluvia(h) {
  const cand = J.enemigos.filter((e) => !e.muerto && e.fase === 'patio' && Math.hypot(e.x - h.x, e.z - h.z) < 18);
  let c = cand[0]; let mejor = -1;
  for (const e of cand) {const n = cand.filter((o) => Math.hypot(o.x - e.x, o.z - e.z) < 4.5).length; if (n > mejor) {mejor = n; c = e;}}
  const cx = c ? c.x : h.x + Math.sin(h.rot) * 6, cz = c ? c.z : h.z + Math.cos(h.rot) * 6, nv = poder();
  aviso3D('aviso_area', cx, cz, 0, 4.8 / 1.5, 0.5);
  for (let i = 0; i < 22; i++) setTimeout(() => {
    if (!J || J.fin) return;
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 4.8, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    particula('destello', x, 0.5, z, {vel: 0, sube: 0, vida: 0.2, escala: 0.9, crece: 1.3, disp: 0}); particula('polvo', x, 0.3, z, {vel: 0.6, sube: 0.3, vida: 0.5, escala: 0.6, crece: 1.5});
    FUENTE = 'lluvia';
    for (const e of cercanos(x, z, 2.5)) if (!e.muerto && e.fase === 'patio' && Math.hypot(e.x - x, e.z - z) < 1.3 + e.radio) hiere(e, 3 + nv * 1.2, 0, 0, 0.3);
  }, 300 + i * 55);
}

/* el golpe crece con el nivel: 1 normal, 2 combo de tres con remate, 3 golpe cargado con onda, 4 el cargado más a menudo y con fuego */
const poder = () => 1 + (J.nivel >= 4) + (J.nivel >= 8) + (J.nivel >= 12);
const PODER_TXT = ['', '', '¡Tu golpe crece! Combo de tres con remate', '¡Golpe cargado! Cada cuatro golpes, una onda que barre', '¡Furia de Helm! Golpe cargado con fuego, más a menudo'];
function empiezaAtaque(h) {
  const ob = buscaObjetivo(h); if (!ob) return;
  const pw = poder(), n = h.alterna++;
  h.fin = pw >= 2 && n % 3 === 2;
  h.cargado = pw >= 3 && n % (pw >= 4 ? 3 : 4) === 3 && !!h.a.clips.golpe_cargado;
  h.objetivo = ob; h.cd = h.cadencia * h.velArmas * (h.cargado ? 1.4 : 1); h.golpe = h.cargado ? 0.4 : 0.25;
  h.rot = Math.atan2(ob.x - h.x, ob.z - h.z);
  const clip = h.cargado ? 'golpe_cargado' : h.cuerpo && h.arco >= Math.PI * 1.99 ? 'giro' : pw >= 2 ? ['atacar', 'atacar_2', 'atacar_3'][n % 3] : ['atacar', 'atacar_2'][n % 2];
  pon(h.a, clip, 0.05, true);
  if (h.cargado) efecto('chispa', h.x, 1.4, h.z, {escala: 2, vida: 0.35});
}
function golpeCargado(h, pw) {
  suena('boom'); vibra(30);
  const r = (h.cuerpo ? h.alcance : 3.2) * (pw >= 4 ? 1.9 : 1.55), dano = danoH(h) * (pw >= 4 ? 3 : 2.4);
  flip('fx_onda', h.x, 0.3, h.z, {tam: r * 2.3, dur: 0.4});
  if (pw >= 4) efecto('explosion', h.x, 0.2, h.z, {escala: r / 2.2, vida: 0.5, crece: 1.3});
  J.temblor = Math.max(J.temblor, 0.35); J.parada = Math.max(J.parada, 0.06);
  FUENTE = pw >= 4 ? 'explosion' : 'cargado';
  for (const e of cercanos(h.x, h.z, r + 1.5)) if (!e.muerto && e.fase === 'patio' && Math.hypot(e.x - h.x, e.z - h.z) < r + e.radio) hiere(e, dano, e.x - h.x, e.z - h.z, 2.6);
}
function impacta(h) {
  if (J.enMuro) for (const sc of J.escalas) if (sc.estado === 'arriba' && Math.abs(sc.x - h.x) < h.alcance + 1.3 && h.z < -18) {danaEscala(sc, danoH(h) * 1.6); particula('astillas', sc.x, Y_MURO + 0.3, Z_MURO_ARRIBA - 0.4, {n: 3, vel: 2.5, sube: 2, vida: 0.6, escala: 0.5, grav: 10, crece: 1}); suena('madera');}
  if (J.enMuro) for (const e of cercanos(h.x, h.z, h.alcance + 2)) if (!e.muerto && e.fase === 'sube' && e.sube > 0.55 && Math.hypot(e.x - h.x, e.z - h.z) < h.alcance + 1.4) {FUENTE = 'heroe'; e.vida = 0; caeDeEscala(e); efecto('chispa', e.x, e.y + 1, e.z, {escala: 1.2}); J.parada = Math.max(J.parada || 0, 0.04);}
  const ob = h.objetivo; if (!ob) return;
  const pw = poder();
  if (h.cargado) {h.cargado = false; golpeCargado(h, pw); if (h.cuerpo) return;}
  if (!h.cuerpo) {
    const vivo = ob.tipo === 'enemigo' && !ob.e.muerto, tx = vivo ? ob.e.x : ob.x, tz = vivo ? ob.e.z : ob.z;
    const base = Math.atan2(tx - h.x, tz - h.z); h.rot = base;
    FUENTE = h.icono;
    const extra = h.fin ? 2 : 0;
    suena('disparo');
    for (let i = 0; i < h.multi + extra; i++) lanza({fuera: true, modelo: h.proyectil, x: h.x, z: h.z, ang: base + (i - (h.multi + extra - 1) / 2) * 0.22, vel: h.velProy, alcance: h.alcance, dano: danoH(h) * (h.fin ? 1.4 : 1), atraviesa: h.atraviesa + (pw >= 3 ? 1 : 0), escala: h.proyectil === 'piedra' ? 1.6 : 1.3, rueda: h.proyectil === 'piedra', escalas: true});
    return;
  }
  if (ob.tipo === 'escala') {danaEscala(ob.s, danoH(h) * h.danoEscala); return;}
  const ang = h.rot, giro = h.arco >= Math.PI * 1.99;
  /* estocada: el héroe se lanza un paso hacia lo que golpea */
  if (ob.tipo === 'enemigo' && !ob.e.muerto) {const dx = ob.e.x - h.x, dz = ob.e.z - h.z, d = Math.hypot(dx, dz); if (d > 1.1) {const st = Math.min(0.5, d - 1.0) * (h.fin ? 1.5 : 1); h.x = Math.max(LX0(), Math.min(LX1(), h.x + dx / d * st)); h.z = Math.max(LZ0(), Math.min(LZ1(), h.z + dz / d * st));}}
  const ce = P.corte_blanco ? (pw >= 4 || (h.fin && pw >= 3) ? 'corte_fuego' : pw >= 2 ? (h.fin ? 'corte_dorado' : 'corte_blanco') : 'corte_blanco') : 'corte';
  suena('tajo', h.fin ? 1.3 : 1);
  flip(ce === 'corte_fuego' ? 'fx_tajo_fuego' : ce === 'corte_dorado' ? 'fx_tajo_oro' : 'fx_tajo', h.x, 0.9, h.z, {tam: h.alcance * 2.3 * (1 + 0.08 * (pw - 1)) * (h.fin ? 1.2 : 1), rot: ang, dur: h.fin ? 0.26 : 0.2});
  if (h.fin) {J.parada = Math.max(J.parada, 0.05); J.temblor = Math.max(J.temblor, 0.15);}
  let tocados = 0;
  for (const e of cercanos(h.x, h.z, h.alcance + 1.5)) {
    if (e.muerto) continue;
    if (Math.abs((e.y ?? 0.15) - (h.y ?? 0.15)) > 2.2) continue;
    const dx = e.x - h.x, dz = e.z - h.z, d = Math.hypot(dx, dz) - e.radio;
    if (d > h.alcance) continue;
    let da = Math.atan2(dx, dz) - ang; da = Math.atan2(Math.sin(da), Math.cos(da));
    if (!giro && Math.abs(da) > h.arco / 2) continue;
    FUENTE = h.icono; hiere(e, danoH(h) * (h.fin ? 1.6 : 1) * (h.emboscada ? 3 : 1), dx, dz, h.fin ? 2.4 : 1.3); tocados++; if (h.tal.aturde && h.alterna % 4 === 0 && !e.d.jefe) e.aturdido = 1;
  }
  if (h.esp && h.esp.linea) {
    /* Lanza de Eorl: todo lo que esté en una franja delante, hasta el doble de alcance */
    const sx = Math.sin(ang), sz = Math.cos(ang), L = h.alcance * 2.1;
    flip('fx_tajo_oro', h.x + sx * L * 0.5, 0.9, h.z + sz * L * 0.5, {tam: L * 1.4, rot: ang, dur: 0.22});
    for (const e of cercanos(h.x, h.z, L + 1.5)) {
      if (e.muerto || e.fase !== 'patio' || Math.abs((e.y ?? 0.15) - (h.y ?? 0.15)) > 2.2) continue;
      const dx = e.x - h.x, dz = e.z - h.z, fw = dx * sx + dz * sz, lat = Math.abs(dx * sz - dz * sx);
      if (fw > h.alcance && fw < L + e.radio && lat < 0.9 + e.radio) {FUENTE = h.icono; hiere(e, danoH(h), dx, dz, 1.8); tocados++;}
    }
  }
  if (h.esp && h.esp.onda && tocados && (h.ondaN = (h.ondaN || 0) + 1) % 4 === 0) golpeCargado(h, 3);
  if (tocados) {suena('golpe', h.fin ? 1.3 : 1); J.parada = Math.max(J.parada, h.fin ? 0.07 : 0.04); J.temblor = Math.max(J.temblor, h.fin ? 0.22 : 0.1);}
  if (tocados >= 3) J.parada = Math.max(J.parada, 0.06);
  h.fin = false; if (tocados && h.emboscada) finOculto();
}

/* ---------- proyectiles amigos (arma propia, armas automáticas, defensas) ---------- */
function lanza(o) {
  const m = P[o.modelo]; if (!m) return;
  if (J.enMuro && enFranja(o.z) && !o.y) {o.y = Y_MURO + 1.2; o.fuera = true;}
  const ob = m.clone(true); ob.scale.setScalar(o.escala || 1); ob.position.set(o.x, o.y || 1.2, o.z); ob.rotation.y = o.ang; scene.add(ob);
  J.proy.push({tag: o.tag || FUENTE, fuera: o.fuera, o: ob, x: o.x, z: o.z, y: o.y || 1.2, vx: Math.sin(o.ang) * o.vel, vz: Math.cos(o.ang) * o.vel, vida: o.alcance / o.vel + 0.15, quedan: o.atraviesa ?? 0, tocados: new Set(), dano: o.dano,
    splash: o.splash || 0, rueda: o.rueda, gira: o.gira, vuelve: o.vuelve ? {ida: o.alcance / o.vel} : null, escalas: o.escalas, emp: o.emp ?? 0.8, arco: o.arco || null, vel: o.vel});
}
function actualizaProyectiles(dt) {
  const h = J.h;
  for (let i = J.proy.length - 1; i >= 0; i--) {
    const p = J.proy[i]; p.vida -= dt;
    if (p.vuelve) {
      p.vuelve.ida -= dt;
      if (p.vuelve.ida <= 0) {const dx = h.x - p.x, dz = h.z - p.z, d = Math.hypot(dx, dz) || 1; if (!p.vuelta) {p.vuelta = true; p.tocados.clear();} p.vx = dx / d * p.vel; p.vz = dz / d * p.vel; p.vida = 2; if (d < 0.8) p.vida = 0;}
    }
    p.x += p.vx * dt; p.z += p.vz * dt;
    if (p.arco) {p.arco.t += dt; const k = Math.min(1, p.arco.t / p.arco.dur); p.y = 1.5 + Math.sin(k * Math.PI) * 6; if (k >= 1) {p.vida = 0; estalla(p);}}
    p.o.position.set(p.x, p.y, p.z);
    if (p.rueda) p.o.rotation.x += dt * 14; if (p.gira) p.o.rotation.y += dt * 16;
    let fuera = p.vida <= 0 && !p.arco;
    if (!fuera && p.escalas) for (const s of J.escalas) if (s.estado === 'arriba' && Math.abs(p.x - s.x) < 0.9 && p.z < Z_MURO_ARRIBA + 0.9) {danaEscala(s, p.dano * h.danoEscala); fuera = true; break;}
    if (!fuera && !p.arco) for (const e of J.enemigos) {
      if (e.muerto || p.tocados.has(e) || (e.fase !== 'patio' && e.fase !== 'sube' && e.fase !== 'adarve' && !((e.d.antorcha || e.d.ariete || e.d.tronco || J.enMuro) && p.fuera && e.fase === 'hacia'))) continue;
      if (Math.hypot(e.x - p.x, e.z - p.z) < e.radio + 0.3) {
        p.tocados.add(e); FUENTE = p.tag; hiere(e, p.dano * (J.h.emboscada ? 3 : 1), p.vx, p.vz, p.emp); if (J.h.emboscada) finOculto();
        if (p.rebota > 0) {
          const sig = J.enemigos.filter((o) => !o.muerto && !p.tocados.has(o) && o.fase === 'patio' && Math.hypot(o.x - e.x, o.z - e.z) < 6).sort((a, b) => Math.hypot(a.x - e.x, a.z - e.z) - Math.hypot(b.x - e.x, b.z - e.z))[0];
          if (sig) {p.rebota--; const dx = sig.x - p.x, dz = sig.z - p.z, d = Math.hypot(dx, dz) || 1; p.vx = dx / d * p.vel; p.vz = dz / d * p.vel; p.vida = 1; particula('chispa', p.x, 1.2, p.z, {n: 2, vel: 2, sube: 1, vida: 0.25, escala: 0.4, grav: 8}); break;}
        }
        if (p.splash) {estalla(p); fuera = true; break;}
        if (p.quedan !== Infinity && p.quedan-- <= 0) {fuera = true; break;}
      }
    }
    if (p.z < (p.fuera ? -60 : Z_MURO_ARRIBA - 1) || p.z > PATIO.z1 + 2 || p.x < PATIO.x0 - 3 || p.x > PATIO.x1 + 3) fuera = true;
    if (fuera || (p.arco && p.vida <= 0)) {scene.remove(p.o); J.proy.splice(i, 1);}
  }
}
function estalla(p) {
  FUENTE = p.tag || 'explosion';
  efecto('explosion', p.x, 0.2, p.z, {escala: p.splash / 1.6, vida: 0.5, crece: 1.3});
  for (const e of cercanos(p.x, p.z, p.splash + 1.5)) if (!e.muerto && Math.hypot(e.x - p.x, e.z - p.z) < p.splash + e.radio && !p.tocados.has(e)) hiere(e, p.dano * 0.8, e.x - p.x, e.z - p.z, 0.6);
}
function resiste(e, n) {
  const d = e.d;
  if (e.tipo === 'warg' || e.tipo === 'huargo_jinete') {
    if (tiene('rapido') || tiene('area') || tiene('fuego')) return [n * 1.8, 'debil'];
    if (Math.random() < 0.55) return [0, 'esquiva'];
  }
  if (d.armadura) {
    if (d.ariete && tiene('fuego')) return [n * 2, 'debil'];
    if (tiene('pesado') || tiene('fuego')) return [n * (e.tipo === 'troll_acorazado' ? 1.3 : 1.5), 'debil'];
    if (tiene('perfora') && e.tipo === 'uruk_acorazado') return [n * 1.2, ''];
    const r = n * 5 / (5 + d.armadura); return [r, r < n * 0.6 ? 'bloq' : ''];
  }
  if (d.antorcha && (tiene('perfora') || tiene('rapido'))) return [n * 2, 'debil'];
  return [n, ''];
}
function hiere(e, n, dx, dz, emp = 0.8) {
  if (e.muerto) return;
  if (e.desagueHeroe && FUENTE === 'arquero') n *= 0.3;
  if (FUENTE === 'arquero') suena('clavada');
  const [n2, como] = resiste(e, n);
  if (como === 'esquiva') {if (!(J.txtT > J.t - 0.9)) {J.txtT = J.t; numero(e.x, 2.2, e.z, '¡esquiva!', 'bloq');} return;}
  if (como === 'bloq') {suena('metal'); if (!(J.txtT > J.t - 0.9)) {J.txtT = J.t; numero(e.x, 2.6, e.z, '¡clang!', 'bloq');}}
  if (como === 'debil' && n2 >= 3) emp *= 1.3;
  n = n2;
  e.vida -= n; e.gdx = dx; e.gdz = dz; e.gn = n; golpeVisual(e.a); flip('fx_impacto', e.x + rnd(-0.2, 0.2), 1.2, e.z + rnd(-0.2, 0.2), {tam: n >= 6 ? 2.4 : 1.6, dur: 0.18, suelo: false}); if (n >= 3) particula('chispa', e.x, 1.1, e.z, {n: 2, vel: 3, sube: 2, vida: 0.3, escala: 0.4, grav: 9});
  /* menos números: solo golpes que importan y como mucho uno cada 0,4 s por enemigo */
  if ((n >= 5 || como === 'debil') && !(e.numT > J.t - 0.4)) e.numT = J.t, numero(e.x, e.d.pesado || e.d.jefe ? 4.2 : 2.3, e.z, Math.round(n), como === 'debil' ? 'debil' : n >= 8 ? 'gran' : '');
  if (e.fase === 'patio' && emp && !e.d.ariete) {const l = Math.hypot(dx, dz) || 1, k = e.d.jefe ? 0.05 : e.d.pesado ? 0.15 : 1; e.x += dx / l * emp * k; e.z += dz / l * emp * k; if (!e.d.jefe) e.aturdido = 0.12;}
  if (e.vida <= 0) {
    const enCara = (e.fase === 'sube' || e.fase === 'almena') && !e.d.salta;
    mata(e, false);
    /* muere colgado del muro: cae hacia fuera dando vueltas, no se hunde en la piedra */
    if (enCara) {e.vuela = {vx: (dx || 0) * 0.3 + rnd(-0.8, 0.8), vz: -rnd(2.5, 4), vy: rnd(1, 2.5), giro: rnd(-5, 5)}; e.muerto = 2.6; if (e.a.clips.caer) pon(e.a, 'caer', 0.05, true);}
  }
  else if (!ocupada(e.a) && e.fase === 'patio' && e.golpe <= 0 && !e.d.jefe) pon(e.a, n >= 5 && e.a.clips.empujado ? 'empujado' : 'recibir_golpe', 0.05, true);
}
function caraMuro(y) {
  const t = y < 3.75 ? -22.26 + 0.7 * y / 3.75 : -21.56, a = -22.06, k = Math.min(1, Math.max(0, (y - 6.3) / 0.9));
  return t + (a - t) * k;
}
function caeDeEscala(e) {
  if (e.muerto) return;
  e.vuela = {vx: rnd(-1.2, 1.2), vz: -rnd(2.5, 4.5), vy: rnd(1.5, 3.5), giro: rnd(-5, 5)};
  if (Math.random() < 0.5) suena('muerte');
  mata(e, true); e.muerto = 2.6; e.cae = false; if (e.a.clips.caer) pon(e.a, 'caer', 0.05, true);
}
function mata(e, caida) {
  if (e.muerto) return;
  if (e.desagueHeroe) {J.cine = null; J.lenta = 0; aviso('¡Lo habéis tumbado! El desagüe aguanta', 2200); J.oro += 40;}
  suena('muerte');
  {const h = J.h; h.racha = (h.racha || 0) + 1; if (h.tal.sangre) h.vida = Math.min(h.vidaMax, h.vida + 2); if (h.tal.ira && h.racha % 8 === 0 && h.racha <= 40) {numero(h.x, 2.6, h.z, '¡Ira +' + (h.racha / 8 * 10) + ' %!', 'gran'); bota('bVida');}}
  e.muerto = e.d.jefe ? 2.6 : 1.3; e.golpe = 0; e.cargando = 0; pon(e.a, e.d.jefe ? 'morir_jefe' : e.a.clips.romperse ? 'romperse' : azar(['morir', 'morir_2', 'morir_3'].filter((k) => e.a.clips[k])), 0.05, true);
  if (e.d.ariete) {e.muerto = 2.2; J.temblor = 0.6; efecto('explosion_muro', e.x, 0.1, e.z, {escala: 1, vida: 1}); aviso('¡El ariete se rompe!', 1500);}
  if (e.fase === 'patio' && !e.d.pesado && !e.d.jefe && (e.gdx || e.gdz) && Math.random() < (e.gn >= 6 ? 0.8 : 0.35)) {
    const l = Math.hypot(e.gdx, e.gdz) || 1, f = rnd(3, 5.5); e.vuela = {vx: e.gdx / l * f, vz: e.gdz / l * f, vy: rnd(3.5, 6), giro: rnd(-6, 6)}; e.muerto = 1.8; if (e.a.clips.caer) pon(e.a, 'caer', 0.05, true);
  }
  if (e.fase !== 'patio' && e.escala) e.escala.cola = Math.max(0, e.escala.cola - 1);
  if (caida) {J.puntos += Math.round(e.d.pts / 2); return;}
  J.bajas++; J.puntos += Math.round(e.d.pts * 2.2) * (e.elite ? 3 : 1);
  if (e.fase === 'patio') {mancha(e.x, e.z, e.d.pesado || e.d.jefe ? 2 : 1); particula(e.d.ariete ? 'astillas' : 'sangre', e.x, 1, e.z, {n: 2, vel: 2, sube: 1.5, vida: 0.5, escala: 0.7, grav: 8, crece: 1.2});}
  const zx = Math.max(e.z, zSuelo + 0.5);
  sueltaXp(e.x, zx, Math.round(e.d.xp * 2.2 * (e.elite ? 3 : 1)));
  if (Math.random() < (e.elite ? 1 : e.d.pesado ? 0.9 : 0.3)) suelta('moneda_oro', e.x + rnd(-.5, .5), zx + rnd(-.5, .5), {oro: e.elite ? 10 : e.d.pesado ? 8 : 1 + (Math.random() * 2 | 0)});
  if (e.elite || e.d.jefe) suelta('cofre', e.x, zx, {cofre: e.d.jefe ? 3 : 1});
  else if (Math.random() < 0.018) suelta('lembas_suelo', e.x, zx, {cura: 30});
  else if (Math.random() < 0.006) suelta('iman', e.x, zx, {iman: true});
  if (e.d.pesado || e.d.jefe) {J.parada = Math.max(J.parada, 0.09); J.temblor = Math.max(J.temblor, 0.45);}
  if (e.d.jefe) {aviso('¡Has abatido al capitán uruk!', 2600); $('bJefe').style.display = 'none'; J.puntos += 1000; for (let i = 0; i < 6; i++) suelta('moneda_oro', e.x + rnd(-2, 2), zx + rnd(-2, 2), {oro: 8});}
}

/* ---------- botín: gemas, oro, cofres, lembas, imán ---------- */
function sueltaXp(x, z, n) {
  while (n >= 25) {suelta('gema_roja', x + rnd(-.5, .5), z + rnd(-.5, .5), {xp: 25}); n -= 25;}
  while (n >= 5) {suelta('gema_azul', x + rnd(-.5, .5), z + rnd(-.5, .5), {xp: 5}); n -= 5;}
  while (n >= 1) {suelta('gema_verde', x + rnd(-.4, .4), z + rnd(-.4, .4), {xp: 1}); n -= 1;}
}
function suelta(modelo, x, z, datos) {
  if (J.gemas.length > 220 && datos.xp) {ganaXp(datos.xp); return;}
  const base = P[modelo]; if (!base) return;
  if (J.enMuro) {x = Math.max(ADARVE.x0, Math.min(ADARVE.x1, x)); z = Math.max(ADARVE.z0, Math.min(ADARVE.z1, z));}
  let m;
  if (GI[modelo]) {m = new THREE.Object3D(); m.position.set(x, 0.3, z);}   /* gemas y monedas: se pintan instanciadas */
  else {m = base.clone(true); m.position.set(x, 0.3, z); if (modelo === 'cofre' && P.brillo_cofre) m.add(P.brillo_cofre.clone()); scene.add(m);}
  J.gemas.push({m, x, z, v: 0, modelo, ...datos, t: 0});
}
/* ---------- motor: gemas y monedas instanciadas (cientos en el suelo = 3-4 dibujos por tipo) ---------- */
const GI = {}, _gm = new THREE.Matrix4(), _gi = new THREE.Matrix4();
function preparaGemasInst() {
  for (const k of ['gema_verde', 'gema_azul', 'gema_roja', 'moneda_oro']) {
    const base = P[k]; if (!base) continue; base.updateMatrixWorld(true); _gi.copy(base.matrixWorld).invert(); const partes = [];
    base.traverse((o) => {if (!o.isMesh) return; const im = new THREE.InstancedMesh(o.geometry, o.material, 240); im.count = 0; im.frustumCulled = false; scene.add(im); partes.push({im, local: new THREE.Matrix4().multiplyMatrices(_gi, o.matrixWorld)});});
    if (partes.length) GI[k] = partes;
  }
}
function pintaGemas() {
  const n = {}; for (const k in GI) n[k] = 0;
  if (J) for (const g of J.gemas) {
    const ps = GI[g.modelo]; if (!ps) continue; const i = n[g.modelo]; if (i >= 240) continue; n[g.modelo]++;
    g.m.updateMatrix(); for (const p of ps) p.im.setMatrixAt(i, _gm.multiplyMatrices(g.m.matrix, p.local));
  }
  for (const k in GI) for (const p of GI[k]) {p.im.count = n[k]; p.im.instanceMatrix.needsUpdate = true;}
}
function actualizaGemas(dt) {
  const h = J.h;
  for (let i = J.gemas.length - 1; i >= 0; i--) {
    const g = J.gemas[i], dx = h.x - g.x, dz = h.z - g.z, d = Math.hypot(dx, dz);
    g.t += dt; if (!g.cofre) {g.m.rotation.y += dt * 3; g.m.position.y = (g.alto ?? (g.alto = enFranja(g.z) ? Y_MURO + 0.3 : 0.3)) + Math.sin(J.t * 4 + i) * 0.12;}
    const imanta = (g.xp || g.oro) && (d < h.iman * (g.oro ? 1.4 : 1) || g.atraido);
    if (imanta) {g.v = Math.min(18, g.v + dt * 30); g.x += dx / d * g.v * dt; g.z += dz / d * g.v * dt; g.m.position.x = g.x; g.m.position.z = g.z;}
    if (d < (g.cofre ? 1.3 : 0.7)) {
      scene.remove(g.m); J.gemas.splice(i, 1);
      if (g.xp) ganaXp(g.xp * h.xpMul);
      if (g.oro) {suena('moneda'); if (J.h.tal.botin) g.oro = Math.ceil(g.oro * 1.5); J.oro += g.oro; J.oroTotal += g.oro; numero(h.x, 2.4, h.z, '+' + g.oro + ' oro', 'oro'); monedaVuela(g.x, g.z);}
      if (g.cura) {h.vida = Math.min(h.vidaMax, h.vida + g.cura); efecto('curar', h.x, 0.2, h.z, {vida: 0.8, crece: 1.3}); numero(h.x, 2.4, h.z, '+' + g.cura, '');}
      if (g.iman) {J.gemas.forEach((o) => {if (o.xp || o.oro) o.atraido = true;}); aviso('¡El cuerno llama a todas las gemas!', 1200);}
      if (g.cofre) abreCofre(g.cofre, g.x, g.z);
    }
  }
}
function abreCofre(n, x, z) {
  const c = P.cofre.clone(true); c.position.set(x, 0.15, z); scene.add(c);
  const mx = new THREE.AnimationMixer(c), clip = M.botin.animations.find((a) => a.name === 'abrir');
  if (clip) {const a = mx.clipAction(clip); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.play();}
  mezcladores.push(mx); setTimeout(() => {scene.remove(c); const k = mezcladores.indexOf(mx); if (k >= 0) mezcladores.splice(k, 1);}, 2500);
  J.oro += 15; J.oroTotal += 15;
  efecto('subir_nivel', x, 0.15, z, {vida: 1.0, crece: 1.2});
  J.cofresPend = (J.cofresPend || 0) + n;
  setTimeout(() => {if (!J.fin && !J.pausa) siguienteCofre();}, 700);
}
function siguienteCofre() {if (J.cofresPend > 0) {J.cofresPend--; ofreceMejoras(true);}}
function ganaXp(n) {
  J.xp += n; suena('xp');
  if (J.xp >= J.xpSig) {J.xp -= J.xpSig; suena('nivel'); {const hh = J.h; flip('fx_onda', hh.x, (hh.y ?? 0.15) + 0.3, hh.z, {tam: 7, dur: 0.5}); particula('oro', hh.x, (hh.y ?? 0.15) + 1, hh.z, {n: 10, vel: 4, sube: 5, vida: 0.8, escala: 0.5, grav: 9}); J.lenta = Math.max(J.lenta || 0, 0.25); bota('nivel'); bota('hRet');} const pw0 = poder(); J.nivel++; if (poder() > pw0) setTimeout(() => aviso(PODER_TXT[poder()], 2600), 600); J.xpSig = Math.round(J.xpSig * 1.3 + 3); efecto('subir_nivel', J.h.x, 0.15, J.h.z, {vida: 0.9, crece: 1.1}); J.subidas = (J.subidas || 0) + 1;}
}

/* ---------- armas automáticas ---------- */
function nivelArma(id) {return J.armas[id] || 0;}
function actualizaArmas(dt) {
  const h = J.h, va = h.velArmas;
  for (const id in J.armas) {
    const n = J.armas[id], evo = !!J.evos[id], st = J['cd_' + id] = (J['cd_' + id] ?? 0.5) - dt;
    if (id === 'antorcha') continue;
    if (st > 0) continue;
    FUENTE = id;
    if (id === 'cuchillos') {
      J.cd_cuchillos = (evo ? 0.55 : 1.25 - n * 0.1) * va;
      const cuantos = evo ? 7 : 1 + (n >= 2) + (n >= 4), objs = masCercanos(h.x, h.z, 13, cuantos);
      objs.forEach((e, i) => lanza({fuera: true, modelo: evo ? 'cuchillo_elfico_evo' : 'cuchillo_elfico', x: h.x, z: h.z, ang: Math.atan2(e.x - h.x, e.z - h.z), vel: 24, alcance: 14, dano: evo ? 5 : 1.6 + (n >= 3) * 1.2, atraviesa: evo ? Infinity : (n >= 5 ? 2 : 0), escala: 0.9, emp: 0.3}));
    }
    if (id === 'cuerno') {
      suena('cuerno');
      J.cd_cuerno = (evo ? 4.5 : 7.5 - (n >= 4) * 1.5) * va;
      const r = evo ? 9 : 4 + (n >= 2) * 1.2 + (n >= 5) * 2, dano = evo ? 10 : 3 + (n >= 3) * 3;
      flip('fx_onda', h.x, 0.3, h.z, {tam: r * 2.3, dur: 0.45});
      J.temblor = Math.max(J.temblor, 0.2);
      for (const e of cercanos(h.x, h.z, r + 1)) if (!e.muerto && Math.hypot(e.x - h.x, e.z - h.z) < r + e.radio) {hiere(e, dano, e.x - h.x, e.z - h.z, 2.5); if (evo) e.aturdido = 1.2;}
    }
    if (id === 'flecha') {
      J.cd_flecha = (evo ? 1.0 : 1.8 - (n >= 4) * 0.3) * va;
      const cuantas = evo ? 5 : 1 + (n >= 3) + (n >= 5), lista = J.enemigos.filter((e) => !e.muerto && (e.fase === 'patio' || ((e.d.antorcha || e.d.ariete || e.d.tronco) && e.fase === 'hacia')) && Math.hypot(e.x - h.x, e.z - h.z) < 18);
      for (let i = 0; i < cuantas && lista.length; i++) {const e = azar(lista); lanza({fuera: true, modelo: evo ? 'flecha_fuego_evo' : 'flecha_fuego', x: h.x, z: h.z, ang: Math.atan2(e.x - h.x, e.z - h.z), vel: 22, alcance: 17, dano: evo ? 8 : 3 + (n >= 4) * 2, splash: evo ? 3.2 : 1.6 + (n >= 2) * 0.6, escala: 0.9});}
    }
    if (id === 'martillo') {
      J.cd_martillo = (evo ? 1.6 : 2.6 - (n >= 4) * 0.5) * va;
      const objs = masCercanos(h.x, h.z, 12, evo ? 3 : (n >= 5 ? 2 : 1));
      const angs = objs.length ? objs.map((e) => Math.atan2(e.x - h.x, e.z - h.z)) : [h.rot];
      angs.forEach((a) => lanza({modelo: evo ? 'martillo_enano_evo' : 'martillo_enano', x: h.x, z: h.z, ang: a, vel: 14, alcance: evo ? 11 : 7 + (n >= 3) * 2, dano: evo ? 12 : 3 + (n >= 2) * 2 + (n >= 4) * 2, atraviesa: Infinity, vuelve: true, gira: true, escala: 0.8, emp: 1.4}));
    }
    if (id === 'lanzas') {
      J.cd_lanzas = (evo ? 1.2 : 2.1 - (n >= 4) * 0.4) * va;
      const ob = masCercanos(h.x, h.z, 15, 1)[0], base = ob ? Math.atan2(ob.x - h.x, ob.z - h.z) : h.rot, k = evo ? 5 : 1 + (n >= 3) + (n >= 5);
      for (let i = 0; i < k; i++) lanza({fuera: true, modelo: 'virote', x: h.x, z: h.z, ang: base + (i - (k - 1) / 2) * 0.16, vel: 27, alcance: 16, dano: evo ? 10 : 4 + (n >= 2) * 2 + (n >= 4) * 2, atraviesa: evo ? Infinity : 3, escala: 1.7, emp: 1.8});
    }
    if (id === 'hachas') {
      J.cd_hachas = (evo ? 1.4 : 2.3 - (n >= 4) * 0.3) * va;
      const k = evo ? 8 : 2 + (n >= 2) + (n >= 4), a0 = Math.random() * Math.PI * 2;
      for (let i = 0; i < k; i++) lanza({modelo: P.hacha_arrojadiza ? 'hacha_arrojadiza' : 'martillo_enano', x: h.x, z: h.z, ang: a0 + i / k * Math.PI * 2, vel: 13, alcance: evo ? 10 : 6 + (n >= 4) * 2, dano: evo ? 9 : 3.5 + (n >= 3) * 2.5, atraviesa: evo || n >= 5 ? Infinity : 1, gira: true, escala: 1.1, emp: 1.2});
    }
    if (id === 'abanico') {
      J.cd_abanico = (evo ? 1.0 : 1.7 - (n >= 4) * 0.3) * va;
      const ob = masCercanos(h.x, h.z, 15, 1)[0], base = ob ? Math.atan2(ob.x - h.x, ob.z - h.z) : h.rot, k = evo ? 11 : 3 + (n >= 2) + (n >= 4) + (n >= 5);
      for (let i = 0; i < k; i++) lanza({fuera: true, modelo: 'flecha_elfica', x: h.x, z: h.z, ang: base + (i - (k - 1) / 2) * (evo ? 0.13 : 0.18), vel: 25, alcance: 14, dano: evo ? 3.5 : 1.8 + (n >= 3) * 1.2, atraviesa: evo ? Infinity : 0, escala: 1.1, emp: 0.4});
    }
    if (id === 'piedras') {
      J.cd_piedras = (evo ? 1.0 : 1.5 - (n >= 4) * 0.2) * va;
      const objs = masCercanos(h.x, h.z, 13, evo ? 3 : (n >= 5 ? 2 : 1));
      objs.forEach((e) => lanza({fuera: true, modelo: 'piedra', x: h.x, z: h.z, ang: Math.atan2(e.x - h.x, e.z - h.z), vel: 22, alcance: 14, dano: evo ? 5 : 2.2 + (n >= 3) * 1.5, escala: 1.1, emp: 0.5, rebota: evo ? 8 : 2 + (n >= 2) + (n >= 4) * 2}));
    }
    if (id === 'humo') {
      J.cd_humo = (evo ? 3.5 : 6 - (n >= 4) * 1.2) * va;
      J.nubes.push({x: h.x, z: h.z, r: evo ? 5.5 : 2.8 + (n >= 2) * 0.8, t: evo ? 5 : 3.5 + (n >= 5) * 1.5, dps: evo ? 4 : 1 + (n >= 3) * 1.5, tick: 0, evo});
    }
    if (id === 'rayo') {
      J.cd_rayo = (evo ? 2.2 : 3.6 - (n >= 4) * 0.8) * va;
      const k = evo ? 7 : 1 + (n >= 3) + (n >= 5) * 2, dano = evo ? 16 : 8 + (n >= 2) * 5;
      const lista = J.enemigos.filter((e) => !e.muerto && (e.fase !== 'hacia' || e.z > -40) && Math.hypot(e.x - h.x, e.z - h.z) < 15).sort(() => Math.random() - 0.5).slice(0, k);
      if (!lista.length) {J.cd_rayo = 0.6; continue;}
      GR.flash = Math.max(GR.flash || 0, 0.45); suena('rayo');
      for (const e of lista) {flip('fx_explosion', e.x, e.y + 1.4, e.z, {tam: 2.6, dur: 0.35, suelo: false}); flip('fx_onda', e.x, e.y + 0.2, e.z, {tam: 3, dur: 0.3}); particula('chispa', e.x, e.y + 1, e.z, {n: 4, vel: 5, sube: 4, vida: 0.4, escala: 0.4, grav: 12}); FUENTE = 'rayo'; hiere(e, dano, 0, 0, 0.3); if (evo) e.aturdido = 1;}
    }
    if (id === 'viento') {
      J.cd_viento = (evo ? 3.5 : 6 - (n >= 4) * 1.5) * va;
      const r = evo ? 8 : 3.5 + (n >= 2) * 1.2 + (n >= 5) * 1.5, dano = evo ? 6 : 2 + (n >= 3) * 3;
      suena('viento'); flip('fx_onda', h.x, (h.y ?? 0.15) + 0.3, h.z, {tam: r * 2.4, dur: 0.5}); particula('polvo', h.x, (h.y ?? 0.15) + 0.4, h.z, {n: 8, vel: r * 2, sube: 0.5, vida: 0.6, escala: 1.4, disp: 0.6});
      for (const e of cercanos(h.x, h.z, r + 1)) if (!e.muerto && Math.hypot(e.x - h.x, e.z - h.z) < r + e.radio) {FUENTE = 'viento'; hiere(e, dano, e.x - h.x, e.z - h.z, 4); if (n >= 3) e.lento = 2; if (evo) e.aturdido = 1.5;}
    }
    if (id === 'caldero') {
      J.cd_caldero = (evo ? 3.2 : 6 - (n >= 4) * 1.2) * va;
      const lista = J.enemigos.filter((e) => !e.muerto && e.fase === 'patio' && Math.hypot(e.x - h.x, e.z - h.z) < 14);
      const e = lista.length ? azar(lista) : null; if (!e) continue;
      charco(e.x, e.z, evo ? 3.4 : 1.6 + (n >= 2) * 0.5, evo ? 9 : 3 + (n >= 3) * 2, evo ? 5 : 3 + (n >= 5) * 1.5, evo);
    }
  }
  actualizaOrbitales(dt);
  for (let i = J.nubes.length - 1; i >= 0; i--) {
    const c = J.nubes[i]; c.t -= dt; c.tick -= dt;
    if (c.t <= 0) {J.nubes.splice(i, 1); continue;}
    if (Math.random() < dt * 14) if (Math.random() < 0.35) flip('fx_humo', c.x + rnd(-c.r, c.r) * 0.6, 1.4, c.z + rnd(-c.r, c.r) * 0.6, {tam: c.r * 1.1, dur: 1.3, suelo: false, suma: false});
    if (c.tick <= 0) {c.tick = 0.4; FUENTE = 'humo'; for (const e of cercanos(c.x, c.z, c.r + 1)) if (!e.muerto && e.fase === 'patio' && Math.hypot(e.x - c.x, e.z - c.z) < c.r + e.radio) {e.lento = 0.6; if (c.evo) e.aturdido = Math.max(e.aturdido, 0.45); hiere(e, c.dps * 0.4, 0, 0, 0);}}
  }
}
function masCercanos(x, z, r, n) {
  return J.enemigos.filter((e) => !e.muerto && (e.fase === 'patio' || ((e.d.antorcha || e.d.ariete || e.d.tronco) && e.fase === 'hacia')) && Math.hypot(e.x - x, e.z - z) < r).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z)).slice(0, n);
}
function ponOrbitales() {
  J.orbitales.forEach((o) => scene.remove(o.o)); J.orbitales = [];
  const n = J.armas.antorcha; if (!n) return;
  const evo = !!J.evos.antorcha, cuantas = evo ? 6 : Math.min(4, n - (n >= 3 ? 1 : 0) + (n >= 5 ? 1 : 0));
  for (let i = 0; i < cuantas; i++) {const o = P[evo ? 'antorcha_orbital_evo' : 'antorcha_orbital'].clone(true); o.scale.setScalar(0.7); scene.add(o); J.orbitales.push({o, fase: i / cuantas * Math.PI * 2, golpeados: new Map()});}
}
function actualizaOrbitales(dt) {
  if (!J.orbitales.length) return;
  const h = J.h, n = J.armas.antorcha, evo = !!J.evos.antorcha, r = evo ? 3.2 : 2.2 + (n >= 3) * 0.5, dano = evo ? 6 : 2 + (n >= 3) + (n >= 5) * 1.5;
  for (const o of J.orbitales) {
    o.fase += dt * (evo ? 3.6 : 2.8);
    const x = h.x + Math.cos(o.fase) * r, z = h.z + Math.sin(o.fase) * r;
    o.o.position.set(x, (J.h.y ?? 0.15) + 0.25, z); o.o.rotation.y = -o.fase;
    for (const e of cercanos(x, z, 1.5)) {
      if (e.muerto || Math.hypot(e.x - x, e.z - z) > e.radio + 0.5) continue;
      const ult = o.golpeados.get(e) || -9; if (J.t - ult < 0.5) continue;
      o.golpeados.set(e, J.t); FUENTE = 'antorcha'; hiere(e, dano, e.x - h.x, e.z - h.z, 0.6);
    }
  }
}
function charco(x, z, r, dps, dura, evo) {
  const base = M.defensas.scene.getObjectByName('pozo_aceite_ardiendo'); if (!base) return;
  const o = base.clone(true); o.position.set(x, enFranja(z) ? Y_MURO + 0.05 : 0.16, z); o.scale.set(r, 1, r); scene.add(o);
  if (evo) o.traverse((m) => {if (m.isMesh) {m.material = m.material.clone(); if (m.material.emissive) m.material.emissive.setRGB(0.2, 0.9, 0.2); m.material.color.lerp(new THREE.Color('#5cff5c'), 0.5);}});
  J.charcos.push({o, x, z, r, dps, t: dura});
}
function actualizaCharcos(dt) {
  for (let i = J.charcos.length - 1; i >= 0; i--) {
    const c = J.charcos[i]; c.t -= dt;
    if (c.t <= 0) {scene.remove(c.o); J.charcos.splice(i, 1); continue;}
    c.tick = (c.tick || 0) - dt;
    if (c.tick <= 0) {c.tick = 0.5; FUENTE = 'caldero'; for (const e of cercanos(c.x, c.z, c.r + 1.5)) if (!e.muerto && Math.hypot(e.x - c.x, e.z - c.z) < c.r + e.radio * 0.5) {hiere(e, c.dps * 0.5, 0, 0, 0); e.lento = 0.6;}}
  }
}

/* ---------- cartas al subir de nivel (y cofres) ---------- */
function opciones() {
  const h = J.h, op = [], nArmas = Object.keys(J.armas).length, nPas = Object.keys(J.pasivas).length;
  for (const id in ARMAS) {
    if (ARMAS[id].clases && !ARMAS[id].clases.includes(J.h.tipo)) continue;
    const a = ARMAS[id], n = J.armas[id] || 0, util = AMENAZAS[J.amenaza] && AMENAZAS[J.amenaza].armas.includes(id), pu = util ? 3 : 1, du = util ? '⚔ Útil ahora. ' : '';
    if (n >= 5 && !J.evos[id] && J.pasivas[a.pareja]) op.push({peso: 6, evo: true, icono: a.icono, t: a.nombre, d: a.evo, f: () => {J.evos[id] = true; if (id === 'antorcha') ponOrbitales(); aviso('¡Evolución! ' + a.evo.split(':')[0], 2000);}});
    else if (n > 0 && n < 5) op.push({peso: 3 * pu, icono: a.icono, t: a.nombre, nv: n + 1, d: du + a.d[n], f: () => {J.armas[id]++; if (id === 'antorcha') ponOrbitales();}});
    else if (n === 0 && nArmas < 4) op.push({peso: 2 * pu, nueva: true, icono: a.icono, t: a.nombre, d: du + a.d[0] + ' <i>Evoluciona con ' + PASIVAS[a.pareja].nombre + '</i>', f: () => {J.armas[id] = 1; J['cd_' + id] = 0.3; if (id === 'antorcha') ponOrbitales();}});
  }
  for (const id in PASIVAS) {
    const p = PASIVAS[id], n = J.pasivas[id] || 0;
    if (n >= 5 || (n === 0 && nPas >= 4)) continue;
    op.push({peso: 2, nueva: n === 0, icono: p.icono, t: p.nombre, nv: n + 1, d: p.d, f: () => {J.pasivas[id] = n + 1; aplicaPasiva(id);}});
  }
  BASE_MEJORAS.filter((m) => !m.solo || (m.solo === 'cuerpo') === h.cuerpo).filter((m) => !(m.t === 'Barrido' && h.arco >= Math.PI * 1.99)).forEach((m) => op.push({peso: 1.5, base: true, icono: h.icono, t: m.t, d: typeof m.d === 'function' ? m.d(h) : m.d, f: () => m.f(h)}));
  for (const id in TALENTOS) if (!h.tal[id]) {const T = TALENTOS[id]; op.push({peso: 1.3, raro: 'epica', icono: T.icono, t: T.t, d: T.d, f: () => {h.tal[id] = true; aviso('¡' + T.t + '!', 1400);}});}
  if (J.puerta < J.puertaMax * 0.7) op.push({peso: 3, icono: 'puerta', t: 'Carpinteros de Edoras', d: 'Reparas 150 de la puerta.', f: () => {J.puerta = Math.min(J.puertaMax, J.puerta + 150);}});
  return op;
}
function aplicaPasiva(id) {
  const h = J.h;
  if (id === 'botas') h.vel *= 1.15;
  if (id === 'corazon') h.regen += 1.5;
  if (id === 'escudo') h.armadura = Math.min(0.6, h.armadura + 0.15);
  if (id === 'estrella') h.velArmas *= 0.85;
  if (id === 'lembas') {h.vidaMax += 35; h.vida = h.vidaMax;}
  if (id === 'gema') {h.iman *= 2; h.xpMul *= 1.2;}
}
function ofreceMejoras(cofre) {
  J.pausa = true;
  const op = opciones(), elegidas = [];
  const evos = op.filter((o) => o.evo); if (evos.length) elegidas.push(evos[0]);
  while (elegidas.length < 3 && op.length) {
    /* solo una mejora del arma básica por tirada: si no, salen dos cartas con el mismo dibujo */
    const vale = (o) => !elegidas.includes(o) && !(o.base && elegidas.some((e) => e.base) && op.some((q) => !q.base && !elegidas.includes(q)));
    const total = op.reduce((s, o) => s + (vale(o) ? o.peso : 0), 0); let r = Math.random() * total;
    for (const o of op) {if (!vale(o)) continue; r -= o.peso; if (r <= 0) {elegidas.push(o); break;}}
    if (elegidas.length === op.length) break;
  }
  $('mejT').textContent = cofre === 'botin' ? '¡Botín de la oleada!' : cofre ? '¡Un cofre de los Rohirrim!' : '¡Subes de nivel!'; if (cofre) suena('cofre');
  $('mejP').textContent = cofre === 'botin' ? 'Armas y mejoras: elige una' : cofre ? 'Elige tu premio (+15 oro)' : 'Elige una mejora';
  const c = $('cartas'); c.innerHTML = '';
  elegidas.forEach((m) => {
    const raro = m.evo ? 'evolucion' : m.raro || (m.nueva ? 'rara' : m.nv >= 5 ? 'legendaria' : 'comun');
    const b = document.createElement('button'); b.className = 'carta' + (m.evo ? ' evo' : '') + (m.nueva ? ' nueva' : ''); b.dataset.r = raro;
    b.innerHTML = '<img src="' + ico(m.icono) + '" alt=""><div><b>' + m.t + (m.evo ? '<em>EVOLUCIÓN</em>' : m.raro === 'epica' ? '<em>ÉPICA</em>' : m.nueva ? '<em>NUEVA</em>' : m.nv ? '<em>NIVEL ' + m.nv + '</em>' : m.base ? '<em>TU ARMA</em>' : '') + '</b><small>' + m.d + '</small></div>';
    b.onclick = () => {m.f(); pintaArmas(); $('mejora').classList.add('hidden'); J.pausa = false; reloj.getDelta(); setTimeout(siguientePendiente, 50);};
    c.appendChild(b);
  });
  if ((J.cambios ?? 2) > 0) {const r = document.createElement('div'); r.className = 'cambiar'; r.textContent = '🎲 Cambiar cartas (' + (J.cambios ?? 2) + ')'; r.onclick = () => {J.cambios = (J.cambios ?? 2) - 1; ofreceMejoras(cofre);}; c.appendChild(r);}
  $('mejora').classList.remove('hidden');
  /* que el texto quepa siempre dentro del pergamino de la carta */
  /* que el texto quepa siempre dentro del pergamino: se mide al pintar, cuando carga la letra y al acabar la animación */
  const ajusta = () => c.querySelectorAll('.carta div').forEach((d) => {let f = 1; d.style.setProperty('--k', 1); while ((d.scrollHeight > d.clientHeight + 1 || d.scrollWidth > d.clientWidth + 1) && f > 0.34) {f -= 0.04; d.style.setProperty('--k', f);}});
  ajusta(); setTimeout(ajusta, 450); setTimeout(ajusta, 1200); if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajusta);
}
function siguientePendiente() {
  if (J.fin || J.pausa) return;
  if (J.subidas > 0) {J.subidas--; if (arbolDisponible()) ofreceArbol(); else {ofreceMejoras(false); const prox = proximoNodo(); if (prox) $('mejP').textContent = 'Elige una mejora. El árbol vuelve a nivel ' + prox + '.';} return;}
  siguienteCofre();
}
function pintaArmas() {
  const c = $('armas'); c.innerHTML = '';
  const pon1 = (icono, n, evo, info) => {const d = document.createElement('div'); d.innerHTML = '<img src="' + ico(icono) + '" alt=""><b class="' + (evo ? 'evo' : '') + '">' + (evo ? '★' : n) + '</b>'; d.onclick = (ev) => {ev.stopPropagation(); fichaArma(info);}; c.appendChild(d);};
  pon1(J.h.icono, '', false, {heroe: true}); c.lastChild.querySelector('b').remove();
  for (const id in J.armas) pon1(ARMAS[id].icono, J.armas[id], J.evos[id], {arma: id});
  for (const id in J.pasivas) pon1(PASIVAS[id].icono, J.pasivas[id], false, {pasiva: id});
}
/* ficha al tocar un arma del marcador: qué hace, su nivel y con qué evoluciona (pausa mientras se lee) */
function fichaArma(o) {
  if (!J || J.fin) return;
  const f = $('fichaArma'); let ic, t, txt = '', ev = '';
  if (o.heroe) {
    const h = J.h, ramas = (J.arbol || []).filter((r) => r.nv).map((r) => r.def.t + ' ' + ['I', 'II', 'III', 'IV', 'V'][r.nv - 1]);
    ic = h.icono; t = 'Tu arma: ' + HEROES[h.tipo].nombre; txt = 'Daño ' + h.dano.toFixed(1) + ' · un golpe cada ' + (h.cadencia * h.velArmas).toFixed(2) + ' s · alcance ' + h.alcance.toFixed(1) + ' m.';
    ev = ramas.length ? 'Árbol: ' + ramas.join(' · ') : 'Mejora en el árbol cada vez que subes de nivel.';
  } else if (o.arma) {
    const a = ARMAS[o.arma], n = J.armas[o.arma], p = PASIVAS[a.pareja];
    ic = a.icono; t = a.nombre + (J.evos[o.arma] ? ' ★' : ' · nivel ' + n + '/5');
    txt = J.evos[o.arma] ? a.evo : a.d.slice(0, n).join(' ');
    ev = J.evos[o.arma] ? '¡Ya ha evolucionado!' : '<b>Evoluciona</b> con el arma al nivel 5 <u class="' + (n >= 5 ? 'si' : '') + '">' + (n >= 5 ? '✓' : n + '/5') + '</u> y ' + p.nombre + ' <u class="' + (J.pasivas[a.pareja] ? 'si' : '') + '">' + (J.pasivas[a.pareja] ? '✓' : 'te falta') + '</u> → <i>' + a.evo + '</i>';
  } else {
    const p = PASIVAS[o.pasiva], arma = Object.keys(ARMAS).find((k) => ARMAS[k].pareja === o.pasiva);
    ic = p.icono; t = p.nombre + ' · nivel ' + J.pasivas[o.pasiva]; txt = p.d;
    ev = arma ? 'Hace evolucionar <b>' + ARMAS[arma].nombre + '</b>' + (J.armas[arma] ? ' (la tienes al nivel ' + J.armas[arma] + '/5)' : ' (aún no la tienes)') + '.' : '';
  }
  f.innerHTML = '<div><img src="' + ico(ic) + '" alt=""><b>' + t + '</b></div><p>' + txt + '</p>' + (ev ? '<p class="ev">' + ev + '</p>' : '') + '<small>Toca para seguir</small>';
  f.classList.remove('hidden'); J.pausaFicha = true; J.pausa = true;
}
$('fichaArma').onclick = () => {$('fichaArma').classList.add('hidden'); if (J && J.pausaFicha) {J.pausaFicha = false; J.pausa = false; reloj.getDelta();}};

/* ---------- defensas ---------- */
const coloca = {activo: false, tipo: null, marca: null, x: 0, z: 0, ok: false};
let marcaOk = null, marcaNo = null;
function preparaMarcas() {
  marcaOk = P.marca_ok ? P.marca_ok.clone() : null; marcaNo = P.marca_no ? P.marca_no.clone() : null;
  [marcaOk, marcaNo].forEach((m) => {if (m) {m.visible = false; m.position.y = 0.18; scene.add(m);}});
}
function abreBandeja() {
  if (!J || J.fin) return;
  J.pausa = true; coloca.activo = true; coloca.tipo = null; pintaBandeja(); $('bandeja').style.display = 'block'; $('bDef').classList.add('hidden'); $('bEsq').classList.add('hidden');
  mando.activo = false; mando.x = mando.z = 0; $('joy').style.display = 'none';
}
function cierraBandeja() {
  coloca.activo = false; coloca.tipo = null; $('bandeja').style.display = 'none'; $('bDef').classList.remove('hidden'); $('bEsq').classList.remove('hidden');
  if (marcaOk) marcaOk.visible = false; if (marcaNo) marcaNo.visible = false;
  if (J && !$('mejora').classList.contains('hidden')) return;
  if (J) {J.pausa = false; reloj.getDelta(); setTimeout(siguientePendiente, 50);}
}
function pintaBandeja() {
  $('bandT').textContent = 'Defensas · ' + J.oro + ' oro';
  const c = $('defs'); c.innerHTML = '';
  for (const k in DEFENSAS) {
    const d = DEFENSAS[k], b = document.createElement('button'); b.className = 'def' + (coloca.tipo === k ? ' sel' : ''); b.disabled = J.oro < d.coste;
    b.innerHTML = '<img src="' + ico(d.icono) + '" alt=""><b>' + d.nombre + '</b>' + d.coste + ' oro<br><small>' + d.d + '</small>';
    b.onclick = () => {coloca.tipo = k; pintaBandeja(); $('ayuda').textContent = 'Toca el suelo del patio para colocar: ' + d.nombre + '.';};
    c.appendChild(b);
  }
}
const _ray = new THREE.Raycaster(), _pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.15), _pt = new THREE.Vector3(), _ndc = new THREE.Vector2();
function sueloDe(e) {_ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); _ray.setFromCamera(_ndc, camera); return _ray.ray.intersectPlane(_pl, _pt) ? _pt : null;}
function valido(x, z) {
  if (x < PATIO.x0 + 1 || x > PATIO.x1 - 1 || z < PATIO.z0 + 1 || z > PATIO.z1 - 1.5) return false;
  if (J.defensas.some((d) => Math.hypot(d.x - x, d.z - z) < 2.1)) return false;
  return Math.hypot(J.h.x - x, J.h.z - z) > 1.4;
}
function colocaMueve(e) {
  if (!coloca.tipo) return; const p = sueloDe(e); if (!p) return;
  coloca.x = Math.round(p.x / 2) * 2 + 1; coloca.z = Math.round(p.z / 2) * 2; coloca.ok = valido(coloca.x, coloca.z);
  if (marcaOk) {marcaOk.visible = coloca.ok; marcaOk.position.set(coloca.x, 0.18, coloca.z);}
  if (marcaNo) {marcaNo.visible = !coloca.ok; marcaNo.position.set(coloca.x, 0.18, coloca.z);}
}
function colocaToque(e) {
  if (!coloca.tipo) {$('ayuda').textContent = 'Primero elige una defensa de la lista.'; return;}
  colocaMueve(e);
  const d = DEFENSAS[coloca.tipo];
  if (!coloca.ok) {$('ayuda').textContent = 'Ahí no se puede: elige un hueco libre del patio.'; return;}
  if (J.oro < d.coste) {$('ayuda').textContent = 'No tienes oro suficiente.'; return;}
  J.oro -= d.coste; creaDefensa(coloca.tipo, coloca.x, coloca.z); pintaBandeja(); pintaHud();
  if (J.oro < d.coste) coloca.tipo = null;
}
function creaDefensa(tipo, x, z) {
  const nodo = {abrojos: 'abrojos', estacas: 'estacas', aceite: 'pozo_aceite', escorpion: 'escorpion', catapulta: 'catapulta_pequena', estandarte: 'estandarte_aliento'}[tipo];
  let o, mixer = null, clips = {}, arquero = null;
  if (tipo === 'arquero') {arquero = montar('arquero_rohan', true); o = arquero.raiz; pon(arquero, 'quieto');}
  else {
    o = M.defensas.scene.getObjectByName(nodo).clone(true); o.position.set(0, 0, 0);
    o.traverse((m) => {if (m.isMesh) {m.castShadow = true; m.receiveShadow = true;}});
    mixer = new THREE.AnimationMixer(o);
    const usa = {estacas: ['romperse'], escorpion: ['disparar_escorpion'], catapulta: ['disparar_catapulta'], estandarte: ['ondear']}[tipo] || [];
    M.defensas.animations.filter((c) => usa.includes(c.name)).forEach((c) => {clips[c.name] = mixer.clipAction(c); if (c.name !== 'ondear') {clips[c.name].setLoop(THREE.LoopOnce, 1); clips[c.name].clampWhenFinished = true;}});
    if (tipo === 'estandarte' && clips.ondear) clips.ondear.play();
  }
  o.position.set(x, 0.15, z); scene.add(o);
  let ardiendo = null;
  if (tipo === 'aceite') {ardiendo = M.defensas.scene.getObjectByName('pozo_aceite_ardiendo').clone(true); ardiendo.position.set(x, 0.15, z); ardiendo.visible = false; scene.add(ardiendo);}
  const d = {tipo, x, z, o, mixer, clips, arquero, ardiendo, bloquea: tipo === 'estacas', mult: 1, vida: tipo === 'estacas' ? 40 : 60, cd: 0.5, estado: 'listo', t: 0, rot: 0};
  J.defensas.push(d);
  efecto('polvo', x, 0.15, z, {escala: 1.5, vida: 0.5});
}
function dañaDefensa(d, n) {
  if (!d.bloquea || d.roto) return;
  d.vida -= n; particula('astillas', d.x + rnd(-1.5, 1.5), 0.9, d.z, {vel: 2.5, sube: 2, vida: 0.6, escala: 0.6, grav: 10, crece: 1});
  if (d.vida <= 0) {
    d.roto = true; if (d.clips.romperse) d.clips.romperse.reset().play(); suena('madera');
    efecto('polvo', d.x, 0.2, d.z, {escala: 2, vida: 0.6});
    if (d.sitio) {aviso('¡Han roto la empalizada!', 1200); quitaSitio(d.sitio);}
    else setTimeout(() => {scene.remove(d.o); const k = J.defensas.indexOf(d); if (k >= 0) J.defensas.splice(k, 1);}, 750);
  }
}
function cercaCaja(d, x, z) {const c = d.caja || {hx: 0.9, hz: 0.9}; return [Math.max(d.x - c.hx, Math.min(d.x + c.hx, x)), Math.max(d.z - c.hz, Math.min(d.z + c.hz, z))];}
function dCaja(d, x, z) {const [cx, cz] = cercaCaja(d, x, z); return Math.hypot(x - cx, z - cz);}
function empujaCaja(o, d, r) {
  const [cx, cz] = cercaCaja(d, o.x, o.z), dx = o.x - cx, dz = o.z - cz, dd = Math.hypot(dx, dz);
  if (dd >= r) return;
  if (dd > 1e-4) {o.x += dx / dd * (r - dd); o.z += dz / dd * (r - dd);}
  else {const c = d.caja || {hx: 0.9, hz: 0.9}; o.z = o.z < d.z ? d.z - c.hz - r : d.z + c.hz + r;}
}
function actualizaDefensas(dt) {
  for (const d of J.defensas) {
    FUENTE = d.tipo;
    if (d.mixer) d.mixer.update(dt); if (d.arquero) d.arquero.mixer.update(dt);
    if (d.roto) continue;
    d.cd -= dt;
    if (d.tipo === 'abrojos' || d.tipo === 'estacas') {
      d.tick = (d.tick || 0) - dt;
      if (d.tick <= 0) {d.tick = 0.5; for (const e of cercanos(d.x, d.z, 2.5)) if (!e.muerto && Math.hypot(e.x - d.x, e.z - d.z) < (d.tipo === 'abrojos' ? 1.3 : 1.7) + e.radio * 0.5) {if (d.tipo === 'abrojos') e.lento = 0.7; hiere(e, d.tipo === 'abrojos' ? 0.6 : 1, 0, 0, 0);}}
    }
    if (d.tipo === 'aceite') {
      if (d.estado === 'listo' && cercanos(d.x, d.z, 2).some((e) => !e.muerto && Math.hypot(e.x - d.x, e.z - d.z) < 1.3)) {d.estado = 'arde'; d.t = 5; d.o.visible = false; d.ardiendo.visible = true;}
      if (d.estado === 'arde') {
        d.t -= dt; d.tick = (d.tick || 0) - dt;
        if (d.tick <= 0) {d.tick = 0.5; for (const e of cercanos(d.x, d.z, 2.5)) if (!e.muerto && Math.hypot(e.x - d.x, e.z - d.z) < 1.6 + e.radio * 0.5) hiere(e, 3, 0, 0, 0);}
        if (d.t <= 0) {d.estado = 'recarga'; d.t = 14; d.ardiendo.visible = false; d.o.visible = true;}
      }
      if (d.estado === 'recarga') {d.t -= dt; if (d.t <= 0) d.estado = 'listo';}
    }
    if (d.tipo === 'escorpion' || d.tipo === 'arquero' || d.tipo === 'catapulta') {
      const rango = d.rango || (d.tipo === 'escorpion' ? 16 : d.tipo === 'arquero' ? 12 : 20);
      const obj = J.enemigos.filter((e) => !e.muerto && (e.fase === 'patio' || (d.tipo !== 'catapulta' && (e.fase === 'sube' || e.fase === 'adarve')) || (d.tipo === 'escorpion' && (e.d.antorcha || e.d.ariete || e.d.tronco))) && Math.hypot(e.x - d.x, e.z - d.z) < rango && Math.hypot(e.x - d.x, e.z - d.z) > (d.tipo === 'catapulta' ? 4 : 0))
        .sort((a, b) => (Math.hypot(a.x - d.x, a.z - d.z) - (a.d.marca ? 30 : 0)) - (Math.hypot(b.x - d.x, b.z - d.z) - (b.d.marca ? 30 : 0)))[0];
      if (obj) {const ang = Math.atan2(obj.x - d.x, obj.z - d.z); d.rot += Math.atan2(Math.sin(ang - d.rot), Math.cos(ang - d.rot)) * Math.min(1, dt * 6); d.o.rotation.y = d.rot;}
      if (obj && d.cd <= 0) {
        const ang = Math.atan2(obj.x - d.x, obj.z - d.z);
        if (d.tipo === 'escorpion') {d.cd = 1.6 / Math.sqrt(d.mult); if (d.clips.disparar_escorpion) d.clips.disparar_escorpion.reset().play(); lanza({fuera: true, modelo: 'virote', x: d.x, z: d.z, y: 1.3, ang, vel: 30, alcance: d.rango || 18, dano: 5 * d.mult, atraviesa: 4, escala: 1.2, emp: 1.2, escalas: true});}
        if (d.tipo === 'arquero') {d.cd = 1.2 / Math.sqrt(d.mult); pon(d.arquero, 'disparar', 0.05, true); const yy = d.o.position.y + 1.6, fu = d.tipo; setTimeout(() => {if (!J.fin) {FUENTE = fu; for (let k = 0; k < (d.flechas || 1); k++) lanza({modelo: 'flecha_elfica', x: d.x, z: d.z, y: yy, ang: ang + (k - ((d.flechas || 1) - 1) / 2) * 0.12, vel: 26, alcance: d.rango || 14, dano: 2.2 * d.mult, atraviesa: 0, escala: 1.2, escalas: true});}}, 300); setTimeout(() => pon(d.arquero, d.arquero.clips.apuntar ? 'apuntar' : 'quieto', 0.2), 950);}
        if (d.tipo === 'catapulta') {
          d.cd = 4; if (d.clips.disparar_catapulta) d.clips.disparar_catapulta.reset().play();
          const dist = Math.hypot(obj.x - d.x, obj.z - d.z), dur = 1.1;
          J.proy.push({o: (() => {const p = P.piedra_grande ? P.piedra_grande.clone() : P.piedra.clone(); p.scale.setScalar(1.6); scene.add(p); return p;})(), x: d.x, z: d.z, y: 1.5, vx: Math.sin(ang) * dist / dur, vz: Math.cos(ang) * dist / dur, vida: dur + 0.1, quedan: 0, tocados: new Set(), dano: 7 * d.mult, splash: 2.4 + (d.mult - 1), arco: {t: 0, dur}, rueda: true, vel: dist / dur, tag: 'catapulta'});
        }
      }
    }
  }
}

/* ---------- interfaz ---------- */
function barra(el, v, max, txt) {el.querySelector('i').style.width = Math.max(0, Math.min(100, v / max * 100)) + '%'; el.lastElementChild.textContent = txt;}
function pintaHud() {
  const hecho = J.ola ? Math.max(0, J.olaTotal - J.porSalir - (J.vivos || 0)) / Math.max(1, J.olaTotal) : 0;
  barra($('bAlba'), J.alba ? NOLAS : Math.max(0, J.ola - 1 + hecho), NOLAS, J.alba ? '¡El alba!' : J.tregua ? 'Tregua · ' + Math.ceil(J.tregua.fin - J.t) + ' s' : 'Oleada ' + J.ola + '/' + NOLAS + ' · quedan ' + (J.porSalir + (J.vivos || 0)));
  barra($('bPuerta'), J.puerta, J.puertaMax, Math.ceil(Math.max(0, J.puerta)) + (J.barr.vida > 0 ? ' +' + Math.ceil(J.barr.vida) : ''));
  barra($('bVida'), J.h.vida, J.h.vidaMax, Math.ceil(Math.max(0, J.h.vida)) + ' / ' + J.h.vidaMax);
  barra($('bXp'), J.xp, J.xpSig, Math.floor(J.xp) + ' / ' + J.xpSig);
  if (J.jefe && !J.jefe.muerto) barra($('bJefe').lastElementChild, J.jefe.vida, J.jefe.vidaMax, Math.ceil(J.jefe.vida) + '');
  $('nivel').textContent = J.nivel; $('bajas').textContent = J.bajas + ' bajas'; $('puntos').textContent = J.puntos + ' puntos'; $('oro').textContent = J.oro;
  if ($('hRet').dataset.t !== J.h.tipo) {$('hRet').dataset.t = J.h.tipo; $('hRet').src = 'ui/r_' + J.h.tipo + '.webp';}
  $('bDef').lastElementChild.textContent = 'Defensas · ' + J.oro;
  if ($('tregua').style.display === 'block' && ((J.t * 4) | 0) !== J._trc) {J._trc = (J.t * 4) | 0; pintaTregua();}
}
let avisoT = null;
/* personajes del libro: hablan en un bocadillo con su emblema (no se dibujan) */
const DICHOS = {
  aragorn: {n: 'Aragorn', e: 'h_rohan', t: ['¡Arriba los escudos! Que ninguno pise el adarve.', 'Aguantad en el muro. Cada escala que caiga es un respiro.']},
  gimli: {n: 'Gimli', e: 'h_enano', t: ['¡Llevo {g}! Supéralo si puedes, elfo.', '¡{g} y subiendo! Esto es mejor que las minas.']},
  legolas: {n: 'Legolas', e: 'h_elfo', t: ['{l}, maese enano. Y tú, defensor, ¿cuántos llevas?', 'Ya van {l}. Los orcos no paran de llegar.']},
  theoden: {n: 'Théoden', e: 'h_rohan', t: ['¡Atrás, al patio! Defended la puerta de la Corneta.', 'Si cae la puerta, cae Rohan. ¡Aguantad!']},
  haldir: {n: 'Haldir', e: 'h_elfo', t: ['Lórien no olvida las viejas alianzas. Venimos a luchar con vosotros.']},
  gandalf: {n: 'Gandalf', e: 'gandalf', t: ['¡Mirad al este! Ya llega la luz, y con ella Erkenbrand.']},
  eomer: {n: 'Éomer', e: 'h_rohan', t: ['¡Jinetes de la Marca, conmigo!']},
};
const EMB = {gandalf: 'ui/emb_gandalf.webp', aragorn: 'ui/emb_aragorn.webp', gimli: 'ui/emb_gimli.webp', legolas: 'ui/emb_legolas.webp', theoden: 'ui/emb_theoden.webp', haldir: 'ui/emb_haldir.webp', eomer: 'ui/emb_eomer.webp'};
let bocT = 0;
function habla(k, extra) {
  const d = DICHOS[k]; if (!d || !J) return;
  if (J.tregua && J.zoomT > 0.3) {(J.colaHabla = J.colaHabla || []).push([k, extra]); return;}
  J.dichos[k] = (J.dichos[k] || 0) + 1;
  let t = d.t[(J.dichos[k] - 1) % d.t.length]; const g = J.retoBajas.gimli, l = J.retoBajas.legolas;
  t = t.replace('{g}', g).replace('{l}', l); if (extra) t = extra;
  const b = $('bocadillo'); b.querySelector('img').src = EMB[k] || ('iconos/' + d.e + '.webp'); b.querySelector('b').textContent = d.n; b.querySelector('span').textContent = t;
  b.classList.add('ver'); clearTimeout(bocT); bocT = setTimeout(() => b.classList.remove('ver'), 4200);
}
/* Gimli y Legolas cuentan bajas en voz alta; Aragorn anima; Gimli te salva una vez */
function actualizaDichos(dt) {
  if (enTregua(J.t) || J.fin) return;
  const R = J.retoBajas;
  J.charlaT = (J.charlaT ?? 30) - dt;
  if (J.charlaT <= 0) {J.charlaT = rnd(26, 38); R.gimli = Math.max(R.gimli + 1, Math.round(J.bajas * rnd(0.8, 1.1))); R.legolas = Math.max(R.legolas + 1, Math.round(J.bajas * rnd(0.85, 1.12))); habla(Math.random() < 0.5 ? 'gimli' : 'legolas');}
  if (J.animo > 0) J.animo -= dt;
  if (!J.animoVisto && J.ola >= 2 && J.t > J.olaIni + 4) {J.animoVisto = true; J.animo = 14; habla('aragorn', '¡Por Rohan y por los que esperan en las cuevas! Golpead con todo (+25 % de daño un rato).');}
  if (!J.gimliSalva && J.h.vida < J.h.vidaMax * 0.25 && J.t > 20) {
    J.gimliSalva = true; habla('gimli', '¡Quieto ahí, que este es mío! ¡Baruk Khazâd!');
    const h = J.h; h.vida = Math.min(h.vidaMax, h.vida + h.vidaMax * 0.3); flip('fx_onda', h.x, (h.y ?? 0.15) + 0.3, h.z, {tam: 9, dur: 0.5}); J.temblor = 0.5;
    for (const e of cercanos(h.x, h.z, 5)) if (!e.muerto && Math.hypot(e.x - h.x, e.z - h.z) < 4.5) {FUENTE = 'carga'; hiere(e, 20, e.x - h.x, e.z - h.z, 4); e.aturdido = 1.5;}
  }
  if (!J.gandalfVisto && J.alba) {J.gandalfVisto = true; habla('gandalf'); GR.flash = 1;}
}
function aviso(t, ms = 1600) {const a = $('txt'); a.textContent = t; a.style.opacity = 1; clearTimeout(avisoT); avisoT = setTimeout(() => a.style.opacity = 0, ms);}
function terminar(gana) {
  document.body.classList.remove('cine');
  J.fin = true; if (!J.alba) paraMusica(); $('bEsq').classList.add('hidden'); $('bHab').classList.add('hidden'); $('tregua').style.display = 'none'; document.body.classList.remove('tregua');
  if (gana) J.puntos += Math.round(J.puerta) * 2;
  else pon(J.h.a, J.h.vida <= 0 ? 'morir' : 'quieto', 0.1, true);
  if (gana && J.h.a.clips.celebrar) pon(J.h.a, 'celebrar', 0.2, true);
  const tesoro = Math.round(J.oroTotal * 0.6) + J.oro + (gana ? 60 : 0) + Math.floor(J.bajas / 10);
  guardado.tesoro += tesoro; const record = J.puntos > guardado.record; if (record) guardado.record = J.puntos; guarda();
  ['bDef', 'dbg'].forEach((k) => $(k).classList.add('hidden')); $('bJefe').style.display = 'none';
  const est = !gana ? 0 : 1 + (J.puerta >= J.puertaMax * 0.5 ? 1 : 0) + (J.puerta >= J.puertaMax * 0.9 ? 1 : 0);
  const res = {puntos: Math.round(J.puntos), bajas: J.bajas, oleada: J.alba ? NOLAS : J.ola, gana, est, heroe: elegido, seg: Math.round(J.t), tesoro, record};
  guardaPartida(res);
  setTimeout(() => pintaFin(res), gana ? 300 : 1400);
}
function pintaFin(r) {
  const f = $('fin'); f.classList.toggle('pierde', !r.gana);
  $('finT').textContent = r.gana ? '¡Ha llegado el alba!' : (J.puerta <= 0 ? 'La puerta ha caído' : 'Has caído en el Abismo');
  $('finSub').textContent = r.gana ? ['', 'Cuernavilla resiste, por poco.', 'Cuernavilla resiste con la puerta en pie.', '¡Defensa perfecta! La puerta casi intacta.'][r.est] : 'Aguantaste hasta la oleada ' + r.oleada + ' de ' + NOLAS + '.';
  $('finNota').textContent = r.gana && r.est < 3 ? (r.est === 1 ? '★★ con la puerta por encima de la mitad · ★★★ casi intacta' : '★★★ si la puerta acaba casi intacta') : '';
  $('fOla').textContent = r.oleada + ' / ' + NOLAS; $('finRec').classList.toggle('si', r.record);
  [...$('finEst').children].forEach((e) => {e.className = ''; e.style.animationDelay = '';});
  f.classList.remove('hidden'); $('hud').classList.add('hidden');
  [...$('finEst').children].forEach((e, k) => {if (k < r.est) setTimeout(() => {e.className = 'si'; suena('nivel'); J && (J.temblor = 0.25);}, 450 + k * 420);});
  cuentaSube($('fPts'), r.puntos, 1100, ''); cuentaSube($('fBaj'), r.bajas, 900, ''); cuentaSube($('fTes'), r.tesoro, 1300, '+');
  pintaRanking($('finRank'), 9);
}
/* contador que sube como en los juegos de móvil */
function cuentaSube(el, n, ms, pre) {
  const t0 = performance.now(); let ult = -1;
  const f = (t) => {const k = Math.min(1, (t - t0) / ms), v = Math.round(n * (1 - Math.pow(1 - k, 3))); el.textContent = pre + v.toLocaleString('es-ES'); if (v !== ult && k < 1 && Math.random() < 0.25) suena('moneda'); ult = v; if (k < 1) requestAnimationFrame(f);};
  requestAnimationFrame(f);
}
function cartelOla(a, b, c) {
  const e = $('banOla'); $('banA').textContent = a; $('banB').textContent = b; $('banC').textContent = c;
  e.classList.remove('sale'); void e.offsetWidth; e.classList.add('sale'); suena('cuerno'); if (J) J.temblor = Math.max(J.temblor, 0.35);
}
/* ---------- la Comunidad: partidas y clasificación en Supabase (solo dentro de La Otra Comunidad, con cuenta) ---------- */
const SB_URL = 'https://egdnytvckttgvybdbvmw.supabase.co', SB_KEY = 'sb_publishable_1-eGqPkYOPKsW-ZEtUBo7A_16RQQGdK';
function locAuth() {try {return JSON.parse(localStorage.getItem('loc.auth'));} catch (e) {return null;}}
async function locRpc(fn, body) {
  let a = locAuth(); if (!a || !a.at) return null;
  try {
    if (Date.now() > a.exp - 60000) {
      const r = await fetch(SB_URL + '/auth/v1/token?grant_type=refresh_token', {method: 'POST', headers: {apikey: SB_KEY, 'Content-Type': 'application/json'}, body: JSON.stringify({refresh_token: a.rt})});
      if (!r.ok) return null; const j = await r.json(); a = {at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, em: a.em}; localStorage.setItem('loc.auth', JSON.stringify(a));
    }
    const r = await fetch(SB_URL + '/rest/v1/rpc/' + fn, {method: 'POST', headers: {apikey: SB_KEY, Authorization: 'Bearer ' + a.at, 'Content-Type': 'application/json'}, body: JSON.stringify(body || {})});
    return r.ok ? await r.json() : null;
  } catch (e) {return null;}
}
let rankCache = null;
async function guardaPartida(r) {
  await locRpc('loc_abismo_guardar', {p_puntos: r.puntos, p_bajas: r.bajas, p_oleada: r.oleada, p_gana: r.gana, p_estrellas: r.est, p_heroe: r.heroe, p_segundos: r.seg});
  rankCache = null;
}
async function pintaRanking(el, max) {
  el.innerHTML = '';
  const filas = rankCache || await locRpc('loc_abismo_ranking'); if (!Array.isArray(filas) || !filas.length) return; rankCache = filas;
  el.innerHTML = '<h3>Clasificación de la Comunidad</h3>' + filas.slice(0, max).map((f, k) => '<div class="rk' + (f.yo ? ' yo' : '') + '"><i>' + (k + 1) + '</i><span>' + f.nombre + (f.estrellas ? ' <small style="color:#ffd24a">' + '★'.repeat(f.estrellas) + '</small>' : '') + '</span><b>' + f.mejor.toLocaleString('es-ES') + '</b></div>').join('')
    + (max < 9 && !filas.slice(0, max).some((f) => f.yo) && filas.some((f) => f.yo) ? (() => {const k = filas.findIndex((f) => f.yo), f = filas[k]; return '<div class="rk yo"><i>' + (k + 1) + '</i><span>Tú</span><b>' + f.mejor.toLocaleString('es-ES') + '</b></div>';})() : '');
}
function pintaArmeria() {
  const c = $('armeria'), ICON = {vida: 'm_vida', dano: 'm_dano', oro: 'm_oro', vel: 'm_vel'};
  c.innerHTML = '<div class="tes">Armería de Edoras · ' + guardado.tesoro + ' de tesoro' + (guardado.record ? ' · récord ' + guardado.record : '') + '</div>';
  PERMANENTES.forEach((p) => {
    const n = guardado.perm[p.id] || 0, coste = p.base * (n + 1), r = document.createElement('div'); r.className = 'mej';
    r.innerHTML = '<img src="ui/' + ICON[p.id] + '.webp"><span><b>' + p.t + '</b> <span class="pts">' + '●'.repeat(n) + '○'.repeat(5 - n) + '</span><br>' + p.d + ' por nivel</span>';
    const b = document.createElement('button'); b.textContent = n >= 5 ? 'Máximo' : coste + ' tesoro'; b.disabled = n >= 5 || guardado.tesoro < coste;
    b.onclick = () => {guardado.tesoro -= coste; guardado.perm[p.id] = n + 1; guarda(); pintaArmeria();};
    r.appendChild(b); c.appendChild(r);
  });
  if ($('bArmT')) $('bArmT').textContent = 'Armería · ' + guardado.tesoro + ' de tesoro';
}

/* ---------- depuración: hitboxes ---------- */
function anillo(r, color) {
  const g = new THREE.BufferGeometry().setFromPoints(Array.from({length: 33}, (_, i) => new THREE.Vector3(Math.cos(i / 32 * Math.PI * 2) * r, 0.2, Math.sin(i / 32 * Math.PI * 2) * r)));
  return new THREE.Line(g, new THREE.LineBasicMaterial({color, depthTest: false}));
}
function pintaDebug() {
  debug.grupo.clear(); if (!debug.on) return;
  const h = J.h; const a = anillo(0.55, '#4cf'); a.position.set(h.x, 0.15, h.z); debug.grupo.add(a);
  const al = anillo(h.alcance, '#ff0'); al.position.set(h.x, 0.15, h.z); debug.grupo.add(al);
  J.enemigos.forEach((e) => {if (!e.muerto) {const r = anillo(e.radio, '#f44'); r.position.set(e.x, e.y, e.z); debug.grupo.add(r);}});
  J.proy.forEach((p) => {const r = anillo(0.3, '#4f4'); r.position.set(p.x, 1, p.z); debug.grupo.add(r);});
  J.eproy.forEach((p) => {const r = anillo(0.65, '#f80'); r.position.set(p.x, 1, p.z); debug.grupo.add(r);});
}
$('dbg').onclick = () => {debug.on = !debug.on; if (!debug.on) debug.grupo.clear();};
$('bDef').onclick = abreBandeja; $('bandX').onclick = cierraBandeja;

/* ---------- bucle ---------- */
const reloj = new THREE.Clock();
const camPos = new THREE.Vector3();
let fpsN = 0, fpsT = 0;
function bucle() {
  requestAnimationFrame(bucle);
  const dt = Math.min(reloj.getDelta(), 0.05);
  fpsN++; fpsT += dt; if (fpsT > 1) {$('fps').textContent = Math.round(fpsN / fpsT) + ' fps · ' + (GR.pr || 0).toFixed(2) + 'x · calidad ' + GR.calidad + (J ? ' · ' + J.enemigos.length + ' enemigos' : ''); fpsN = 0; fpsT = 0;}
  antorchas.forEach((a) => {a.fase += dt * 9; const k = 0.85 + Math.sin(a.fase) * 0.08 + Math.sin(a.fase * 2.7) * 0.07; a.l.intensity = a.base * k; });
  if (J && !J.pausa && !J.fin) {if (J.parada > 0) J.parada -= dt; else paso(dt * (J.lenta > 0 ? 0.35 : 1)); if (J.lenta > 0) J.lenta -= dt;}
  else if (J && J.fin) {J.enemigos.forEach((e) => e.a.mixer.update(dt)); J.h.a.mixer.update(dt);}
  actualizaEfectos(dt);
  actualizaNumeros(dt);
  mezcladores.forEach((m) => m.update(dt));
  actualizaLluvia(dt, J ? J.h.x : 0, J ? J.h.z : 12);
  if (J && !J.pausa && Math.random() < dt * 12) particula('gota', J.h.x + rnd(-9, 9), 0.25, J.h.z + rnd(-13, 6), {vel: 0, sube: 0, vida: 0.3, escala: 0.55, crece: 1.4, disp: 0, giro: 0});
  camara(dt);
  actualizaPool(dt, camMira.x, camMira.z); orientaMatas(); pintaGemas();
  if (J) {etiquetas(); marcasAmenaza();}
  GR.render(dt, !!(J && !J.pausa && !J.fin));
}
function paso(dt) {
  /* durante la escena del desagüe el mundo se congela: solo se mueve el que carga contra el muro */
  if (J.cine) {J.cine.t = (J.cine.t || 0) + dt; if (J.cine.t > 9) J.cine = null;}
  const cine = !!J.cine;
  if (cine !== J._cineCss) {J._cineCss = cine; document.body.classList.toggle('cine', cine); if (cine) {mando.activo = false; mando.x = mando.z = 0;}}
  if (!cine) {
    J.t += dt;
    if (AC && AC.state === 'running' && !J.fin) ponMusica(enTregua(J.t) ? 'tregua_tensa' : J.alba ? 'alba_triunfal' : 'batalla_epica');
    actualizaDichos(dt);
    spawns(dt);
  }
  llenaRejilla();
  mueveHeroe(dt);
  const h0 = J.h; for (const e of J.enemigos) if (!e.muerto) {const g = e.golpe; mueveEnemigo(e, dt); if (e.d.jefe && g > 0 && e.golpe <= 0) finGolpeJefe(e);}
  if (!cine) {
    separa();
    actualizaArmas(dt);
    actualizaProyectiles(dt);
    actualizaEproy(dt);
    actualizaCharcos(dt);
    actualizaDefensas(dt);
    actualizaFortaleza(dt);
    actualizaArqueros(dt);
    actualizaSubidas(dt);
    actualizaJinetes(dt);
    actualizaElfos(dt);
    actualizaEscalas(dt);
    actualizaGemas(dt);
    actualizaManchas(dt);
  }
  for (let i = J.enemigos.length - 1; i >= 0; i--) {
    const e = J.enemigos[i];
    if (cine && !e.desagueHeroe && !e.vuela) {e.a.raiz.position.set(e.x, e.y, e.z); continue;}
    if (e.muerto) {
      e.muerto -= dt;
      if (e.vuela) {
        const v = e.vuela; e.x += v.vx * dt; e.z += v.vz * dt; e.y += v.vy * dt; v.vy -= 22 * dt; e.rot = (e.rot || 0) + v.giro * dt;
        e.a.raiz.rotation.x = Math.max(-1.4, (e.a.raiz.rotation.x || 0) - dt * 4);
        if (e.y <= 0.15) {e.y = 0.15; if (!v.tocado) {v.tocado = true; pon(e.a, e.a.clips.morir_2 ? 'morir_2' : 'morir', 0.08, true);} if (v.vy < -2) {efecto('polvo', e.x, 0.15, e.z, {escala: 0.8, vida: 0.4}); v.vy = -v.vy * 0.25; v.vx *= 0.4; v.vz *= 0.4; v.giro *= 0.3;} else {v.vx = v.vz = v.vy = v.giro = 0;}}
      }
      else if (e.cae && e.y > 0.2) {e.y = Math.max(0.2, e.y - dt * 9); e.z -= dt * 2;}
      else if (e.muerto < 0.45 && !e.cae) e.y -= dt * 1.6;
      if (e.muerto <= 0) {scene.remove(e.a.raiz); J.enemigos.splice(i, 1); continue;}
    }
    if (!e.muerto) ritmo(e.a, e, e.d.vel, dt);
    if (!e.muerto && e.golpe > 0 && (e.golpeA === 'heroe' || e.golpeA === 'area')) {
      const k = 1 - e.golpe / (e.golpeA === 'area' ? 0.7 : 0.35);
      e.a.raiz.traverse((o) => {if (o.isMesh && o.material.emissive && !o.userData.borde) {o.material.emissive.setRGB(0.9, 0.16, 0.03); o.material.emissiveIntensity = 0.06 + 0.32 * k * k;}}); e.a.flash = 0.04;
    }
    e.a.raiz.position.set(e.x, e.y, e.z); e.a.raiz.rotation.y = e.rot || 0;
    /* los lejanos se animan a saltos (cada 3 fotogramas): ahorra mucho con 100 orcos en el campo */
    const lejos = Math.abs(e.z - h0.z) > 26 || Math.abs(e.x - h0.x) > 22;
    e.aFr = e.aFr || 0; e.aDt = (e.aDt || 0) + dt; if (!lejos || ++e.aFr % 3 === 0 || e.muerto) {e.a.mixer.update(e.aDt); e.aDt = 0;}
    apagaFlash(e.a, dt);
  }
  pintaBarras();
  const h = J.h; if (window._aro) {window._aro.position.set(h.x, (h.y ?? 0.15) + 0.03, h.z); window._aro.material.opacity = 0.7 + Math.sin(J.t * 4) * 0.15; window._aro.rotation.y += 0.004;} ritmo(h.a, h, h.vel, dt); h.a.raiz.position.set(h.x, h.y ?? 0.15, h.z); {let d = h.rot - (h.rotV ?? h.rot); d = Math.atan2(Math.sin(d), Math.cos(d)); h.rotV = (h.rotV ?? h.rot) + d * Math.min(1, dt * 18);} h.a.raiz.rotation.y = h.rotV; h.a.mixer.update(dt); apagaFlash(h.a, dt);
  actualizaPuerta();
  pintaDebug();
  pintaHud();
  if (J.subidas > 0 && !J.pausa) siguientePendiente();
  if (J.h.vida <= 0 || J.puerta <= 0) terminar(false); else if (J.alba && (J.t > J.alba + 14 || (J.t > J.alba + 5 && !(J.vivos > 0)))) terminar(true);
}
/* el paso de la animación sigue a la velocidad real (sin pies que patinan) y el cuerpo se inclina al correr */
function ritmo(a, o, velRef, dt) {
  if (dt <= 0) return;
  const px = o._px ?? o.x, pz = o._pz ?? o.z, v = Math.hypot(o.x - px, o.z - pz) / dt; o._px = o.x; o._pz = o.z;
  o._v = (o._v || 0) + (Math.min(v, velRef * 3) - (o._v || 0)) * Math.min(1, dt * 10);
  const n = a.actual && a.actual.getClip().name;
  if (n === 'andar' || n === 'correr') a.actual.timeScale = Math.max(0.55, Math.min(1.7, o._v / (velRef * (n === 'andar' ? 0.55 : 1)) || 1));
  else if (a.actual && a.actual.timeScale !== 1 && !o.lento) a.actual.timeScale = 1;
  a.raiz.rotation.order = 'YXZ';
  const lean = (n === 'correr' || n === 'andar') ? Math.min(0.13, o._v / velRef * 0.09) : 0;
  if (!o.vuela) a.raiz.rotation.x += (lean - a.raiz.rotation.x) * Math.min(1, dt * 8);
}
const camMira = new THREE.Vector3(0, 0, 10);
function camara(dt) {
  if (J) {
    const h = J.h;
    J.temblor = Math.max(0, J.temblor - dt);
    const tb = J.temblor * 0.6;
    /* más alejada que antes; junto a la puerta se pone casi cenital para ver la puerta y a quien la ataca */
    const k = THREE.MathUtils.smoothstep(h.z, 20, 33);
    J.cineT = (J.cineT || 0) + ((J.cine ? 1 : 0) - (J.cineT || 0)) * Math.min(1, dt * 3);
    const mando = !!enTregua(J.t) && !J.fin;
    J.zoomT = (J.zoomT || 0) + ((mando ? 1 : 0) - (J.zoomT || 0)) * Math.min(1, dt * 2.5);
    J.murT = (J.murT ?? 1) + ((J.enMuro ? 1 : 0) - (J.murT ?? 1)) * Math.min(1, dt * 2);
    const w = J.murT, z = J.zoomT, alto = ((19 + 8 * k) * (1 - w) + 14 * w) * (1 - z) + 66 * z, atras = ((21 * (1 - k) + 6 * k) * (1 - w) + 10 * w) * (1 - z);
    camPos.set((h.x * 0.85) * (1 - z) + rnd(-tb, tb), alto + (h.y ?? 0.15) * (1 - z), (h.z + atras) * (1 - z) + 22 * z + rnd(-tb, tb));
    camPos.z = Math.min(camPos.z, 36.2 + 40 * z);
    const fv = 47 + 6 * w * (1 - z) + 19 * z; if (Math.abs(camera.fov - fv) > 0.05) {camera.fov = fv; camera.updateProjectionMatrix();}
    const f = 1 - Math.pow(0.001, Math.min(dt, 0.1));
    camera.position.lerp(camPos, f);
    camMira.lerp(_v3.set((h.x * 0.85) * (1 - z), 0, (h.z - 8 * (1 - k) + 0.8 * k - 14 * w) * (1 - z) + 1 * z), f);
    let mx = camMira.x, mz = camMira.z;
    /* plano desde lo alto de la muralla mirando al berserker del desagüe */
    if (J.cineT > 0.01) {const c = J.cine || J.cineUlt, q = J.cineT * J.cineT * (3 - 2 * J.cineT); J.cineUlt = c; camera.position.lerp(_v4.set(c.x + 4.5, Y_MURO + 4.5, Math.min(c.z + 12, Z_MURO_FUERA - 2.5)), q); mx += (c.x - mx) * q; mz += (c.z - mz) * q;}
    if (z < 0.5) mz = Math.min(mz, camera.position.z - 4);
    camera.lookAt(mx + rnd(-tb, tb) * 0.3, 0, mz);
    if (window._camFija) {const c = window._camFija; camera.position.set(...c.p); camera.lookAt(...c.t);}
    luna.position.set(h.x - 22, 40, h.z + 14); luna.target.position.set(h.x, 0, h.z);
    GR.ojo(camera.position, h.x, h.z, THREE.MathUtils.smoothstep(h.z, 18, 28), Math.max(0, (h.y ?? 0.15) - 0.15));
    /* carteles de las escaleras */
    ESCALERAS.forEach((es, i) => {
      let el = $('esc' + i); if (!el) {el = document.createElement('div'); el.id = 'esc' + i; el.className = 'escalera'; document.body.appendChild(el);}
      const arriba = J.enMuro, p = _v4.set(arriba ? es.x1 : es.x0, arriba ? Y_MURO + 1.8 : 2.2, arriba ? ADARVE.z1 : PATIO.z0).project(camera);
      const ver = !J.fin && !J.pausa && !J.h.rampa && !(J.zoomT > 0.3) && p.z < 1 && Math.abs(p.x) < 1.1 && Math.abs(p.y) < 1.1 && !(J.tramos[i ? 5 : 0].roto && arriba);
      el.style.display = ver ? 'block' : 'none';
      if (ver) {el.textContent = arriba ? '▼ Bajar al patio' : '▲ Subir al muro'; el.style.left = ((p.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - p.y) / 2 * innerHeight) + 'px';}
    });
  } else {camera.position.set(0, 30, 50); camera.lookAt(0, 0, 10); GR.ojo(camera.position, 0, 10);}
}
const _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();

/* ---------- pantalla de inicio ---------- */
let elegido = 'rohan';
function pintaHeroes() {
  const c = $('heroes'); c.innerHTML = '';
  Object.entries(HEROES).forEach(([k, h]) => {
    const b = document.createElement('button'); b.className = 'heroe' + (k === elegido ? ' sel' : ''); b.setAttribute('aria-label', h.nombre);
    b.innerHTML = '<img src="ui/r_' + k + '.webp" alt="">';
    b.onclick = () => {elegido = k; pintaHeroes();};
    c.appendChild(b);
  });
  const h = HEROES[elegido]; $('hsImg').src = 'ui/r_' + elegido + '.webp'; $('hsNom').textContent = h.nombre; $('hsDesc').textContent = h.desc;
}
pintaHeroes(); pintaArmeria();
$('bEsq').addEventListener('pointerdown', (e) => {e.stopPropagation(); if (J) J.pideEsq = true;});
$('bHab').addEventListener('pointerdown', (e) => {e.stopPropagation(); if (J) J.pideHab = true;});
$('jugar').onclick = () => {$('inicio').classList.add('hidden'); nuevaPartida(elegido); reloj.getDelta();};
$('otra').onclick = () => {$('fin').classList.add('hidden'); $('inicio').classList.remove('hidden'); pintaArmeria(); pintaRanking($('rankIni'), 3);};
$('otraYa').onclick = () => {$('fin').classList.add('hidden'); nuevaPartida(elegido); reloj.getDelta();};
bucle();
pintaRanking($('rankIni'), 3);
cargarTodo().then(() => {$('jugar').disabled = false; $('bMerc').disabled = false; $('jugar').firstElementChild.textContent = 'Defender la muralla';}).catch((e) => {console.error(e); $('jugar').firstElementChild.textContent = 'Error al cargar';});
/* ---------- pantalla del Mercado ---------- */
let mercHeroe = 'rohan', prev = null;
function abreMercado() {mercHeroe = elegido || 'rohan'; $('inicio').classList.add('hidden'); $('mercadoCapa').classList.remove('hidden'); pintaMercado(); arrancaPrevia();}
function pintaMercado() {
  const g = guardado.mercado, eq = g.equipo[mercHeroe] = g.equipo[mercHeroe] || {};
  $('mercTes').textContent = guardado.tesoro;
  $('mercHer').innerHTML = Object.keys(HEROES).map((k) => '<button data-h="' + k + '" class="' + (k === mercHeroe ? 'on' : '') + '"><img src="iconos/h_' + k + '.webp" alt=""></button>').join('');
  $('mercNom').textContent = HEROES[mercHeroe].nombre;
  const lista = MERCADO.filter((m) => !m.heroe || m.heroe === mercHeroe), cont = $('mercLista'); cont.innerHTML = '';
  for (const [slot, tit] of [['arma', 'Armas'], ['escudo', 'Escudos'], ['extra', 'Equipo']]) {
    const del = lista.filter((m) => m.slot === slot); if (!del.length) continue;
    const h = document.createElement('h3'); h.textContent = tit; cont.appendChild(h);
    for (const m of del) {
      const tiene = g.tiene[m.id], puesto = eq[slot] === m.id, r = document.createElement('div'); r.className = 'mItem' + (puesto ? ' puesto' : '');
      r.innerHTML = '<img src="' + ico(m.icono) + '" alt=""><div><b>' + m.t + '</b><span>' + m.d + '</span></div>';
      const b = document.createElement('button');
      if (!tiene) {b.innerHTML = '<i>' + m.coste + '</i>'; b.className = 'comprar' + (guardado.tesoro < m.coste ? ' no' : ''); b.onclick = () => {if (guardado.tesoro < m.coste) {aviso('Te falta tesoro: juega más partidas', 1200); return;} guardado.tesoro -= m.coste; g.tiene[m.id] = true; eq[slot] = m.id; guarda(); suena('cofre'); pintaMercado(); vistePrevia();};}
      else if (puesto) {b.textContent = 'Quitar'; b.className = 'quitar'; b.onclick = () => {delete eq[slot]; guarda(); pintaMercado(); vistePrevia();};}
      else {b.textContent = 'Equipar'; b.className = 'equipar'; b.onclick = () => {eq[slot] = m.id; guarda(); suena('metal'); pintaMercado(); vistePrevia();};}
      r.appendChild(b); cont.appendChild(r);
    }
  }
  $('mercHer').querySelectorAll('button').forEach((b) => b.onclick = () => {mercHeroe = b.dataset.h; pintaMercado(); vistePrevia(true);});
}
/* el héroe girando con su equipo puesto (un renderizador pequeño aparte) */
function arrancaPrevia() {
  const cv = $('mercCv');
  if (!prev) {
    const r = new THREE.WebGLRenderer({canvas: cv, antialias: true, alpha: true}); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.35;
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight('#fff4dc', '#3a2a1a', 2.2)); const d = new THREE.DirectionalLight('#ffe2b0', 2.4); d.position.set(2, 4, 3); sc.add(d);
    const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50); cam.position.set(0, 1.35, 3.7); cam.lookAt(0, 0.95, 0);
    prev = {r, sc, cam, a: null, t: performance.now()};
  }
  vistePrevia(true);
  const bucleP = () => {
    if ($('mercadoCapa').classList.contains('hidden')) {prev.run = false; return;}
    const w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== Math.round(w * prev.r.getPixelRatio())) {prev.r.setSize(w, h, false); prev.cam.aspect = w / h; prev.cam.updateProjectionMatrix();}
    const t = performance.now(), dt = Math.min(0.05, (t - prev.t) / 1000); prev.t = t;
    if (prev.a) {prev.a.mixer.update(dt); prev.a.raiz.rotation.y += dt * 0.6;}
    prev.r.render(prev.sc, prev.cam); requestAnimationFrame(bucleP);
  };
  if (!prev.run) {prev.run = true; requestAnimationFrame(bucleP);}
}
function vistePrevia(nuevo) {
  if (!prev) return;
  if (nuevo || !prev.a || prev.tipo !== mercHeroe) {
    if (prev.a) prev.sc.remove(prev.a.raiz);
    const b = HEROES[mercHeroe]; prev.a = montar(b.modelos ? b.modelos[0] : b.modelo, false); prev.tipo = mercHeroe; prev.a.raiz.position.set(0, 0, 0); prev.a.raiz.rotation.y = 0.5;
    prev.a.raiz.traverse((o) => {if (o.userData.borde) o.visible = false;});
    prev.sc.add(prev.a.raiz); pon(prev.a, 'quieto');
  }
  vistePersonaje(prev.a.raiz, mercHeroe);
}
$('bMerc').onclick = abreMercado; window._prev = () => prev;
$('mercVolver').onclick = () => {$('mercadoCapa').classList.add('hidden'); $('inicio').classList.remove('hidden');};
$('bArm').onclick = () => {pintaArmeria(); $('inicio').classList.add('hidden'); $('armeriaCapa').classList.remove('hidden');};
$('armVolver').onclick = () => {$('armeriaCapa').classList.add('hidden'); $('inicio').classList.remove('hidden');};
window.ganaXp = ganaXp; window._J = () => J;
window._elige = (k) => {elegido = k; pintaHeroes();};
window._def = (tipo, x, z) => {creaDefensa(tipo, x, z);};
window._arma = (id, n) => {J.armas[id] = n; if (id === 'antorcha') ponOrbitales(); pintaArmas();};
window._sim = (seg, auto) => {for (let i = 0; i < seg * 20 && J && !J.fin; i++) {if (J.pausa && auto) {const c = document.querySelector('.carta'); if (c) c.click();} if (!J.pausa) {if (J.parada > 0) J.parada -= 0.05; else paso(0.05); actualizaEfectos(0.05);}} camara(1); return J && J.t;};
window.THREE_DBG = THREE; window._CAM = camera; window._SC = scene; window._R = renderer;
window._crea = (t, x, z) => creaEnemigo(t, {patio: true, x, z});
window._desague = () => antorchero(true); window._tronco = () => tronco(); window._derriba = (i) => danaEscala(J.escalas[i], 999); window._cartel = (a, b, c) => cartelOla(a, b, c);
window._monta = (n, x, z) => {const a = montar(n, true); a.raiz.position.set(x, 0.15, z); scene.add(a.raiz); const c = a.clips.quieto || Object.values(a.clips)[0]; if (c) c.play(); window._mezc = (window._mezc || []).concat(a.mixer); return a;};
window._tramo = (k) => dañaTramo(J.tramos[k], 9999);
window._mej = () => ofreceMejoras(false);
window._fbs = () => fbs.length;
