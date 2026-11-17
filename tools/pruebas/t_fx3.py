import asyncio, sys, base64
from playwright.async_api import async_playwright
HEROE = sys.argv[1]; K = sys.argv[2]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % HEROE)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.x = 0; h.z = 2; if (V.MIO) {V.MIO.x = 0; V.MIO.z = 2;}}"); await pg.wait_for_timeout(4000)
        await pg.evaluate("""(k) => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.rk = {q:1,w:1,e:1,r:1}; h.mana = 999; for (const c of 'qwer') h.cd[c] = 0; V.usaHab(h, k, 0, -1, h.x, h.z - 6);}""", K)
        for i in range(30):
            await pg.wait_for_timeout(100)
            if await pg.evaluate("window._rafagas.length") >= 3: break
        d = await pg.evaluate("""() => {const V = window._vado; for (const r of window._rafagas) {const k = 0.55; r.o.position.set(r.x + (r.tx - r.x) * k, r.y * (1 - k) + 0.25 * k + Math.sin(k * Math.PI) * r.salta, r.z + (r.tz - r.z) * k);} V.renderer.render(V.scene, V.camera); return [window._rafagas.length, V.renderer.domElement.toDataURL('image/png')];}""")
        print('n', d[0]); open('/home/claude/pruebas/fx3_%s_%s.png' % (HEROE, K), 'wb').write(base64.b64decode(d[1].split(',')[1]))
        await b.close()
asyncio.run(main())
