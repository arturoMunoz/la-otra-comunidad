// GENERADO por tools/vado/hace_sim.mjs a partir de public/batalla/juego.js: no tocar a mano.
export function creaSim() {
  let S = null, VISTA = new Map(), YO = null, MI_EQ = 0, ESTADO = 'juego';
  const EN_SERVIDOR = true, INTERP_MS = 100, NET = {online: true}, hechElegido = 'f';
  const document = {getElementById: () => null}, localStorage = {getItem: () => null, setItem() {}};
  const window = {}; function efectoLocal() {}
 /* entre estas marcas va la simulación que también corre en el servidor (tools/vado/hace_sim.mjs → sim_vado.js) */

const $ = (id) => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => {const dx = a.x - b.x, dz = a.z - b.z; return Math.sqrt(dx * dx + dz * dz);}; /* 22/11: sqrt en vez de hypot (hypot es varias veces más lento y dist es lo que más se llama) */
const ICO = (n) => n.includes('/') ? n : '../abismo/iconos/' + n + '.webp';

/* ---------- datos ---------- */
const HEROES = {
  /* LA AUTOPISTA (17/11): 7 héroes originales. Clave interna = héroe de La Brecha cuyo kit usan. Modelos y arte PROVISIONALES hasta los pedidos a ChatGPT. */
  enano: {nombre: 'Dalinar, Caballero de Luz', modelo: 'ap_brask', alto: 2.45, ret: 'ui/ap_r_enano.webp', mana: 300, crecM: 30, vida: 740, dano: 58, vatq: 0.8, alcance: 2.3, vel: 4.9, crecV: 95, crecD: 4, arm: 38, rm: 32,
    hab: {q: {n: 'Tajo radiante', cd: 5, mn: 30, tipo: 'cono', alc: 3.8, ang: 1.5, dano: 115, icono: 'hacha', d: 'Un espadazo de luz en abanico delante de ti.'},
      w: {n: 'Coraza de luz', cd: 14, mn: 45, tipo: 'reduce', val: 0.45, dur: 3, icono: 'escudo', d: 'Su armadura se llena de luz: recibe un 45 % menos de daño durante 3 s.'},
      e: {n: 'Caída luminosa', cd: 10, mn: 45, tipo: 'salto', dist: 7, radio: 2.6, dano: 85, lento: 0.35, durL: 1.5, icono: 'botas', d: 'Salta impulsado por la luz, hiere y frena al caer.'},
      r: {n: 'Estallido de luz', cd: 50, mn: 90, tipo: 'area', radio: 4.6, dano: 240, aturde: 1.25, icono: 'h_enano', d: 'Libera toda la luz de su armadura: daño enorme y aturde a todos alrededor.'}}},
  gandalf: {nombre: 'Vael, el Mago', modelo: 'ap_vael', ret: 'ui/ap_r_gandalf.webp', mana: 420, crecM: 40, vida: 540, dano: 50, vatq: 0.88, alcance: 6.8, vel: 5.1, crecV: 78, crecD: 4.3, mag: true, arm: 20, rm: 32, proy: 'brasa',
    hab: {q: {n: 'Orbe ígneo', cd: 8, mn: 50, tipo: 'linea', mag: true, alc: 11.5, ancho: 0.9, dano: 110, aturde: 1.3, proy: 'brasa', icono: 'h_gandalf_q', d: 'Lanza un orbe de fuego que atrapa 1,3 s al primero que toca.'},
      w: {n: 'Escudo de brasas', cd: 13, mn: 55, tipo: 'escudo', mag: true, val: 140, dur: 3, aliados: 7, icono: 'h_gandalf_w', d: 'Un escudo de brasas para ti y los aliados a 7 m durante 3 s.'},
      e: {n: 'Círculo de ceniza', cd: 9, mn: 60, tipo: 'zona', mag: true, alc: 10, radio: 3.2, dur: 1.5, dps: 100, lento: 0.45, icono: 'h_gandalf_e', d: 'Ceniza ardiente en el suelo que hiere y frena un 45 % a los que la pisan.'},
      r: {n: 'Llamarada', cd: 45, mn: 100, tipo: 'linea', mag: true, alc: 16, ancho: 1.5, dano: 250, perfora: true, proy: 'brasa', icono: 'h_gandalf_r', d: 'Un gran chorro de fuego que hiere a todos en una línea muy larga.'}}},
  orco: {nombre: 'Grub, el Maestro', modelo: 'ap_grub', alto: 1.25, ret: 'ui/ap_r_orco.webp', mana: 280, crecM: 28, vida: 730, dano: 63, vatq: 0.84, alcance: 2.7, vel: 5.0, crecV: 88, crecD: 4.4, arm: 34, rm: 30,
    hab: {q: {n: 'Remolino de energía', cd: 8, mn: 30, tipo: 'area', radio: 3.5, dano: 100, curaH: 0.1, icono: 'h_orco_q', d: 'Gira la espada de energía: hiere a los de alrededor y se cura un 10 % de la vida que le falta por cada héroe que toca.'},
      w: {n: 'Tajo pesado', cd: 7, mn: 30, tipo: 'cono', alc: 3.4, ang: 1.2, dano: 90, lento: 0.5, durL: 1.2, icono: 'h_orco_w', d: 'Un tajo delante que frena un 50 % 1,2 s.'},
      e: {n: 'Atracción', cd: 14, mn: 45, tipo: 'linea', alc: 6.5, ancho: 0.9, dano: 60, tira: true, lento: 0.4, durL: 1, proy: 'energia', icono: 'h_orco_e', d: 'Con la fuerza de su mente arrastra hasta él al primero que toca.'},
      r: {n: 'Sentencia', cd: 45, mn: 80, tipo: 'ejecuta', alc: 6, dano: 170, falta: 0.35, icono: 'h_orco_r', d: 'Salta sobre el héroe más cercano: más daño cuanta menos vida le quede (35 % de la que le falta). Si lo derriba, se recarga al momento.'}}},
  elfo: {nombre: 'Ata, la Francotiradora', modelo: 'ap_ata', ret: 'ui/ap_r_elfo.webp', mana: 340, crecM: 32, vida: 520, dano: 50, vatq: 0.95, alcance: 7, vel: 5.3, crecV: 75, crecD: 4.5, arm: 22, rm: 28, proy: 'bala',
    hab: {q: {n: 'Bala perforante', cd: 6, mn: 45, tipo: 'linea', alc: 13, ancho: 0.55, dano: 125, perfora: true, proy: 'bala', icono: 'arco', d: 'Un disparo largo que atraviesa a todos en su línea.'},
      w: {n: 'Cadencia', cd: 12, mn: 40, tipo: 'rafaga', val: 0.6, dur: 4, icono: 'i_abanico', d: 'Disparas un 60 % más rápido durante 4 s.'},
      e: {n: 'Voltereta', cd: 9, mn: 35, tipo: 'dash', dist: 5, dano: 0, icono: 'i_esquivar', d: 'Ruedas hacia donde apuntes.'},
      r: {n: 'Fuego de cobertura', cd: 45, mn: 90, tipo: 'zona', alc: 10, radio: 3.6, dur: 3, dps: 80, lento: 0.3, icono: 'h_elfo', d: 'Durante 3 s barres la zona a balazos: hieres y frenas.'}}},
  hobbit: {nombre: 'Birdie, el Golfista', modelo: 'ap_birdie', ret: 'ui/ap_r_hobbit.webp', mana: 320, crecM: 32, vida: 560, dano: 50, vatq: 1.0, alcance: 6.5, vel: 5.8, crecV: 78, crecD: 4, arm: 24, rm: 28, proy: 'bola',
    hab: {q: {n: 'Drive', cd: 7, mn: 40, tipo: 'linea', alc: 11, ancho: 0.6, dano: 100, aturde: 0.9, proy: 'bola', icono: 'honda', d: 'Una bola de golf a toda velocidad: aturde al primero que toca.'},
      w: {n: 'Bajo par', cd: 16, mn: 45, tipo: 'invis', dur: 3, vel: 0.35, icono: 'i_humo', d: 'Desapareces 3 s y corres más: ni torres ni enemigos te ven.'},
      e: {n: 'Cubo de bolas', cd: 6, mn: 35, tipo: 'cono', alc: 5.2, ang: 1.0, dano: 90, icono: 'i_piedras', d: 'Vacías el cubo: un puñado de bolas en abanico.'},
      r: {n: 'Hoyo en uno', cd: 45, mn: 80, tipo: 'suerte', cura: 0.4, vel: 0.5, dur: 5, icono: 'h_hobbit', d: 'Te curas un 40 %, corres más y pegas más fuerte 5 s.'}}},
  gollum: {nombre: 'Fu, el Ninja', modelo: 'ap_fu', ret: 'ui/ap_r_gollum.webp', mana: 280, crecM: 28, vida: 640, dano: 68, vatq: 1.1, alcance: 2.3, vel: 5.7, crecV: 90, crecD: 5, arm: 32, rm: 30,
    hab: {q: {n: 'Salto de la grulla', cd: 6, mn: 30, tipo: 'salto', dist: 6, radio: 2.2, dano: 140, lento: 0.35, durL: 1, icono: 'h_gollum_q', d: 'Salta sobre su presa: hiere y frena al caer.'},
      w: {n: 'Meditación', cd: 14, mn: 40, tipo: 'suerte', cura: 0.25, vel: 0.3, dur: 3, icono: 'h_gollum_w', d: 'Respira hondo: se cura un 25 %, corre más y pega más fuerte 3 s.'},
      e: {n: 'Kusarigama', cd: 10, mn: 35, tipo: 'linea', alc: 9, ancho: 0.8, dano: 70, aturde: 1.0, proy: 'cadena', icono: 'h_gollum_e', d: 'Lanza la hoz con cadena: atrapa 1 s al primero que toca.'},
      r: {n: 'Bomba de humo', cd: 50, mn: 80, tipo: 'invis', dur: 5, vel: 0.6, icono: 'h_gollum_r', d: 'Desaparece 5 s entre el humo y corre mucho más: nadie le ve llegar.'}}},
  visor: {nombre: 'El Visor', modelo: 'ap_visor', ret: 'ui/ap_r_visor.webp', mana: 400, crecM: 38, vida: 565, dano: 52, vatq: 0.92, alcance: 6.8, vel: 5.2, crecV: 82, crecD: 4.6, mag: true, arm: 20, rm: 30, proy: 'rayo',
    hab: {q: {n: 'Impacto óptico', cd: 7, mn: 45, tipo: 'linea', mag: true, alc: 10, ancho: 0.7, dano: 135, lento: 0.4, durL: 1.2, proy: 'rayo', icono: 'h_visor_q', d: 'Un rayo corto y potente: hiere y frena un 40 % al primero que toca.'},
      w: {n: 'Rebote', cd: 11, mn: 55, tipo: 'linea', mag: true, alc: 12, ancho: 0.7, dano: 110, perfora: true, proy: 'rayo', icono: 'h_visor_w', d: 'Un rayo que atraviesa a todos los enemigos de su línea.'},
      e: {n: 'Ráfaga', cd: 9, mn: 50, tipo: 'cono', mag: true, alc: 6, ang: 1.05, dano: 110, lento: 0.35, durL: 1.5, icono: 'h_visor_e', d: 'Un abanico de rayos delante de él: hiere y frena un 35 %.'},
      r: {n: 'Mirada total', cd: 50, mn: 100, tipo: 'linea', mag: true, alc: 17, ancho: 1.6, dano: 300, perfora: true, proy: 'rayo', icono: 'h_visor_r', d: 'Abre la visera del todo: un rayo gigantesco que atraviesa todo lo que hay en su línea.'}}},
  rohan: {nombre: 'Moha, el Halcón del Atlas', modelo: 'ap_moha', ret: 'ui/ap_r_rohan.webp', mana: 300, crecM: 30, vida: 650, dano: 62, vatq: 0.9, alcance: 2.5, vel: 5.2, crecV: 85, crecD: 4.5, arm: 32, rm: 30,
    hab: {q: {n: 'Gumía', cd: 6, mn: 35, tipo: 'dash', dist: 5.5, dano: 95, icono: 'lanza', d: 'Se lanza hacia delante con su daga curva y hiere a todos los que atraviesa.'},
      w: {n: 'Velo de arena', cd: 12, mn: 45, tipo: 'escudo', val: 170, dur: 3, icono: 'escudo', d: 'Un remolino de arena que absorbe daño durante 3 s.'},
      e: {n: 'Siroco', cd: 10, mn: 40, tipo: 'area', radio: 4, dano: 55, lento: 0.4, durL: 2, icono: 'cuerno', d: 'Levanta el viento del desierto: hiere y frena a los que le rodean.'},
      r: {n: 'Picado del halcón', cd: 45, mn: 80, tipo: 'dash', dist: 11, dano: 230, aturde: 1, icono: 'h_rohan', d: 'Se lanza como un halcón: derriba y aturde 1 s a todos a su paso.'}}},
};
/* PASIVAS (17/11): como en el LoL, cada héroe tiene una que funciona sola; copiadas de su campeón */
const PASIVA = {
  gandalf: {n: 'Marca de brasas', d: 'Sus hechizos marcan al enemigo; su siguiente golpe básico contra él estalla con daño mágico extra.'},
  orco: {n: 'Disciplina', d: 'Sus golpes a héroes se acumulan (hasta 5); con 5, +30 % de daño durante 5 s.'},
  gollum: {n: 'Acecho', d: 'Desde los matorrales, su golpe básico es un salto hasta la presa (hasta 6 m).'},
  rohan: {n: 'Ojo de halcón', d: 'El primer golpe a cada enemigo quita un 8 % de su vida actual; se repite cada 6 s por enemigo.'},
  visor: {n: 'Sobrecarga', d: 'Cada 4.º golpe básico es un rayo cargado: daño mágico extra.'},
  elfo: {n: 'Balas de goma', d: 'Sus disparos frenan un 25 % durante 1,5 s.'},
  enano: {n: 'Armadura viva', d: 'Un escudo del 10 % de su vida máxima que vuelve si pasa 10 s sin recibir daño.'},
  hobbit: {n: 'Concentración', d: 'Si se queda quieto 1,5 s se vuelve invisible hasta que se mueve o ataca.'},
};
const RET = (t) => {const h = HEROES[t] || HEROES.enano; return h.ret || '../abismo/ui/' + h.retrato + '.webp';};
const NIVEL_R = 4, NIVEL_MAX = 9;
/* energía que cuesta una habilidad: como en el LoL, las básicas cuestan un 10 % más por rango; la definitiva, siempre lo mismo */
const costeMn = (tipo, k, rk) => {const m = HEROES[tipo].hab[k].mn; return k === 'r' ? m : Math.round(m * (1 + 0.1 * Math.max(0, (rk || 1) - 1)));};
/* rango máximo de cada habilidad según el nivel (Q/W/E hasta 4, R a nivel 4 y 8) */
const rangoMax = (nivel, k) => k === 'r' ? (nivel >= 8 ? 2 : nivel >= 4 ? 1 : 0) : Math.min(4, Math.ceil(nivel / 2));
function puedeSubir(h, k) {return h.pts > 0 && h.rk[k] < rangoMax(h.nivel, k);}
function subeHab(h, k) {if (!puedeSubir(h, k)) return false; h.rk[k]++; h.pts--; return true;}
function autoSube(h) {let n = 0; while (h.pts > 0 && n++ < 6) {const o = ['r', 'q', 'e', 'w', 'q', 'e'].find((k) => puedeSubir(h, k) && (k === 'r' || h.rk[k] <= Math.min(h.rk.q, h.rk.e, h.rk.w) + (k === 'q' ? 1 : 0))) || ['q', 'w', 'e'].find((k) => puedeSubir(h, k)); if (!o) break; subeHab(h, o);}}
/* hechizos de invocador: Destello y Curar */
const HECHIZOS = {d: {n: 'Destello', cd: 100, icono: 'ui/ap_hz_destello.webp'}, f: {n: 'Curar', cd: 90, icono: 'ui/ap_hz_curar.webp'}, c: {n: 'Ignición', cd: 90, icono: 'ui/ap_hz_ignicion.webp'}};
const OBJ = {
  hoja: {t: 'Barra de hierro', i: 'ui/ap_obj_hoja.webp', c: 350, st: {dano: 18}},
  daga: {t: 'Navaja automática', i: 'ui/ap_obj_daga.webp', c: 300, st: {vatq: 0.2}},
  cota: {t: 'Chaleco reflectante', i: 'ui/ap_obj_cota.webp', c: 350, st: {vida: 160, arm: 10}},
  yelmo: {t: 'Casco de obra', i: 'ui/ap_obj_yelmo.webp', c: 350, st: {arm: 25}},
  manto: {t: 'Mono ignífugo', i: 'ui/ap_obj_manto.webp', c: 350, st: {rm: 25}},
  tomo: {t: 'Batería de litio', i: 'ui/ap_obj_tomo.webp', c: 350, st: {poder: 30, mana: 150}},
  botas: {t: 'Zapatillas de correr', i: 'ui/ap_obj_botas.webp', c: 300, st: {vel: 0.12}},
  amuleto: {t: 'Termo de café', i: 'ui/ap_obj_amuleto.webp', c: 300, st: {regen: 3}},
  herugrim: {t: 'Bate de acero', i: 'ui/ap_obj_herugrim.webp', leg: 1, rec: ['hoja', 'hoja'], c: 500, st: {dano: 50, crit: 0.2}, p: 'Un 20 % de golpes críticos (doble daño).'},
  guthwine: {t: 'Machetes gemelos', i: 'ui/ap_obj_guthwine.webp', leg: 1, rec: ['hoja', 'daga'], c: 450, st: {dano: 28, vatq: 0.35}, p: 'Daño y velocidad de ataque.'},
  escudo: {t: 'Escudo antidisturbios', i: 'ui/ap_obj_escudo.webp', leg: 1, rec: ['cota', 'yelmo'], c: 500, st: {vida: 300, arm: 45, espinas: 0.15}, p: 'Quien te pega cuerpo a cuerpo se lleva un 15 %.'},
  capa: {t: 'Patinete eléctrico', i: 'ui/ap_obj_capa.webp', leg: 1, rec: ['botas', 'amuleto'], c: 400, st: {vel: 0.18, regen: 5, esquiva: 0.12}, p: 'Un 12 % de golpes no te tocan.'},
  hacha: {t: 'Motosierra', i: 'ui/ap_obj_hacha.webp', leg: 1, rec: ['hoja', 'amuleto'], c: 450, st: {dano: 30, robo: 0.12}, p: 'Robo de vida del 12 %.'},
  baculo: {t: 'Bobina de alta tensión', i: 'ui/ap_obj_baculo.webp', leg: 1, rec: ['tomo', 'tomo'], c: 500, st: {poder: 90, mana: 300}, p: 'Mucho poder mágico: las habilidades mágicas pegan bastante más.'},
  narya: {t: 'Generador portátil', i: 'ui/ap_obj_narya.webp', leg: 1, rec: ['tomo', 'manto'], c: 450, st: {poder: 50, rm: 30, vida: 150, mana: 200}, p: 'Poder mágico y protección contra la magia.'},
  velo: {t: 'Traje aislante', i: 'ui/ap_obj_velo.webp', leg: 1, rec: ['manto', 'cota'], c: 450, st: {vida: 300, rm: 50, regen: 3}, p: 'Mucha resistencia mágica: contra magos.'},
  mithril: {t: 'Armadura de kevlar', i: 'ui/ap_obj_mithril.webp', leg: 1, rec: ['cota', 'cota', 'amuleto'], c: 550, st: {vida: 450, arm: 30, rm: 30, regen: 4}, p: 'Ligera y casi irrompible: protege de golpes y de la magia.'},
};
for (const k in OBJ) OBJ[k].c = Math.round(OBJ[k].c * 1.75 / 25) * 25;
{const A = (t, k, o) => Object.assign(k ? HEROES[t].hab[k] : HEROES[t], o); /* equilibrio 22/11 (PULIDO WILD RIFT) */
 A('hobbit', null, {dano: 56, crecD: 4.5, vida: 585, alcance: 6.8}); A('hobbit', 'q', {dano: 125, cd: 6}); A('hobbit', 'e', {dano: 120, alc: 6});
 A('orco', 'q', {curaH: 0.07, d: 'Gira la espada de energía: hiere a los de alrededor y se cura un 7 % de la vida que le falta por cada héroe que toca.'});
 A('rohan', null, {dano: 59}); A('elfo', null, {vida: 555, crecV: 80}); A('elfo', 'q', {dano: 135}); A('gandalf', 'q', {aturde: 1.1, d: 'Lanza un orbe de fuego que atrapa 1,1 s al primero que toca.'}); A('enano', 'q', {dano: 125});} /* 22/11: precios del Wild Rift (ver PULIDO WILD RIFT) */
const PLAN_BOT = {gandalf: ['tomo', 'tomo', 'baculo', 'botas', 'manto', 'tomo', 'narya', 'amuleto', 'capa', 'tomo', 'tomo', 'baculo', 'cota', 'manto', 'velo'], orco: ['hoja', 'cota', 'hacha', 'yelmo', 'escudo', 'botas', 'amuleto', 'cota', 'mithril', 'hoja', 'herugrim', 'hoja', 'daga', 'guthwine', 'amuleto', 'hacha'], rohan: ['hoja', 'hoja', 'herugrim', 'cota', 'yelmo', 'escudo', 'botas', 'amuleto', 'capa', 'cota', 'cota', 'amuleto', 'mithril', 'hoja', 'daga', 'guthwine', 'hoja', 'amuleto', 'hacha'], enano: ['cota', 'yelmo', 'escudo', 'hoja', 'amuleto', 'hacha', 'cota', 'cota', 'amuleto', 'mithril', 'hoja', 'hoja', 'herugrim', 'hoja', 'daga', 'guthwine', 'hoja', 'amuleto', 'hacha'], elfo: ['daga', 'hoja', 'guthwine', 'botas', 'amuleto', 'capa', 'hoja', 'hoja', 'herugrim', 'cota', 'yelmo', 'escudo', 'hoja', 'daga', 'guthwine', 'hoja', 'amuleto', 'hacha'], hobbit: ['hoja', 'amuleto', 'hacha', 'botas', 'amuleto', 'capa', 'hoja', 'daga', 'guthwine', 'cota', 'yelmo', 'escudo', 'hoja', 'daga', 'guthwine', 'hoja', 'amuleto', 'hacha'],
  /* 22/11: Gollum no tenía plan: los bots no compraban NADA con él (por eso perdía todos los duelos) y en la tienda no salía «Recomendado» */
  gollum: ['hoja', 'daga', 'guthwine', 'botas', 'hoja', 'hoja', 'herugrim', 'amuleto', 'capa', 'hoja', 'amuleto', 'hacha', 'cota', 'yelmo', 'escudo'],
  visor: ['tomo', 'tomo', 'baculo', 'botas', 'tomo', 'manto', 'narya', 'amuleto', 'capa', 'tomo', 'tomo', 'baculo', 'manto', 'cota', 'velo']};
PLAN_BOT.hobbit = ['daga', 'hoja', 'guthwine', 'botas', 'hoja', 'hoja', 'herugrim', 'amuleto', 'capa', 'hoja', 'amuleto', 'hacha', 'cota', 'yelmo', 'escudo']; /* 22/11: Birdie es tirador: velocidad de ataque y críticos (antes robo de vida primero) */
/* El mapa en «ojo» (dibujo de Arturo, 14/11): dos caminos curvos de la base de Rohan (abajo a la izquierda) a la de Isengard
   (arriba a la derecha), la espesura en medio con el Uruk azul en el centro y el río (el vado) cruzando por la mitad.
   Todo es simétrico girando 180° alrededor del centro. */
/* Dos mapas:
   · «OJO» (2 contra 2, dibujo de Arturo): dos caminos curvos de Rohan (abajo izquierda) a Isengard (arriba derecha), espesura en medio,
     el Uruk Azul en el centro y el río cruzando; simétrico girando 180°.
   · «LÍNEA» (1 contra 1): un solo camino recto de abajo arriba, espesura a los dos lados, el río por la mitad y el Uruk a un lado del vado;
     simétrico como en un espejo (cada bando su mitad). */
const gira = (p) => ({x: -p.x, z: -p.z}), refleja = (p) => ({x: p.x, z: -p.z});
let MAPA, CARRILES, LARGOS, OJO, EJE, BASES, HIERBAS, CAMPOS, PIT, TIPO_MAPA = '', SIM, ORILLA, RELIQ = [], PIT2 = {x: 400, z: 400}, PLANTAS = [];
function puntoCarril(l, f) {const L = CARRILES[l], c = LARGOS[l], d = f * c[c.length - 1]; for (let i = 1; i < L.length; i++) if (d <= c[i]) {const k = (d - c[i - 1]) / (c[i] - c[i - 1]); return {x: L[i - 1].x + (L[i].x - L[i - 1].x) * k, z: L[i - 1].z + (L[i].z - L[i - 1].z) * k};} return {...L[L.length - 1]};}
function distSeg(px, pz, a, b) {const vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((px - a.x) * vx + (pz - a.z) * vz) / l2)); return Math.hypot(px - a.x - vx * t, pz - a.z - vz * t);}
function distCarril(x, z, l) {let m = 1e9; for (const k of l === undefined ? (TIPO_MAPA === 'ojo' ? [0, 1] : [0]) : [l]) {const L = CARRILES[k]; for (let i = 1; i < L.length; i++) m = Math.min(m, distSeg(x, z, L[i - 1], L[i]));} return m;}
/* cuánto ha avanzado un punto por un camino (0 en Rohan, 1 en Isengard) */
function progreso(l, p) {const L = CARRILES[l], c = LARGOS[l]; let mejor = 1e9, f = 0; for (let i = 1; i < L.length; i++) {const a = L[i - 1], b = L[i], vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.z - a.z) * vz) / l2)), d = Math.hypot(p.x - a.x - vx * t, p.z - a.z - vz * t); if (d < mejor) {mejor = d; f = (c[i - 1] + t * (c[i] - c[i - 1])) / c[c.length - 1];}} return f;}
function dentroOjo(x, z) {if (!OJO) return Math.abs(x) < MAPA.ancho && Math.abs(z) < MAPA.largo; let c = false; for (let i = 0, j = OJO.length - 1; i < OJO.length; j = i++) {const a = OJO[i], b = OJO[j]; if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) c = !c;} return c;}
const ladoDe = (p) => p.x * EJE.x + p.z * EJE.z;        /* < 0 lado de Rohan, > 0 lado de Isengard */
const TORRE_F = 0.27;                                   /* las torres de camino, al 27 % desde su base */
const enHierba = (u) => HIERBAS.findIndex((b) => Math.hypot(u.x - b.x, u.z - b.z) < b.r);
/* ---------- LA CIUDAD (22/11, Henar: «un mapa de autopistas sin ríos, del que sentirme orgulloso»): la Batalla 2 contra 2 de A-6 ----------
   Dos autopistas casi paralelas (34 m de una a otra) de peaje a peaje; entre ellas el barrio (la jungla): manzanas de edificios con calles,
   solares y plazas donde viven las bestias; una avenida cruza por la mitad con una glorieta (la rata). Fuera de las autopistas, el colector
   de Nasor (oeste) y la central del lagarto (este), cada uno con una sola boca a su autopista. Simétrico girando 180°.
   Los edificios son rectángulos sólidos (RECTS): choque exacto, sin las paredes a trompicones de los árboles. */
