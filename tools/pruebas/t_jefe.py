# Foto del cartel de Nasor (pronto / sale / cae nuestro / cae rival) en una partida contra la máquina: python3 t_jefe.py
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 859, 'height': 396}, device_scale_factor=2, has_touch=True)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','2v2')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(3000)
        await pg.click('#bBots'); await pg.wait_for_timeout(1500); await pg.evaluate("setTimeout(() => document.getElementById('eOk').click(), 10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("() => {const V = window._vado; for (let i = 0; i < 30*20; i++) V.paso(1/30);}")
        for n, e in enumerate([['jefe','pronto',-28,-2,30], ['jefe','sale',-28,-2], ['jefe','cae',-28,-2,0], ['jefe','lsale',28,2,1], ['jefe','lcae',28,2,1,0,1]]):
            await pg.evaluate("e => window._vado.efecto(e)", e)
            await pg.wait_for_timeout(1400)
            await pg.screenshot(path=f'/home/claude/pruebas/jefe_{n}.png')
        await b.close()
asyncio.run(main())
