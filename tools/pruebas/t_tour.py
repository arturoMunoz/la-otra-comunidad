# Vuelta por las pantallas de A-6 a 844x390: menú, elegir héroe, partida al empezar, a los 3 y 7 min, taller. python3 t_tour.py HEROE modo
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'elfo'; MODO = sys.argv[2] if len(sys.argv) > 2 else '1v1'
D = '/home/claude/pruebas/tour_%s_%s_' % (MODO, H)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=1)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.modo','%s')" % (H, MODO))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(4000)
        await pg.screenshot(path=D + '1menu.png')
        await pg.click('#bBots'); await pg.wait_for_timeout(1500); await pg.screenshot(path=D + '2elige.png')
        await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(5000); await pg.screenshot(path=D + '3inicio.png')
        for t, n in ((180, '4min3'), (420, '5min7')):
            await pg.evaluate("""(t) => {const V = window._vado; const yo = V.S.u.find(q => q.id === V.YO); yo.bot = true; while (V.S.t < t) V.paso(1/30);}""", t)
            await pg.wait_for_timeout(2500); await pg.screenshot(path=D + n + '.png')
        await pg.evaluate("""() => {const V = window._vado; const yo = V.S.u.find(q => q.id === V.YO); yo.bot = false; yo.oro = 2500;}""")
        await pg.wait_for_timeout(800)
        try:
            await pg.evaluate("document.getElementById('bTienda') && document.getElementById('bTienda').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}))")
            await pg.wait_for_timeout(1500); await pg.screenshot(path=D + '6taller.png')
        except Exception as e: print('taller', e)
        print('errores', errs)
        await b.close()
asyncio.run(main())
