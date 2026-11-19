# Fotos del menú, elegir héroe, tienda y ficha de A-6 a 859x396 (móvil de Henar) con un héroe: python3 t_textos.py HEROE
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'visor'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 859, 'height': 396}, device_scale_factor=2, has_touch=True)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(3000)
        await pg.screenshot(path=f'/home/claude/pruebas/tx_menu_{H}.png')
        await pg.click('#bBots'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'/home/claude/pruebas/tx_elige_{H}.png')
        await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*60; i++) V.paso(1/30);}""")
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'/home/claude/pruebas/tx_juego_{H}.png')
        await b.close()
asyncio.run(main())