let RECTS = [];
const CIU = {
  carril: [{x: 0, z: 46}, {x: -9, z: 39}, {x: -17, z: 28}, {x: -17, z: 0}, {x: -17, z: -28}, {x: -9, z: -39}, {x: 0, z: -46}],
  base: {fuente: {x: 0, z: 56}, nexo: {x: 0, z: 51}, torre: {x: 0, z: 42.5}},
  /* manzanas del lado azul [x0, z0, x1, z1]; las del rojo salen girando */
  bloques: [[-12, 3, -8.5, 10], [-12, 14.5, -8.5, 23.5], [-8.5, 3, -3, 6.5], [-8.5, 17, -2.5, 21], [-8.5, 28.5, -3.5, 31.5], [-5.5, 31.5, -3, 35.5],
    [8.5, 3, 12, 6.5], [8.5, 10.5, 12, 17.5], [8.5, 22, 12, 26.5], [2.5, 13, 8.5, 17], [3.5, 27, 8.5, 31], [3, 31, 5.5, 35.5],
    [-34, 8, -22, 40], [-24, 3, -22, 8], [22, 12, 34, 40], [22, 7, 24, 12], [-34, 40, -14.5, 60], [14.5, 40, 34, 60]],
  campos: [{x: -5.5, z: 12, tipo: 'huorn', n: 1}, {x: -5.5, z: 25, tipo: 'warg', n: 2}, {x: 5.5, z: 9, tipo: 'crebain', n: 4}, {x: 5.5, z: 22, tipo: 'troll', n: 1}, {x: 0, z: 31, tipo: 'sapo', n: 1}],
  plantas: [{x: 5.5, z: 4.6, tipo: 'baya'}, {x: -1, z: 24.5, tipo: 'flor'}, {x: -5.5, z: 16, tipo: 'seta'}],
  hierbas: [{x: -10.3, z: 12.25, r: 2.4}, {x: -10.3, z: 26, r: 2.4}, {x: 10.3, z: 8.5, r: 2.4}, {x: 10.3, z: 19.75, r: 2.4}, {x: -9, z: 1.3, r: 2.4}, {x: 0, z: 18, r: 2.2}],
  /* calles para los bots (del lado azul; 'L' = a la autopista más cercana) */
  nodos: {rot: {x: 0, z: 0}, avO: {x: -9, z: 0}, c6: {x: 0, z: 6.5}, c12: {x: 0, z: 12}, c19: {x: 0, z: 18.5}, c25: {x: 0, z: 24.5}, pO1: {x: -10.3, z: 12.25}, pO2: {x: -10.3, z: 26}, pE1: {x: 10.3, z: 8.5}, pE2: {x: 10.3, z: 19.75}, bC: {x: 0, z: 37.5}},
  calles: [['rot', 'avO'], ['avO', 'L'], ['rot', 'c6'], ['c6', 'c12'], ['c12', 'c19'], ['c19', 'c25'], ['c25', 'sapo'], ['sapo', 'bC'], ['bC', 'L'],
    ['huorn', 'c12'], ['huorn', 'pO1'], ['pO1', 'L'], ['warg', 'c25'], ['warg', 'pO2'], ['pO2', 'L'], ['crebain', 'c6'], ['crebain', 'pE1'], ['crebain', 'rot'], ['pE1', 'L'], ['troll', 'c19'], ['troll', 'pE2'], ['pE2', 'L']],
};
function ponCiudad() {
  MAPA = {ancho: 34, largo: 58}; SIM = gira; EJE = {x: 0, z: -1}; PIT = {x: -28, z: -2}; PIT2 = gira(PIT);
  const A = CIU.carril; CARRILES = [A, A.map(gira).reverse()];
  const R = CIU.base; BASES = [R, {fuente: gira(R.fuente), nexo: gira(R.nexo), torre: gira(R.torre)}];
  const C = CIU.campos; CAMPOS = [...C, ...C.map((c) => ({...c, ...gira(c)})), {x: PIT.x, z: PIT.z, tipo: 'uruk', n: 1}, {x: PIT2.x, z: PIT2.z, tipo: 'draco', n: 1}, {x: 0, z: 0, tipo: 'nutria', n: 1}];
  PLANTAS = [...CIU.plantas, ...CIU.plantas.map((q) => ({...q, ...gira(q)}))];
  ORILLA = [];
  RECTS = [...CIU.bloques, ...CIU.bloques.map((b) => [-b[2], -b[3], -b[0], -b[1]])];
}
/* empuja fuera de las manzanas (por el lado más corto) */
function chocaRects(u, m) {
  for (let i = 0; i < RECTS.length; i++) {const r = RECTS[i];
    if (u.x <= r[0] - m || u.x >= r[2] + m || u.z <= r[1] - m || u.z >= r[3] + m) continue;
    const a = u.x - (r[0] - m), b = r[2] + m - u.x, c = u.z - (r[1] - m), d = r[3] + m - u.z, k = Math.min(a, b, c, d);
    if (k === a) u.x = r[0] - m; else if (k === b) u.x = r[2] + m; else if (k === c) u.z = r[1] - m; else u.z = r[3] + m;}
}
/* ¿cruza una manzana el segmento a-b? (con margen) — también los núcleos y las torres de las bases, que están en medio del paso */
function cortaRects(a, b, m) {
  for (const B of BASES) for (let j = 0; j < 2; j++) {const q = j ? B.torre : B.nexo, r = j ? 1.9 : 2.4; if (distSeg(q.x, q.z, a, b) < r + m + 0.2 && Math.hypot(a.x - q.x, a.z - q.z) > r + 0.3) return true;}
  const dx = b.x - a.x, dz = b.z - a.z;
  for (let i = 0; i < RECTS.length; i++) {const r = RECTS[i]; let t0 = 0, t1 = 1, fuera = false;
    for (let k = 0; k < 4 && !fuera; k++) {const p = k === 0 ? -dx : k === 1 ? dx : k === 2 ? -dz : dz, q = k === 0 ? a.x - (r[0] - m) : k === 1 ? r[2] + m - a.x : k === 2 ? a.z - (r[1] - m) : r[3] + m - a.z;
      if (p === 0) {if (q < 0) fuera = true;} else {const t = q / p; if (p < 0) {if (t > t1) fuera = true; else if (t > t0) t0 = t;} else {if (t < t0) fuera = true; else if (t < t1) t1 = t;}}}
    if (!fuera && t0 <= t1) return true;}
  return false;
}
function navCiudad() {
  const nodos = [], aristas = [], idx = new Map(), add = (p, extra) => {nodos.push({x: p.x, z: p.z, ...extra}); return nodos.length - 1;};
  const ruta = CARRILES.map(() => []);
  CARRILES.forEach((L, l) => L.forEach((p, i) => {const k = p.x + ',' + p.z; if (!idx.has(k)) idx.set(k, add(p, {carril: true})); ruta[l].push(idx.get(k));}));
  for (const r of ruta) for (let i = 1; i < r.length; i++) aristas.push([r[i - 1], r[i]]);
  const camp = CAMPOS.map((c) => add(c, {campo: true}));
  const d = (a, b) => Math.hypot(nodos[a].x - nodos[b].x, nodos[a].z - nodos[b].z);
  /* puerta a la autopista: el punto más cercano del carril, metido en él */
  const aLinea = (c) => {let m = null; CARRILES.forEach((L) => {for (let i = 1; i < L.length; i++) {const a = L[i - 1], b = L[i], vx = b.x - a.x, vz = b.z - a.z, t = Math.max(0, Math.min(1, ((nodos[c].x - a.x) * vx + (nodos[c].z - a.z) * vz) / (vx * vx + vz * vz))), x = a.x + vx * t, z = a.z + vz * t, dd = Math.hypot(nodos[c].x - x, nodos[c].z - z); if (!m || dd < m.d) m = {d: dd, x, z, a: idx.get(a.x + ',' + a.z), b: idx.get(b.x + ',' + b.z)};}}); const n = add({x: m.x, z: m.z}, {carril: true, puerta: true}); aristas.push([m.a, n], [n, m.b], [c, n]);};
  for (const s of [0, 1]) {
    const T = s ? gira : (p) => p, mio = new Map();
    for (const k in CIU.nodos) {const p = T(CIU.nodos[k]), key = p.x + ',' + p.z; if (!idx.has(key)) idx.set(key, add(p, {})); mio.set(k, idx.get(key));}
    CIU.campos.forEach((c, i) => mio.set(c.tipo, camp[i + s * CIU.campos.length]));
    for (const [a, b] of CIU.calles) {const ia = mio.get(a); if (b === 'L') {aLinea(ia); continue;} const ib = mio.get(b); if (!aristas.some(([x, y]) => (x === ia && y === ib) || (x === ib && y === ia))) aristas.push([ia, ib]);}
  }
  const iU = camp[CAMPOS.findIndex((c) => c.tipo === 'uruk')], iD = camp[CAMPOS.findIndex((c) => c.tipo === 'draco')], iN = camp[CAMPOS.findIndex((c) => c.tipo === 'nutria')];
  aLinea(iU); aLinea(iD); aristas.push([iN, idx.get('0,0')]);
  /* de la fuente a la autopista rodeando el núcleo (está en medio): dos pasos a los lados */
  for (const b of BASES) {const p = CARRILES[0][b === BASES[0] ? 0 : CARRILES[0].length - 1], f = add(b.fuente, {}), n = idx.get(p.x + ',' + p.z);
    for (const sg of [1, -1]) {const l = add({x: b.nexo.x + sg * 4.3, z: b.nexo.z}, {}); aristas.push([f, l], [l, n]);}}
  const vec = nodos.map(() => []); for (const [a, b] of aristas) {vec[a].push(b); vec[b].push(a);}
  return {nodos, aristas, vec, d};
}

