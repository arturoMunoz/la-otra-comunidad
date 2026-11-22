# Fotos de la Batalla 2v2 de A-6: python3 t_2v2.py [x,z ...]   (pone tu héroe en cada punto tras adelantar la partida 400 s)
import asyncio, sys
from playwright.async_api import async_playwright
import os
ZOOM = int(os.environ.get('ZOOM', '0'))
PUNTOS = [tuple(map(float, a.split(','))) for a in sys.argv[1:]] or [(11.8, 5.5), (-11.8, -5.5), (-16, 4), (0, 0)]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','enano');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','2v2')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.screenshot(path='/home/claude/pruebas/2v2_menu.png')
        await pg.click('#bBots'); await pg.wait_for_timeout(800)
        await pg.screenshot(path='/home/claude/pruebas/2v2_elige.png')
        await pg.evaluate("setTimeout(() => document.getElementById('eOk').click(), 10)")
        for i in range(200):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado; for (let i = 0; i < 30*400; i++) V.paso(1/30);}")
        for (x, z) in PUNTOS:
            await pg.evaluate("""(a) => {const V = window._vado; const h = V.S.u.find(e => e.id === V.YO);
              if (h) {h.x = a[0]; h.z = a[1]; h.vida = 99999; h.muerto = false; V.MIO.x = a[0]; V.MIO.z = a[1];} for (let i = 0; i < 10; i++) V.paso(1/30);}""", [x, z])
            await pg.wait_for_timeout(3500)
            if ZOOM: [await pg.click('#bZoom') for _ in range(ZOOM)]; await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'/home/claude/pruebas/2v2_{int(x)}_{int(z)}.png')
        print(errs[:8])
        await b.close()
asyncio.run(main())
