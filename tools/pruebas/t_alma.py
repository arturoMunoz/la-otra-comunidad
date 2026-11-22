# ALMA: emoticono propio, frase del rival y «¡DERRIBADO!». python3 t_alma.py [HEROE] [RIVAL] [modo]
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'hobbit'; RV = sys.argv[2] if len(sys.argv) > 2 else 'visor'; MODO = sys.argv[3] if len(sys.argv) > 3 else '1v1'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 859, 'height': 396})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('console', lambda m: errs.append(m.text[:200]) if 'alma' in m.text else None)
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.rival','%s');localStorage.setItem('auto.cal','alta');localStorage.setItem('auto.modo','%s')" % (H, RV, MODO))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(200):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*60; i++) V.paso(1/30);
          const yo = V.S.u.find(e => e.id === V.YO); const en = V.S.u.find(e => e.k === 'h' && e.eq !== yo.eq);
          yo.bot = true; for (const h of [yo, en]) {h.muerto = false; h.vida = h.max || 2000;}
          yo.x = 0; yo.z = 4; en.x = 1; en.z = -1; V.MIO.x = 0; V.MIO.z = 4; for (let i = 0; i < 4; i++) V.paso(1/30);}""")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("() => {const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, ms > 1000 ? ms * 20 : ms, ...a); const c = document.createElement('style'); c.textContent = '.burb,.derribo{animation:none !important}'; document.head.appendChild(c);}")  # en swiftshader cada foto tarda segundos: que no se vayan antes
        await pg.click('#bEmo'); await pg.wait_for_timeout(600); await pg.screenshot(path='/home/claude/pruebas/alma_0.png')
        await pg.click('#emo button[data-e="risa"]')
        print(await pg.evaluate("() => {const V = window._vado; return [V.YO, V.alma.BURB.size, document.querySelectorAll('.burb').length, V.S.t, (V.S.u.find(q => q.id === V.YO) || {}).emoT]}"))
        await pg.evaluate("""() => {const V = window._vado; const en = V.S.u.find(e => e.k === 'h' && e.id !== V.YO); V.efecto(['hb', en.id, 'r', 0, 1, en.x, en.z]);}""")
        await pg.wait_for_timeout(900); await pg.screenshot(path='/home/claude/pruebas/alma_1.png')
        print(await pg.evaluate("() => [...document.querySelectorAll('.burb')].map(e => [e.textContent, e.parentNode.className, getComputedStyle(e).display, JSON.stringify(e.getBoundingClientRect())])"))
        await pg.evaluate("""() => {const V = window._vado; const en = V.S.u.find(e => e.k === 'h' && e.id !== V.YO); V.efecto(['baja', V.YO, en.id, '¡Primera sangre!']);}""")
        await pg.wait_for_timeout(700); await pg.screenshot(path='/home/claude/pruebas/alma_2.png')
        print(errs[:5])
        await b.close()
asyncio.run(main())
