# tira de fotogramas de lado de un bot corriendo: python3 t_tira.py HEROE
import asyncio, sys, base64
from playwright.async_api import async_playwright
H = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 300, 'height': 300})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.rival','%s')" % (H, H))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado; V.S.u.find((u) => u.id === V.YO).bot = true;}"); await pg.wait_for_timeout(9000)
        for i in range(6):
            d = await pg.evaluate("""() => {const V = window._vado; const h = V.S.u.find((u) => u.id === V.YO); const o = V.VIS.get(h.id), p = o.raiz.position; const c = V.camera.clone(); c.aspect = V.renderer.domElement.width / V.renderer.domElement.height; c.updateProjectionMatrix(); c.position.set(p.x - 5, 1.6, p.z); c.lookAt(p.x, 1.3, p.z); V.renderer.render(V.scene, c); return V.renderer.domElement.toDataURL();}""")
            open('/home/claude/pruebas/tira_%s_%d.png' % (H, i), 'wb').write(base64.b64decode(d.split(',')[1])); await pg.wait_for_timeout(120)
        await b.close()
asyncio.run(main())
