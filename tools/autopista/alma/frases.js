/* ALMA (22/11): frases de cada héroe en un bocadillo sobre la cabeza (al derribar, al lanzar la definitiva, al volver a la vida) y emoticonos.
   Textos propios, sin citas. hola/risa/burla/gg = los 4 emoticonos del botón; mata/ulti/vuelve = automáticas. */
const FRASES = {
  enano: {hola: ['Que la luz te guarde.'], risa: ['¡Ja! Ni un rasguño.'], burla: ['¿Eso era un golpe?'], gg: ['Buena pelea. De verdad.'],
    mata: ['La luz no se apaga.', 'Uno menos en la carretera.', 'Al suelo, y a pensar.'], ulti: ['¡QUE BRILLE!', '¡De rodillas!'], vuelve: ['Otra vez en pie.', 'La armadura aguanta.']},
  gandalf: {hola: ['Hace calor, ¿eh?'], risa: ['¡Jajaja! Chamuscado.'], burla: ['Te veo un poco tostado.'], gg: ['Partida ardiente.'],
    mata: ['Ceniza.', '¡Achicharrado!', 'Vuelta y vuelta.'], ulti: ['¡ARDE!', '¡Todo en llamas!'], vuelve: ['Las brasas nunca se apagan.']},
  orco: {hola: ['Grub saluda. Grub es educado.'], risa: ['¡Jo, jo! ¡Grub se ríe!'], burla: ['Grub bajito. Tú más.'], gg: ['Grub respeta.'],
    mata: ['Lección aprendida.', 'Grub enseña, tú aprendes.', 'Clase terminada.'], ulti: ['¡HOJA VERDE!', '¡Grub corta!'], vuelve: ['El maestro vuelve.']},
  elfo: {hola: ['Te tengo en la mira.'], risa: ['Ni te has enterado.'], burla: ['Quietecito, que no te veo.'], gg: ['Buen tiro. El mío, digo.'],
    mata: ['Un disparo, una baja.', 'Blanco abatido.', 'Demasiado fácil.'], ulti: ['Respira… ¡ya!', '¡Fuego a discreción!'], vuelve: ['Recargando.']},
  hobbit: {hola: ['¡Fore!'], risa: ['¡Jaja! ¡Hoyo en uno!'], burla: ['Tu swing da pena.'], gg: ['Bonito recorrido.'],
    mata: ['¡Bajo par!', '¡Al green!', 'Eagle. Para mí.'], ulti: ['¡FOOORE!', '¡Drive largo!'], vuelve: ['Saco otra vez desde el tee.']},
  gollum: {hola: ['Ni me has oído llegar.'], risa: ['Je.'], burla: ['Demasiado lento.'], gg: ['Respeto, guerrero.'],
    mata: ['Silencio.', 'Ni lo viste venir.', 'Sombra y filo.'], ulti: ['Sombras…', '¡Ahora!'], vuelve: ['La sombra vuelve.']},
  visor: {hola: ['Escaneando… hola.'], risa: ['Ja. Ja. Calculado.'], burla: ['Objetivo: predecible.'], gg: ['Partida registrada: buena.'],
    mata: ['Objetivo eliminado.', 'Lectura completa.', 'Error en tu sistema.'], ulti: ['¡RAYO MÁXIMO!', 'Fijado. Disparo.'], vuelve: ['Sistema reiniciado.']},
  rohan: {hola: ['El viento me trae.'], risa: ['¡Te ha comido la arena!'], burla: ['Te pierdes en un oasis.'], gg: ['Buena caza, amigo.'],
    mata: ['El halcón no falla.', 'Polvo eres.', 'Arena en los ojos.'], ulti: ['¡TORMENTA DE ARENA!', '¡Desde el cielo!'], vuelve: ['El halcón vuelve a volar.']},
};
const EMO = {hola: '👋', risa: '😂', burla: '😜', gg: '👍'};
const BURB = new Map(); /* id → {el, hasta, auto} */
function burbuja(id, k, emo) {
  const v = VISTA.get(id); if (!v || v.k !== 'h') return; const F = FRASES[v.tipo] || FRASES.enano, L = F[k]; if (!L) return;
  const ahora = performance.now(), prev = BURB.get(id);
  if (!emo && prev && ahora < prev.hasta + 4500) return; /* las automáticas, como mucho una cada ~7 s por héroe */
  const b = BARRAS.get(id); if (!b) return;
  if (prev && prev.el.parentNode) prev.el.remove();
  const el = document.createElement('div'), dur = emo ? 2600 : 2200;
  el.className = 'burb ' + (id === YO ? 'yo' : v.eq === MI_EQ ? 'az' : 'ro'); el.style.setProperty('--d', dur + 'ms');
  el.innerHTML = (emo ? '<img class="burbE" src="ui/ap_emo_' + k + '.webp" alt="">' : '') + L[Math.floor(Math.random() * L.length)]; /* pegatina del Pack Autopista 59 ART encima del bocadillo */
  if (emo) el.classList.add('conE');
  b.appendChild(el); BURB.set(id, {el, hasta: ahora + dur});
  /* el héroe celebra (su animación «celebrar») si está quieto: con los emoticonos y al derribar; si echa a andar, se corta */
  const o = VIS.get(id); if (o && (emo ? k !== 'hola' : k === 'mata') && (o.vel || 0) < 0.6 && o.todos && o.todos.celebrar && !(v.muerto >= 0)) {o.ocup = Math.min(2.4, animaClip(o, 'celebrar')); o.celeb = 1;}
  setTimeout(() => {if (el.parentNode) el.remove();}, dur);
}
/* emoticono propio: en la partida contra la máquina va directo; en línea, por la simulación para que lo vean todos */
let emoMioT = 0;
function emoteMio(k) {
  const ahora = performance.now(); if (ahora < emoMioT) return; emoMioT = ahora + 3000;
  if (S) {const h = S.u.find((q) => q.id === YO); if (h) emote(h, k);} else NET.manda({t: 'emo', k});
}
/* lo que pasa en la partida que da pie a una frase, y el golpe de gracia cuando derribas a un héroe (temblor, monedas, onda y el cartel en oro) */
function almaEfecto(e) {
  const t = e[0];
  if (t === 'emo') {burbuja(e[1], e[2], true); if (e[1] === YO || (VISTA.get(e[1]) || {}).eq === MI_EQ) suena('gema', 0.25);}
  if (t === 'hb' && e[2] === 'r') burbuja(e[1], 'ulti');
  if (t === 'vive') burbuja(e[1], 'vuelve');
  if (t === 'baja') {const va = VISTA.get(e[1]), vd = VISTA.get(e[2]); $('anuncio').classList.toggle('tuyo', e[1] === YO && !!vd && vd.k === 'h'); /* el cartel brilla en oro si el derribo es tuyo */
    if (!va || !vd || va.k !== 'h' || vd.k !== 'h') return;
    setTimeout(() => burbuja(e[1], 'mata'), 350);
    if (e[1] === YO) {const x = vd.xi ?? vd.x, z = vd.zi ?? vd.z; tiemblaCam = Math.max(tiemblaCam, 0.55); camGolpe = Math.max(camGolpe, 0.8);
      flip('monedas', x, z, 3.4, false, 0, 1.4); flip('ondaC', x, z, 5, true); flip('critico', x, z, 3.2, false, undefined, 1.4);
      try {navigator.vibrate && navigator.vibrate([40, 30, 90]);} catch (er) {}}}
}
/* micro-parón en los golpes fuertes tuyos o que te dan: atacante y víctima se quedan congelados 70 ms (solo su animación; el juego sigue) */
function parónGolpe(id, de) {for (const q of [id, de]) {const o = VIS.get(q); if (o && o.mixer) {o.mixer.timeScale = 0.04; o.hsT = 0.07;}}}
/* al empezar, cada héroe saluda con su frase */
function saludosInicio() {let i = 0; for (const [id, v] of VISTA) if (v.k === 'h') setTimeout(() => burbuja(id, id === YO ? 'hola' : ['hola', 'burla'][i % 2], false), 1800 + 900 * i++);}
/* vapor de las alcantarillas en las calles del barrio (solo la Batalla): un soplo de vez en cuando en los cruces cerca de la cámara */
const VAPOR = {p: null, t: 0};
function animaAlma(dt) {
  for (const [, o] of VIS) if (o.hsT > 0) {o.hsT -= dt; if (o.hsT <= 0 && o.mixer) o.mixer.timeScale = 1;}
  if (TIPO_MAPA !== 'ojo' || !NAV || ESTADO !== 'juego') return;
  if (!VAPOR.p) VAPOR.p = NAV.nodos.filter((n, i) => i % 3 === 1 && Math.abs(n.z) < 36 && Math.abs(Math.abs(n.x) - 17) > 5).map((n) => ({x: n.x + 1.3, z: n.z - 0.9, t: Math.random() * 4}));
  for (const q of VAPOR.p) {q.t -= dt; if (q.t > 0) continue; q.t = 3 + Math.random() * 3.5; if (Math.hypot(q.x - camM.x, q.z - camM.z) < 22) flip('humo', q.x, q.z, 2.4 + Math.random(), false, undefined, 0.4);}
}
/* con poca vida (menos del 25 %), un latido rojo en los bordes; y al caer el núcleo, los héroes del equipo que gana celebran */
let latidoOn = false;
function latidoVida() {
  const v = VISTA.get(YO), bajo = !!v && !(v.muerto >= 0) && v.vida > 0 && v.vida < (v.max || 1) * 0.25 && ESTADO === 'juego';
  if (bajo === latidoOn) return; latidoOn = bajo; let el = $('latido'); if (!el) {el = document.createElement('div'); el.id = 'latido'; document.body.appendChild(el);} el.classList.toggle('on', bajo);
}
function celebraGanadores(ganador) {for (const [id, v] of VISTA) if (v.k === 'h' && v.eq === ganador && !(v.muerto >= 0)) {const o = VIS.get(id); if (o && o.todos && o.todos.celebrar) {o.ocup = 4; o.celeb = 0; animaClip(o, 'celebrar'); setTimeout(() => {if (o.todos.celebrar) animaClip(o, 'celebrar');}, 1700);}}}
