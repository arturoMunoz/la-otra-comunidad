import asyncio, sys
from playwright.async_api import async_playwright
HEROE = sys.argv[1]; TECLAS = sys.argv[2]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text + ' @ ' + str(m.location)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % HEROE)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(6000)
        print(await pg.evaluate("() => [window._vado.S.t, JSON.stringify(window._vado.PERF)]"))
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.x = 0; h.z = 2; if (V.MIO) {V.MIO.x = 0; V.MIO.z = 2;}}"); await pg.wait_for_timeout(3000)
        for k in TECLAS:
            await pg.evaluate("""(k) => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.rk = {q:1,w:1,e:1,r:1}; h.mana = 999; for (const c of 'qwer') h.cd[c] = 0; h.x = 0; h.z = 2; if (V.MIO) {V.MIO.x = 0; V.MIO.z = 2;} document.getElementById('hud').style.display='none'; document.getElementById('mandos') && (document.getElementById('mandos').style.display='none'); window._r = V.usaHab(h, k, 0, -1, h.x, h.z - 5);}""", k)
            print(k, await pg.evaluate("window._r"))
            print('rafagas', await pg.evaluate('window._rafagas.length'))
            for j in range(4):
                print('r', await pg.evaluate('window._rafagas.length')); await pg.wait_for_timeout(150); await pg.screenshot(path='/home/claude/pruebas/fx_%s_%s%d.png' % (HEROE, k, j))
            await pg.wait_for_timeout(1500)
        print(await pg.evaluate("() => window._vado.S.t"))
        print('ERR', errs[:5]); await b.close()
asyncio.run(main())
