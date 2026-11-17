# Golpe básico congelado a mitad: python3 t_basico.py <clave>
import asyncio, sys, base64
from playwright.async_api import async_playwright
HEROE = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % HEROE)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado; for (let i = 0; i < 30*40; i++) V.paso(1/30);}")
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO), e = V.S.u.find(u => u.eq !== h.eq && u.k === 's' && u.vida > 0); h.x = e.x; h.z = e.z + 1.6; h.vida = 9999; if (V.MIO) {V.MIO.x = h.x; V.MIO.z = h.z;}}")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("(q) => {window._q = q;}", {'elfo':'fogonazo','hobbit':'tajo_arco','gandalf':'fx_fuego','rohan':'rohan_tajo','enano':'enano_tajo','orco':'orco_tajo','gollum':'gollum_tajo'}[HEROE])
        for intento in range(60):
            await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.ataca = true; V.paso(1/30);}")
            await pg.wait_for_timeout(60)
            n = await pg.evaluate("() => window._vado.FXP.filter(p => p.flip && new RegExp(window._q).test(p.o.material.map.source.data && p.o.material.map.source.data.src || '')).length")
            if n: break
            if intento % 10 == 0: print(await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO), v = V.VISTA.get(V.YO); return [h.ac, v && v.ac, h.tipo, Math.round(h.x), Math.round(h.z), h.vida]}"))
        d = await pg.evaluate("""() => {const V = window._vado, nom = [];
          for (const p of V.FXP) if (p.flip) {const {c, r} = p.flip, i = Math.floor(p.flip.n * 0.35); p.o.material.map.offset.set((i % c) / c, 1 - (Math.floor(i / c) + 1) / r); p.o.material.opacity = 1; p.o.scale.setScalar(p.esc); p.t = -99; nom.push(p.o.material.map.source.data && p.o.material.map.source.data.src ? p.o.material.map.source.data.src.split('/').pop() : '?');}
          V.renderer.render(V.scene, V.camera); return [nom, V.renderer.domElement.toDataURL('image/png')];}""")
        print(HEROE, 'hojas', d[0], 'ERR', errs[:2]); open('/home/claude/pruebas/bas_%s.png' % HEROE, 'wb').write(base64.b64decode(d[1].split(',')[1]))
        await b.close()
asyncio.run(main())
