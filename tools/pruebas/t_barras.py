# Foto de cerca de las barras de vida/energía de los héroes (tú y el rival): python3 t_barras.py [HEROE]
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'elfo'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=3)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("""() => {const V = window._vado; for (const h of V.S.u) if (h.k === 'h') {h.bot = false; h.x = h.id === V.YO ? -1.5 : 1.5; h.z = 0; h.vida = h.id === V.YO ? 380 : 150; h.mana = h.id === V.YO ? 120 : 260;}}""")
        await pg.wait_for_timeout(2500)
        for sel, n in [('.bv.h.yo', 'yo'), ('.bv.h.e1', 'rival')]:
            el = await pg.query_selector(sel)
            if not el: print('no hay', sel); continue
            bb = await el.bounding_box(); await pg.screenshot(path='/home/claude/pruebas/barra_%s.png' % n, clip={'x': bb['x'] - 60, 'y': bb['y'] - 12, 'width': bb['width'] + 120, 'height': bb['height'] + 24})
            print(n, bb)
        await b.close()
asyncio.run(main())