function ponHechC(tipo) {Object.assign(HECHIZOS.c, tipo === 'ojo' ? {n: 'Castigo', cd: 60, icono: 'ui/ap_hz_castigo.webp'} : {n: 'Ignición', cd: 90, icono: 'ui/ap_hz_ignicion.webp'});}
function ponMapa(modo) {
  const tipo = modo === '2v2' ? 'ojo' : 'linea'; ponHechC(tipo); if (tipo === TIPO_MAPA) return false; TIPO_MAPA = tipo;
  if (tipo === 'ojo') {
    ponCiudad();
  } else {
    /* 1 contra 1 en «el Abismo», como el Abismo de los Lamentos del ARAM (donde el Wild Rift juega su Duelo):
       un único puente recto, sin espesura ni bestias, matorrales a los lados y 4 reliquias de vida */
    MAPA = {ancho: 10.5, largo: 58}; SIM = refleja; EJE = {x: 0, z: -1}; PIT = {x: 400, z: 400}; PIT2 = {x: 400, z: -400}; PLANTAS = [];
    const A = [{x: 0, z: 46}, {x: 0, z: 31}, {x: 0, z: 15}, {x: 0, z: 0}, {x: 0, z: -15}, {x: 0, z: -31}, {x: 0, z: -46}];
    CARRILES = [A, A];
    const R = {fuente: {x: 0, z: 55}, nexo: {x: 0, z: 49.5}, torre: {x: 0, z: 41}};
    BASES = [R, {fuente: refleja(R.fuente), nexo: refleja(R.nexo), torre: refleja(R.torre)}];
    const C = [{x: -12, z: 18, tipo: 'warg', n: 2}, {x: 12, z: 26, tipo: 'warg', n: 2}, {x: -13, z: 35, tipo: 'orco', n: 3}, {x: 14, z: 13, tipo: 'troll', n: 1}, {x: -15, z: 7, tipo: 'alfa', n: 1}];
    CAMPOS = [];
    ORILLA = []; RECTS = [];
  }
  LARGOS = CARRILES.map((L) => {const c = [0]; for (let i = 1; i < L.length; i++) c.push(c[i - 1] + Math.hypot(L[i].x - L[i - 1].x, L[i].z - L[i - 1].z)); return c;});
  OJO = tipo === 'ojo' ? [...CARRILES[0], ...CARRILES[1].slice().reverse()] : null;
  /* hierba alta (como los matorrales del Wild Rift): dentro no te ven los héroes enemigos salvo que estén a tu lado */
  HIERBAS = [];
  for (const l of tipo === 'ojo' ? [0, 1] : [0]) for (const [f, lado] of [[0.36, 1], [0.5, -1], [0.64, 1]]) for (const sgn of tipo === 'ojo' ? [0] : [1, -1]) {
    const p = puntoCarril(l, f), q = puntoCarril(l, Math.min(1, f + 0.01)), tx = q.x - p.x, tz = q.z - p.z, tl = Math.hypot(tx, tz) || 1, nx = -tz / tl, nz = tx / tl;
    const haciaDentro = Math.sign((PIT.x - p.x) * nx + (PIT.z - p.z) * nz) || 1, s2 = sgn || lado * haciaDentro, d = tipo === 'ojo' ? (lado > 0 ? 6.2 : 5.6) : 7.2;
    HIERBAS.push({x: p.x + nx * s2 * d, z: p.z + nz * s2 * d, r: 2.4});
  }
  if (tipo === 'ojo') HIERBAS = [...CIU.hierbas, ...CIU.hierbas.map((h) => ({...h, ...gira(h)}))];
  for (const q of ORILLA) HIERBAS.push({...q, r: 2.4});
  /* reliquias de vida del ARAM: dos por lado, una delante de la torre de camino y otra detrás; salen a 1:45 y 2:30 y vuelven 90 s después de cogerlas */
  RELIQ = [];
  if (tipo === 'linea') RELIQ.push({x: 0, z: 0, t0: 105});
  ARB.clear(); FUEGOS.length = 0;
  NAV = haceNav();
  return true;
}
const ARB = new Map(); const FUEGOS = [], LUCES = []; let NAV = null; const arbKey = (x, z) => Math.floor(x / 4) + ',' + Math.floor(z / 4);
function ponArbolChoque(x, z, r) {const k = arbKey(x, z); if (!ARB.has(k)) ARB.set(k, []); ARB.get(k).push({x, z, r});}
/* el bosque: lo mismo en el móvil (para dibujarlo) y en el servidor (para los choques) */
function plantaBosque(al, planta, enBase) {
  if (TIPO_MAPA === 'ojo') return;  /* la ciudad no tiene bosque: sus manzanas son RECTS */
  const sendas = NAV.aristas.filter(([a, b]) => !(NAV.nodos[a].carril && NAV.nodos[b].carril)).map(([a, b]) => [NAV.nodos[a], NAV.nodos[b]]);
  enBase = enBase || ((x, z) => BASES.some((b) => Math.hypot(b.fuente.x - x, b.fuente.z - z) < 10 || Math.hypot(b.nexo.x - x, b.nexo.z - z) < 9 || Math.hypot(b.torre.x - x, b.torre.z - z) < 6));
  for (let x = -58; x <= 58; x += 2.6) for (let z = -84; z <= 84; z += 2.6) {
    const muro = TIPO_MAPA === 'ojo' && dentroOjo(x, z), jt = muro ? 0.5 : 1.5, H = muro ? 1 : 0;  /* muro = jungla del 2v2 */
    const px = x + (al() - 0.5) * jt, pz = z + (al() - 0.5) * jt, dc = distCarril(px, pz), juego = Math.abs(px) < MAPA.ancho + 1 && Math.abs(pz) < MAPA.largo + 1;
    if (dc < (muro ? 6.3 : 4.7) || enBase(px, pz)) continue;
    if (juego) {
      if (Math.hypot(px - PIT.x, pz - PIT.z) < 8.5 || Math.hypot(px - PIT2.x, pz - PIT2.z) < 8.5 || PLANTAS.some((q) => Math.hypot(q.x - px, q.z - pz) < 2.6 + H * 0.9) || Math.abs(ladoDe({x: px, z: pz})) < 2.6 + H * 1.2 || CAMPOS.some((c) => Math.hypot(c.x - px, c.z - pz) < (NEUTRO[c.tipo].grande ? 7 : 5.5) - H * 0.5) || HIERBAS.some((b) => Math.hypot(b.x - px, b.z - pz) < b.r + 1.3 - H * 0.6) || sendas.some(([a, b]) => distSeg(px, pz, a, b) < 3.2)) continue;
      if (TIPO_MAPA === 'linea' && Math.abs(px) < 10.2) continue;
    }
    const isen = ladoDe({x: px, z: pz}) > 0, r = al();
    const n = isen ? (r < 0.3 ? 'arbol_muerto_0' + (1 + (r < 0.12 ? 1 : 0)) : 'pino_0' + (1 + Math.floor(al() * 4))) : (r < 0.45 ? 'roble_0' + (1 + Math.floor(al() * 3)) : 'pino_0' + (1 + Math.floor(al() * 4)));
    const jO = juego && TIPO_MAPA === 'ojo', dO = jO && dentroOjo(px, pz), nJ = dO ? 'roble_0' + (1 + Math.floor(r * 9) % 3) : n; planta(nJ, px, pz, ((nJ.startsWith('roble') ? 0.6 : 0.8) + al() * 0.35) * (dO ? 1.4 : jO ? 0.85 : 1), juego && !muro); if (juego && muro) ponArbolChoque(px, pz, 1.3);
  }
}
function lineaLibre(a, b) {if (RECTS.length && cortaRects(a, b, 0.25)) return false; const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / 1.2); for (let i = 1; i < n; i++) {const x = a.x + (b.x - a.x) * i / n, z = a.z + (b.z - a.z) * i / n, l = ARB.get(arbKey(x, z)); if (l) for (const t of l) if (Math.hypot(t.x - x, t.z - z) < t.r + 0.6) return false;} return true;}
const NEUTRO = {
  warg: {nombre: 'Perro asilvestrado', vida: 560, dano: 26, alcance: 1.9, vatq: 0.9, vel: 5, oro: 45, xp: 55, modelo: 'ap_perro', alto: 1.2},
  orco: {nombre: 'Perro asilvestrado', vida: 430, dano: 22, alcance: 1.8, vatq: 1, vel: 4.4, oro: 35, xp: 40, modelo: 'ap_perro', alto: 1.2},
  troll: {rad: 1.3, nombre: 'Toro negro', vida: 2200, dano: 60, alcance: 2.8, vatq: 0.55, vel: 3.6, oro: 120, xp: 200, modelo: 'ap_toro', alto: 2.86, buff: 'troll', grande: true},
  /* la jungla del LoL a la manera de la Tierra Media (Pack Vado 9): rapaces → crebain, Gromp → sapo, azul → Huorn, dragón → draco, cangrejo → nutria */
  crebain: {nombre: 'Buitre', vida: 300, dano: 16, alcance: 1.6, vatq: 1.1, vel: 5, oro: 22, xp: 28, modelo: 'ap_buitre', alto: 0.3},
  sapo: {rad: 0.8, nombre: 'Jabalí', vida: 1300, dano: 38, alcance: 2.2, vatq: 0.7, vel: 3.4, oro: 80, xp: 110, modelo: 'ap_jabali', alto: 1.4},
  huorn: {rad: 1.3, nombre: 'Coloso del desguace', vida: 1900, dano: 46, alcance: 2.8, vatq: 0.6, vel: 3.2, oro: 110, xp: 180, modelo: 'ap_coloso', alto: 3.5, buff: 'huorn', grande: true},
  draco: {nombre: 'Lagarto de la central', vida: 2800, dano: 72, alcance: 3.2, vatq: 0.6, vel: 3.6, oro: 150, xp: 260, modelo: 'ap_lagarto', alto: 2.6, grande: true, draco: true},
  nutria: {nombre: 'Rata de alcantarilla', vida: 900, dano: 0, alcance: 0, vatq: 1, vel: 3.2, oro: 70, xp: 90, modelo: 'ap_rata', alto: 0.6, pasiva: true},
  alfa: {nombre: 'Perro jefe', vida: 1800, dano: 50, alcance: 2.2, vatq: 0.8, vel: 5, oro: 110, xp: 180, modelo: 'ap_perro_jefe', alto: 2.0, buff: 'alfa', grande: true},
  /* el «Barón» del Vado: un uruk enorme y azulado en el centro; da la Furia del Uruk a todo el equipo */
  uruk: {nombre: 'Nasor', vida: 3800, dano: 105, alcance: 3.2, vatq: 0.5, vel: 3.4, oro: 250, xp: 400, modelo: 'ap_nasor', alto: 5.6, buff: 'uruk', grande: true, jefe: true},
};
for (const k in NEUTRO) {const n = NEUTRO[k]; if (n.jefe || n.draco) {n.oro = Math.round(n.oro * 1.3); continue;} if (n.pasiva) {n.oro = Math.round(n.oro * 1.4); n.xp = Math.round(n.xp * 1.3); continue;}
  n.vida = Math.round(n.vida * 0.7); n.dano = Math.round(n.dano * 0.65); n.oro = Math.round(n.oro * 1.4); n.xp = Math.round(n.xp * 1.3);}
const BUFF_TXT = {troll: 'Brasa del toro: tus golpes queman y frenan durante 2 min', huorn: 'Turbo del coloso: habilidades un 20 % más rápidas y más regeneración durante 2 min', alfa: 'Aullido del alfa: corres más y te curas deprisa durante 2 min', uruk: 'Furia de Nasor: todo el equipo pega más, se cura más y sus soldados salen más fuertes durante 3 min'};
/* red de caminos para los bots: puntos de los dos caminos, cubiles y fuentes; los árboles nunca se ponen encima de estas sendas */
function haceNav() {
  if (TIPO_MAPA === 'ojo') return navCiudad();
  const nodos = [], aristas = [], idx = new Map(), add = (p, extra) => {nodos.push({x: p.x, z: p.z, ...extra}); return nodos.length - 1;};
  const ruta = CARRILES.map(() => []);
  CARRILES.forEach((L, l) => L.forEach((p, i) => {const k = p.x + ',' + p.z; if (!idx.has(k)) idx.set(k, add(p, {carril: true})); ruta[l].push(idx.get(k));}));
  for (const r of ruta) for (let i = 1; i < r.length; i++) aristas.push([r[i - 1], r[i]]);
  const camp = CAMPOS.map((c) => add(c, {campo: true}));
  const carriles = nodos.map((n, i) => i).filter((i) => nodos[i].carril);
  const d = (a, b) => Math.hypot(nodos[a].x - nodos[b].x, nodos[a].z - nodos[b].z);
  const SENDAS_J = [['sapo', 'L'], ['sapo', 'warg'], ['sapo', 'crebain'], ['warg', 'huorn'], ['warg', 'crebain'], ['huorn', 'L'], ['huorn', 'uruk'],
    ['crebain', 'troll'], ['crebain', 'nutria'], ['troll', 'L'], ['troll', 'draco'], ['huorn', 'nutria']];
  if (TIPO_MAPA === 'ojo') {
    const lado = (c) => nodos[c].x * EJE.x + nodos[c].z * EJE.z, pits = new Set(['uruk', 'draco', 'nutria']);
    const deTipo = (t, s) => camp.find((c) => CAMPOS[c - camp[0]].tipo === t && (pits.has(t) || Math.sign(lado(c)) === s));
    const aLinea = (c) => {let m = null; CARRILES.forEach((L) => {for (let i = 1; i < L.length; i++) {const a = L[i - 1], b = L[i], vx = b.x - a.x, vz = b.z - a.z, t = Math.max(0, Math.min(1, ((nodos[c].x - a.x) * vx + (nodos[c].z - a.z) * vz) / (vx * vx + vz * vz))), x = a.x + vx * t, z = a.z + vz * t, dd = Math.hypot(nodos[c].x - x, nodos[c].z - z); if (!m || dd < m.d) m = {d: dd, x, z, a: idx.get(a.x + ',' + a.z), b: idx.get(b.x + ',' + b.z)};}}); const n = add({x: m.x, z: m.z}, {carril: true, puerta: true}); aristas.push([m.a, n], [n, m.b], [c, n]);};
    for (const s of [-1, 1]) for (const [p, q] of SENDAS_J) {const a = deTipo(p, s); if (a === undefined) continue; if (q === 'L') {aLinea(a); continue;} const b = deTipo(q, s); if (b !== undefined && !aristas.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) aristas.push([a, b]);}
    const pz = ['uruk', 'draco'].map((t) => deTipo(t)), nu = deTipo('nutria'); for (const c of pz) aristas.push([c, nu]);
  } else for (const c of camp) {
    const cerca = (lista, n, max) => lista.filter((i) => i !== c).sort((a, b) => d(c, a) - d(c, b)).slice(0, n).filter((i) => d(c, i) < max);
    for (const i of cerca(carriles, 2, 24)) aristas.push([c, i]);
    for (const i of cerca(camp, nodos[c].x === 0 && nodos[c].z === 0 ? 4 : 2, 26)) aristas.push([c, i]);
  }
  for (const b of BASES) {const p = CARRILES[0][b === BASES[0] ? 0 : CARRILES[0].length - 1], f = add(b.fuente, {}), n = idx.get(p.x + ',' + p.z); aristas.push([f, n]);}
  const vec = nodos.map(() => []); for (const [a, b] of aristas) {vec[a].push(b); vec[b].push(a);}
  return {nodos, aristas, vec, d};
}
function camino(desde, hasta) {
  const N = NAV.nodos, cerca = (p) => {let m = -1, md = 1e9; N.forEach((n, i) => {const dd = Math.hypot(n.x - p.x, n.z - p.z) + (lineaLibre(p, n) ? 0 : 40); if (dd < md) {md = dd; m = i;}}); return m;};
  const a = cerca(desde), b = cerca(hasta), dist0 = N.map(() => 1e9), prev = N.map(() => -1), hecho = N.map(() => false); dist0[a] = 0;
  for (;;) {let u = -1; for (let i = 0; i < N.length; i++) if (!hecho[i] && (u < 0 || dist0[i] < dist0[u])) u = i; if (u < 0 || dist0[u] >= 1e9 || u === b) break; hecho[u] = true; for (const v of NAV.vec[u]) {const nd = dist0[u] + NAV.d(u, v); if (nd < dist0[v]) {dist0[v] = nd; prev[v] = u;}}}
  const r = []; for (let u = b; u >= 0; u = prev[u]) r.unshift(N[u]); return r;
}
/* súbditos: a los héroes les quitan poco (como en el Wild Rift, un 2 % de la vida de un héroe por golpe al principio); entre ellos se pegan más */
const SUBD = {m: {vida: 380, dano: 12, alcance: 1.9, vatq: 0.85, vel: 3.4, oro: 22, xp: 32}, r: {vida: 270, dano: 16, alcance: 6, vatq: 0.75, vel: 3.4, oro: 16, xp: 26}, a: {vida: 1100, dano: 30, alcance: 2.3, vatq: 0.6, vel: 3.1, oro: 60, xp: 70, muros: 3}};
const SUBD_X = {s: 1.6, t: 2.2, n: 2.2};
/* supersúbdito (Wild Rift: sale cuando cae la torre de la base enemiga, en lugar del de asedio): mucha vida, pega fuerte,
   las torres le quitan un 7 % de su vida por golpe, hace la mitad a las estructuras y protege a los súbditos de al lado */
SUBD.x = {vida: 1500, dano: 40, alcance: 2.2, vatq: 0.85, vel: 3.3, oro: 60, xp: 90, muros: 1.1};
/* encantamientos de botas (Wild Rift): mejoran las botas y dan un botón propio; uno a la vez (se puede cambiar) */
const ENC = {
  estasis: {t: 'Airbag', i: 'ui/ap_enc_estasis.webp', c: 400, cd: 120, d: 'Te vuelves invulnerable 2,5 s, pero no puedes moverte ni atacar.'},
  gargola: {t: 'Jaula antivuelco', i: 'ui/ap_enc_gargola.webp', c: 200, cd: 45, d: '+40 % de vida durante 4 s, pero haces un 60 % menos de daño.'},
  azogue: {t: 'Nitro', i: 'ui/ap_enc_azogue.webp', c: 320, cd: 70, d: 'Te quita aturdimientos y frenos y corres un 50 % más 1,5 s.'},
  medallon: {t: 'Bengala de emergencia', i: 'ui/ap_enc_medallon.webp', c: 200, cd: 90, d: 'Escudo para ti y los aliados cercanos durante 2,5 s.'},
};
const tieneBotas = (inv) => inv.includes('botas') || inv.includes('capa');
/* Duelo (modo 1 contra 1 del Wild Rift): gana quien derriba 2 veces al rival o tira la primera torre; en el minuto 8 aparece
   un anillo de fuego que cubre el mapa, a los 30 s empieza a cerrarse y 1:30 después mide 5 m; fuera quema; con el anillo, 1 derribo gana.
   Oro y experiencia aumentados. */
/* activo: false (16/11, pedido de Arturo): en el Duelo solo se gana tirando el estandarte, como en la Batalla; ni derribos, ni primera torre, ni anillo */
const DUELO = {activo: false, anillo: 480, cierra: 30, dura: 90, r0: 62, r1: 5, quema: 0.06, botin: 1.5};
const radioAnillo = (t) => !DUELO.activo || t < DUELO.anillo ? 0 : t < DUELO.anillo + DUELO.cierra ? DUELO.r0 : DUELO.r0 + (DUELO.r1 - DUELO.r0) * Math.min(1, (t - DUELO.anillo - DUELO.cierra) / DUELO.dura);
/* desde el minuto 5 las hordas pegan cada vez más fuerte a las torres, para que las partidas no se eternicen */
const asedio = () => 1 + Math.max(0, (S.t - 300) / 240);   /* multiplicador contra súbditos y contra torres/estandarte */
const MODELO_SUBD = [{m: 'ap_sub_azul_m', r: 'ap_sub_azul_r', a: 'ap_sub_azul_m', x: 'ap_super_azul'}, {m: 'ap_sub_rojo_m', r: 'ap_sub_rojo_r', a: 'ap_sub_rojo_m', x: 'ap_super_rojo'}];
const ALTO_SUBD = {m: 1.7, r: 1.6, a: 2.6, x: 2.7};
const signo = (eq) => eq === 0 ? 1 : -1;
const ORDA = 3;   /* cuerpo a cuerpo por oleada y camino (más 2 arqueros) */



let idSig = 1;

