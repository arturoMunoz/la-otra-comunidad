/* ======== ATAQUES COMO SE VEN (22/11, Henar: «que un ataque de área se vea exactamente donde apunta la marca») ========
   Una sola regla para todo: la marca de apuntar, el dibujo del efecto y el daño son la MISMA zona, y una zona da a quien la TOCA
   con su cuerpo. El aro que cada uno lleva debajo mide su cuerpo (héroes 0,75 m, soldados 0,5, los grandes 0,8): si el borde
   del efecto toca ese aro, le da. Las medidas de cada dibujo salen de tools/autopista/ataques/*.py (ver su LEEME). */
/* borde que se ve de cada hoja de efectos, en fracción de medio fotograma */
const FX_BORDE = {ondaC: 0.82, polvoA: 0.78, grietas: 0.76, explosion: 0.78, onda: 0.88, impacto: 0.89, chispa: 0.8, fuego: 0.78, polvo: 0.94,
  ap_enano_estallido: 1, ap_orco_remolino: 0.86, ap_rohan_arena: 0.88, ap_gandalf_ceniza: 0.82, ap_hobbit_hoyo: 0.8, ap_gollum_humo: 0.94,
  ap_rohan_tajo: 0.87, ap_gollum_tajo: 0.87, ap_orco_tajo: 1.02, ap_gandalf_impacto: 0.92, ap_elfo_fogonazo: 0.88, ap_hobbit_impacto: 0.97, ap_visor_impacto: 0.9};
/* tamaño que hay que pedirle a flip() para que el borde que se ve quede a R metros del centro */
const tamR = (n, R) => 2 * R / ((FX_BORDE[n] || 0.8) * (FB_DUR[n] ? 1.3 : 1));
function flipR(n, x, z, R, suelo = true, rot, y, dur) {return flip(n, x, z, tamR(n, R), suelo, rot, y, dur);}
/* línea de neón de las marcas circulares (fracción del radio de la imagen) */
const IND_R = {ap_ind_enano_e: 0.84, ap_ind_gandalf_e: 0.845, ap_ind_rohan_e: 0.835, ap_ind_enano_r: 0.805, ap_ind_gollum_q: 0.805, ap_ind_orco_q: 0.9, ap_ind_elfo_r: 0.985, ap_ind_orco_r: 0.965,
  ap_ind_elfo_alcance: 0.935, ap_ind_enano_alcance: 0.89, ap_ind_gandalf_alcance: 0.89, ap_ind_gollum_alcance: 0.91, ap_ind_hobbit_alcance: 0.885, ap_ind_orco_alcance: 0.955, ap_ind_rohan_alcance: 0.935,
  ind_area: 0.915, ind_alcance: 0.88 /* en A-6 es ap_alcance */, ap_zona_torre: 0.88, aro: 0.815};
/* abanicos: vértice (xa, ya) en la imagen (y hacia abajo, fracción del fotograma), eje a 'cen' grados (0 = arriba), semiabertura 'an' y radio 'rn'
   del borde que se ve; 'ae' y 're' = hasta dónde se dibuja (el marco metálico de las marcas va por fuera de la línea de neón).
   Se dibujan deformados sobre un abanico de verdad: la abertura y el largo quedan exactos sea cual sea el ángulo de la habilidad. */
const ABAN = {
  ap_ind_enano_q: {xa: 0.501, ya: 1.278, cen: 0, an: 25.4, ae: 29, rn: 1.1, re: 1.278},
  ap_ind_orco_w: {xa: 0.501, ya: 1.271, cen: 0, an: 26.1, ae: 29, rn: 1.15, re: 1.27},
  ap_ind_hobbit_e: {xa: 0.5, ya: 1.137, cen: 0, an: 26.7, ae: 30.9, rn: 1.03, re: 1.137},
  ind_cono: {xa: 0.5, ya: 0.8223, cen: 0, an: 44.5, ae: 46, rn: 0.64, re: 0.665},
  ap_visor_abanico: {xa: 0.5, ya: 0.96, cen: 0, an: 48, ae: 62, rn: 0.9, re: 0.95},
  ap_enano_tajo: {xa: 0.04, ya: 0.94, cen: 47, an: 36, ae: 41, rn: 1, re: 1.04}};
