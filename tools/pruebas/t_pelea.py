# Foto de una pelea en A-6: python3 t_pelea.py HEROE [RIVAL] [modo]
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1]; RV = sys.argv[2] if len(sys.argv) > 2 else 'gandalf'; MODO = sys.argv[3] if len(sys.argv) > 3 else '1v1'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.modo','%s')" % (H, MODO))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(90):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*240; i++) V.paso(1/30);
          const yo = V.S.u.find(e => e.id === V.YO); const en = V.S.u.find(e => e.k === 'h' && e.eq !== yo.eq);
          yo.bot = true; for (const h of [yo, en]) {h.muerto = false; h.vida = h.max || 2000;}
          yo.x = 0; yo.z = 6; en.x = 0.5; en.z = 1.5; for (let i = 0; i < 4; i++) V.paso(1/30);}""")
        for k in range(3):
            await pg.wait_for_timeout(1200)
            await pg.screenshot(path=f'/home/claude/pruebas/pelea_{H}_{k}.png')
        print(errs[:5])
        await b.close()
asyncio.run(main())