function nuevaPartida(jugadores, modo) {
  S = {t: 0, u: [], proy: [], zonas: [], dif: [], reliq: RELIQ.map((r) => ({...r, listo: r.t0})), bufEq: [{}, {}], plantas: PLANTAS.map((q) => ({...q, listo: 90})), santuarios: [], visiones: [], dracoSig: Math.random() < 0.5 ? 'f' : 'h', campos: CAMPOS.map((c) => ({...c, resp: NEUTRO[c.tipo].jefe ? 360 : NEUTRO[c.tipo].draco ? 150 : NEUTRO[c.tipo].pasiva ? 90 : NEUTRO[c.tipo].grande ? 75 : 30, vivos: 0})), ev: [], ola: 5, oleadaN: 0, muertes: [0, 0], fin: -1, modo};
  idSig = 1;
  const plazas = modo === '2v2' ? 4 : 2; S.carriles = modo === '2v2' ? [0, 1] : [0];
  for (let slot = 0; slot < plazas; slot++) {
    const j = jugadores.find((q) => q.slot === slot);
    const esBot = !j || !!j.bot; /* 18/11: contra la máquina se puede elegir el héroe del bot rival ({slot, heroe, bot: true}) */
    const tipo = j && j.heroe && HEROES[j.heroe] ? j.heroe : Object.keys(HEROES)[(slot * 5 + 1) % Object.keys(HEROES).length];
    const eq = slot % 2, f = BASES[eq].fuente, x = f.x + (slot >= 2 ? 1.5 : -1.5), z0 = f.z - signo(eq) * 2.5;
    const b = HEROES[tipo] || HEROES.rohan;
    S.u.push({id: idSig++, k: 'h', eq, tipo, slot, bot: esBot, nombre: !esBot ? j.nombre : 'Bot ' + b.nombre.replace(/^(El|La) /, '').split(/[ ,]/)[0], x, z: z0, rot: eq ? 0 : Math.PI, carril: slot >= 2 && modo === '2v2' ? 1 : 0,
      vida: b.vida, max: b.vida, mana: b.mana, nivel: 1, xp: 0, oro: 650, vg: 1, vgT: 210, inv: [], enc: '', hf: j && j.hech === 'c' ? 'c' : 'f', modoAt: '', fijo: 0, cd: {q: 0, w: 0, e: 0, r: 0, a: 0, d: 0, f: 0}, rk: {q: 0, w: 0, e: 0, r: 0}, pts: 1, muertes: 0, asist: 0, cs: 0, racha: 0, hierba: -1, multi: 0, multiT: -99, danos: {}, buf: {}, resp: 0, muerto: false, ac: 0, hc: 0, hk: '', mueve: false, ataca: false, mx: 0, mz: 0, kills: 0, plan: 0});
  }
  for (const eq of [0, 1]) {
    /* «los soles» del dibujo: una torre en cada camino y otra delante del estandarte */
    for (const l of S.carriles) {const p = puntoCarril(l, eq ? 1 - TORRE_F : TORRE_F); const vt = modo === '2v2' ? 2000 : 1200; S.u.push({id: idSig++, k: 't', eq, n: 1, carril: l, x: p.x, z: p.z, vida: vt, max: vt, cd: 0, rad: 1.6});}
    const b = BASES[eq];
    const vb = modo === '2v2' ? 2600 : 1600, vn = modo === '2v2' ? 3000 : 2000;
    S.u.push({id: idSig++, k: 't', eq, n: 2, x: b.torre.x, z: b.torre.z, vida: vb, max: vb, cd: 0, rad: 1.6});
    S.u.push({id: idSig++, k: 'n', eq, x: b.nexo.x, z: b.nexo.z, vida: vn, max: vn, rad: 2});
  }
}
const heroes = () => S.u.filter((u) => u.k === 'h');
function stats(h) {
  const b = HEROES[h.tipo], n = h.nivel - 1, st = {vida: b.vida + b.crecV * n, dano: b.dano + b.crecD * n, vatq: b.vatq, alcance: b.alcance, vel: b.vel, reduc: 0, regen: 1.5, crit: 0, robo: 0, espinas: 0, esquiva: 0, arm: (b.arm || 25) + 3 * n, rm: (b.rm || 25) + 1.5 * n, poder: 0, mana: b.mana + b.crecM * n, rmana: 3 + 0.3 * n};
  let va = 0, ve = 0;
  for (const id of h.inv) {const o = OBJ[id].st; st.vida += o.vida || 0; st.dano += o.dano || 0; va += o.vatq || 0; ve += o.vel || 0; st.reduc += o.reduc || 0; st.arm += o.arm || 0; st.rm += o.rm || 0; st.poder += o.poder || 0; st.mana += o.mana || 0; st.regen += o.regen || 0; st.crit += o.crit || 0; st.robo += o.robo || 0; st.espinas += o.espinas || 0; st.esquiva += o.esquiva || 0;}
  const be = S && S.bufEq[h.eq] || {};
  if (be.drF) st.dano *= 1 + 0.06 * be.drF; if (be.drH) st.vida *= 1 + 0.06 * be.drH; if (be.alma) {st.dano *= 1.1; st.vida *= 1.1;}
  if (h.buf.huorn > 0) {st.regen += 4; st.rmana += 3 + st.mana * 0.01;} /* la Savia es la «azul» del LoL: también da energía */
  if (S && S.santuarios.some((z) => z.eq === h.eq && z.hasta > S.t && Math.hypot(h.x - z.x, h.z - z.z) < z.r)) ve += 0.3;
  if (h.buf.alfa > 0) {ve += 0.15; st.regen += 6;}
  if (S && be.uruk > S.t) {st.dano *= 1.3; if (st.poder) st.poder *= 1.3; st.regen += 12; st.vel *= 1.08;}
  if (h.buf.rafaga > 0) va += 0.6;
  if (h.buf.suerte > 0) {ve += 0.5; st.dano *= 1.35;}
  if (h.buf.invis > 0 && !(h.tipo === 'hobbit' && h.buf.escond > 0)) ve += 0.35;
  if (h.tipo === 'gollum' && h.hierba >= 0) st.alcance = 6;
  if (h.buf.furiaO > 0) st.dano *= 1.3;
  if (h.buf.azogue > 0) ve += 0.5;
  if (h.buf.casa > 0) ve += 0.4;
  if (h.buf.gargola > 0) st.vida *= 1.4;
  if (h.buf.prisa > 0) ve += 0.3;
  if (h.buf.lento > 0) ve -= h.buf.lentoV || 0.35;
  st.vatq *= 1 + va; st.vel *= Math.max(0.3, 1 + ve);
  if (h.buf.reduce > 0) st.reduc += 0.45;
  st.reduc = Math.min(0.75, st.reduc);
  return st;
}
function xpNivel(n) {return XP_BASE + XP_SUBE * (n - 1);}
const XP_BASE = 300, XP_SUBE = 95;
function ganaXp(h, n) {
  if (h.nivel >= NIVEL_MAX) return; h.xp += n * (S.modo === '1v1' ? DUELO.botin : 1);
  while (h.nivel < NIVEL_MAX && h.xp >= xpNivel(h.nivel)) {h.xp -= xpNivel(h.nivel); const v0 = stats(h).vida; h.nivel++; h.pts++; const v1 = stats(h).vida; h.vida += v1 - v0; h.mana += HEROES[h.tipo].crecM; ev(['fx', 'onda', h.x, h.z, 3]); if (h.nivel === NIVEL_R) ev(['aviso', h.id, '¡Habilidad definitiva lista!']);}
}
function ev(e) {S.ev.push(e); efectoLocal(e);}
/* ALMA (22/11): emoticono de un héroe (uno cada 3 s) */
function emote(h, k) {if (!h || !['hola', 'risa', 'burla', 'gg'].includes(k) || (h.emoT || 0) > S.t) return; h.emoT = S.t + 3; ev(['emo', h.id, k]);}

/* ---------- simulación (anfitrión) ---------- */
function oculto(u, quien) {if (u.k !== 'h' || u.hierba < 0 || u.revela > S.t) return false; return !(quien && (dist(quien, u) < 3.2 || quien.hierba === u.hierba));}
function enemigosDe(eq, quien) {return S.u.filter((u) => u.eq !== eq && !u.muerto && u.vida > 0 && !(u.k === 'h' && (u.buf.invis > 0 || u.buf.estasis > 0)) && !(eq === 2 && u.k !== 'h') && !(quien && oculto(u, quien)));}
function atacable(u) {
  if (u.k === 't' && u.n === 2) return S.u.some((q) => q.k === 't' && q.eq === u.eq && q.n === 1 && q.vida <= 0);
  if (u.k === 'n') return !S.u.some((q) => q.k === 't' && q.eq === u.eq && q.n === 2 && q.vida > 0);
  return true;
}
function radio(u) {return u.rad || (u.k === 'h' ? 0.75 : 0.5);}
const CHOQUE_H = 1.1; /* distancia mínima entre dos héroes (centro a centro) */
/* protecciones de las torres del Wild Rift: las de camino llevan armadura extra al principio (300 que baja 50 por minuto)
   y ninguna estructura recibe más que un 25 % (el estandarte un 20 %) si no hay súbditos enemigos cerca (se quita a los 3 s) */
function protegida(d) {
  if (S.u.some((s) => s.k === 's' && !s.muerto && s.eq !== d.eq && dist(s, d) < 10)) d.subdT = S.t;
  return S.t - (d.subdT ?? -9) > 3;
}
const PLACAS_FIN = 420, PLACA_ORO = 120;
function placaRota(t) {
  const cerca = heroes().filter((h) => h.eq !== t.eq && !h.muerto && dist(h, t) < 12);
  ev(['fx', 'explosion', t.x, t.z, 2.4]);
  if (!cerca.length) return; const g = Math.round(PLACA_ORO / cerca.length);
  for (const h of cerca) {h.oro += g; ev(['num', t.x, t.z, '+' + g, 'o', h.id]); ev(['aviso', h.id, 'Placa de torre: +' + g + ' de oro']);}
}
function dana(o, d, n, tipo) {
  if (!d || d.vida <= 0 || d.muerto) return;
  if (d.buf && d.buf.casa) d.buf.casa = 0; if (o && o.buf && o.buf.casa && d.k !== 's' && d.k !== 'j') o.buf.casa = 0;
  if (S.facil && o && o.k === 'h' && o.bot && d.k === 'h') n *= 0.45; /* partida guiada: el héroe de la máquina pega menos de la mitad */
  if (o && o.k === 'h' && o.buf.gargola > 0) n *= 0.4;
  if (d.k === 't' || d.k === 'n') {
    if (d.k === 't' && d.n === 1) n *= 100 / (100 + Math.max(0, 300 - 50 * Math.floor(S.t / 60)));
    if (protegida(d)) n *= d.k === 'n' ? 0.2 : 0.25;
  }
  if (d.k === 's') {
    if (d.tipo === 'x' && o && o.k === 't') n = d.max * 0.07;
    else if (d.tipo !== 'x' && S.u.some((q) => q.k === 's' && q.tipo === 'x' && !q.muerto && q.eq === d.eq && dist(q, d) < 6)) n *= 0.75;
  }
  if (o && o.k === 'h' && o.tipo === 'gandalf' && tipo === 'mag' && d.k !== 't' && d.k !== 'n') d.luz = S.t + 6;
  if (d.k === 'h') {
    if (d.buf.estasis > 0) return;
    const st = stats(d);
    if (tipo !== 'hab' && tipo !== 'mag' && st.esquiva && Math.random() < st.esquiva) {ev(['num', d.x, d.z, '¡esquiva!', 'r']); return;}
    {const res = tipo === 'mag' ? st.rm : tipo === 'pura' ? 0 : st.arm; n *= 100 / (100 + Math.max(0, res)) * (1 - st.reduc);} /* físico contra armadura, mágico contra resistencia mágica (como el LoL) */
    if (d.buf.escudo > 0) {const a = Math.min(d.buf.escudoV || 0, n); d.buf.escudoV -= a; n -= a;}
    if (d.granito > 0 && n > 0) {const a = Math.min(d.granito, n); d.granito -= a; n -= a;}
    d.golpeT = S.t; if (d.tipo === 'hobbit') {d.quieto = 0; d.buf.escond = 0;}
    if (o && o.k === 'h') {d.agresor = o.id; d.agresorT = S.t + 3; o.atacoHeroeT = S.t + 2.5; d.danos[o.id] = S.t;}
    if (st.espinas && o && o.k !== 't' && tipo !== 'hab' && tipo !== 'mag' && dist(o, d) < 3) dana(null, o, n * st.espinas, 'pura');
  }
  if (d.k === 'j' && o && o.k === 'h') {d.agro = o.id; d.agroT = S.t + 6;}
  if (o) {o.atacaA = d.id; o.atacaT = S.t + 2;}
  if (o && o.k === 'h' && d.k === 'h' && o.eq !== d.eq) o.dH = (o.dH || 0) + Math.max(0, Math.min(n, d.vida)); /* PROGRESO: daño a héroes */
  d.vida -= n; ev(['num', d.x, d.z, Math.round(n), tipo === 'crit' ? 'c' : '', o ? o.id : 0, d.id]);
  if (d.k === 't' && d.n === 1 && S.t < PLACAS_FIN) {if (d.placas === undefined) d.placas = 5; while (d.placas > 0 && d.vida > 0 && d.vida <= d.max * (d.placas - 1) / 5) {d.placas--; placaRota(d);}}
  if (d.k === 'h' || (o && o.k === 'h') || (o && o.k === 't')) ev(['g', d.id, o ? o.id : 0, tipo === 'crit' || tipo === 'hab' || tipo === 'mag' || n > 150 ? 1 : 0]);
  if (o && o.k === 'h' && o.vida > 0) {const r = stats(o).robo; if (r) o.vida = Math.min(stats(o).vida, o.vida + n * r);}
  if (d.vida <= 0) muere(d, o);
}
function muere(d, o) {
  d.vida = 0;
  if (d.k === 's') {
    d.muerto = true; d.quitar = S.t + 1.6; ev(['muere', d.id]);
    const sd = SUBD[d.tipo];
    if (o && o.k === 'h') {const g = Math.round(sd.oro * (S.modo === '1v1' ? DUELO.botin : 1)); o.oro += g; o.cs++; ev(['num', d.x, d.z, '+' + g, 'o', o.id]);}
    {const cerca = heroes().filter((h) => h.eq !== d.eq && !h.muerto && dist(h, d) < 12), k = cerca.length > 1 ? 0.65 : 1; for (const h of cerca) ganaXp(h, sd.xp * k);}
  }
  if (d.k === 'j') {
    d.muerto = true; d.quitar = S.t + 2; ev(['muere', d.id]);
    const nd = NEUTRO[d.tipo], c = S.campos[d.campo]; c.vivos--; if (c.vivos <= 0) c.resp = S.t + (nd.jefe ? 240 : nd.draco ? 240 : nd.pasiva ? 150 : nd.grande ? 90 : 45);
    const eq = o && o.k === 'h' ? o.eq : null;
    if (o && o.k === 'h') {const stJ = stats(o); o.vida = Math.min(stJ.vida, o.vida + stJ.vida * (nd.grande ? 0.1 : 0.04)); o.mana = Math.min(stJ.mana, o.mana + stJ.mana * 0.05); o.oro += nd.oro; o.cs++; ev(['num', d.x, d.z, '+' + nd.oro, 'o', o.id]);}
    if (eq !== null) for (const h of heroes()) if (h.eq === eq && !h.muerto && (h === o || dist(h, d) < 14)) ganaXp(h, nd.xp);
    if (nd.buff === 'uruk' && eq !== null) {S.bufEq[eq].uruk = S.t + 180; for (const h of heroes()) if (h.eq === eq) h.oro += 150; ev(['fx', 'onda', d.x, d.z, 9]); ev(['baja', o.id, d.id, (eq === 0 ? 'El equipo azul' : 'El equipo rojo') + ' derriba a Nasor']); ev(['jefe', 'cae', d.x, d.z, eq]);}
    else if (nd.draco && eq !== null) {
      const be = S.bufEq[eq]; be.drF = be.drF || 0; be.drH = be.drH || 0; if (d.elem === 'f') be.drF++; else be.drH++;
      S.dracoSig = S.dracoSig === 'f' ? 'h' : 'f'; ev(['fx', 'onda', d.x, d.z, 9]);
      ev(['baja', o.id, d.id, (eq === 0 ? 'El equipo azul' : 'El equipo rojo') + (d.elem === 'f' ? ' caza al lagarto de fuego' : ' caza al lagarto de hielo')]);
      if (be.drF + be.drH >= 3 && !be.alma) {be.alma = 1; ev(['jefe', 'lcae', d.x, d.z, eq, d.elem === 'f' ? 1 : 0, 1]); for (const q of S.campos) if (NEUTRO[q.tipo].draco) q.resp = 1e9;}
      else ev(['jefe', 'lcae', d.x, d.z, eq, d.elem === 'f' ? 1 : 0, 0]);
    }
    else if (nd.pasiva && eq !== null) {S.santuarios.push({x: d.x, z: d.z, r: 7, eq, hasta: S.t + 90}); ev(['aviso', 0, (eq === 0 ? 'El equipo azul' : 'El equipo rojo') + ' caza a la rata: santuario de velocidad y vista en la glorieta']); ev(['fx', 'onda', d.x, d.z, 7]);}
    else if (nd.buff && o && o.k === 'h') {o.buf[nd.buff] = 120; ev(['fx', 'onda', d.x, d.z, 5]); ev(['aviso', o.id, BUFF_TXT[nd.buff]]);}
  }
  if (d.k === 'h') {
    d.muerto = true; d.resp = S.t + Math.min(45, 6 + d.nivel * 2 + Math.floor(S.t / 60) * 0.8); /* como en el LoL: cuanto más avanzada la partida, más cuesta morir */ d.buf = {}; ev(['muere', d.id]); S.muertes[1 - d.eq]++;
    d.muertes++; const rachaVictima = d.racha; d.racha = 0; const rmAntes = d.rachaM || 0;
    if (DUELO.activo && S.modo === '1v1' && S.fin < 0 && S.muertes[1 - d.eq] >= (S.t >= DUELO.anillo ? 1 : 2) && !S.duelo) {S.duelo = 1; luego(1.2, () => {if (S.fin < 0) {S.fin = 1 - d.eq; ev(['fin', 1 - d.eq]);}});}
    const asesino = o && o.k === 'h' ? o : S.u.find((q) => q.id === d.agresor && d.agresorT > S.t);
    let txt = '';
    if (asesino) {
      asesino.kills++; asesino.racha++; asesino.multi = S.t - asesino.multiT < 10 ? asesino.multi + 1 : 1; asesino.multiT = S.t;
      const rm = d.rachaM || 0, recomp = rachaVictima >= 3 ? Math.min(700, 150 + 100 * (rachaVictima - 3)) : 0;
      let oro = [300, 274, 220, 176, 140, 112, 100][Math.min(6, rm)] + recomp; asesino.oro += oro; asesino.rachaM = 0; ganaXp(asesino, 120 + 25 * d.nivel);
      if (recomp) ev(['aviso', 0, '💰 Racha cortada: +' + recomp + ' de recompensa']);
      if (!S.primera) {S.primera = true; txt = '¡Primera sangre!'; asesino.oro += 100;}
      else if (asesino.multi >= 2) txt = ['', '', '¡Doble derribo!', '¡Triple derribo!', '¡Cuádruple derribo!'][Math.min(4, asesino.multi)];
      else if (rachaVictima >= 3) txt = '¡Racha cortada!';
      else if (asesino.racha >= 3) txt = asesino.racha >= 7 ? '¡Leyenda de la autopista!' : asesino.racha >= 5 ? '¡Imparable!' : '¡En racha!';
      {const as = heroes().filter((a) => a.eq === asesino.eq && a !== asesino && d.danos[a.id] > S.t - 10); for (const a of as) {a.asist++; a.oro += Math.round(oro * 0.5 / as.length); a.rachaM = 0; ganaXp(a, 60 + 12 * d.nivel);}}
      if (heroes().filter((q) => q.eq === d.eq).every((q) => q.muerto) && heroes().filter((q) => q.eq === d.eq).length > 1) txt = '¡Aniquilación!';
    }
    d.danos = {}; d.rachaM = rmAntes + 1;
    ev(['baja', asesino ? asesino.id : 0, d.id, txt]);
  }
  if (d.k === 't') {ev(['fx', 'explosion', d.x, d.z, 5]); ev(['baja', o && o.k === 'h' ? o.id : 0, d.id, d.eq === 0 ? 'Torre de los azules destruida' : 'Torre de los rojos destruida']); for (const h of heroes()) if (h.eq !== d.eq) {h.oro += d.inhib ? 50 : 150; ganaXp(h, 80);}
    if (DUELO.activo && S.modo === '1v1' && S.fin < 0) {S.fin = 1 - d.eq; luego(1.5, () => ev(['fin', 1 - d.eq]));}
    /* inhibidor (Wild Rift 4.0a): la torre de la base vuelve a los 4 min (5 desde el 13, 6 desde el 18) pero ya no dispara; mientras esté caída, supersúbditos */
    if (d.n === 2) {d.respInh = S.t + (S.t < 780 ? 240 : S.t < 1080 ? 300 : 360); ev(['aviso', 0, (d.eq ? '¡El equipo rojo' : '¡El equipo azul') + ' ha perdido su torre de la base: ¡supersoldados!']);}}
  if (d.k === 'n' && S.fin < 0) {S.fin = 1 - d.eq; ev(['fx', 'explosion', d.x, d.z, 8]); ev(['fin', 1 - d.eq]);}
}
/* golpes con retraso dentro de la simulación (no con setTimeout: así va igual a cualquier velocidad) */
function luego(seg, fn) {const r = REBOBINA; S.dif.push({t: S.t + seg, fn: r ? () => rebobinado(r, fn) : fn});}
/* compensación del retraso para las habilidades de un invitado: mientras se resuelven (y sus golpes con retraso), los héroes enemigos
   están donde él los veía en su pantalla; al acabar vuelven a su sitio */
