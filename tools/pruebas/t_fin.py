# PROGRESO: pantalla final, chip del menú y perfil. python3 t_fin.py [HEROE] [modo] → fin.png, menu_perfil.png, perfil.png
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'hobbit'; MODO = sys.argv[2] if len(sys.argv) > 2 else '2v2'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 859, 'height': 396})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type in ('warning', 'error') and 'Failed to load' not in m.text else None)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','%s')" % (H, MODO))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(2000)
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*480; i++) V.paso(1/30); const yo = V.S.u.find(q => q.id === V.YO), en = V.S.u.find(q => q.k === 'h' && q.eq !== yo.eq);
          V.efecto(['baja', V.YO, en.id, '¡Primera sangre!']); V.efecto(['baja', V.YO, en.id, '¡Doble derribo!']); V.efecto(['baja', V.YO, 0, 'Nasor ha caído']);
          setTimeout(() => V.efecto(['fin', yo.eq]), 1500);}""")
        for i in range(30):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("!!document.querySelector('#fin .fin2')"): break
        await pg.wait_for_timeout(3000); await pg.screenshot(path='/home/claude/pruebas/fin.png')
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(3000)
        await pg.screenshot(path='/home/claude/pruebas/menu_perfil.png')
        await pg.click('#perfilChip'); await pg.wait_for_timeout(800); await pg.screenshot(path='/home/claude/pruebas/perfil.png')
        await pg.click('#perfil [data-t="l"]'); await pg.wait_for_timeout(500); await pg.screenshot(path='/home/claude/pruebas/perfil_l.png')
        print(errs[:6]); print(await pg.evaluate("localStorage.getItem('auto.perfil')"))
        await b.close()
asyncio.run(main())
