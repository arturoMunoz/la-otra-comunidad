# Partidas enteras contra la máquina (todos bots, reloj falso) y apunta los errores de JS. python3 t_errores.py MIN modo heroe [heroe…]
import asyncio, sys, json
from playwright.async_api import async_playwright
MIN = float(sys.argv[1]); MODO = sys.argv[2]; HER = sys.argv[3:] or ['enano']
async def una(b, her):
    pg = await b.new_page(viewport={'width': 640, 'height': 300})
    errs = []; pg.on('pageerror', lambda e: errs.append('PAGE ' + str(e)[:300]))
    pg.on('response', lambda r: errs.append('404 ' + r.url) if r.status == 404 else None)
    pg.on('console', lambda m: errs.append('CONS ' + m.text[:300]) if m.type == 'error' else None)
    await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.modo','%s')" % (her, MODO))
    await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
    await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
    for i in range(240):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
    await pg.wait_for_timeout(3000)
    await pg.evaluate("""() => {const V = window._vado; for (const h of V.S.u) if (h.k === 'h') h.bot = true;
      const R = V.renderer, RR = R.render.bind(R); let n = 0; R.render = (a, b) => {if (++n % 15 === 0) RR(a, b);};
      let falso = performance.now(); performance.now = () => falso;
      window.requestAnimationFrame = (cb) => setTimeout(() => {falso += 50; cb(falso);}, 0);}""")
    fin = None
    for _ in range(int(MIN * 60 / 3) + 5):
        await pg.wait_for_timeout(1500)
        st = await pg.evaluate("[window._vado.S ? window._vado.S.t : -1, window._vado.ESTADO, (window._vado.S ? window._vado.S.fin >= 0 : false)]")
        if st[1] != 'juego' or st[2] or st[0] > MIN * 60: fin = st; break
    shot = '/home/claude/pruebas/err_%s_%s.png' % (MODO, her)
    await pg.screenshot(path=shot)
    u = sorted(set(errs))
    print(her, MODO, 'fin', fin, 'errores', len(errs)); [print('   ', e) for e in u[:12]]
    await pg.close()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for h in HER: await una(b, h)
        await b.close()
asyncio.run(main())
