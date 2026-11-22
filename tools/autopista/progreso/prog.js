/* PROGRESO (22/11, Henar: «dale otra vuelta a todo»): lo que hace que apetezca jugar otra. Todo en este móvil (localStorage 'auto.perfil'):
   nivel de cuenta con experiencia por partida, MAESTRÍA de cada héroe (I-V, como la del Wild Rift), LOGROS de partida (primera sangre,
   dobles, intocable, cazador de Nasor…), historial de las últimas 12 partidas y una pantalla final nueva con MVP, daño a héroes,
   oro, logros y las barras de cuenta y maestría llenándose. */
const PERFIL_K = 'auto.perfil', MAE = [0, 600, 1500, 3000, 5200, 8000], MAE_N = ['Sin maestría', 'Maestría I', 'Maestría II', 'Maestría III', 'Maestría IV', 'Maestría V'];
const LOGROS = {
  sangre: ['🩸', 'Primera sangre', 'El primer derribo de la partida'], doble: ['⚔️', 'Doble derribo', 'Dos derribos seguidos'], triple: ['🔥', 'Triple derribo', 'Tres derribos seguidos'],
  cuadruple: ['☄️', 'Cuádruple', 'Cuatro derribos seguidos'], racha: ['📈', 'En racha', 'Tres derribos sin morir'], imparable: ['⚡', '¡Imparable!', 'Cinco derribos sin morir'],
  leyenda: ['🌟', 'Leyenda de la autopista', 'Siete derribos sin morir'], aniquila: ['💀', 'Aniquilación', 'Dejar a todo el equipo rival en el suelo'], corta: ['✂️', 'Racha cortada', 'Derribar a quien iba en racha'],
  intocable: ['🛡️', 'Intocable', 'Ganar sin morir ni una vez'], demoledor: ['🏗️', 'Demoledor', 'Derribar dos torres o más'], nasor: ['🐛', 'Cazador de Nasor', 'Dar el último golpe a Nasor'],
  lagarto: ['🦎', 'Domador', 'Dar el último golpe al lagarto de la central'], granjero: ['🌾', 'Granjero', 'Seis soldados por minuto o más'], mvp: ['👑', 'MVP', 'El mejor de la partida ganando'],
  remonta: ['🔄', 'Remontada', 'Ganar yendo por detrás en derribos a mitad de partida'], paliza: ['💥', 'Paliza', 'Ganar en menos de 12 minutos'],
};
function perfil() {try {const p = JSON.parse(localStorage.getItem(PERFIL_K)); if (p && p.v === 1) return p;} catch (e) {} return {v: 1, xp: 0, partidas: 0, victorias: 0, heroes: {}, logros: {}, hist: []};}
function guardaPerfil(p) {try {localStorage.setItem(PERFIL_K, JSON.stringify(p));} catch (e) {}}
const xpSig = (n) => 250 + 60 * (n - 1);
function nivelCuenta(xp) {let n = 1, r = xp; while (r >= xpSig(n)) {r -= xpSig(n); n++;} return {n, r, sig: xpSig(n)};}
function nivelMae(pts) {let n = 0; while (n < 5 && pts >= MAE[n + 1]) n++; return {n, r: pts - MAE[n], sig: n < 5 ? MAE[n + 1] - MAE[n] : 1};}
const romano = (n) => ['', 'I', 'II', 'III', 'IV', 'V'][n] || '';
/* emblemas del Pack Autopista 59 ART (ui/ap_mae_1..5) */
const maeImg = (n) => n ? '<img class="maeB" src="ui/ap_mae_' + n + '.webp" alt="' + MAE_N[n] + '">' : '';
function maeBadge(k) {const h = perfil().heroes[k]; return maeImg(h ? nivelMae(h.pts).n : 0);}
/* lo que va pasando en la partida (desde efectoLocal) */
const PART = {logros: new Set(), torres: 0, kMitad: null};
function progEfecto(e) {
  if (e[0] !== 'baja' || e[1] !== YO) return; const vd = VISTA.get(e[2]), txt = e[3] || '';
  if (/Nasor/.test(txt)) PART.logros.add('nasor'); if (/lagarto/i.test(txt)) PART.logros.add('lagarto');
  if (vd && vd.k === 't') {PART.torres++; if (PART.torres >= 2) PART.logros.add('demoledor');}
  const m = {'¡Primera sangre!': 'sangre', '¡Doble derribo!': 'doble', '¡Triple derribo!': 'triple', '¡Cuádruple derribo!': 'cuadruple', '¡En racha!': 'racha', '¡Imparable!': 'imparable', '¡Leyenda de la autopista!': 'leyenda', '¡Aniquilación!': 'aniquila', '¡Racha cortada!': 'corta'}[txt];
  if (m) {PART.logros.add(m); if (m === 'triple' || m === 'cuadruple') PART.logros.add('doble'); if (m === 'imparable' || m === 'leyenda') PART.logros.add('racha'); if (m === 'leyenda') PART.logros.add('imparable');}
}
const kdaDe = (q) => {const p = (q.kda || '0/0/0/0/0').split('/').map(Number); return {k: p[0] || 0, d: p[1] || 0, a: p[2] || 0, cs: p[3] || 0, dH: p[4] || 0};};
const valorDe = (q) => Math.round((q.oro || 0) + (q.inv || []).reduce((s, i) => s + (OBJ[i] ? valorObj(i) : 0), 0));
const nota = (q) => {const s = kdaDe(q); return s.k * 3 + s.a * 1.6 - s.d * 1.3 + s.cs * 0.04 + s.dH / 450;};
/* pantalla final nueva + reparto de experiencia y maestría */
function finNuevo(f, ganador) {
  const yo = VISTA.get(YO); if (!yo) return; const gana = ganador === MI_EQ, seg = +($('marcador').dataset.t || 0), min = Math.max(1, seg / 60);
  const hs = [...VISTA.values()].filter((q) => q.k === 'h'), mejor = (eq) => hs.filter((q) => q.eq === eq).sort((a, b) => nota(b) - nota(a))[0];
  const mvp = ganador >= 0 && MODO !== '1v1' ? mejor(ganador) : null, svp = ganador >= 0 && MODO !== '1v1' ? mejor(1 - ganador) : null, s = kdaDe(yo); /* en el Duelo no hay MVP: solo sois dos */
  if (gana && s.d === 0) PART.logros.add('intocable'); if (s.cs / min >= 6 && min >= 5) PART.logros.add('granjero'); if (gana && mvp && mvp.id === YO) PART.logros.add('mvp');
  if (gana && seg < 720 && seg > 60) PART.logros.add('paliza');
  if (gana && PART.kMitad !== null && PART.kMitad < 0) PART.logros.add('remonta');
  /* experiencia de cuenta y puntos de maestría */
  const P = perfil(), hk = yo.tipo, H = P.heroes[hk] = P.heroes[hk] || {pts: 0, p: 0, v: 0, k: 0, d: 0, a: 0};
  const xp = Math.round((gana ? 120 : 70) + s.k * 6 + s.a * 3 + s.cs * 0.4 + min * 4 + PART.logros.size * 10);
  const pts = Math.round((gana ? 320 : 160) + Math.max(0, nota(yo)) * 14 + (mvp && mvp.id === YO ? 120 : svp && svp.id === YO ? 60 : 0));
  const c0 = nivelCuenta(P.xp), m0 = nivelMae(H.pts); P.xp += xp; H.pts += pts;
  const c1 = nivelCuenta(P.xp), m1 = nivelMae(H.pts);
  if (ganador >= 0) {P.partidas++; if (gana) P.victorias++; H.p++; if (gana) H.v++; H.k += s.k; H.d += s.d; H.a += s.a;}
  for (const l of PART.logros) P.logros[l] = (P.logros[l] || 0) + 1;
  const LM = progLigaMisiones(P, ganador, s, !!(mvp && mvp.id === YO)), rg = rangoDe(P.pl || 0);
  P.hist.unshift({f: Date.now(), h: hk, g: gana ? 1 : ganador === -1 ? -1 : 0, kda: s.k + '/' + s.d + '/' + s.a, m: MODO, t: Math.round(seg)}); P.hist = P.hist.slice(0, 12);
  guardaPerfil(P);
  /* pintar */
  const maxD = Math.max(1, ...hs.map((q) => kdaDe(q).dH)), fila = (q) => {const t = kdaDe(q), sello = mvp && q.id === mvp.id ? '<img class="fMvpI" src="ui/ap_mvp.webp" alt="MVP">' : svp && q.id === svp.id ? '<img class="fMvpI" src="ui/ap_svp.webp" alt="SVP">' : '';
    return '<div class="fFila ' + (q.eq === MI_EQ ? 'az' : 'ro') + (q.id === YO ? ' yo' : '') + '"><img src="' + RET(q.tipo) + '" alt=""><span class="fN">' + (q.nombre || '') + sello + '<small>' + HEROES[q.tipo].nombre.split(',')[0] + ' · Nv ' + q.nivel + '</small></span><span class="fK">' + t.k + '/' + t.d + '/' + t.a + '</span><span class="fD"><i style="width:' + Math.round(t.dH / maxD * 100) + '%"></i><b>' + t.dH.toLocaleString('es') + '</b></span><span class="fO">💰 ' + (valorDe(q) / 1000).toFixed(1) + 'k</span><span class="fC">🗡 ' + t.cs + '</span></div>';};
  const eqs = [MI_EQ, 1 - MI_EQ].map((eq) => '<div class="fEq ' + (eq === MI_EQ ? 'az' : 'ro') + '"><div class="fEqT">' + (eq === MI_EQ ? 'Tu equipo' : 'Rivales') + (ganador === eq ? ' · ganan' : '') + '</div>' + hs.filter((q) => q.eq === eq).sort((a, b) => nota(b) - nota(a)).map(fila).join('') + '</div>').join('');
  const barra = (cls, tit, a0, a1, sube, txt) => '<div class="fBar ' + cls + '"><div class="fBarT"><b>' + tit + '</b><span>' + txt + '</span></div><div class="fBarI"><i style="width:' + a0 + '%" data-a="' + a1 + '" data-sube="' + (sube ? 1 : 0) + '"></i></div></div>';
  const pc = (r, sig) => Math.round(Math.min(1, r / sig) * 100);
  const logros = [...PART.logros].map((l) => '<span class="fLog" title="' + LOGROS[l][2] + '"><i>' + LOGROS[l][0] + '</i>' + LOGROS[l][1] + '</span>').join('');
  f.innerHTML = '<div class="fin2"><div class="fIzq"><img class="fSpl" src="ui/ap_splash_' + hk + '.webp" alt=""><h2 class="' + (gana ? 'gana' : 'pierde') + '">' + (gana ? '¡VICTORIA!' : ganador === -1 ? 'FIN' : 'DERROTA') + '</h2>' +
    (mvp && mvp.id === YO ? '<div class="fYoMvp"><img src="ui/ap_mvp.webp" alt=""><b>MVP</b></div>' : svp && svp.id === YO ? '<div class="fYoMvp s"><img src="ui/ap_svp.webp" alt=""><b>Mejor de tu equipo</b></div>' : '') + '<div class="fDur">' + Math.floor(seg / 60) + ':' + String(Math.floor(seg % 60)).padStart(2, '0') + ' · ' + (MODO === '2v2' ? 'Batalla' : 'Duelo') + '</div></div>' +
    '<div class="fDer"><div class="fCab"><span></span><span>K/D/A</span><span>Daño a héroes</span><span>Valor</span><span>Soldados</span></div>' + eqs +
    '<div class="fPremios">' + barra('cuenta', 'Cuenta · Nv ' + c1.n, c1.n > c0.n ? 0 : pc(c0.r, c0.sig), pc(c1.r, c1.sig), c1.n > c0.n, '+' + xp + ' XP' + (c1.n > c0.n ? ' · ¡Subes a nivel ' + c1.n + '!' : '')) +
    barra('mae', HEROES[hk].nombre.split(',')[0] + ' · ' + MAE_N[m1.n], m1.n > m0.n ? 0 : pc(m0.r, m0.sig), m1.n === 5 ? 100 : pc(m1.r, m1.sig), m1.n > m0.n, '+' + pts + ' maestría' + (m1.n > m0.n ? ' · ¡' + MAE_N[m1.n] + '!' : '')) +
    (logros ? '<div class="fLogs">' + logros + '</div>' : '<div class="fLogs vacio">Sin logros esta vez. La próxima.</div>') +
    (ganador >= 0 ? '<div class="fLiga">' + rangoBadge(P.pl || 0) + '<b>Liga: ' + rg.n + '</b><span class="' + (LM.pl >= 0 ? 'lMas' : 'lMenos') + '">' + (LM.pl >= 0 ? '+' : '') + LM.pl + ' PL</span>' + LM.hechas.map((id) => '<em>' + MISIONES[id][0] + ' Misión cumplida: ' + MISIONES[id][1] + ' · +80 XP</em>').join('') + '</div>' : '') + '</div>' +
    '<button class="bt" id="bOtra">Seguir</button></div></div>';
  setTimeout(() => f.querySelectorAll('.fBarI i').forEach((i) => {i.style.width = i.dataset.a + '%'; if (i.dataset.sube === '1') i.parentNode.parentNode.classList.add('sube');}), 450);
  if (c1.n > c0.n || m1.n > m0.n) setTimeout(() => suena('nivel', 0.8), 900);
}
/* a mitad de partida se mira quién va por delante en derribos (para la «Remontada») */
function progTick() {const seg = +($('marcador').dataset.t || 0); if (PART.kMitad === null && seg > 360) {const hs = [...VISTA.values()].filter((q) => q.k === 'h'), k = (eq) => hs.filter((q) => q.eq === eq).reduce((s, q) => s + kdaDe(q).k, 0); PART.kMitad = k(MI_EQ) - k(1 - MI_EQ);}}
/* en el menú: tu nivel arriba a la izquierda; al tocarlo, el perfil */
function pintaPerfilChip() {
  const menu = $('menu'); if (!menu) return; let c = $('perfilChip'); const P = perfil(), n = nivelCuenta(P.xp);
  if (!c) {c = document.createElement('button'); c.id = 'perfilChip'; menu.appendChild(c); c.onclick = abrePerfil;}
  const ms = misionesHoy(P), pend = ms.l.filter((m) => !m.ok).length; guardaPerfil(P);
  c.innerHTML = '<img src="' + RET(heroeElegido) + '" alt=""><span><b>' + (localStorage.getItem('vado.nombre') || 'Jugador') + '</b><small>Nivel ' + n.n + ' · ' + rangoDe(P.pl || 0).n + '</small><i><u style="width:' + Math.round(n.r / n.sig * 100) + '%"></u></i></span>' + rangoBadge(P.pl || 0) + (pend ? '<em class="pcMis">' + pend + '</em>' : '');
}
function abrePerfil() {
  const P = perfil(), n = nivelCuenta(P.xp); let el = $('perfil'); if (!el) {el = document.createElement('div'); el.id = 'perfil'; document.body.appendChild(el);}
  const pct = (a, b) => b ? Math.round(a / b * 100) + ' %' : '—';
  const heroes = Object.keys(HEROES).map((k) => {const h = P.heroes[k] || {pts: 0, p: 0, v: 0, k: 0, d: 0, a: 0}, m = nivelMae(h.pts);
    return '<div class="pH"><img src="' + RET(k) + '" alt="">' + maeImg(m.n) + '<b>' + HEROES[k].nombre.split(',')[0] + '</b><small>' + MAE_N[m.n] + '</small><span class="pBar"><u style="width:' + (m.n === 5 ? 100 : Math.round(m.r / m.sig * 100)) + '%"></u></span><small>' + h.p + ' partidas · ' + pct(h.v, h.p) + (h.p ? ' · ' + ((h.k + h.a) / Math.max(1, h.d)).toFixed(1) + ' KDA' : '') + '</small></div>';}).join('');
  const logros = Object.entries(LOGROS).map(([k, l]) => '<div class="pL' + (P.logros[k] ? ' on' : '') + '" title="' + l[2] + '"><i>' + l[0] + '</i><b>' + l[1] + '</b><small>' + (P.logros[k] ? '×' + P.logros[k] : l[2]) + '</small></div>').join('');
  const misiones = misionesHoy(P).l.map((m) => {const M_ = MISIONES[m.id]; return '<div class="pM' + (m.ok ? ' ok' : '') + '"><i>' + M_[0] + '</i><b>' + M_[1] + '</b><span class="pBar"><u style="width:' + Math.round(m.n / M_[2] * 100) + '%"></u></span><small>' + (m.ok ? '✅ Hecha · +80 XP' : m.n.toLocaleString('es') + ' / ' + M_[2].toLocaleString('es') + ' · +80 XP') + '</small></div>';}).join('') + '<p class="pVacio">Cambian cada día a medianoche. Liga: +25 PL si ganas (+5 si eres el MVP), −15 si pierdes.</p>'; guardaPerfil(P);
  const hist = P.hist.length ? P.hist.map((q) => '<div class="pR ' + (q.g === 1 ? 'g' : q.g === 0 ? 'p' : '') + '"><img src="' + RET(q.h) + '" alt=""><b>' + (q.g === 1 ? 'Victoria' : q.g === 0 ? 'Derrota' : 'Fin') + '</b><span>' + q.kda + '</span><small>' + (q.m === '2v2' ? 'Batalla' : 'Duelo') + ' · ' + Math.floor(q.t / 60) + ' min</small></div>').join('') : '<p class="pVacio">Aún no has jugado ninguna partida.</p>';
  el.innerHTML = '<div class="pCaja"><button class="pX" id="pX">✕</button><div class="pCab"><img src="' + RET(heroeElegido) + '" alt=""><div><b>' + (localStorage.getItem('vado.nombre') || 'Jugador') + '</b><small>Nivel ' + n.n + ' · ' + n.r + '/' + n.sig + ' XP</small><span class="pBar"><u style="width:' + Math.round(n.r / n.sig * 100) + '%"></u></span></div><div class="pTot pRg">' + rangoBadge(P.pl || 0, true) + '<b>' + rangoDe(P.pl || 0).n + '</b><small>' + (P.pl || 0) + ' PL' + (rangoDe(P.pl || 0).sig ? ' · faltan ' + (rangoDe(P.pl || 0).sig - rangoDe(P.pl || 0).r) : '') + '</small></div><div class="pTot"><b>' + P.partidas + '</b><small>partidas</small></div><div class="pTot"><b>' + pct(P.victorias, P.partidas) + '</b><small>victorias</small></div></div>' +
    '<div class="pTabs"><button data-t="m" class="on">Misiones</button><button data-t="h">Maestría</button><button data-t="l">Logros</button><button data-t="r">Historial</button></div>' +
    '<div class="pCont pMis" data-c="m">' + misiones + '</div><div class="pCont oculto" data-c="h">' + heroes + '</div><div class="pCont oculto" data-c="l">' + logros + '</div><div class="pCont oculto" data-c="r">' + hist + '</div></div>';
  el.classList.remove('hidden'); $('pX').onclick = () => el.classList.add('hidden'); el.onclick = (e) => {if (e.target === el) el.classList.add('hidden');};
  el.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => {el.querySelectorAll('[data-t]').forEach((q) => q.classList.toggle('on', q === b)); el.querySelectorAll('[data-c]').forEach((q) => q.classList.toggle('oculto', q.dataset.c !== b.dataset.t));});
}
/* en elegir héroe: su frase de presentación y tu maestría con él */
function eligeExtra(k) {
  const F = typeof FRASES !== 'undefined' && FRASES[k], h = perfil().heroes[k], m = h ? nivelMae(h.pts).n : 0;
  return (F ? '<i class="eFrase">«' + F.hola[0] + '»</i>' : '') + '<small class="eMae">' + maeImg(m) + MAE_N[m] + (h && h.p ? ' · ' + h.p + ' partidas · ' + Math.round(h.v / h.p * 100) + ' %' : '') + '</small>';
}
/* ---------- LIGA (22/11): puntos de liga (PL) por partida acabada: +25 si ganas (+5 si eres MVP), −15 si pierdes; 7 rangos ---------- */
const RANGOS = [['Asfalto', 0, '#8a8f98'], ['Bronce', 100, '#c07a3a'], ['Plata', 250, '#c9d4e2'], ['Oro', 450, '#ffcf3a'], ['Platino', 700, '#3ad8c0'], ['Diamante', 1000, '#5aa8ff'], ['Leyenda de la A-6', 1400, '#ff4ad8']];
function rangoDe(pl) {let i = 0; while (i < RANGOS.length - 1 && pl >= RANGOS[i + 1][1]) i++; const sig = RANGOS[i + 1]; return {i, n: RANGOS[i][0], col: RANGOS[i][2], r: pl - RANGOS[i][1], sig: sig ? sig[1] - RANGOS[i][1] : 0};}
const rangoBadge = (pl, grande) => {const r = rangoDe(pl); return '<img class="rgB' + (grande ? ' g' : '') + '" src="ui/ap_rango_' + (r.i + 1) + '.webp" alt="' + r.n + '">';}; /* Pack Autopista 60 ART */
/* ---------- MISIONES DEL DÍA (22/11): 3 al día (las mismas para todo el día, elegidas con la fecha), +80 XP cada una ---------- */
const MISIONES = {
  jugar2: ['🎮', 'Juega 2 partidas', 2, (r) => r.acaba], gana1: ['🏆', 'Gana una partida', 1, (r) => r.gana], derr5: ['⚔️', 'Consigue 5 derribos', 5, (r) => r.k],
  asis6: ['🤝', 'Consigue 6 asistencias', 6, (r) => r.a], sold80: ['🗡️', 'Remata 80 soldados', 80, (r) => r.cs], dano8: ['💥', 'Haz 8.000 de daño a héroes', 8000, (r) => r.dH],
  batalla: ['🏙️', 'Juega una Batalla 2 contra 2', 1, (r) => r.batalla], jefe: ['🐛', 'Da el último golpe a Nasor o al lagarto', 1, (r) => r.jefe],
  torre: ['🏗️', 'Derriba una torre', 1, (r) => r.torres], logro3: ['🌟', 'Saca 3 logros en una partida', 1, (r) => r.logros >= 3 ? 1 : 0],
};
const hoyKey = () => {const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();};
function misionesHoy(P) {
  const k = hoyKey(); if (P.mis && P.mis.dia === k) return P.mis;
  let s = 0; for (const c of k) s = (s * 31 + c.charCodeAt(0)) >>> 0; const ids = Object.keys(MISIONES), el = [];
  while (el.length < 3) {s = (s * 1103515245 + 12345) >>> 0; const id = ids[s % ids.length]; if (!el.includes(id)) el.push(id);}
  P.mis = {dia: k, l: el.map((id) => ({id, n: 0, ok: 0}))}; return P.mis;
}
/* lo que ha pasado en la partida, para las misiones y la liga (se llama desde finNuevo antes de guardar) */
function progLigaMisiones(P, ganador, s, mvpYo) {
  const out = {pl: 0, hechas: []}; if (ganador < 0) return out;
  const gana = ganador === MI_EQ; P.pl = Math.max(0, (P.pl || 0) + (gana ? 25 + (mvpYo ? 5 : 0) : -15)); out.pl = gana ? 25 + (mvpYo ? 5 : 0) : -15;
  const r = {acaba: 1, gana: gana ? 1 : 0, k: s.k, a: s.a, cs: s.cs, dH: s.dH, batalla: MODO === '2v2' ? 1 : 0, jefe: PART.logros.has('nasor') || PART.logros.has('lagarto') ? 1 : 0, torres: PART.torres, logros: PART.logros.size};
  for (const m of misionesHoy(P).l) {if (m.ok) continue; const M_ = MISIONES[m.id]; m.n = Math.min(M_[2], m.n + (M_[3](r) || 0)); if (m.n >= M_[2]) {m.ok = 1; P.xp += 80; out.hechas.push(m.id);}}
  return out;
}
/* resumen de muerte (como el del Wild Rift): quién te ha quitado la vida en los últimos 12 s */
const DANO_R = []; let RECAP = '';
function recibeDano(e) {if (e[0] !== 'num' || e[6] !== YO || typeof e[3] !== 'number' || e[4] === 'o') return; DANO_R.push([performance.now(), e[5] || 0, e[3]]); while (DANO_R.length && performance.now() - DANO_R[0][0] > 12000) DANO_R.shift();}
function recapMuerte(v) {
  if (!(v.muerto >= 0)) {RECAP = ''; return '';} if (RECAP) return RECAP;
  const por = new Map(); let tot = 0; for (const [t, de, n] of DANO_R) {if (performance.now() - t > 12000) continue; const q = VISTA.get(de), key = !q ? 'otro' : q.k === 'h' ? de : q.k === 's' ? 'sold' : q.k === 't' || q.k === 'n' ? 'torre' : 'bestia'; por.set(key, (por.get(key) || 0) + n); tot += n;}
  if (!tot) return (RECAP = ' ');
  const filas = [...por.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => {const q = typeof k === 'number' ? VISTA.get(k) : null, mag = q && q.k === 'h' && typeof esMagico === 'function' && esMagico(q.tipo);
    const img = q ? RET(q.tipo) : k === 'torre' ? '../abismo/iconos/torre.webp' : k === 'sold' ? 'ui/ap_b_subditos.webp' : 'ui/ap_mm_troll.webp', nom = q ? q.nombre : {torre: 'Torre', sold: 'Soldados', bestia: 'Bestias', otro: 'Otros'}[k];
    return '<div class="dR"><img src="' + img + '" alt=""><span>' + nom + '<small>' + (q ? (mag ? 'daño mágico' : 'daño físico') : '') + '</small></span><i><u class="' + (mag ? 'mag' : '') + '" style="width:' + Math.round(n / tot * 100) + '%"></u></i><b>' + Math.round(n) + '</b></div>';}).join('');
  return (RECAP = '<div class="dRecap"><div class="dT">Daño recibido · ' + Math.round(tot) + '</div>' + filas + '</div>');
}
