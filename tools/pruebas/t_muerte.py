# Foto de la pantalla de derribado: python3 t_muerte.py [HEROE]
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'gollum'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, has_touch=True)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(4000)
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find((u) => u.id === V.YO), e = V.S.u.find((u) => u.k === 'h' && u.id !== V.YO); h.x = 0; h.z = 0; e.x = 1.5; e.z = 0; V.S.u.forEach(() => {}); h.vida = 1; h.golpeDe = e.id;}")
        await pg.wait_for_timeout(300)
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find((u) => u.id === V.YO), e = V.S.u.find((u) => u.k === 'h' && u.id !== V.YO); if (V.dana) V.dana(h, 50, e, 'pura'); else h.vida = 0;}")
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path='/home/claude/pruebas/muerte.png')
        print(await pg.evaluate("() => !document.getElementById('muerto').classList.contains('hidden')"))
        await b.close()
asyncio.run(main())
