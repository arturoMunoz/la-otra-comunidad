# Foto entera de la partida y solapes entre botones: python3 t_hud.py HEROE ANCHO ALTO
import asyncio, sys, json
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'gollum'
W = int(sys.argv[2]) if len(sys.argv) > 2 else 858
HH = int(sys.argv[3]) if len(sys.argv) > 3 else 396
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': W, 'height': HH}, device_scale_factor=2, has_touch=True)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*60; i++) V.paso(1/30); const h = V.S.u.find(u => u.id === V.YO); h.pts = 3; h.nivel = 3;}""")
        await pg.wait_for_timeout(3000)
        await pg.screenshot(path='/home/claude/pruebas/hud_%d.png' % W)
        for bid in ['bQ', 'bR']:
            q = await pg.evaluate("(k) => {const h = window._vado.S.u.find(u => u.id === window._vado.YO); h.rk = {q:1,w:1,e:1,r:1}; const r = document.getElementById(k).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];}", bid)
            await pg.mouse.move(q[0], q[1]); await pg.mouse.down(); await pg.mouse.move(q[0] - 30, q[1] - 20, steps=4); await pg.mouse.move(q[0] - 70, q[1] - 40, steps=4)
            print(bid, 'mira', await pg.evaluate("() => {const m = window._vado.mira; return !!m && JSON.stringify(Object.keys(m)).slice(0, 80);}"))
            await pg.screenshot(path='/home/claude/pruebas/hud_mira_%s.png' % bid)
            await pg.mouse.up(); await pg.wait_for_timeout(300)
        r = await pg.evaluate("""() => {const out = []; for (const el of document.querySelectorAll('#mandos button, #mandos .mas, #hud > *, #bAjustes, #mini, #miniMarco')) {const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || el.offsetParent === null && s.position !== 'fixed') continue; const q = el.getBoundingClientRect(); if (q.width < 2) continue; out.push([el.id || el.className, Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]);} return out;}""")
        for x in r: print(x)
        print('ERR', errs[:3]); await b.close()
asyncio.run(main())