const CONO_DE = {enano: 'ap_ind_enano_q', orco: 'ap_ind_orco_w', hobbit: 'ap_ind_hobbit_e', visor: 'ap_ind_enano_q'};
const GEO_AB = new Map();
function geoAbanico(P, R, A, clave) {
  const an = P.an || A * 180 / Math.PI, ae = P.ae || an, key = clave + '|' + R.toFixed(2) + '|' + A.toFixed(3);
  let g = GEO_AB.get(key); if (g) return g;
  const nA = 28, nR = 12, Ae = A * ae / an, Re = R * P.re / P.rn, pos = [], uv = [], ix = [], cl = (u) => Math.max(0.002, Math.min(0.998, u));
  for (let j = 0; j <= nR; j++) for (let i = 0; i <= nA; i++) {
    const rho = Re * j / nR, th = -Ae + 2 * Ae * i / nA, ti = (P.cen + th / A * an) * Math.PI / 180, ri = rho / R * P.rn;
    pos.push(rho * Math.cos(th), 0, rho * Math.sin(th)); uv.push(cl(P.xa + Math.sin(ti) * ri), cl(1 - P.ya + Math.cos(ti) * ri));
  }
  for (let j = 0; j < nR; j++) for (let i = 0; i < nA; i++) {const a = j * (nA + 1) + i, b = a + 1, c = a + nA + 1, d = c + 1; ix.push(a, b, c, b, d, c);}
  g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeBoundingSphere();
  GEO_AB.set(key, g); return g;
}
/* efecto de hoja en abanico: vértice en (x, z), mirando hacia 'rot' (= atan2(dx, dz)), radio R y abertura total A. Las hojas redondas
   (onda, polvo…) se recortan en abanico: el borde de la onda queda justo en el arco de la habilidad */
function abanicoR(n, x, z, rot, R, A, op = 1, dur) {
  const b = FX_BORDE[n] || 0.8, P = ABAN[n] || {xa: 0.5, ya: 0.5, cen: 0, rn: b / 2, re: b / 2 * 1.04}, key = 'ab:' + n, pool = FB_POOL[key] || (FB_POOL[key] = []);
  const [f, c, r, mez] = FB[n], base = fbTex[f] || (fbTex[f] = cargaTex(f));
  let o = pool.pop();
  if (!o) {const sv = base.source.version, t = base.clone(); base.source.version = sv; t.repeat.set(1 / c, 1 / r);
    o = new THREE.Mesh(GEO_SUELO, new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, blending: mez === 'n' ? THREE.NormalBlending : THREE.AdditiveBlending})); o.userData.pool = key;}
  const t = o.material.map; if (t.version !== base.version) t.version = base.version;
  o.geometry = geoAbanico(P, R, A, n); o.userData.zona = {R, A}; o.material.color.set(FB_TINTE[n] || '#ffffff'); o.material.opacity = op; o.renderOrder = 3; o.visible = true;
  o.position.set(x, 0.13, z); o.rotation.set(0, Math.atan2(-Math.cos(rot), Math.sin(rot)), 0); o.scale.setScalar(1); t.offset.set(0, 1 - 1 / r);
  scene.add(o); FXP.push({o, t: 0, dur: dur || FB_DUR[n] || 0.55, flip: {c, r, n: c * r, i0: 0}, esc: 1, op: op * (FB_OP[n] || 1)});
  return o;
}
/* marca de cono (la de cada héroe, deformada a su abertura y largo de verdad) */
function marcaCono(n, x, z, wx, wz, R, A, color) {
  const key = 'cono:' + n; let m = MIRA_H[key];
  if (!m) {const t = cargaTex('../batalla/ui/' + n + '.webp'), gen = n === 'ind_cono'; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    m = new THREE.Mesh(GEO_SUELO, new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, opacity: gen ? 1 : 0.85, blending: gen ? THREE.AdditiveBlending : THREE.NormalBlending})); if (color) m.material.color.set(color); m.renderOrder = 4; scene.add(m); MIRA_H[key] = m;}
  m.geometry = geoAbanico(ABAN[n], R, A, n); m.position.set(x, 0.11, z); m.rotation.set(0, Math.atan2(-wz, wx), 0); m.visible = true; return m;
}
/* adónde llega de verdad un salto o una carga: el mismo cálculo que la simulación (paredes, torres, núcleos y árboles incluidos) */
function destinoMov(x, z, wx, wz, d0, T) {const p = {k: 'h', x, z}, v = d0 / T; let t = T; while (t > 1e-6) {const pt = Math.min(1 / 30, t); t -= 1 / 30; p.x += wx * v * pt; p.z += wz * v * pt; limita(p);} return p;}
/* la zona de cada habilidad, la misma para la marca, el aviso al rival y el dibujo:
   c = círculo (cx, cz, r) · v = cono (r, a = abertura total) · l = franja (lar = largo hasta la punta, w = ancho). alc = aro de alcance */
