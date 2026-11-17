import asyncio, sys, json
from playwright.async_api import async_playwright
HEROE = sys.argv[1] if len(sys.argv) > 1 else 'enano'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % HEROE)
        await pg.goto('http://localhost:8799/batalla/autopista.html')
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path='/home/claude/pruebas/menu.png')
        await pg.click('#bBots'); await pg.wait_for_timeout(800)
        await pg.screenshot(path='/home/claude/pruebas/elige.png')
        await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(4000)
        await pg.screenshot(path='/home/claude/pruebas/juego.png')
        # adelantar la partida 3 minutos con la simulación
        r = await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*180 && V.S && V.S.fin < 0; i++) V.paso(1/30); return {t: Math.round(V.S.t), fin: V.S.fin};}""")
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/home/claude/pruebas/juego3.png')
        print(json.dumps(r, ensure_ascii=False)); print('ERRORES:', errs[:8])
        await b.close()
asyncio.run(main())