let REBOBINA = null;
function rebobinado(h, fn) {
  if (!h.lat || REBOBINA) return fn();
  const t = S.t - h.lat, mov = [];
  for (const e of S.u) if (e.k === 'h' && e.eq !== h.eq && !e.muerto) {const p = posAt(e, t); mov.push([e, e.x, e.z]); e.x = p.x; e.z = p.z;}
  REBOBINA = h;
  try {return fn();} finally {REBOBINA = null; for (const [e, x, z] of mov) {const dx = e.x - posAt(e, t).x, dz = e.z - posAt(e, t).z; e.x = x + dx; e.z = z + dz;}}
}
function posAt(e, t) {
  const hs = e.hist; if (!hs || hs.length < 3) return e;
  for (let i = hs.length - 3; i >= 0; i -= 3) if (hs[i] <= t) {const j = i + 3; if (j >= hs.length) return {x: hs[i + 1], z: hs[i + 2]}; const k = (t - hs[i]) / Math.max(1e-4, hs[j] - hs[i]); return {x: hs[i + 1] + (hs[j + 1] - hs[i + 1]) * k, z: hs[i + 2] + (hs[j + 2] - hs[i + 2]) * k};}
  return {x: hs[1], z: hs[2]};
}
function golpea(o, d) {
  if (o.k === 'h') {
    if (o.buf.troll > 0 && d.k !== 't' && d.k !== 'n') {d.quema = {dps: 10 + 3 * o.nivel, hasta: S.t + 3, o: o.id, tick: 0}; if (d.k === 'h') {d.buf.lento = 1; d.buf.lentoV = 0.2;} else d.lento = S.t + 1;}
    const st = stats(o), crit = st.crit && Math.random() < st.crit, n = st.dano * (crit ? 2 : 1), b = HEROES[o.tipo];
    o.ac++;
    pasivaGolpe(o, d);
    if (b.proy) {const dl = {hobbit: 0.32, elfo: 0.15}[o.tipo] || 0, tira = () => {if (d.vida > 0 && !d.muerto && !o.muerto) lanzaProy(o, d, b.proy, n, crit ? 'crit' : 'at');}; if (dl) luego(dl, tira); else tira();}
    else luego(0.18, () => {if (d.vida > 0 && !o.muerto) {dana(o, d, n, crit ? 'crit' : 'at'); ev(['fx', 'impacto', d.x, d.z, 1.4]);}});
    return;
  }
  if (o.k === 's') {o.ac++; const sd = SUBD[o.tipo]; if (o.tipo === 'r') lanzaProy(o, d, o.eq ? 'flecha_orca' : 'flecha_elfica', sd.dano * (o.fuerte ? 1.5 : 1) * (SUBD_X[d.k] || 1) * (d.k === 't' || d.k === 'n' ? asedio() : 1), 'at'); else luego(0.2, () => {if (d.vida > 0 && o.vida > 0) dana(o, d, sd.dano * (o.fuerte ? 1.5 : 1) * ((d.k === 't' || d.k === 'n') ? (sd.muros || SUBD_X.t) * asedio() : (SUBD_X[d.k] || 1)), 'at');}); return;}
  if (o.k === 'j') {o.ac++; const nd = NEUTRO[o.tipo], piso = nd.jefe && o.ac % 3 === 0; luego(piso ? 0.75 : 0.3, () => {if (o.vida <= 0) return; if (piso) {for (const h of heroes()) if (!h.muerto && dist(h, o) < 4.2) dana(o, h, nd.dano * 0.8 * (1 + S.t / 900), 'at'); ev(['fx', 'onda', o.x, o.z, 8]); ev(['fx', 'explosion', o.x, o.z, 3]);} else if (d.vida > 0) {dana(o, d, nd.dano * (1 + S.t / 900), 'at'); if (nd.grande) ev(['fx', 'impacto', d.x, d.z, 2]);}}); return;}
  if (o.k === 't') {o.ac++; if (d.k === 'h' && o.calorDe === d.id) o.calor = Math.min(3, (o.calor || 0) + 1); else o.calor = 0; o.calorDe = d.k === 'h' ? d.id : 0; const n = d.k === 'h' ? (130 + 12 * Math.floor(S.t / 60)) * (1 + 0.35 * o.calor) : 110; const p = lanzaProy(o, d, 'piedra', n, 'at', 2.6, 5); p.area = 2.4; p.v = 13;}
}
function pasivaGolpe(o, d) {
  const t = o.tipo, heroe = d.k === 'h', vivo = () => d.vida > 0 && !d.muerto && !o.muerto;
  if (t === 'hobbit') {o.quieto = 0; o.buf.escond = 0;}
  if (t === 'gollum' && dist(o, d) > 3) {const l = dist(o, d), ux = (d.x - o.x) / l, uz = (d.z - o.z) / l; o.x = d.x - ux * 1.3; o.z = d.z - uz * 1.3; limita(o); ev(['fx', 'onda', o.x, o.z, 3]); ev(['num', o.x, o.z, '¡Acecho!', 'y']);}
  if (t === 'orco' && heroe) luego(0.2, () => {if (!vivo()) return; const s0 = d.sang && d.sang.hasta > S.t ? d.sang.n : 0; d.sang = {n: Math.min(5, s0 + 1), hasta: S.t + 5, o: o.id, tick: 0}; if (d.sang.n === 5 && !(o.buf.furiaO > 0)) {o.buf.furiaO = 5; ev(['num', o.x, o.z, '¡Disciplina!', 'r']);}});
  if (t === 'gandalf' && d.luz > S.t) {d.luz = 0; const extra = 20 + 10 * o.nivel + stats(o).poder * 0.35; luego(0.3, () => {if (vivo()) {dana(o, d, extra, 'mag'); ev(['fx', 'impacto', d.x, d.z, 2.2]); ev(['num', d.x, d.z, '✦', 'y']);}});}
  if (t === 'rohan' && d.k !== 't' && d.k !== 'n') {o.jarv = o.jarv || {}; if (!(o.jarv[d.id] > S.t)) {o.jarv[d.id] = S.t + 6; luego(0.2, () => {if (vivo()) dana(o, d, Math.min(d.k === 'h' ? 9999 : 260, d.vida * 0.08), 'pura');});}}
  if (t === 'visor') {o.carga = (o.carga || 0) + 1; if (o.carga % 4 === 0) {const extra = 25 + 12 * o.nivel + stats(o).poder * 0.4; luego(0.3, () => {if (vivo()) {dana(o, d, extra, 'mag'); ev(['fx', 'impacto', d.x, d.z, 2]); ev(['num', d.x, d.z, '⚡', 'y']);}});}}
  if (t === 'elfo' && d.k !== 't' && d.k !== 'n') luego(0.25, () => {if (!vivo()) return; if (heroe) {d.buf.lento = 1.5; d.buf.lentoV = Math.max(d.buf.lentoV || 0, 0.25);} else d.lento = S.t + 1.5;});
}
function lanzaProy(o, d, modelo, n, tipo, esc = 1, y = 1.2) {
  const p = {o, d, x: o.x, z: o.z, n, tipo, v: o.k === 't' ? 16 : 22};
  S.proy.push(p); ev(['proy', modelo, o.x, o.z, d.id, o.k === 't' ? 13 : p.v, esc, y]); return p;
}
function mueveHacia(u, tx, tz, vel, dt) {
  let dx = tx - u.x, dz = tz - u.z; const l = Math.hypot(dx, dz); if (l < 0.05) return false;
  /* rodear torres y estandartes: si hay uno delante en el camino, se desvía de lado (antes los súbditos se quedaban atascados detrás de las torres) */
  if (u.k !== 'h') for (const a of ESTR) {
    const ax = a.x - u.x, az = a.z - u.z, pr = (ax * dx + az * dz) / l; if (pr <= 0 || pr > Math.min(l, a.r + 3)) continue;
    const lat = (ax * dz - az * dx) / l, m = a.r + 0.9; if (Math.abs(lat) >= m) continue;
    const s0 = lat > 0 ? -1 : 1, nx = dx / l, nz = dz / l; dx = nx + s0 * nz * 1.6; dz = nz - s0 * nx * 1.6; const l2 = Math.hypot(dx, dz); dx = dx / l2 * l; dz = dz / l2 * l; break;
  }
  const p = Math.min(l, vel * dt); u.x += dx / l * p; u.z += dz / l * p; u.rot = Math.atan2(dx, dz); limita(u); return true;
}
function limita(u) {u.x = Math.max(-MAPA.ancho, Math.min(MAPA.ancho, u.x)); u.z = Math.max(-MAPA.largo, Math.min(MAPA.largo, u.z)); choca(u);}
/* torres y estandartes son sólidos (antes se atravesaban): ESTR se rehace en cada paso del anfitrión y, en los demás móviles, desde lo que se ve */
let ESTR = [];
function estructuras(lista) {ESTR = []; if (window._sinEstr) return; for (const q of lista) if ((q.k === 't' || q.k === 'n') && q.vida > 0) ESTR.push({x: q.x, z: q.z, r: (q.k === 'n' ? 2.4 : 1.9)});}
function choca(u) {
  if (RECTS.length) chocaRects(u, u.k === 'h' ? 0.45 : 0.3);
  for (const a of ESTR) {const dx = u.x - a.x, dz = u.z - a.z, d = Math.hypot(dx, dz), m = a.r + (u.rad && u.k !== 'h' ? 0.3 : 0.45); if (d < m) {if (d < 0.001) {u.x = a.x + m; continue;} u.x = a.x + dx / d * m; u.z = a.z + dz / d * m;}}
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {const l = ARB.get((Math.floor(u.x / 4) + i) + ',' + (Math.floor(u.z / 4) + j)); if (l) for (const a of l) {const dx = u.x - a.x, dz = u.z - a.z, d = Math.hypot(dx, dz), m = a.r + 0.45; if (d < m && d > 0.001) {u.x = a.x + dx / d * m; u.z = a.z + dz / d * m;}}}
}
/* rumbo de un bot: recto si no hay árboles en medio; si los hay, por la red de sendas */
function rumbo(u, tx, tz) {
  const t = {x: tx, z: tz};
  if ((Math.hypot(tx - u.x, tz - u.z) < 4 && !(RECTS.length && cortaRects(u, t, 0.2))) || lineaLibre(u, t)) {u.ruta = null; return [tx - u.x, tz - u.z];}
  if (!u.ruta || u.rutaT < S.t || Math.hypot(u.rutaD.x - tx, u.rutaD.z - tz) > 4) {u.ruta = camino(u, t); u.rutaT = S.t + 1.5; u.rutaD = t;}
  /* el punto más lejano de la ruta al que ya se ve recto */
  let obj = null; for (let i = u.ruta.length - 1; i >= 0; i--) if (lineaLibre(u, u.ruta[i])) {obj = u.ruta[i]; break;}
  if (!obj) obj = u.ruta[0] || t;
  return [obj.x - u.x, obj.z - u.z];
}
function ve(h, tx, tz) {const [x, z] = rumbo(h, tx, tz); h.mx = x; h.mz = z;}
function masCercano(u, lista, r) {let m = null, md = r; for (const q of lista) {const d0 = dist(u, q) - radio(q); if (d0 < md) {md = d0; m = q;}} return m;}

function oleada() {
  S.oleadaN++; if (S.oleadaN === 1) ev(['voz', 'hordas']);
  for (const eq of [0, 1]) for (const l of S.carriles) {
    const L = CARRILES[l], ini = eq ? L[L.length - 1] : L[0], sig = eq ? L[L.length - 2] : L[1], dl = Math.hypot(sig.x - ini.x, sig.z - ini.z), ux = (sig.x - ini.x) / dl, uz = (sig.z - ini.z) / dl;
    /* las hordas: cuerpo a cuerpo delante, arqueros detrás; desde el minuto 4 un ariete cada tercera oleada */
    const tipos = [...Array(ORDA).fill('m'), 'r', 'r']; if (S.t > 240 && S.oleadaN % 3 === 0) tipos.push('a'); if (S.t > 600) tipos.push('a');
    const furia = S.bufEq[eq].uruk > S.t;
    /* como el inhibidor del LoL: si cayó la torre de la base enemiga, tus hordas llevan un ariete más y van reforzadas */
    const rota = S.u.some((t) => t.k === 't' && t.n === 2 && t.eq !== eq && t.vida <= 0); if (rota) {for (let i = tipos.length - 1; i >= 0; i--) if (tipos[i] === 'a') tipos.splice(i, 1); tipos.unshift('x');}
    tipos.forEach((tipo, i) => {
      const sd = SUBD[tipo], refuerzo = (1 + 0.06 * Math.floor(S.t / 60)) * (furia ? 1.5 : 1), atras = tipo === 'x' ? -1.6 : tipo === 'm' ? 0 : tipo === 'r' ? 2.4 : 4.4, lat = tipo === 'a' || tipo === 'x' ? 0 : (((i - (tipos[0] === 'x' ? 1 : 0)) % ORDA) - (ORDA - 1) / 2) * 1.3;
      S.u.push({id: idSig++, k: 's', eq, tipo, carril: l, wp: eq ? L.length - 2 : 1, fuerte: furia, x: ini.x - ux * atras - uz * lat, z: ini.z - uz * atras + ux * lat, vida: sd.vida * refuerzo, max: sd.vida * refuerzo, cd: 0, ac: 0, rot: Math.atan2(ux, uz), rad: tipo === 'a' || tipo === 'x' ? 0.8 : 0.5});
    });
  }
}

