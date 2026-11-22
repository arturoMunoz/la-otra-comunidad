# Foto de la marca de apuntar y el efecto de la habilidad uno encima del otro: python3 t_zona.py HEROE TECLA [HEROE TECLA …]
# (servidor en public:8799). Deja al rival tocando el borde de la zona. Fotos en /home/claude/pruebas/zona_HEROE_TECLA.png
import asyncio, sys, base64, os
from playwright.async_api import async_playwright
PARES = list(zip(sys.argv[1::2], sys.argv[2::2]))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % PARES[0][0])
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000); await pg.evaluate("() => {const g = document.getElementById('guia'); if (g) g.remove();}")
        for HEROE, K in PARES:
            await pg.evaluate("""([t, k]) => {const V = window._vado, S = V.S, h = S.u.find(u => u.id === V.YO), H = V.HEROES[t].hab[k], r = S.u.find(u => u.k === 'h' && u.eq !== h.eq);
              const tM = S.u.find(u => u.k === 't' && u.n === 1 && u.eq === h.eq), tE = S.u.find(u => u.k === 't' && u.n === 1 && u.eq !== h.eq), sg = Math.sign(tE.z - tM.z) || 1, zc = (tM.z + tE.z) / 2 - 5 * sg;
              for (const u of S.u) if (u.k === 's') {u.x = 60; u.z = 60;}
              h.tipo = t; h.rk = {q: 1, w: 1, e: 1, r: 1}; h.mana = 9999; h.vida = 1e5; for (const c of 'qwer') h.cd[c] = 0; h.x = 0; h.z = zc; if (V.MIO) {V.MIO.x = 0; V.MIO.z = zc;}
              const Z = V.ATQ.zonaHab(H, 0, zc, 0, sg, 6), cz = Z.f === 'c' ? Z.cz : zc, R0 = Z.f === 'c' ? Z.r : Z.f === 'v' ? Z.r : 0;
              r.vida = 1e5; r.bot = false; r.mx = r.mz = 0; r.x = Z.f === 'l' ? Z.w / 2 + 0.7 : 0.5; r.z = Z.f === 'l' ? zc + sg * Math.min(5, Z.lar - 1) : cz + sg * Math.sqrt(Math.max(0, (R0 + 0.7) ** 2 - 0.25)); window._SG = sg;}""", [HEROE, K])
            await pg.wait_for_timeout(1500)
            await pg.evaluate("""(k) => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); const {F, R} = V.ATQ.ejes(), sg = window._SG; window._DD = [60 * sg * R.z, -60 * sg * F.z]; V.ATQ.muestraMira(k, window._DD[0], window._DD[1]);}""", K)
            await pg.evaluate("""(k) => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO), d = V.ATQ.mira && V.ATQ.mira.dir; V.FXP.length = 0; V.usaHab(h, k, d ? d.wx : 0, d ? d.wz : window._SG, d ? d.px : h.x, d ? d.pz : h.z + 6 * window._SG);}""", K)
            await pg.wait_for_timeout(700)
            await pg.evaluate("(s) => {window._SOLO = s;}", os.environ.get('SOLO', ''))
            d = await pg.evaluate("""(k) => {const V = window._vado; if (window._SOLO) for (const p of V.FXP) p.o.visible = (p.o.userData.pool || '') === window._SOLO; {const v = V.VISTA.get(V.YO); v.cds = [0, 0, 0, 0]; v.mana = 9999;} V.ATQ.muestraMira(k, window._DD[0], window._DD[1]);
              for (const p of V.FXP) if (p.flip) {const {c, r} = p.flip, i = Math.floor(p.flip.n * 0.55); p.o.material.map.offset.set((i % c) / c, 1 - (Math.floor(i / c) + 1) / r); p.o.material.opacity = 0.9; p.o.scale.setScalar(p.esc); p.t = -99;}
              V.renderer.render(V.scene, V.camera); window._LIST = V.FXP.map(p => [p.o.userData.pool || p.tipo || (p.o.isSprite ? 'sprite' : p.o.type), +p.o.position.x.toFixed(1), +p.o.position.z.toFixed(1), +(p.o.scale.x).toFixed(2), p.t]); return V.renderer.domElement.toDataURL('image/png');}""", K)
            print(HEROE, K, await pg.evaluate('window._LIST'))
            open('/home/claude/pruebas/zona_%s_%s.png' % (HEROE, K), 'wb').write(base64.b64decode(d.split(',')[1]))
            await pg.evaluate("() => {const V = window._vado; for (const p of V.FXP) if (p.t === -99) p.t = 99;}")
            await pg.wait_for_timeout(300)
        print('errores', err[:5])
        await b.close()
asyncio.run(main())
