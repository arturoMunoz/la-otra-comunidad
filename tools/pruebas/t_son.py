# Comprueba que los sonidos de A-6 cargan (sin 404): python3 t_son.py
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        mal, ok = [], []
        pg.on('response', lambda r: (mal if r.status >= 400 else ok).append(r.url.split('/batalla/')[-1]) if ('.mp3' in r.url) else None)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','gandalf');localStorage.setItem('auto.cal','baja')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(6000)
        print('cargados', len(ok), '| de sonidos_ap', sum('sonidos_ap' in u for u in ok), '| voces_ap', sum('voces_ap' in u for u in ok), '| de abismo/sonidos/fx', sum('abismo/sonidos/fx' in u for u in ok))
        print('fallan', mal[:10])
        await b.close()
asyncio.run(main())