function paso(dt) {
  S.t += dt; S.ola -= dt; S.porId = new Map(S.u.map((u) => [u.id, u])); estructuras(S.u);
  /* historial de posiciones de los héroes (0,6 s) para compensar el retraso de los que juegan a distancia */
  for (const u of S.u) if (u.k === 'h') {const hs = u.hist || (u.hist = []); hs.push(S.t, u.x, u.z); while (hs.length > 3 && hs[0] < S.t - 0.6) hs.splice(0, 3);}
  for (let i = S.dif.length - 1; i >= 0; i--) if (S.dif[i].t <= S.t) {const f = S.dif[i].fn; S.dif.splice(i, 1); f();} if (S.ola <= 0) {S.ola = S.carriles.length > 1 ? 28 : 24; oleada();}
  mueveTirosH(dt); /* quemadura de la brasa del troll */
  for (const u of S.u) if (u.quema) {if (S.t > u.quema.hasta || u.vida <= 0 || u.muerto) {u.quema = null; continue;} u.quema.tick -= dt; if (u.quema.tick <= 0) {u.quema.tick = 0.5; dana(S.porId.get(u.quema.o) || null, u, u.quema.dps * 0.5, 'hab');}}
  /* plantas de la espesura (como las del LoL): seta de humo lanza por los aires, baya cura, flor de elanor da vista */
  for (const q of S.plantas) if (S.t >= q.listo) for (const h of heroes()) if (!h.muerto && dist(h, q) < 1.4) {
    q.listo = S.t + (q.tipo === 'seta' ? 60 : 75); ev(['planta', q.tipo, q.x, q.z]);
    if (q.tipo === 'seta') for (const a of heroes()) if (!a.muerto && dist(a, q) < 3.4) {const dx = a.x - q.x, dz = a.z - q.z, l = Math.hypot(dx, dz) || 1, ux = l > 0.2 ? dx / l : Math.sin(a.rot || 0), uz = l > 0.2 ? dz / l : Math.cos(a.rot || 0); a.x = q.x + ux * 7.5; a.z = q.z + uz * 7.5; a.px = undefined; a.dash = null; limita(a); ev(['tp', a.id, a.x, a.z]);}
    if (q.tipo === 'baya') {const st = stats(h); const n = Math.min(st.vida - h.vida, st.vida * 0.12 + 40); h.vida += n; ev(['num', h.x, h.z, '+' + Math.round(n), 'v']);}
    if (q.tipo === 'flor') S.visiones.push({x: q.x, z: q.z, r: 11, eq: h.eq, hasta: S.t + 12});
    break;
  }
  for (const z of [...S.santuarios, ...S.visiones]) if (z.hasta > S.t) for (const e of heroes()) if (e.eq !== z.eq && Math.hypot(e.x - z.x, e.z - z.z) < z.r) e.revela = Math.max(e.revela || 0, S.t + 0.3);
  /* reliquias de vida: cura un 20 % + 30 por nivel al que pasa por encima */
  for (const r of S.reliq) if (S.t >= r.listo) for (const h of heroes()) if (!h.muerto && dist(h, r) < 1.6) {const st = stats(h); const n = Math.min(st.vida - h.vida, st.vida * 0.2 + 30 * h.nivel); h.vida += n; h.mana = Math.min(st.mana, h.mana + st.mana * 0.2); r.listo = S.t + 90; ev(['num', h.x, h.z, '+' + Math.round(n), 'v']); ev(['fx', 'onda', r.x, r.z, 3]); ev(['son', 'magia']); break;}
  /* anillo de fuego del Duelo */
  if (S.modo === '1v1') {
    const r = radioAnillo(S.t);
    if (r && !S.anilloAv) {S.anilloAv = 1; ev(['aviso', 0, '🔥 ¡El anillo de fuego! Desde ahora, un solo derribo gana']); ev(['voz', 'uruk_despierta']);}
    if (r) for (const h of heroes()) if (!h.muerto && Math.hypot(h.x, h.z) > r) {h.vida -= stats(h).vida * DUELO.quema * dt; h.quemaT = (h.quemaT || 0) - dt; if (h.quemaT <= 0) {h.quemaT = 0.5; ev(['num', h.x, h.z, '🔥', 'r']);} if (h.vida <= 0) muere(h, null);}
  }
  /* rendición: si se acaba el tiempo de la votación sin votos suficientes, falla */
  for (const eq of [0, 1]) {const R = S.voto && S.voto[eq]; if (R && S.t >= R.hasta) cierraVoto(eq, false);}
  const hs = heroes();
  for (const h of hs) {
    for (const k in h.cd) h.cd[k] = Math.max(0, h.cd[k] - dt);
    if (h.vg < 2) {h.vgT -= dt; if (h.vgT <= 0) {h.vg++; h.vgT = recargaAlmenara();}}
    for (const k in h.buf) if (typeof h.buf[k] === 'number' && !k.endsWith('V')) h.buf[k] = Math.max(0, h.buf[k] - dt);
    if (h.muerto) {if (S.t >= h.resp) {h.muerto = false; const f = BASES[h.eq].fuente; h.x = f.x + (h.slot >= 2 ? 1.5 : -1.5); h.z = f.z - signo(h.eq) * 2.5; h.px = undefined; h.vida = stats(h).vida; h.mana = stats(h).mana; h.buf.casa = 8; ev(['vive', h.id]);} continue;}
    const st = stats(h); h.oro += 2.2 * dt;
    if (h.sang && h.sang.hasta > S.t) {h.sang.tick -= dt; if (h.sang.tick <= 0) {h.sang.tick = 1; const ob = S.porId.get(h.sang.o); dana(ob || null, h, (2 + 0.8 * (ob ? ob.nivel : 1)) * h.sang.n, 'fis');}} else h.sang = null;
    if (h.tipo === 'enano' && S.t - (h.golpeT ?? -99) > 10 && !(h.granito > 0)) {h.granito = st.vida * 0.1; ev(['num', h.x, h.z, '🛡 granito', 'y']);}
    if (h.tipo === 'hobbit') {h.quieto = h.mueve ? 0 : (h.quieto || 0) + dt; if (h.quieto > 1.5) {if (!(h.buf.escond > 0)) ev(['num', h.x, h.z, '…', 'y']); h.buf.escond = 0.2; h.buf.invis = 0.2;}}
    h.hierba = enHierba(h);
    const enFuente = dist(h, BASES[h.eq].fuente) < 8; if (h.ultCompra && !h.muerto && !enFuente) h.ultCompra = null;
    h.vida = Math.min(st.vida, h.vida + (st.regen + (enFuente ? st.vida * 0.12 : 0)) * dt);
    h.mana = Math.min(st.mana, h.mana + (st.rmana + (enFuente ? st.mana * 0.12 : 0)) * dt); /* energía: se recupera solo y deprisa en la fuente */
    if (h.bot) {ia(h, dt, st); esquivaBot(h);}
    if (h.dash) {
      const d = h.dash, pt = Math.min(dt, Math.max(0, d.t)); d.t -= dt; h.x += d.vx * pt; h.z += d.vz * pt; limita(h);
      if (d.n) for (const e of enemigosDe(h.eq)) if (!d.toc.has(e.id) && e.k !== 'n' && (e.k !== 't') && dist(h, e) < 1.6 + radio(e)) {d.toc.add(e.id); dana(h, e, d.n, 'hab'); if (d.aturde && e.k !== 't') {e.aturd = S.t + d.aturde;}}
      if (d.t <= 0) {if (d.cae) {for (const e of enemigosDe(h.eq)) if (e.k !== 't' && e.k !== 'n' && dist(e, h) < d.cae.r + radio(e)) {dana(h, e, d.cae.n, 'hab'); e.buf ? (e.buf.lento = d.cae.dur, e.buf.lentoV = d.cae.l) : (e.lento = S.t + d.cae.dur);} ev(['fx', 'onda', h.x, h.z, d.cae.r * 1.6]);} h.dash = null;}
    } else if (h.buf.estasis > 0) {h.mueve = false;
    } else if (!(h.aturd > S.t) && !(h.paraT > S.t)) {
      if (h.bot || h.local) {if (h.mx || h.mz) {const l = Math.hypot(h.mx, h.mz); h.x += h.mx / l * st.vel * Math.min(1, l) * dt; h.z += h.mz / l * st.vel * Math.min(1, l) * dt; h.rot = Math.atan2(h.mx, h.mz); limita(h); h.mueve = true;} else h.mueve = false;}
    }
    /* ataque básico */
    if (h.fijo) {const f = S.porId.get(h.fijo); if (!f || f.vida <= 0 || f.muerto || dist(h, f) > 16 || (f.k === 'h' && oculto(f, h))) h.fijo = 0;}
    if ((h.ataca || h.tap > S.t) && !h.dash && !(h.aturd > S.t) && !(h.buf.estasis > 0) && h.cd.a <= 0) {
      /* compensación del retraso (como los shooters y el Wild Rift): a un jugador a distancia se le mira el alcance contra donde ÉL veía
         al héroe enemigo en su pantalla (hace su ping/2 + la interpolación), no contra donde está ahora en el anfitrión */
      const atras = h.lat ? S.t - h.lat : 0, pos = (e) => (atras && e.k === 'h' ? posAt(e, atras) : e);
      const en = enemigosDe(h.eq, h).filter(atacable), r = st.alcance + 0.6, aTiro = (e) => {const p = pos(e); return Math.min(dist(h, e), Math.hypot(p.x - h.x, p.z - h.z)) - radio(e) < r;};
      let obj = null; const hh = en.filter((e) => e.k === 'h' && aTiro(e)), f = h.fijo && en.find((e) => e.id === h.fijo);
      /* como en el Wild Rift: objetivo fijado (arrastrando el ataque o tocando su retrato), botón de torre (solo estructuras),
         botón de súbditos (el de menos vida, para rematar) y, si no, prioridad normal (héroes primero) */
      if (f) obj = aTiro(f) ? f : null;
      else if (h.modoAt === 't') obj = masCercano(h, en.filter((e) => e.k === 't' || e.k === 'n'), r);
      else if (h.modoAt === 's') obj = en.filter((e) => (e.k === 's' || e.k === 'j') && aTiro(e)).sort((a, b) => a.vida - b.vida)[0] || null;
      /* 18/11 (Henar: «el orden de prioridad del básico es raro»), como el Wild Rift: 1) héroe enemigo a tiro (el más cercano; los bots,
         el de menos vida), 2) soldado o bestia a tiro, el más cercano, 3) y solo si no hay nada más, torre o núcleo. Antes una torre cercana
         podía ganar a los soldados que tenías delante. */
      else if (hh.length && h.prioHeroe !== false) obj = h.bot ? hh.sort((a, b) => a.vida - b.vida)[0] : hh.sort((a, b) => dist(h, a) - dist(h, b))[0];
      else obj = masCercano(h, en.filter((e) => e.k === 's' || (e.k === 'j' && (e.agro === h.id || !h.bot || h.ataca))), r) || masCercano(h, en.filter((e) => e.k === 't' || e.k === 'n'), r);
      if (obj) {h.cd.a = 1 / st.vatq; h.rot = Math.atan2(obj.x - h.x, obj.z - h.z); if (h.buf.invis) h.buf.invis = 0; h.revela = S.t + 1.2; golpea(h, obj); h.tap = 0; h.paraT = S.t + Math.min(0.3, 0.3 / st.vatq); h.mueve = false;}
      /* pedido de Arturo: cada toque del ataque da un golpe SIEMPRE, aunque te muevas y no haya nadie (golpe al aire) */
      else if (!h.bot && (h.tap > S.t || !h.mueve)) {h.cd.a = 1 / st.vatq; h.ac++; h.tap = 0;}
    }
  }
  /* súbditos */
  const EN_S = {};
  for (const u of S.u) {
    if (u.k !== 's' || u.muerto) continue;
    const sd = SUBD[u.tipo]; u.cd = Math.max(0, u.cd - dt);
    if (u.aturd > S.t) continue;
    /* como en el LoL: siguen con su objetivo; prefieren súbditos y torres; a un héroe solo si ataca a un héroe de su bando cerca o si no queda otra cosa */
    /* 18/11 (tirones en las peleas): la lista de enemigos atacables es la misma para todos los súbditos de un bando: se calcula una vez por paso (antes, una por súbdito: con 40 súbditos, 40 recorridos de todo el mapa) */
    const en = EN_S[u.eq] || (EN_S[u.eq] = enemigosDe(u.eq).filter((e) => e.eq !== 2 && atacable(e))), rr = u.tipo === 'r' ? 7 : 6;
    /* prioridades del LoL / Wild Rift: 1 héroe que ataca a un héroe aliado, 2 súbdito que ataca a un héroe aliado, 3 súbdito que ataca a un súbdito aliado,
       4 torre que ataca a un súbdito aliado, 5 héroe que ataca a un súbdito aliado, 6 súbdito más cercano, 7 héroe más cercano. Las 1 y 2 interrumpen; el resto respeta el objetivo que ya tenía. */
    const victima = (e) => e.atacaT > S.t ? S.porId.get(e.atacaA) : null;
    const cerca = en.filter((e) => e.vida > 0 && !e.muerto && Math.abs(u.x - e.x) < rr + 4 && Math.abs(u.z - e.z) < rr + 4 && dist(u, e) - radio(e) < rr + 1.5);
    const prio = (e) => {const v = victima(e); if (v && v.eq === u.eq) {if (v.k === 'h') return e.k === 'h' ? 1 : 2; if (v.k === 's') return e.k === 's' ? 3 : e.k === 't' ? 4 : 5;} return e.k === 'h' ? 7 : 6;};
    let obj = null, mejor = 9;
    for (const e of cerca) {const p = prio(e); if (p < mejor || (p === mejor && obj && dist(u, e) < dist(u, obj))) {mejor = p; obj = e;}}
    if (mejor > 2 && u.objId) {const o2 = cerca.find((e) => e.id === u.objId); if (o2) obj = o2;}
    u.objId = obj ? obj.id : 0;
    const vel = sd.vel * (u.lento > S.t ? 0.6 : 1);
    if (obj) {
      const d0 = dist(u, obj) - radio(obj);
      if (d0 > sd.alcance) {mueveHacia(u, obj.x, obj.z, vel, dt); u.mueve = true;}
      else {u.mueve = false; u.rot = Math.atan2(obj.x - u.x, obj.z - u.z); if (u.cd <= 0) {u.cd = 1 / sd.vatq; golpea(u, obj);}}
    } else {
      const L = CARRILES[u.carril], paso0 = u.eq ? -1 : 1;
      if (u.wp >= 0 && u.wp < L.length) {
        const sig = L[u.wp + paso0]; if (sig && dist(u, sig) < dist(u, L[u.wp])) u.wp += paso0;
        const w = L[u.wp]; if (dist(u, w) < 2.2) u.wp += paso0;
      }
      const meta = u.wp >= 0 && u.wp < L.length ? L[u.wp] : BASES[1 - u.eq].nexo;
      u.mueve = mueveHacia(u, meta.x, meta.z, vel, dt);
    }
  }
  /* la espesura: campamentos que reaparecen y bestias que vuelven a su sitio si te alejas */
  S.campos.forEach((c, ci) => {
    if (c.vivos === 0 && (NEUTRO[c.tipo].jefe || NEUTRO[c.tipo].draco) && c.avJ !== c.resp && S.t > c.resp - 30 && S.t < c.resp && c.resp < 1e8) {c.avJ = c.resp; ev(['jefe', NEUTRO[c.tipo].jefe ? 'pronto' : 'lpronto', c.x, c.z, Math.round(c.resp - S.t), S.dracoSig === 'f' ? 1 : 0]);}
    if (c.vivos > 0 || S.t < c.resp) return;
    const nd = NEUTRO[c.tipo], k = 1 + S.t / 600; c.vivos = c.n;
    if (nd.draco) {c.elem = S.dracoSig; ev(['jefe', 'lsale', c.x, c.z, 0, c.elem === 'f' ? 1 : 0]);}
    for (let i = 0; i < c.n; i++) S.u.push({id: idSig++, k: 'j', eq: 2, tipo: c.tipo, campo: ci, elem: c.elem, x: c.x + (i - (c.n - 1) / 2) * 1.5, z: c.z, cx: c.x + (i - (c.n - 1) / 2) * 1.5, cz: c.z, vida: nd.vida * k, max: nd.vida * k, cd: 0, ac: 0, rot: Math.atan2(-c.x, -c.z) || 0, rad: nd.rad || (nd.jefe ? 1.9 : nd.draco ? 1.4 : nd.grande ? 1.1 : 0.6)});
    if (nd.jefe) ev(['jefe', 'sale', c.x, c.z]);
  });
  for (const u of S.u) {
    if (u.k !== 'j' || u.muerto) continue;
    const nd = NEUTRO[u.tipo]; u.cd = Math.max(0, u.cd - dt);
    if (nd.pasiva) {
      const t = (u.ruta = u.ruta ?? 1), R = 8.5, dx = R * t, dz = 0, huye = u.agro && S.t < u.agroT;
      u.mueve = mueveHacia(u, dx, dz, nd.vel * (huye ? 1.6 : 0.8), dt); if (!u.mueve) u.ruta = -t;
      continue;
    }
    if (u.aturd > S.t) continue;
    let obj = u.agro && S.t < u.agroT + 4 ? S.u.find((q) => q.id === u.agro && !q.muerto && q.vida > 0) : null;
    const lejos = Math.hypot(u.x - u.cx, u.z - u.cz) > 11;
    if (obj && (lejos || dist(obj, {x: u.cx, z: u.cz}) > 13)) obj = null;
    if (obj) {
      const d0 = dist(u, obj) - radio(obj);
      if (d0 > nd.alcance) {u.mueve = mueveHacia(u, obj.x, obj.z, nd.vel * (u.lento > S.t ? 0.6 : 1), dt);}
      else {u.mueve = false; u.rot = Math.atan2(obj.x - u.x, obj.z - u.z); if (u.cd <= 0) {u.cd = 1 / nd.vatq; golpea(u, obj);}}
    } else {
      u.agro = null; u.mueve = mueveHacia(u, u.cx, u.cz, nd.vel * 1.3, dt);
      if (!u.mueve || lejos) u.vida = Math.min(u.max, u.vida + u.max * 0.25 * dt);
    }
  }
  /* separación entre súbditos para que no se monten */
  const ss = S.u.filter((u) => (u.k === 's' || u.k === 'h') && !u.muerto);
  /* 18/11 (tirones en las peleas): solo se comparan los que están en casillas vecinas de 1,2 m (antes, todos con todos: con 60 personajes, 1.770 parejas en cada paso) */
  const CEL = new Map(), PARES = [];
  ss.forEach((q, i) => {q._i = i; const k = (Math.floor(q.x / 1.2) + 512) * 1024 + Math.floor(q.z / 1.2) + 512; let c = CEL.get(k); if (!c) CEL.set(k, c = []); c.push(q);});
  for (const q of ss) {const cx = Math.floor(q.x / 1.2) + 512, cz = Math.floor(q.z / 1.2) + 512; for (let ox = -1; ox <= 1; ox++) for (let oz = -1; oz <= 1; oz++) {const c = CEL.get((cx + ox) * 1024 + cz + oz); if (c) for (const r of c) if (r._i > q._i) PARES.push(q, r);}}
  for (let pi = 0; pi < PARES.length; pi += 2) {const a = PARES[pi], b = PARES[pi + 1], hh = a.k === 'h' && b.k === 'h'; if (hh && (a.dash || b.dash)) continue; let dx = a.x - b.x, dz = a.z - b.z; if (dx > 1.2 || dx < -1.2 || dz > 1.2 || dz < -1.2) continue; let d0 = Math.hypot(dx, dz); const m = hh ? CHOQUE_H : 0.9; if (d0 < m) {if (d0 < 0.001) {dx = a.id < b.id ? 1 : -1; dz = 0; d0 = 1;} const p = (m - d0) / 2; if (a.k === 's' || hh) {a.x += dx / d0 * p; a.z += dz / d0 * p;} if (b.k === 's' || hh) {b.x -= dx / d0 * p; b.z -= dz / d0 * p;} if (hh) {choca(a); choca(b);}}}
  /* 17/11 (Henar): los héroes chocan entre sí, como en el Wild Rift (antes se atravesaban); en las cargas y saltos no */
  /* 23/11: las bestias tienen cuerpo: héroes y soldados no se meten dentro (antes se veían metidos dentro de Nasor); la bestia no se mueve por eso */
  for (const j of S.u) {if (j.k !== 'j' || j.muerto || j.vida <= 0) continue; const rj = radio(j);
    for (const u of ss) {if (u.dash) continue; const m = rj + (u.k === 'h' ? 0.6 : 0.4); let dx = u.x - j.x, dz = u.z - j.z; if (dx > m || dx < -m || dz > m || dz < -m) continue; let d0 = Math.hypot(dx, dz); if (d0 >= m) continue;
      if (d0 < 0.001) {dx = 1; dz = 0; d0 = 1;} u.x = j.x + dx / d0 * m; u.z = j.z + dz / d0 * m; limita(u);}}
  /* torres */
  const EN_T = {};
  for (const t of S.u) {
    if (t.k === 't' && t.vida <= 0 && t.respInh && S.t >= t.respInh && S.modo !== '1v1') {t.vida = t.max; t.inhib = true; t.respInh = 0; ev(['aviso', 0, 'La torre de la base de ' + (t.eq ? 'los rojos' : 'los azules') + ' se ha alzado de nuevo (sin disparar)']);}
    if (t.k !== 't' || t.vida <= 0 || t.inhib) continue; t.cd = Math.max(0, t.cd - dt);
    const en = (EN_T[t.eq] || (EN_T[t.eq] = enemigosDe(t.eq))).filter((e) => e.eq !== 2 && e.k !== 't' && e.k !== 'n' && e.vida > 0 && !e.muerto && dist(t, e) - radio(e) < 8.75);
    /* como en el Wild Rift: la torre sigue con su objetivo hasta que muere o sale; si un héroe enemigo pega a un héroe aliado dentro del alcance, va a por él */
    let obj = en.find((e) => {if (e.k !== 'h' || !(e.atacaT > S.t)) return false; const v = S.porId.get(e.atacaA); return v && v.k === 'h' && v.eq === t.eq && dist(v, t) < 10.5;});
    if (!obj && t.obj) obj = en.find((e) => e.id === t.obj);
    if (!obj) obj = masCercano(t, en.filter((e) => e.k === 's'), 9.5) || masCercano(t, en, 9.5);
    t.obj = obj ? obj.id : 0;
    if (obj && t.cd <= 0) {t.cd = 1.1; golpea(t, obj);}
  }
  /* proyectiles */
  for (let i = S.proy.length - 1; i >= 0; i--) {
    const p = S.proy[i], d = p.d;
    if (!d || d.vida <= 0) {S.proy.splice(i, 1); continue;}
    const dx = d.x - p.x, dz = d.z - p.z, l = Math.hypot(dx, dz);
    if (l < 0.6) {dana(p.o, d, p.n, p.tipo); if (p.area) {for (const e of enemigosDe(p.o.eq)) if (e !== d && e.eq !== 2 && e.k !== 't' && e.k !== 'n' && dist(e, d) < p.area) dana(p.o, e, p.n * (e.k === 'h' ? 0.5 : 0.25), 'at'); ev(['fx', 'explosion', d.x, d.z, 3.2]);} S.proy.splice(i, 1); continue;}
    p.x += dx / l * Math.min(l, p.v * dt); p.z += dz / l * Math.min(l, p.v * dt);
  }
  /* zonas (lluvia de flechas) */
  for (let i = S.zonas.length - 1; i >= 0; i--) {
    const z = S.zonas[i]; z.t -= dt; z.tick -= dt;
    if (z.tick <= 0) {z.tick = 0.5; for (const e of enemigosDe(z.eq)) if (e.k !== 't' && e.k !== 'n' && dist(e, z) < z.r + radio(e)) {dana(z.o, e, z.dps * 0.5, z.mag ? 'mag' : 'hab'); if (e.buf) {e.buf.lento = 0.8; e.buf.lentoV = z.l;} else e.lento = S.t + 0.8;}}
    if (z.t <= 0) S.zonas.splice(i, 1);
  }
  S.u = S.u.filter((u) => !((u.k === 's' || u.k === 'j') && u.muerto && S.t > u.quitar));
}

