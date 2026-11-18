# Foto de un campamento de la jungla del 2v2 de A-6: python3 t_campo.py [tipo=troll]
import asyncio, sys
from playwright.async_api import async_playwright
T = sys.argv[1] if len(sys.argv) > 1 else 'troll'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, has_touch=True)
        err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.modo','2v2');localStorage.setItem('auto.cal','media')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(90):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(6000)
        await pg.evaluate("(t) => {const V = window._vado, h = V.S.u.find((u) => u.id === V.YO), c = V.S.campos.find((c) => c.tipo === t) || V.S.campos[0]; h.x = c.x + 3; h.z = c.z + 3; if (V.MIO) {V.MIO.x = h.x; V.MIO.z = h.z;}}", T)
        await pg.wait_for_timeout(4000)
        await pg.screenshot(path='/home/claude/pruebas/campo_%s.png' % T)
        print('errores', err[:3])
        await b.close()
asyncio.run(main())
