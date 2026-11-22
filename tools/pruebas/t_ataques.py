# ¿Se sale algún efecto de su zona? python3 t_ataques.py [heroes]  (servidor en public:8799)
# Lanza cada habilidad apuntable de cada héroe por la simulación de verdad, apunta todo lo que se pinta en el suelo (efectos de hoja,
# abanicos y aros) y compara su borde con la zona de daño (zonaHab): «sale» = cuánto se pasa del borde (debe ser ≤ 0,2 m) y «borde» = cuánto
# llega el efecto más grande (en las de área debe tocar el borde: ≈ 0).
import asyncio, sys, json, os
from playwright.async_api import async_playwright
HEROES = (sys.argv[1] if len(sys.argv) > 1 else 'enano,gandalf,orco,elfo,hobbit,gollum,visor,rohan').split(',')
JS = r"""async ([tipo, k]) => {
  const V = window._vado, A = V.ATQ, S = V.S, h = S.u.find(u => u.id === V.YO), rival = S.u.find(u => u.k === 'h' && u.eq !== h.eq);
  for (const u of S.u) if (u.k === 's' || u.k === 'j') {u.x = 60; u.z = 60;}
  const tM = S.u.find(u => u.k === 't' && u.n === 1 && u.eq === h.eq), tE = S.u.find(u => u.k === 't' && u.n === 1 && u.eq !== h.eq), sg = Math.sign(tE.z - tM.z) || 1, zc = (tM.z + tE.z) / 2 - 6 * sg;
  h.tipo = tipo; h.rk = {q: 1, w: 1, e: 1, r: 1}; h.mana = 9999; h.vida = 1e5; for (const c of 'qwer') h.cd[c] = 0; h.x = 0; h.z = zc; h.dash = null; h.aturd = 0; h.paraT = 0; if (V.MIO) {V.MIO.x = 0; V.MIO.z = zc;}
  const H = V.HEROES[tipo].hab[k];
  rival.vida = 1e5; rival.x = H.tipo === 'ejecuta' ? 0 : 9; rival.z = H.tipo === 'ejecuta' ? zc + 4 * sg : tE.z + 20 * sg;
  await new Promise(r => setTimeout(r, 400));
  const adds = [], add0 = V.scene.add.bind(V.scene); V.scene.add = (...os) => {for (const o of os) adds.push({o, x: o.position.x, z: o.position.z, s: o.scale.x, zona: o.userData.zona && {...o.userData.zona}, rotY: o.rotation.y}); return add0(...os);};
  const x0 = h.x, z0 = h.z, px = 0, pz = z0 + 5 * sg;
  const ok = V.usaHab(h, k, 0, sg, px, pz);
  await new Promise(r => setTimeout(r, 1800));
  V.scene.add = add0;
  const Z = A.zonaHab(H, x0, z0, 0, sg, 5), fin = {x: h.x, z: h.z};
  if (H.tipo === 'salto') {Z.cx = fin.x; Z.cz = fin.z;}
  const res = [];
  for (const a of adds) {
    const o = a.o, key = o.userData.pool || '';
    let nom = null, R = null;
    if (key.startsWith('ab:')) {nom = key.slice(3); res.push({nom, x: a.x, z: a.z, ab: a.zona, rot: a.rotY}); continue;}
    if (o.isMesh && /s$|sn$/.test(key)) {nom = key.replace(/sn?$/, ''); R = a.s / 2 * (A.FX_BORDE[nom] || 0.8);}
    else if (o.isMesh && o.userData.tira && o.geometry && o.geometry.parameters && o.geometry.parameters.width) {nom = 'aro'; R = o.geometry.parameters.width / 2 * A.IND_R.aro;}
    if (nom === 'estelaF') R = a.s * 0.135; /* estela alargada a lo largo del disparo: cuenta su grosor */
    if (nom && !(a.x === 0 && a.z === 0) && Math.hypot(a.x - x0, a.z - z0) < 22) res.push({nom, x: a.x, z: a.z, R, ini: Math.hypot(a.x - x0, a.z - z0) < 1.7});
  }
  return {ok, H: {tipo: H.tipo, alc: H.alc, dist: H.dist, radio: H.radio, ancho: H.ancho, ang: H.ang, dano: !!H.dano}, Z, x0, z0, fin, res};
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 640, 'height': 300})
        err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','enano');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.guia','1')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(4000); await pg.evaluate("() => {const g = document.getElementById('guia'); if (g) g.remove();}")
        malos = 0
        for t in HEROES:
            for k in 'qwer':
                tipo = await pg.evaluate("([t, k]) => window._vado.HEROES[t].hab[k].tipo", [t, k])
                if tipo not in ('area', 'zona', 'salto', 'cono', 'linea', 'dash', 'ejecuta'): continue
                r = await pg.evaluate(JS, [t, k])
                Z, H = r['Z'], r['H']; sale = 0; borde = -99; peor = ''
                for e in r['res']:
                    if e.get('ini') and H['tipo'] in ('zona', 'salto', 'dash', 'ejecuta') and e['R'] <= 1.45: continue  # destello al lanzar, junto al que lanza
                    if e.get('ab'):
                        ab = e['ab']; R = Z.get('r', 0) if Z['f'] == 'v' else 0
                        if Z['f'] == 'v': s = ab['R'] - Z['r']; s2 = ab['A'] - Z['a']
                        else: s = 0; s2 = 0
                        if max(s, s2) > sale: sale = max(s, s2); peor = e['nom'] + ' abanico'
                        borde = max(borde, s)
                        continue
                    if Z['f'] == 'c': d = ((e['x'] - Z['cx']) ** 2 + (e['z'] - Z['cz']) ** 2) ** 0.5 + e['R'] - Z['r']
                    elif Z['f'] == 'v': d = ((e['x'] - r['x0']) ** 2 + (e['z'] - r['z0']) ** 2) ** 0.5 + e['R'] - Z['r']
                    else:  # franja: distancia al eje (los de menos de 1,6 m del que lanza no cuentan: el fogonazo al disparar)
                        if ((e['x'] - r['x0']) ** 2 + (e['z'] - r['z0']) ** 2) ** 0.5 < 1.6 and e['R'] < 1.0: continue
                        d = abs(e['x'] - r['x0']) + e['R'] - Z['w'] / 2
                    borde = max(borde, d)
                    if d > sale: sale = d; peor = '%s (%.2f m)' % (e['nom'], e['R'])
                if os.environ.get('VER') and sale > 0.2: print('     ', [(e['nom'], round(e['x'], 2), round(e['z'], 2), round(e.get('R') or 0, 2)) for e in r['res']], 'x0', r['x0'], r['z0'], 'fin', r['fin'])
                mal = sale > 0.2 or (Z['f'] == 'c' and H['tipo'] != 'ejecuta' and borde < -0.25)
                malos += mal
                print('%-8s %s %-7s zona %-28s sale %+.2f  borde %+.2f  %s%s' % (t, k, H['tipo'], json.dumps({q: round(v, 2) if isinstance(v, float) else v for q, v in Z.items() if q in ('f', 'r', 'a', 'lar', 'w')}), sale, borde, peor, '  <-- MAL' if mal else ''))
        print('errores de la página:', err[:5]); print('MAL:', malos)
        await b.close()
asyncio.run(main())
