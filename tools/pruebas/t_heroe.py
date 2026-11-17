# Foto de cerca de los dos héroes (para comprobar que se ven bien): python3 t_heroe.py HEROE
import asyncio, sys, base64
from playwright.async_api import async_playwright
H = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 700, 'height': 400})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','alta')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.x = 0; h.z = 0; if (V.MIO) {V.MIO.x = 0; V.MIO.z = 0;}}"); await pg.wait_for_timeout(3000)
        d = await pg.evaluate("""() => {const V = window._vado, o = V.VIS.get(V.YO), p = o.raiz.position; const c = V.camera.clone(); c.position.set(p.x + 2.2, 2.4, p.z + 3.2); c.lookAt(p.x, 1.1, p.z); V.renderer.setPixelRatio(1); V.renderer.render(V.scene, c); return V.renderer.domElement.toDataURL('image/png');}""")
        open('/home/claude/pruebas/heroe_%s.png' % H, 'wb').write(base64.b64decode(d.split(',')[1]))
        await b.close()
asyncio.run(main())