function zonaHab(H, x, z, wx, wz, d) {
  if (H.tipo === 'area') return {f: 'c', cx: x, cz: z, r: H.radio, alc: H.radio};
  if (H.tipo === 'zona') {const d0 = Math.min(H.alc, d); return {f: 'c', cx: x + wx * d0, cz: z + wz * d0, r: H.radio, alc: H.alc};}
  if (H.tipo === 'salto') {const p = destinoMov(x, z, wx, wz, Math.min(H.dist, d) || H.dist, 0.45); return {f: 'c', cx: p.x, cz: p.z, r: H.radio, alc: H.dist};}
  if (H.tipo === 'ejecuta') return {f: 'c', cx: x, cz: z, r: H.alc + 0.6, alc: H.alc + 0.6};
  if (H.tipo === 'cono') return {f: 'v', r: H.alc, a: H.ang, alc: H.alc};
  if (H.tipo === 'linea') return {f: 'l', lar: H.alc + H.ancho, w: 2 * H.ancho, alc: H.alc};
  if (H.tipo === 'dash') {const p = destinoMov(x, z, wx, wz, H.dist, 0.28), l = (p.x - x) * wx + (p.z - z) * wz; return {f: 'l', lar: Math.max(0.6, l + (H.dano ? 1.6 : 0)), w: H.dano ? 3.2 : 0.9, alc: H.dist};}
  return null;
}
function aroAlcance(t, x, z, R) {
  const a = marcaH(t, 'alcance', 'area'), n = 'ap_ind_' + t + '_alcance';
  if (a && IND_R[n]) {a.visible = true; a.position.set(x, 0.09, z); a.scale.setScalar(2 * R / IND_R[n]);}
  else {mira.alc.visible = true; mira.alc.position.set(x, 0.09, z); mira.alc.scale.setScalar(2 * R / IND_R.ind_alcance);}
}
const nuevaMira = () => ({alc: indicador('ind_alcance', '#ffffff'), area: indicador('ind_area', '#ffe9a8'), flecha: indicador('ind_flecha', '#ffe9a8'), cono: indicador('ind_cono', '#ffe9a8')});
function muestraMira(k, dx, dy) {
  const v = VISTA.get(YO); if (!v) return; const H = HEROES[v.tipo].hab[k];
  const iq = 'qwer'.indexOf(k); if (!APUNTABLE[H.tipo] || (v.cds && v.cds[iq] > 0) || v.mana < costeMn(v.tipo, k, v.rk && v.rk[iq]) || !(v.rk && v.rk[iq] > 0) || v.muerto >= 0) {ocultaMira(); return;}
  const {F, R} = ejes(), x = v.xi ?? v.x, z = v.zi ?? v.z, alc = H.alc || H.dist || H.radio || 4;
  let wx, wz, l;
  if (dx === null) {/* sin arrastrar: hacia el objetivo automático, a su distancia */
    const ob = autoObjetivo(H, x, z); let ax, az; if (ob) {ax = (ob.xi ?? ob.x) - x; az = (ob.zi ?? ob.z) - z;} else {const r = v.ri ?? v.rot ?? 0; ax = Math.sin(r); az = Math.cos(r);}
    const la = Math.hypot(ax, az) || 1; wx = ax / la; wz = az / la; l = ob ? Math.min(90, la / alc * 90) : 90;
  } else {l = Math.hypot(dx, dy); wx = (dx * R.x - dy * F.x) / l; wz = (dx * R.z - dy * F.z) / l;}
  if (!mira) mira = nuevaMira();
  const k2 = Math.min(1, l / 90), t = v.tipo;
  for (const n of ['alc', 'area', 'flecha', 'cono']) mira[n].visible = false; for (const n in MIRA_H) MIRA_H[n].visible = false; if (FL.g) FL.g.visible = false;
  const Z = zonaHab(H, x, z, wx, wz, alc * k2); if (!Z) {ocultaMira(); return;}
  aroAlcance(t, x, z, Z.alc);
  if (Z.f === 'c') {const n = 'ap_ind_' + t + '_' + k, a = IND_R[n] ? marcaH(t, k, 'area') : null, m = a || mira.area; m.visible = true; m.scale.setScalar(2 * Z.r / (a ? IND_R[n] : IND_R.ind_area)); m.position.set(Z.cx, 0.11, Z.cz);}
  else if (Z.f === 'v') marcaCono(CONO_DE[t] || 'ind_cono', x, z, wx, wz, Z.r, Z.a, CONO_DE[t] ? null : '#ffe9a8');
  else {let lar = Z.lar;
    if (H.tipo === 'linea') {const pr = primeroEnLinea(x, z, wx, wz, alc, H, dx !== null); if (pr.iman) {wx = pr.wx; wz = pr.wz;}
      /* se para en el primero que toque: la punta queda donde acaba el disparo (su borde de delante) */
      if (pr.q && !H.perfora) {const q = pr.q, qx = (q.xi ?? q.x) - x, qz = (q.zi ?? q.z) - z, per = Math.abs(qx * wz - qz * wx), rr = H.ancho + radioVis(q), tc = qx * wx + qz * wz - Math.sqrt(Math.max(0, rr * rr - per * per)); lar = Math.max(1.2, Math.min(lar, tc + H.ancho));}
      marcaBloqueo(H.perfora ? null : pr.q);}
    flechaAP(t, x, z, wx, wz, lar, Z.w);}
  mira.dir = {wx, wz, px: x + wx * alc * k2, pz: z + wz * alc * k2};
}
/* golpe básico: alcance de verdad (el de la simulación: el borde del cuerpo del objetivo dentro de alcance + 0,6) */
function alcBasico(v) {let a = HEROES[v.tipo].alcance; try {a = statsDe(v.tipo, v.nivel, v.inv).alcance || a;} catch (e) {} return a + 0.6;}
function miraAtaque() {
  const v = VISTA.get(YO); if (!MIRA_AT || !v || v.muerto >= 0) return;
  if (!mira) mira = nuevaMira();
  const {F, R} = ejes(), x = v.xi ?? v.x, z = v.zi ?? v.z, {dx, dy} = MIRA_AT, l = Math.hypot(dx, dy) || 1, wx = (dx * R.x - dy * F.x) / l, wz = (dx * R.z - dy * F.z) / l, alc = alcBasico(v);
  mira.alc.visible = true; mira.alc.position.set(x, 0.09, z); mira.alc.scale.setScalar(2 * alc / IND_R.ind_alcance);
  flechaAP(v.tipo, x, z, wx, wz, alc, 0.55);
}
/* lo que lanza el rival se ve en rojo en el suelo con la MISMA forma y tamaño que su zona de verdad */
let TELE_CONO = null;
function telegrafo(H, x, z, dx, dz, px, pz) {
  if (!APUNTABLE[H.tipo]) return; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
  const Z = zonaHab(H, x, z, dx, dz, Math.hypot(px - x, pz - z) || 0); if (!Z) return; let m;
  if (Z.f === 'c') {m = indicador('ind_area', '#ff3a2a'); m.scale.setScalar(2 * Z.r / IND_R.ind_area); m.position.set(Z.cx, 0.12, Z.cz);}
  else if (Z.f === 'v') {if (!TELE_CONO) TELE_CONO = cargaTex('../batalla/ui/ind_cono.webp'); m = new THREE.Mesh(geoAbanico(ABAN.ind_cono, Z.r, Z.a, 'ind_cono'), new THREE.MeshBasicMaterial({map: TELE_CONO, color: '#ff3a2a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending})); m.userData.geoFija = 1; m.renderOrder = 4; m.position.set(x, 0.12, z); m.rotation.y = Math.atan2(-dz, dx); scene.add(m);}
  else {m = indicador('ind_flecha', '#ff3a2a'); const L = Z.lar / 0.975; m.scale.set(L, 1, Z.w / 0.27); m.position.set(x + dx * L / 2, 0.12, z + dz * L / 2); m.rotation.y = Math.atan2(-dz, dx);}
  m.visible = true; m.material.opacity = 0.9; TELE.push({m, t: 0});
}
/* zonas que se quedan en el suelo (Vael E, Ata R): todo se pinta donde la pone la simulación, con su radio exacto */
function zonaVisual(e) {
  const cx = e[1], cz = e[2], R0 = e[3], dur = e[4], id = e[5], v = VISTA.get(id), o = VIS.get(id), enemiga = v && v.eq !== MI_EQ;
  const a = aro(enemiga ? '#ff7a5a' : '#ffd9a0', R0 / IND_R.aro); a.userData.tira = 1; a.position.set(cx, 0.08, cz); scene.add(a); FXP.push({o: a, t: 0, dur, op: 0.95});
  flipR('ondaC', cx, cz, R0);
  if (v && v.tipo === 'gandalf') {
    flipR('ap_gandalf_ceniza', cx, cz, R0, true, Math.random() * 6, 0.13, dur + 0.4);
    for (let i = 0; i < 4; i++) {const an = i / 4 * Math.PI * 2 + 0.4; flip('fuego', cx + Math.cos(an) * (R0 - 0.9), cz + Math.sin(an) * (R0 - 0.9), tamR('fuego', 0.8));}
    setTimeout(() => {for (let i = 0; i < 5; i++) {const an = Math.random() * 6.28, r = Math.sqrt(Math.random()) * Math.max(0.3, R0 - 0.9); flip('fuego', cx + Math.cos(an) * r, cz + Math.sin(an) * r, tamR('fuego', 0.7));}}, 500);
    setTimeout(() => {flipR('ondaC', cx, cz, R0); flip('explosion', cx, cz, tamR('explosion', R0 * 0.45));}, dur * 1000);
  } else if (v && v.tipo === 'elfo' && o) {/* ráfagas de Ata: cada bala cae dentro del círculo (su punta, como mucho, en el borde) */
    let n = 0; const tira = () => {if (n++ > dur / 0.09 || VIS.get(id) !== o) return; const p = o.raiz.position, an = Math.random() * 6.28, r = Math.sqrt(Math.random()) * Math.max(0.2, R0 - 0.35), tx = cx + Math.cos(an) * r, tz = cz + Math.sin(an) * r, l = Math.hypot(tx - p.x, tz - p.z) || 1; rafaga({x: p.x, z: p.z, ang: Math.atan2(tx - p.x, tz - p.z), dist: l, varia: 0, kind: 'bala', vel: 45, y: 1.3}); if (n % 3 === 0) suena('arco', 0.3, cx, cz); setTimeout(tira, 90);}; tira();
  } else for (let i = 0; i < 8; i++) setTimeout(() => {const an = Math.random() * 6.28, r = Math.sqrt(Math.random()) * (R0 - 0.5); flip('impacto', cx + Math.cos(an) * r, cz + Math.sin(an) * r, tamR('impacto', 0.5));}, i * 350);
  suena('arco', 0.5, cx, cz);
}
/* el disparo en línea se para donde le ha dado a alguien (antes el dibujo seguía hasta el final aunque el golpe ya hubiera entrado) */
function tiroFin(e) {
  for (const p of FXP) if (p.tipo === 'tiro' && p.pid === e[1]) {p.tx = e[2]; p.tz = e[3]; p.dur = Math.max(0.01, Math.hypot(p.tx - p.x, p.tz - p.z) / (p.vel || 26));}
  const o = VIS.get(e[4]); if (o && o.estelaTiro) {const t = o.estelaTiro; t.alc = Math.min(t.alc, Math.hypot(e[2] - t.x, e[3] - t.z));}
}
