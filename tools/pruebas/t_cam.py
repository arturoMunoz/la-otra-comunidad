# Cámara 60/40 y moneda: mueve tu héroe hacia un lado y saca foto; dispara una moneda y un golpe desde fuera de pantalla
import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','elfo');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','1v1')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(90):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        for nom, dz in [('ade', -1), ('atr', 1)]:
            for k in range(12):
                await pg.evaluate("(dz) => {const V = window._vado; const h = V.S.u.find(e => e.id === V.YO); h.z += dz * 0.5; V.MIO.z = h.z; h.x = 0; V.MIO.x = 0;}", dz)
                await pg.wait_for_timeout(250)
            await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f'/home/claude/pruebas/cam_{nom}.png')
        await pg.evaluate("() => {const V = window._vado; const h = V.S.u.find(e => e.id === V.YO); V.S.ev = V.S.ev || []; }")
        print(errs[:5])
        await b.close()
asyncio.run(main())
