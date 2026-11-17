# Foto del carril de A-6 tras adelantar la partida: python3 t_vista.py Z [segundos]
import asyncio, sys, json
from playwright.async_api import async_playwright
Z = float(sys.argv[1]); SEG = int(sys.argv[2]) if len(sys.argv) > 2 else 60
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','enano');localStorage.setItem('auto.cal','baja')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        print(await pg.evaluate("() => Object.keys(window._vado).join(',')"))
        r = await pg.evaluate("""(a) => {const V = window._vado; for (let i = 0; i < 30*a[1]; i++) V.paso(1/30);
          const h = V.S.u.find(e => e.id === V.YO);
          if (h) {h.x = 0; h.z = a[0]; h.vida = 99999; V.MIO.x = 0; V.MIO.z = a[0];} for (let i = 0; i < 15; i++) V.paso(1/30); return !!h;}""", [Z, SEG])
        await pg.wait_for_timeout(4000)
        await pg.screenshot(path=f'/home/claude/pruebas/vista_{int(Z)}.png'); print(r, errs[:5])
        await b.close()
asyncio.run(main())
