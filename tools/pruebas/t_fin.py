# PROGRESO: pantalla final, chip del menú y perfil. python3 t_fin.py [HEROE] [modo] → fin.png, menu_perfil.png, perfil.png
import asyncio, sys, os
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'hobbit'; MODO = sys.argv[2] if len(sys.argv) > 2 else '2v2'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 859, 'height': 396})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type in ('warning', 'error') and 'Failed to load' not in m.text else None)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','%s')" % (H, MODO))
        if os.environ.get('PERFIL'): await pg.add_init_script("if (!localStorage.getItem('auto.perfil')) localStorage.setItem('auto.perfil', JSON.stringify({v: 1, xp: 2900, partidas: 40, victorias: 23, pl: 760, heroes: {hobbit: {pts: 3200, p: 14, v: 9, k: 60, d: 40, a: 70}, enano: {pts: 8100, p: 20, v: 12, k: 90, d: 70, a: 120}, elfo: {pts: 700, p: 3, v: 1, k: 9, d: 12, a: 6}, orco: {pts: 1600, p: 5, v: 3, k: 20, d: 18, a: 14}}, logros: {sangre: 3}, hist: []}))")  # PERFIL=1: perfil con maestrías y liga para ver los emblemas
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(2000)
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*480; i++) V.paso(1/30); const yo = V.S.u.find(q => q.id === V.YO), en = V.S.u.find(q => q.k === 'h' && q.eq !== yo.eq);
          for (let i = 0; i < 5; i++) V.efecto(['num', yo.x, yo.z, 180 + i * 20, '', en.id, V.YO]); V.efecto(['num', yo.x, yo.z, 90, '', 0, V.YO]); const so = V.S.u.find(q => q.k === 's' && q.eq !== yo.eq); if (so) V.efecto(['num', yo.x, yo.z, 60, '', so.id, V.YO]);
          yo.bot = true; yo.vida = 5; V.dana(en, yo, 999, 'hab'); for (let i = 0; i < 3; i++) V.paso(1/30);}""")
        await pg.wait_for_timeout(2500); await pg.screenshot(path='/home/claude/pruebas/muerte_recap.png')
        await pg.evaluate("""() => {const V = window._vado; const yo = V.S.u.find(q => q.id === V.YO), en = V.S.u.find(q => q.k === 'h' && q.eq !== yo.eq);
          V.efecto(['baja', V.YO, en.id, '¡Primera sangre!']); V.efecto(['baja', V.YO, en.id, '¡Doble derribo!']); V.efecto(['baja', V.YO, 0, 'Nasor ha caído']);
          setTimeout(() => V.efecto(['fin', yo.eq]), 1500);}""")
        for i in range(30):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("!!document.querySelector('#fin .fin2')"): break
        await pg.wait_for_timeout(3000); await pg.screenshot(path='/home/claude/pruebas/fin.png')
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(3000)
        await pg.screenshot(path='/home/claude/pruebas/menu_perfil.png')
        await pg.click('#perfilChip'); await pg.wait_for_timeout(800); await pg.screenshot(path='/home/claude/pruebas/perfil.png')
        await pg.click('#perfil [data-t="h"]'); await pg.wait_for_timeout(300); await pg.screenshot(path='/home/claude/pruebas/perfil_h.png')
        await pg.click('#perfil [data-t="l"]'); await pg.wait_for_timeout(500); await pg.screenshot(path='/home/claude/pruebas/perfil_l.png')
        print(errs[:6]); print(await pg.evaluate("localStorage.getItem('auto.perfil')"))
        await b.close()
asyncio.run(main())
