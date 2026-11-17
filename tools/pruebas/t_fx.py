import asyncio, sys
from playwright.async_api import async_playwright
HEROE = sys.argv[1] if len(sys.argv) > 1 else 'hobbit'
TECLAS = sys.argv[2] if len(sys.argv) > 2 else 'e'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','media')" % HEROE)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(4000)
        await pg.screenshot(path='/home/claude/pruebas/fx_hud.png')
        for k in TECLAS:
            await pg.evaluate("""(k) => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.x = 0; h.z = 4; h.rk = [1,1,1,1]; h.mana = 999; h.cd = {}; h.muerto = -1; if (V.MIO) {V.MIO.x = 0; V.MIO.z = 4;} V.usaHab(h, k, 0, -1, 0, -2);}""", k)
            for j, ms in enumerate([120, 200, 250]):
                await pg.wait_for_timeout(ms); await pg.screenshot(path='/home/claude/pruebas/fx_%s_%s%d.png' % (HEROE, k, j))
            await pg.wait_for_timeout(1500)
        print('ERR', errs[:5]); await b.close()
asyncio.run(main())
