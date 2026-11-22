/* ======== TALLER NUEVO (22/11, Henar: «mejora la tienda») ========
   Como el del Wild Rift: pestañas que caben sin desplazar (Ataque y Magia por separado: los magos ya no buscan entre armas),
   cada objeto con su NOMBRE debajo, «Para ti» con la siguiente compra y la ruta del héroe (lo que ya tienes marcado), y VENDER
   (70 % de lo que vale entero, como en el LoL) y DESHACER la última compra o venta mientras sigas en la fuente. */
let tDesh = false;
const TAB_ICO = {rec: 'ap_tab_rec', atq: 'ap_tab_atq', mag: 'ap_tab_mag', def: 'ap_tab_def', mov: 'ap_tab_mov', enc: 'ap_tab_enc'};
/* nombre corto debajo de cada icono (el entero va en la ficha de la derecha) */
const NOM_C = {hoja: 'Barra', daga: 'Navaja', cota: 'Chaleco', yelmo: 'Casco', manto: 'Mono ignífugo', tomo: 'Batería', botas: 'Zapatillas', amuleto: 'Termo', herugrim: 'Bate', guthwine: 'Machetes', escudo: 'Escudo', capa: 'Patinete', hacha: 'Motosierra', baculo: 'Bobina', narya: 'Generador', velo: 'Traje aislante', mithril: 'Kevlar'};
const nomCorto = (id) => NOM_C[id] || (OBJ[id] ? OBJ[id].t : id);
function vendeMia(id) {
  const v = VISTA.get(YO); if (!v) return;
  if (S) {const hh = S.u.find((q) => q.id === YO), r = vende(hh, id); if (r) aviso(r); else {suena('moneda'); tDesh = true; recibeFotoLocal(foto());}}
  else {NET.manda({t: 'vende', id}); suena('moneda'); const i = v.inv.lastIndexOf(id); if (i >= 0) {v.inv.splice(i, 1); v.oro += Math.floor(valorObj(id) * 0.7);} tDesh = true;}
}
function deshazMia() {
  if (S) {const hh = S.u.find((q) => q.id === YO), r = deshaz(hh); if (r) aviso(r); else {suena('gema', 0.4); recibeFotoLocal(foto());}}
  else {NET.manda({t: 'deshaz'}); suena('gema', 0.4);}
  tDesh = false;
}
function pintaTienda() {
  const v = VISTA.get(YO), t = $('tienda'); if (!v) return;
  const tiene = (id) => v.inv.includes(id);
  const ficha = (id, clase = '') => {
    if (ENC[id]) {const e = ENC[id], hay = tieneBotas(v.inv), st = !hay ? 'bloq' : v.enc === id ? 'mio' : v.oro < e.c ? 'caro' : ''; return '<button class="tI ' + st + ' ' + clase + (id === tSel ? ' sel' : '') + '" data-id="' + id + '"><img src="' + e.i + '" alt=""><em>' + e.t + '</em><b>' + e.c + '</b>' + (v.enc === id ? '<i>✓</i>' : '') + '</button>';}
    const o = OBJ[id], pr = precio(v.inv, id), n = v.inv.filter((x) => x === id).length, st = v.oro < pr ? 'caro' : (o.leg && !falta({inv: v.inv}, id).length) ? 'forja' : '';
    return '<button class="tI ' + st + (o.leg ? ' leg' : '') + ' ' + clase + (id === tSel ? ' sel' : '') + '" data-id="' + id + '"><img src="' + ICO(o.i) + '" alt=""><em>' + nomCorto(id) + '</em><b>' + pr + '</b>' + (n ? '<i>' + (n > 1 ? '×' + n : '✓') + '</i>' : '') + '</button>';
  };
  let centro = '';
  if (tCat === 'rec') {
    const plan = PLAN_BOT[v.tipo] || [], sg = sugerencia(v), legs = [...new Set(plan.filter((id) => OBJ[id].leg))].slice(0, 5);
    const paso = (id) => {const o = OBJ[id], ya = tiene(id), rec = o.rec || [], q = [...v.inv]; let n = 0; for (const r of rec) {const k = q.indexOf(r); if (k >= 0) {q.splice(k, 1); n++;}}
      return '<button class="tPaso' + (ya ? ' ya' : '') + (id === tSel ? ' sel' : '') + '" data-id="' + id + '"><img src="' + ICO(o.i) + '" alt=""><em>' + nomCorto(id) + '</em><small>' + (ya ? '✓ lo tienes' : n ? n + ' de ' + rec.length + ' piezas' : '🪙 ' + precio(v.inv, id)) + '</small></button>';};
    centro = '<h4>Siguiente compra</h4>' + (sg ? (() => {const o = OBJ[sg]; return '<button class="tSig' + (sg === tSel ? ' sel' : '') + '" data-id="' + sg + '"><img src="' + ICO(o.i) + '" alt=""><div><b>' + o.t + '</b><span>' + Object.entries(o.st).map(([k, x]) => ST_TXT[k] ? ST_TXT[k](x) : k).join(' · ') + '</span></div><u>🪙 ' + precio(v.inv, sg) + '</u></button>';})() : '<p class="tVacio">Ya tienes toda la ruta: mira Defensa si te revientan.</p>') +
      '<h4>Ruta de ' + HEROES[v.tipo].nombre.split(/[ ,]/)[0] + '</h4><div class="tRuta2">' + legs.map(paso).join('<span class="tFl">›</span>') + '</div>';
  } else if (tCat === 'enc') centro = '<h4>Encantamientos de botas' + (tieneBotas(v.inv) ? '' : ' · antes, unas zapatillas o el patinete') + '</h4><div class="tRej">' + Object.keys(ENC).map((id) => ficha(id)).join('') + '</div>';
  else {const l = CAT_OBJ[tCat], b = l.filter((id) => !OBJ[id].leg), g = l.filter((id) => OBJ[id].leg); centro = (b.length ? '<h4>Piezas</h4><div class="tRej">' + b.map((id) => ficha(id)).join('') + '</div>' : '') + (g.length ? '<h4>Legendarios</h4><div class="tRej">' + g.map((id) => ficha(id)).join('') + '</div>' : '');}
  /* ficha de la derecha */
  let det;
  if (ENC[tSel]) {
    const e = ENC[tSel], hay = tieneBotas(v.inv), ya = v.enc === tSel, puede = hay && !ya && v.oro >= e.c;
    det = '<div class="tDH"><img src="' + e.i + '" alt=""><div><b>' + e.t + '</b><span class="tP">🪙 ' + e.c + '</span></div></div><p class="tPas">' + e.d + '</p><p class="tNota">Recarga ' + e.cd + ' s · va en las botas y tiene botón propio. Solo uno a la vez.</p>' +
      '<div class="tBots"><button class="tBuy" id="tComprar"' + (puede ? '' : ' disabled') + '>' + (!hay ? 'Antes: botas' : ya ? 'Ya lo llevas' : v.oro < e.c ? 'Faltan ' + (e.c - v.oro) : 'Encantar') + '</button></div>';
  } else {
    const o = OBJ[tSel], pr = precio(v.inv, tSel), fl = falta({inv: v.inv}, tSel), puede = v.oro >= pr && v.inv.length - ((o.rec || []).length - fl.length) < 6, ya = tiene(tSel);
    const usos = Object.keys(OBJ).filter((k) => (OBJ[k].rec || []).includes(tSel));
    det = '<div class="tDH"><img src="' + ICO(o.i) + '" alt=""><div><b>' + o.t + '</b><span class="tP">🪙 ' + pr + (pr !== valorObj(tSel) ? ' <s>' + valorObj(tSel) + '</s>' : '') + '</span></div></div>' +
      '<div class="tSt">' + Object.entries(o.st).map(([k, x]) => '<span>' + (ST_TXT[k] ? ST_TXT[k](x) : k) + '</span>').join('') + '</div>' + (o.p ? '<p class="tPas">' + o.p + '</p>' : '') + efectoEnHeroe(v, tSel) +
      (o.rec ? '<div class="tRec"><small>Se forja con</small><div>' + (() => {const q = [...v.inv]; return o.rec.map((r) => {const k = q.indexOf(r), ten = k >= 0; if (ten) q.splice(k, 1); return '<span class="' + (ten ? 'ten' : '') + '" data-id="' + r + '"><img src="' + ICO(OBJ[r].i) + '" alt="">' + (ten ? '<i>✓</i>' : '') + '</span>';}).join('<em>+</em>');})() + '</div></div>' : '') +
      (usos.length ? '<div class="tRec"><small>Sirve para</small><div>' + usos.map((u) => '<span data-id="' + u + '"><img src="' + ICO(OBJ[u].i) + '" alt=""></span>').join('') + '</div></div>' : '') +
      '<div class="tBots">' + (ya ? '<button class="tSell" id="tVender"><img src="ui/ap_t_vende_ico.webp" alt=""><span>Vender <b>+' + Math.floor(valorObj(tSel) * 0.7) + '</b></span></button>' : '') +
      '<button class="tBuy" id="tComprar"' + (puede ? '' : ' disabled') + '>' + (v.oro < pr ? 'Faltan ' + (pr - v.oro) : !puede ? 'No caben' : 'Comprar') + '</button></div>';
  }
  t.innerHTML = '<div class="tCab"><button class="tX" id="tX" aria-label="Volver">←</button><b>Taller</b><div class="tInv">' + Array.from({length: 6}, (_, i) => v.inv[i] ? '<button class="tHueco lleno' + (v.inv[i] === tSel ? ' sel' : '') + '" data-id="' + v.inv[i] + '"><img src="' + ICO(OBJ[v.inv[i]].i) + '" alt=""></button>' : '<span class="tHueco"></span>').join('') + '</div>' +
    (tDesh ? '<button class="tDesh" id="tDesh" aria-label="Deshacer la última compra o venta"><img src="ui/ap_t_deshaz.webp" alt="">Deshacer</button>' : '') + '<span class="tOro">🪙 ' + v.oro + '</span><button class="tAyuda" id="tAyuda" aria-label="Tu héroe y cómo funciona el daño">?</button></div>' +
    '<div class="tCuerpo"><nav class="tCats">' + T_CATS.map(([k, n]) => '<button data-cat="' + k + '" class="' + (k === tCat ? 'on' : '') + '"><img src="ui/' + TAB_ICO[k] + '.webp" alt=""><span>' + n + '</span></button>').join('') + '</nav>' +
    '<div class="tLista">' + centro + '</div><div class="tDet">' + det + '</div></div>';
  t.querySelectorAll('[data-id]').forEach((b) => b.onclick = () => {tSel = b.dataset.id; pintaTienda();});
  t.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => {tCat = b.dataset.cat; const l = tCat === 'rec' ? null : tCat === 'enc' ? Object.keys(ENC) : CAT_OBJ[tCat]; if (l && !l.includes(tSel)) tSel = l[0]; if (tCat === 'rec') {const sg = sugerencia(v); if (sg) tSel = sg;} pintaTienda();});
  $('tX').onclick = () => {t.classList.add('hidden'); tDesh = false;};
  $('tAyuda').onclick = () => abreFicha(v.tipo, statsDe(v.tipo, v.nivel, v.inv));
  if ($('tDesh')) $('tDesh').onclick = () => {deshazMia(); setTimeout(pintaTienda, S ? 30 : 220);};
  if ($('tVender')) $('tVender').onclick = () => {vendeMia(tSel); setTimeout(pintaTienda, S ? 30 : 160);};
  $('tComprar').onclick = () => {compraMia(tSel); tDesh = true; setTimeout(() => {const w = VISTA.get(YO); if (w && tCat === 'rec') {const sg = sugerencia(w); if (sg) tSel = sg;} pintaTienda();}, 150);};
}