/* habilidades: las resuelve quien simula. dx,dz: dirección; px,pz: punto */
function frena(e, v, d) {if (e.k === 't' || e.k === 'n') return; if (e.buf) {e.buf.lento = d; e.buf.lentoV = v;} else e.lento = S.t + d;}
function golpeLinea(h, e, H, n, T) {dana(h, e, n, T); if (H.aturde && e.k !== 't') e.aturd = S.t + H.aturde; if (H.lento) frena(e, H.lento, H.durL); if (H.tira && e.vida > 0 && (e.k === 'h' || e.k === 's' || e.k === 'j' && !NEUTRO[e.tipo].grande)) {const l2 = Math.hypot(e.x - h.x, e.z - h.z) || 1, q = Math.max(0, l2 - 1.4 - radio(e) + 0.6); e.x -= (e.x - h.x) / l2 * q; e.z -= (e.z - h.z) / l2 * q; limita(e); if (e.k === 'h') {e.dash = null; e.px = undefined;} limita(e); ev(['tp', e.id, e.x, e.z]);}}
function avanzaTiroH(p, dt) {/* true = se acaba */
  const h = S.porId.get(p.o), H = p.H, d = Math.min(26 * dt, p.alc - p.rec); if (!h || d <= 0) return true;
  for (const e of enemigosDe(p.eq)) {
    if (e.k === 'n' || (e.k === 't' && !atacable(e)) || e.vida <= 0 || e.muerto || p.toc.includes(e.id)) continue;
    const t = Math.max(0, Math.min(d, (e.x - p.x) * p.dx + (e.z - p.z) * p.dz));
    if (Math.hypot(p.x + p.dx * t - e.x, p.z + p.dz * t - e.z) < H.ancho + radio(e)) {p.toc.push(e.id); golpeLinea(h, e, H, p.n, p.T); if (!H.perfora) {const pr = (e.x - p.x) * p.dx + (e.z - p.z) * p.dz, pe = Math.abs((e.x - p.x) * p.dz - (e.z - p.z) * p.dx), rr = H.ancho + radio(e), tc = Math.max(0, Math.min(d, pr - Math.sqrt(Math.max(0, rr * rr - pe * pe)))); ev(['tfin', p.pid, +(p.x + p.dx * tc).toFixed(2), +(p.z + p.dz * tc).toFixed(2), p.o]); return true;}}
  }
  p.x += p.dx * d; p.z += p.dz * d; p.rec += d; return p.rec >= p.alc - 1e-3;
}
function mueveTirosH(dt) {if (S.tirosH) for (let i = S.tirosH.length - 1; i >= 0; i--) if (avanzaTiroH(S.tirosH[i], dt)) S.tirosH.splice(i, 1);}
function enCono(ex, ez, dx, dz, R, A, r) {
  const d0 = Math.hypot(ex, ez); if (d0 > R + r) return false; if (d0 < r) return true;
  if ((ex * dx + ez * dz) / d0 >= Math.cos(A)) return true;
  for (const s of [1, -1]) {const ux = dx * Math.cos(A) - s * dz * Math.sin(A), uz = s * dx * Math.sin(A) + dz * Math.cos(A), t = ex * ux + ez * uz; if (t >= 0 && t <= R && Math.abs(ex * uz - ez * ux) < r) return true;}
  return false;
}
function usaHab(h, k, dx, dz, px, pz) {
  if (!h || h.muerto || h.aturd > S.t || h.cd[k] > 0 || !(h.rk[k] > 0)) return false;
  const H = HEROES[h.tipo].hab[k], cm = costeMn(h.tipo, k, h.rk[k]); if (h.mana < cm) return false; /* sin energía no se lanza */
  const st = stats(h), escala = 1 + 0.22 * (h.rk[k] - 1) + 0.03 * (h.nivel - 1) + (H.mag ? st.poder / 160 : (st.dano - HEROES[h.tipo].dano) / 150), T = H.mag ? 'mag' : 'hab'; /* las mágicas crecen con el poder mágico; las físicas, con el daño */
  const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; h.rot = Math.atan2(dx, dz);
  h.cd[k] = H.cd * (1 - 0.08 * (h.rk[k] - 1)) * (h.buf.huorn > 0 ? 0.8 : 1); h.mana -= cm; h.hc++; h.hk = k; h.revela = S.t + 1.2; if (h.buf.invis && H.tipo !== 'invis') h.buf.invis = 0;
  const n = (H.dano || 0) * escala, en = () => enemigosDe(h.eq).filter((e) => e.k !== 'n' && (e.k !== 't' || atacable(e)));
  if (H.tipo === 'dash') {const v = H.dist / 0.28; h.dash = {vx: dx * v, vz: dz * v, t: 0.28, n, aturde: H.aturde, toc: new Set()}; ev(['fx', 'polvo', h.x, h.z, 1.5]);}
  if (H.tipo === 'salto') {const d0 = Math.min(H.dist, Math.hypot(px - h.x, pz - h.z) || H.dist), v = d0 / 0.45; h.dash = {vx: dx * v, vz: dz * v, t: 0.45, salto: true, toc: new Set(), cae: {x: h.x + dx * d0, z: h.z + dz * d0, r: H.radio, n, l: H.lento, dur: H.durL}};}
  if (H.tipo === 'escudo') {for (const a of H.aliados ? heroes().filter((a) => a.eq === h.eq && !a.muerto && (a === h || dist(a, h) < H.aliados)) : [h]) {a.buf.escudo = H.dur; a.buf.escudoV = H.val * escala; ev(['fx', 'onda', a.x, a.z, 2.5]);}}
  if (H.tipo === 'reduce') {h.buf.reduce = H.dur; ev(['fx', 'onda', h.x, h.z, 2.5]);}
  if (H.tipo === 'rafaga') h.buf.rafaga = H.dur;
  if (H.tipo === 'invis') h.buf.invis = H.dur;
  if (H.tipo === 'suerte') {h.buf.suerte = H.dur; h.vida = Math.min(st.vida, h.vida + st.vida * H.cura); ev(['fx', 'onda', h.x, h.z, 3]);}
  if (H.tipo === 'area') {for (const e of en()) if (dist(e, h) < H.radio + radio(e)) {dana(h, e, n, T); if (H.curaH && e.k === 'h') {const mx = st.vida, c = (mx - h.vida) * H.curaH + 15; h.vida = Math.min(mx, h.vida + c); ev(['num', h.x, h.z, '+' + Math.round(c), 'v']);} if (H.aturde && e.k !== 't') e.aturd = S.t + H.aturde; if (H.lento) {if (e.buf) {e.buf.lento = H.durL; e.buf.lentoV = H.lento;} else e.lento = S.t + H.durL;}} ev(['fx', 'onda', h.x, h.z, H.radio * 1.8]); ev(['fx', 'explosion', h.x, h.z, H.radio * 0.6]);}
  if (H.tipo === 'cono') {for (const e of en()) {const ex = e.x - h.x, ez = e.z - h.z, d0 = Math.hypot(ex, ez); if (enCono(ex, ez, dx, dz, H.alc, H.ang / 2, radio(e))) {dana(h, e, n, T); if (H.lento) frena(e, H.lento, H.durL);}} ev(['fx', 'tajo', h.x + dx * 1.8, h.z + dz * 1.8, H.alc]);}
  if (H.tipo === 'linea') {
{const p = {o: h.id, eq: h.eq, x: h.x - dx * 0.5, z: h.z - dz * 0.5, dx, dz, rec: -0.5, alc: H.alc, n, T, H, toc: [], pid: (S.pidT = (S.pidT || 0) + 1)}; ev(['tiro', H.proy, h.x, h.z, h.x + dx * H.alc, h.z + dz * H.alc, 26, H.ancho || 0.5, p.pid, h.id]); if (!(h.lat > 0 && avanzaTiroH(p, h.lat))) (S.tirosH = S.tirosH || []).push(p);} if (0) {const e = null; (() => {dana(h, e, n, T); if (H.aturde && e.k !== 't') e.aturd = S.t + H.aturde; if (H.lento) frena(e, H.lento, H.durL); if (H.tira && e.vida > 0 && (e.k === 'h' || e.k === 's' || e.k === 'j' && !NEUTRO[e.tipo].grande)) {const l2 = Math.hypot(e.x - h.x, e.z - h.z) || 1, q = Math.max(0, l2 - 1.4 - radio(e) + 0.6); e.x -= (e.x - h.x) / l2 * q; e.z -= (e.z - h.z) / l2 * q; limita(e); if (e.k === 'h') {e.dash = null; e.px = undefined;} limita(e); ev(['tp', e.id, e.x, e.z]);}})}
  }
  if (H.tipo === 'ejecuta') {/* la Guillotina de Darius: daño más el que le falta; si derriba, se recarga */
    const t = masCercano(h, en().filter((e) => e.k === 'h'), H.alc + 0.6); if (!t) {h.cd[k] = 0; h.hc--; h.mana += cm; return false;}
    h.rot = Math.atan2(t.x - h.x, t.z - h.z); {const l0 = dist(h, t); if (l0 > 2.2) {h.x = t.x - (t.x - h.x) / l0 * 1.8; h.z = t.z - (t.z - h.z) / l0 * 1.8; limita(h); ev(['fx', 'polvo', h.x, h.z, 2]);}} /* salta hacia él como Darius */ const mx = stats(t).vida; luego(0.35, () => {if (t.vida <= 0 || h.muerto) return; dana(h, t, n + (mx - t.vida) * H.falta, T); if (t.vida <= 0 || t.muerto) {h.cd[k] = 0; ev(['num', h.x, h.z, '¡Otra vez!', 'v']);} ev(['fx', 'explosion', t.x, t.z, 1.6]);});
  }
  ev(['hb', h.id, k, +dx.toFixed(2), +dz.toFixed(2), +(px || 0).toFixed(1), +(pz || 0).toFixed(1)]);
  if (H.tipo === 'zona') {const d0 = Math.min(H.alc, Math.hypot(px - h.x, pz - h.z)), x = h.x + dx * d0, z = h.z + dz * d0; S.zonas.push({x, z, r: H.radio, t: H.dur, tick: 0, dps: H.dps * escala, mag: H.mag, l: H.lento, eq: h.eq, o: h}); ev(['zona', x, z, H.radio, H.dur, h.id]);}
  return true;
}

/* ---------- almenaras: la «Stealth Ward» del LoL / Wild Rift ----------
   Reglas del LoL: 2 cargas como máximo (se empieza con 1), una carga cada 210 → 120 s según el nivel medio de los héroes,
   dura 90 → 120 s según tu nivel, como mucho 3 tuyas a la vez, alcance de colocación 600 (6,75 m con nuestra escala: Destello 400 = 4,5 m),
   visión 900 (10 m). Los enemigos no la ven. Aquí la visión sirve para ver dentro de la hierba alta. */
const ALM = {alc: 6.75, r: 10, max: 3};
function recargaAlmenara() {const hs = heroes(), l = hs.reduce((a, h) => a + h.nivel, 0) / Math.max(1, hs.length); return 210 - 90 * Math.min(1, (l - 1) / 8);}
function ponAlmenara(h, px, pz) {
  if (!h || h.muerto || !(h.vg >= 1)) return false;
  let dx = px - h.x, dz = pz - h.z; const l = Math.hypot(dx, dz); if (l > ALM.alc) {dx *= ALM.alc / l; dz *= ALM.alc / l;}
  const p = {x: h.x + dx, z: h.z + dz}; limita(p);
  const mias = S.visiones.filter((z) => z.alm === h.id && z.hasta > S.t); if (mias.length >= ALM.max) mias.sort((a, b) => a.hasta - b.hasta)[0].hasta = 0;
  S.visiones.push({x: p.x, z: p.z, r: ALM.r, eq: h.eq, hasta: S.t + 90 + 30 * Math.min(1, (h.nivel - 1) / 8), alm: h.id});
  if (h.vg >= 2) h.vgT = recargaAlmenara(); h.vg--; ev(['alm', h.eq, p.x, p.z]); return true;
}
function usaEnc(h) {
  const e = ENC[h.enc]; if (!h || h.muerto || !e || (h.cd.enc || 0) > 0 || !tieneBotas(h.inv)) return false;
  if (h.enc !== 'azogue' && h.aturd > S.t) return false;
  h.cd.enc = e.cd;
  if (h.enc === 'estasis') {h.buf.estasis = 2.5; h.dash = null;}
  if (h.enc === 'gargola') {const v0 = stats(h).vida; h.buf.gargola = 4; h.vida += stats(h).vida - v0;}
  if (h.enc === 'azogue') {h.aturd = 0; h.buf.lento = 0; h.buf.azogue = 1.5;}
  if (h.enc === 'medallon') for (const a of heroes()) if (a.eq === h.eq && !a.muerto && dist(a, h) < 8) {a.buf.escudo = 2.5; a.buf.escudoV = (a.buf.escudoV || 0) + 30 + 11 * h.nivel; ev(['enc', a.id, 'medallon']);}
  if (h.enc !== 'medallon') ev(['enc', h.id, h.enc]);
  ev(['son', 'magia']); return true;
}
function usaHechizo(h, k, dx, dz) {
  if (!h || h.muerto || h.cd[k] > 0 || h.aturd > S.t) return false;
  if (k === 'f' && h.hf === 'c') {/* Castigo: golpe seco a la bestia o súbdito más cercano (como el Smite del LoL) */
    if (TIPO_MAPA === 'ojo') {const t = masCercano(h, S.u.filter((u) => (u.k === 'j' || u.k === 's') && u.eq !== h.eq && !u.muerto && u.vida > 0), 5.5); if (!t) return false;
      h.cd.f = HECHIZOS.c.cd; dana(h, t, 380 + 45 * h.nivel, 'hab'); ev(['castigo', t.x, t.z]); return true;}
    const t = masCercano(h, S.u.filter((u) => u.k === 'h' && u.eq !== h.eq && !u.muerto && u.vida > 0), 7); if (!t) return false;
    h.cd.f = HECHIZOS.c.cd; t.quema = {dps: (80 + 45 * h.nivel) / 5, hasta: S.t + 5, o: h.id, tick: 0}; ev(['castigo', t.x, t.z]); ev(['num', t.x, t.z, '🔥', 'r']); return true;
  }
  h.cd[k] = HECHIZOS[k].cd;
  if (k === 'd') {const l = Math.hypot(dx, dz) || 1, r = h.rot || 0; if (!dx && !dz) {dx = Math.sin(r); dz = Math.cos(r);} else {dx /= l; dz /= l;} ev(['fx', 'onda', h.x, h.z, 2]); h.x += dx * 4.5; h.z += dz * 4.5; h.px = undefined; limita(h); h.rot = Math.atan2(dx, dz); ev(['fx', 'onda', h.x, h.z, 2.4]); ev(['tp', h.id, h.x, h.z]);}
  if (k === 'f') {for (const a of heroes()) if (a.eq === h.eq && !a.muerto && (a === h || dist(a, h) < 8)) {const st = stats(a); a.vida = Math.min(st.vida, a.vida + st.vida * 0.18 + 25 * h.nivel); a.buf.prisa = 1.5; ev(['fx', 'onda', a.x, a.z, 3]); ev(['num', a.x, a.z, '+' + Math.round(st.vida * 0.18 + 25 * h.nivel), 'v']);}}
  ev(['son', 'magia']); return true;
}

/* ---------- bots ---------- */
function heroeEn0(h, en) {return en.filter((e) => e.k === 'h').sort((a, b) => dist(h, a) - dist(h, b))[0];}
function esquivaBot(h) {
  if (h.esq && h.esq.t > S.t) {h.mx = h.esq.x; h.mz = h.esq.z; return;} h.esq = null; if (!S.tirosH || h.muerto) return;
  for (const p of S.tirosH) {if (p.eq === h.eq || p.rec < 1.5) continue; const l = Math.hypot(p.dx, p.dz) || 1, dx = p.dx / l, dz = p.dz / l;
    const al = (h.x - p.x) * dx + (h.z - p.z) * dz, lat = (h.x - p.x) * dz - (h.z - p.z) * dx, r = p.H.ancho + radio(h) + 0.3;
    if (al < 0 || al > Math.min(p.alc - p.rec + 2, 26 * 0.6) || Math.abs(lat) > r) continue;
    const vistos = h.vistos || (h.vistos = new Set()); if (vistos.has(p.pid)) continue; vistos.add(p.pid); if (vistos.size > 40) vistos.clear();
    if (Math.random() > 0.55) continue; const sg = Math.abs(lat) > 0.15 ? Math.sign(lat) : (Math.random() < 0.5 ? -1 : 1);
    h.esq = {t: S.t + 0.38, x: dz * sg, z: -dx * sg}; h.mx = h.esq.x; h.mz = h.esq.z; return;}
}
function ia(h, dt, st) {
  const en = enemigosDe(h.eq, h), F = BASES[h.eq].fuente, avanza = h.eq ? -1 : 1;
  h.iaT = (h.iaT || 0) - dt; h.mx = 0; h.mz = 0; h.ataca = false;
  {const rl = S.reliq.find((r) => S.t >= r.listo && dist(h, r) < 18); if (rl && h.vida < stats(h).vida * 0.6) {ve(h, rl.x, rl.z); return;}}
  if (S.modo === '1v1') {const r = radioAnillo(S.t); if (r && Math.hypot(h.x, h.z) > r - 3) {ve(h, 0, 0); h.ataca = true; return;}}
  if (h.enc === '' && tieneBotas(h.inv) && dist(h, F) < 8 && h.oro > 420) compra(h, ['gargola', 'estasis', 'azogue', 'medallon'][h.slot % 4]);
  if (h.enc && !(h.cd.enc > 0) && h.vida < stats(h).vida * 0.3 && en.some((e) => e.k === 'h' && dist(e, h) < 8)) usaEnc(h);
  if (h.vg >= 1 && Math.random() < 0.02) {const hb = HIERBAS.find((q) => dist(h, q) < ALM.alc && dist(q, F) > 25 && !S.visiones.some((z) => z.eq === h.eq && z.hasta > S.t && dist(z, q) < 8)); if (hb) ponAlmenara(h, hb.x, hb.z);}
  /* compra en la fuente */
  if (dist(h, F) < 8) {const plan = PLAN_BOT[h.tipo] || []; const id = plan[h.plan]; if (id && compra(h, id) === '') h.plan++;}
  autoSube(h);
  const pv = h.vida / st.vida;
  if (pv < 0.3 && h.cd.f <= 0 && en.some((e) => e.k === 'h' && dist(e, h) < 9)) usaHechizo(h, 'f', 0, 0);
  if (pv < 0.18 && h.cd.d <= 0 && en.some((e) => e.k === 'h' && dist(e, h) < 5)) usaHechizo(h, 'd', F.x - h.x, F.z - h.z);
  if (pv < 0.28 || h.vuelve) {h.vuelve = pv < 0.92; ve(h, F.x, F.z); return;}
  const heroeEn = en.filter((e) => e.k === 'h').sort((a, b) => dist(h, a) - dist(h, b))[0];
  /* habilidades contra héroes cercanos */
  if (heroeEn && dist(h, heroeEn) < 9 && h.iaT <= 0) {
    h.iaT = 0.6;
    for (const k of ['r', 'q', 'e', 'w']) {
      const H = HEROES[h.tipo].hab[k]; if (h.cd[k] > 0 || !(h.rk[k] > 0) || h.mana < costeMn(h.tipo, k, h.rk[k])) continue;
      const d0 = dist(h, heroeEn), alc = H.alc || H.dist || H.radio || 4;
      /* 22/11: las de uno mismo cuando sirven (antes solo a menos de 6 m: los de lejos no las usaban nunca) — escudo y coraza al recibir,
         velocidad de ataque al tener a tiro, curación con la vida baja, invisibilidad para entrar si va ganando o para huir */
      if (['escudo', 'reduce', 'rafaga', 'suerte', 'invis'].includes(H.tipo)) {
        const aTiro = d0 < st.alcance + 2.5, pe = heroeEn.vida / stats(heroeEn).vida;
        const sirve = H.tipo === 'rafaga' ? d0 < st.alcance + 1 : H.tipo === 'suerte' ? aTiro && (pv < 0.7 || pe < 0.45) : H.tipo === 'invis' ? (pv < 0.35 && d0 < 8) || (d0 < 10 && pe < pv + 0.1) : aTiro && pv < 0.9;
        if (sirve) {usaHab(h, k, heroeEn.x - h.x, heroeEn.z - h.z, heroeEn.x, heroeEn.z); break;} continue;}
      if (d0 < alc + 0.5) {usaHab(h, k, heroeEn.x - h.x, heroeEn.z - h.z, heroeEn.x, heroeEn.z); break;}
    }
  }
  /* si un compañero pelea con una bestia grande o con el Uruk, se va a ayudar */
  const bestiaAliada = S.u.find((u) => u.k === 'j' && !u.muerto && NEUTRO[u.tipo].grande && S.u.some((q) => q.k === 'h' && q.eq === h.eq && q !== h && q.id === u.agro && !q.bot));
  if (bestiaAliada && pv > 0.55 && dist(h, bestiaAliada) < 40) {if (dist(h, bestiaAliada) - radio(bestiaAliada) > st.alcance) ve(h, bestiaAliada.x, bestiaAliada.z); else h.ataca = true; return;}
  /* camino: en el 2 contra 2 cada uno el suyo; en el 1 contra 1 el que esté más apretado */
  if (S.carriles.length > 1 && S.u.filter((q) => q.k === 'h').length === 2 && (h.carrilT || 0) < S.t) {
    h.carrilT = S.t + 12;
    const peligro = [0, 1].map((l) => Math.max(0, ...S.u.filter((u) => u.k === 's' && u.eq !== h.eq && u.carril === l && !u.muerto).map((u) => h.eq ? progreso(l, u) : 1 - progreso(l, u))));
    h.carril = peligro[0] >= peligro[1] ? 0 : 1;
  }
  const l = h.carril;
  const aliados = S.u.filter((u) => u.eq === h.eq && u.k === 's' && !u.muerto && u.carril === l);
  const prog = (u) => h.eq ? 1 - progreso(l, u) : progreso(l, u);
  const frente = aliados.length ? aliados.reduce((m, u) => (prog(u) > prog(m) ? u : m)) : null;
  /* caza en la espesura cuando su camino está tranquilo */
  const empujando = S.u.some((t) => (t.k === 't' || t.k === 'n') && t.eq !== h.eq && t.vida > 0 && atacable(t) && aliados.some((a) => dist(a, t) < 13));
  const camTranquilo = !empujando && !S.u.some((u) => u.k === 's' && u.eq !== h.eq && !u.muerto && u.carril === l && dist(u, h) < 18);
  /* 23/11: Nasor y el lagarto: van a por ellos aunque haya soldados en su camino (antes casi nunca les tocaban), en pareja o con mucho nivel,
     si no hay héroes enemigos cerca del foso; y si su compañero ya le está pegando, van a ayudar */
  if (pv > 0.55 && !(heroeEn && dist(h, heroeEn) < 9)) {
    const jefe = S.u.find((u) => u.k === 'j' && !u.muerto && u.vida > 0 && (NEUTRO[u.tipo].jefe || NEUTRO[u.tipo].draco) && !en.some((e) => e.k === 'h' && dist(e, u) < 13) && (
      u.agro && S.u.some((a) => a.id === u.agro && a.k === 'h' && a.eq === h.eq) && dist(h, u) < 45 ||
      dist(h, u) < 30 && pv > 0.75 && (NEUTRO[u.tipo].draco ? h.nivel >= 4 : h.nivel >= 6) && (h.nivel >= 9 || S.u.some((a) => a.k === 'h' && a.eq === h.eq && a !== h && !a.muerto && a.vida > 0 && dist(a, u) < 30))));
    if (jefe) {if (dist(h, jefe) - radio(jefe) > st.alcance) ve(h, jefe.x, jefe.z); else h.ataca = true; return;}
  }
  if (camTranquilo && pv > 0.6 && !(heroeEn && dist(h, heroeEn) < 10)) {
    const bestias = S.u.filter((u) => u.k === 'j' && !u.muerto && (NEUTRO[u.tipo].jefe ? (h.nivel >= 9 && pv > 0.9 || h.nivel >= 6 && pv > 0.75 && S.u.some((a) => a.k === 'h' && a.eq === h.eq && a !== h && !a.muerto && a.vida > 0 && (dist(a, u) < 16 || a.nivel >= 6 && dist(a, h) < 22))) : NEUTRO[u.tipo].draco ? h.nivel >= 5 && pv > 0.85 : ladoDe(u) * avanza <= 4) && (dist(h, u) < 26 || (NEUTRO[u.tipo].jefe || NEUTRO[u.tipo].draco) && u.agro && S.u.some((a) => a.id === u.agro && a.k === 'h' && a.eq === h.eq) && dist(h, u) < 40) && !en.some((e) => e.k === 'h' && dist(e, u) < 12));
    const b = bestias.sort((a, c) => dist(h, a) - dist(h, c))[0];
    if (b) {if (dist(h, b) - radio(b) > st.alcance) ve(h, b.x, b.z); else {h.ataca = true;} return;}
  }
  const torres = S.u.filter((t) => (t.k === 't' || t.k === 'n') && t.eq !== h.eq && t.vida > 0 && atacable(t));
  const torreEn = torres.sort((a, b) => dist(h, a) - dist(h, b))[0];
  const enTorre = (p) => S.u.some((t) => t.k === 't' && t.eq !== h.eq && t.vida > 0 && dist(t, p) < 10);
  let objetivo = null;
  /* 22/11: los de cuerpo a cuerpo con un salto o una carga lista entran desde más lejos (antes solo a su alcance + 4 m: los de lejos
     les pegaban sin que se acercaran nunca); los asesinos se atreven antes */
  let alcEnt = st.alcance + 4;
  for (const k of ['q', 'w', 'e', 'r']) {const H = HEROES[h.tipo].hab[k]; if (['salto', 'dash', 'ejecuta'].includes(H.tipo) && h.rk[k] > 0 && h.cd[k] <= 0 && h.mana >= costeMn(h.tipo, k, h.rk[k])) alcEnt = Math.max(alcEnt, (H.dist || H.alc || 0) + st.alcance);}
  const osadia = h.tipo === 'gollum' ? 0.25 : 0.15;
  if (heroeEn && dist(h, heroeEn) < alcEnt && (heroeEn.vida / stats(heroeEn).vida < pv + osadia) && !enTorre(heroeEn)) objetivo = heroeEn;
  if (!objetivo) {const c = masCercano(h, en.filter((e) => e.k === 's' && !enTorre(e)), st.alcance + 3); if (c) objetivo = c;}
  const nadieDefiende = torreEn && !en.some((e) => e.k === 'h' && dist(e, torreEn) < 14);
  const torreOcupada = torreEn && torreEn.k === 't' && torreEn.obj && (S.porId.get(torreEn.obj) || {}).k === 's';
  if (torreOcupada && pv > 0.45 && dist(h, torreEn) < st.alcance + 8 && !(heroeEn && dist(heroeEn, h) < 6)) objetivo = torreEn;
  if (!objetivo && torreEn && (aliados.some((a) => dist(a, torreEn) < 10) || nadieDefiende) && (dist(h, torreEn) < st.alcance + 6 || nadieDefiende && dist(h, torreEn) < 22)) objetivo = torreEn;
  if (objetivo) {
    const d0 = dist(h, objetivo) - radio(objetivo);
    if (d0 > st.alcance) ve(h, objetivo.x, objetivo.z); else h.ataca = true;
  } else {
    /* espera un poco por detrás del súbdito más adelantado de su camino; sin súbditos, junto a su torre */
    let sitio;
    if (frente) {const f = Math.max(0, Math.min(1, progreso(l, frente) - avanza * 0.03)); sitio = puntoCarril(l, f);}
    else {const t = S.u.find((q) => q.k === 't' && q.eq === h.eq && q.carril === l && q.vida > 0); sitio = t ? puntoCarril(l, h.eq ? 1 - TORRE_F + 0.04 : TORRE_F - 0.04) : BASES[h.eq].torre;}
    if (dist(h, sitio) > 1.5) ve(h, sitio.x, sitio.z);
  }
}

/* ---------- rendirse (como en el Wild Rift: desde el minuto 5; hasta el 9 hace falta que voten sí todos,
   después más del 70 %; si falla, otra vez a los 2 minutos). Solo votan las personas, no los bots. ---------- */
const RINDE_T = 300, RINDE_MAYORIA = 540, VOTO_DUR = 15, VOTO_ESPERA = 120;
function votosNecesarios(eq) {const n = heroes().filter((h) => h.eq === eq && !h.bot).length || 1; return S.t < RINDE_MAYORIA ? n : Math.floor(n * 0.7) + 1;}
function rinde(h, si) {
  if (!S.voto) {S.voto = [null, null]; S.votoT = [0, 0];}
  const eq = h.eq; let R = S.voto[eq];
  if (!R) {
    if (!si) return;
    if (S.t < RINDE_T) {ev(['aviso', h.id, 'Podrás rendirte a partir del minuto 5']); return;}
    if (S.votoT[eq] > S.t) {ev(['aviso', h.id, 'Podrás volver a votar en ' + Math.ceil(S.votoT[eq] - S.t) + ' s']); return;}
    R = S.voto[eq] = {si: new Set(), no: new Set(), hasta: S.t + VOTO_DUR};
  }
  if (R.si.has(h.id) || R.no.has(h.id)) return;
  (si ? R.si : R.no).add(h.id);
  const n = heroes().filter((q) => q.eq === eq && !q.bot).length || 1, need = votosNecesarios(eq);
  ev(['voto', eq, h.id, R.si.size, R.no.size, need, n, Math.max(0, R.hasta - S.t)]);
  if (R.si.size >= need) cierraVoto(eq, true); else if (R.no.size > n - need) cierraVoto(eq, false);
}
function cierraVoto(eq, ok) {
  S.voto[eq] = null;
  if (ok) {S.fin = 1 - eq; ev(['aviso', 0, (eq ? 'El equipo rojo' : 'El equipo azul') + ' se rinde']); ev(['fin', 1 - eq]);}
  else {S.votoT[eq] = S.t + VOTO_ESPERA; ev(['votoFin', eq]);}
}
/* ---------- tienda ---------- */
function puedeComprar(h) {return h.muerto || dist(h, BASES[h.eq].fuente) < 9;}
/* precio de verdad como en el Wild Rift: un legendario se compra de golpe pagando también los básicos que te falten */
function precio(inv, id) {const o = OBJ[id]; return o.c + falta({inv}, id).reduce((a, f) => a + OBJ[f].c, 0);}
function falta(h, id) {const o = OBJ[id]; if (!o.rec) return []; const q = [...h.inv], f = []; for (const r of o.rec) {const k = q.indexOf(r); if (k >= 0) q.splice(k, 1); else f.push(r);} return f;}
/* 22/11 (TALLER NUEVO): vender al 70 % de lo que vale entero (como en el LoL) y deshacer la última compra o venta mientras sigas en la fuente */
function valorObj(id) {const o = OBJ[id]; return o ? o.c + (o.rec || []).reduce((a, r) => a + valorObj(r), 0) : 0;}
function fotoCompra(h) {h.ultCompra = {inv: [...h.inv], oro: h.oro, enc: h.enc};}
function vende(h, id) {
  if (!puedeComprar(h)) return 'Solo se vende en tu base';
  const i = h.inv.lastIndexOf(id); if (i < 0) return 'No lo llevas';
  fotoCompra(h); h.inv.splice(i, 1); const p = Math.floor(valorObj(id) * 0.7); h.oro += p; const st = stats(h); h.vida = Math.min(h.vida, st.vida); h.mana = Math.min(h.mana, st.mana);
  ev(['num', h.x, h.z, '+' + p, 'o', h.id]); return '';
}
function deshaz(h) {
  const u = h.ultCompra; if (!u || !puedeComprar(h)) return 'No hay nada que deshacer';
  h.inv = u.inv; h.oro = u.oro; h.enc = u.enc; h.ultCompra = null; const st = stats(h); h.vida = Math.min(h.vida, st.vida); h.mana = Math.min(h.mana, st.mana); return '';
}
function compra(h, id) {
  if (ENC[id]) {
    const e = ENC[id]; if (!puedeComprar(h)) return 'Solo se compra en tu base (o mientras esperas a volver)';
    if (!tieneBotas(h.inv)) return 'Antes necesitas unas botas'; if (h.enc === id) return 'Ya lo tienes';
    if (h.oro < e.c) return 'Te falta oro'; fotoCompra(h); h.oro -= e.c; h.enc = id; h.cd.enc = Math.max(h.cd.enc || 0, 10); return '';
  }
  const o = OBJ[id]; if (!o) return 'No existe';
  if (!puedeComprar(h)) return 'Solo se compra en tu base (o mientras esperas a volver)';
  const fl = falta(h, id), pr = precio(h.inv, id);
  if (h.oro < pr) return 'Te falta oro';
  /* se gastan los básicos que tengas de la receta; los que faltan van incluidos en el precio */
  const tengo = [...h.inv], gasto = []; if (o.rec) for (const r of o.rec) {const k = tengo.indexOf(r); if (k >= 0) {tengo.splice(k, 1); gasto.push(r);}}
  if (h.inv.length - gasto.length >= 6) return 'No caben más objetos';
  fotoCompra(h); const v0 = stats(h).vida; h.oro -= pr; for (const u of gasto) h.inv.splice(h.inv.indexOf(u), 1); h.inv.push(id);
  h.vida += Math.max(0, stats(h).vida - v0); return '';
}

/* ---------- foto de la partida (anfitrión → todos) ---------- */
const AN = {quieto: 0, correr: 1};
/* lo que manda cada jugador (en el móvil del anfitrión o en el servidor) */
function aplicaMando(h, o) {
    if (o.t === 'in') {if (o.tc !== undefined) h.tcIn = o.tc; h.lat = Math.min(0.5, (o.rt || 0) / 1000 + (+o.ip || INTERP_MS) / 1000 + 1 / 30); /* 17/11: antes en el servidor se usaba media ida y vuelta y los golpes del invitado se quedaban cortos */ /* rt = ida y vuelta del invitado al servidor ≈ invitado→servidor→anfitrión */ if (!h.muerto && !h.dash && !(h.aturd > S.t)) {h.x = o.x; h.z = o.z; h.rot = o.rot; h.mueve = o.m;} h.ataca = o.a; h.prioHeroe = true; h.modoAt = o.mo || ''; h.fijo = o.fi || 0; if ((o.g || 0) > (h.gVisto || 0)) {h.gVisto = o.g; h.tap = S.t + 1.5;}}
    if (o.t === 'hab') {h.x = o.x; h.z = o.z; rebobinado(h, () => usaHab(h, o.k, o.dx, o.dz, o.px, o.pz));}
    if (o.t === 'compra') {const r = compra(h, o.id); if (r) S.ev.push(['aviso', h.id, r]);}
    if (o.t === 'vende') {const r = vende(h, o.id); if (r) S.ev.push(['aviso', h.id, r]);}
    if (o.t === 'deshaz') {const r = deshaz(h); if (r) S.ev.push(['aviso', h.id, r]);}
    if (o.t === 'sube') subeHab(h, o.k);
    if (o.t === 'rinde') rinde(h, !!o.si);
    if (o.t === 'enc') usaEnc(h);
    if (o.t === 'hech1') h.hf = o.v === 'c' ? 'c' : 'f';
    if (o.t === 'avisoEq') {const e = ['ping', h.eq, h.id, o.k, o.x, o.z]; ev(e);}
    if (o.t === 'emo') emote(h, o.k);
    if (o.t === 'hech') {h.x = o.x; h.z = o.z; usaHechizo(h, o.k, o.dx, o.dz);}
    if (o.t === 'alm') {h.x = o.x; h.z = o.z; ponAlmenara(h, o.px, o.pz);}
    if (o.t === 'volver') {if (!h.muerto) {const f = BASES[h.eq].fuente; h.x = f.x; h.z = f.z - signo(h.eq) * 2.5; h.px = undefined; h.buf.casa = 8;}}
  }
function foto() {
  const u = S.u.map((q) => q.k === 'h'
    ? [q.id, 'h', q.eq, +q.x.toFixed(2), +q.z.toFixed(2), +(q.rot || 0).toFixed(2), Math.round(q.vida), Math.round(stats(q).vida), q.mueve || q.dash ? 1 : 0, q.ac, q.hc, q.hk, q.muerto ? Math.max(0, Math.ceil(q.resp - S.t)) : -1, q.tipo, q.nivel, Math.floor(q.oro), q.inv.join(','), ['q', 'w', 'e', 'r'].map((k) => +q.cd[k].toFixed(1)).join(','), (q.buf.invis > 0 ? 1 : 0) | (q.aturd > S.t ? 2 : 0) | (q.buf.escudo > 0 ? 4 : 0) | (q.hierba >= 0 && !(q.revela > S.t) ? 8 : 0), q.nombre, q.slot, +(q.xp / xpNivel(q.nivel)).toFixed(2), q.hierba ?? -1, ['q', 'w', 'e', 'r'].map((k) => q.rk[k]).join(''), q.pts, [q.kills, q.muertes, q.asist, q.cs, Math.round(q.dH || 0)].join('/'), +q.cd.d.toFixed(1), +q.cd.f.toFixed(1), Math.round(q.buf.troll || 0), Math.round(q.buf.huorn || 0), q.atacaT > S.t ? q.atacaA : 0, q.enc, +(q.cd.enc || 0).toFixed(1), (q.buf.estasis > 0 ? 1 : 0) | (q.buf.gargola > 0 ? 2 : 0) | (q.buf.lento > 0 ? 4 : 0) | (q.quema && q.quema.hasta > S.t ? 8 : 0) | (q.sang && q.sang.hasta > S.t ? 16 : 0) | (q.buf.azogue > 0 || q.buf.alfa > 0 || q.buf.casa > 0 ? 32 : 0) | (q.buf.furiaO > 0 ? 64 : 0), q.fijo || 0, q.hf, q.vg, Math.ceil(q.vgT), Math.round(q.mana), Math.round(stats(q).mana), q.bot ? 0 : (q.tcIn || 0), +stats(q).vel.toFixed(2)]
    : [q.id, q.k, q.eq, +q.x.toFixed(2), +q.z.toFixed(2), +(q.rot || 0).toFixed(2), Math.round(q.vida), Math.round(q.max), q.mueve ? 1 : 0, q.ac || 0, q.obj || 0, (q.k === 't' || q.k === 'n') ? (q.vida > 0 && protegida(q) ? 'P' : '') + (q.inhib ? 'I' : '') + (q.k === 't' && q.n === 1 && S.t < PLACAS_FIN && (q.placas ?? 5) > 0 ? 'L' : '') : q.k === 'j' ? q.elem || '' : q.fuerte ? 'F' : '', q.muerto ? 0 : -1, q.tipo || q.n || 0]);
  const be = S.bufEq.map((b) => Math.max(0, Math.round((b.uruk || 0) - S.t))), dr = S.bufEq.map((b) => [b.drF || 0, b.drH || 0, b.alma || 0]);
  const cp = S.campos.map((c) => c.vivos > 0 ? -1 : Math.max(0, Math.round(c.resp - S.t)));
  return {t: +S.t.toFixed(2), u, m: S.muertes, be, cp, an: S.modo === '1v1' ? +radioAnillo(S.t).toFixed(1) : 0, rl: S.reliq.map((r) => S.t >= r.listo ? 1 : 0), dr, pl: S.plantas.map((q) => S.t >= q.listo ? 1 : 0), sa: S.santuarios.filter((z) => z.hasta > S.t).map((z) => [+z.x.toFixed(1), +z.z.toFixed(1), z.eq]), al: S.visiones.filter((z) => z.alm && z.hasta > S.t).map((z) => [+z.x.toFixed(1), +z.z.toFixed(1), z.eq, Math.ceil(z.hasta - S.t)]), ev: S.ev.splice(0)};
}

  /* monta el mapa como en el móvil: trazado y árboles con choque (misma semilla que construyeMapa) */
  function montaMapa(modo) {ponMapa(modo); const semilla = {v: 7}; const al = () => {semilla.v = (semilla.v * 16807) % 2147483647; return semilla.v / 2147483647;}; plantaBosque(al, (n, x, z, s, choque) => {al(); if (choque) ponArbolChoque(x, z, 0.75 * s);});}
  return {montaMapa, nuevaPartida, paso, foto, aplicaMando, get S() {return S;}, set S(v) {S = v;}};
}
