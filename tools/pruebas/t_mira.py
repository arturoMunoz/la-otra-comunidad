# Prueba de las marcas de apuntado de A-6: python3 t_mira.py <clave> <tecla>  (servidor en public:8799)
import asyncio, sys, base64
from playwright.async_api import async_playwright
HEROE, K = sys.argv[1], sys.argv[2]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, has_touch=True)
        err = []; pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja')" % HEROE)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(5000)
        await pg.evaluate("() => {const V = window._vado, h = V.S.u.find(u => u.id === V.YO); h.rk = {q:1,w:1,e:1,r:1}; h.lvl = 6; h.mana = 999; for (const c of 'qwer') h.cd[c] = 0;}")
        await pg.wait_for_timeout(1500)
        bid = '#b' + K.upper(); bb = await pg.evaluate("(s) => {const r = document.querySelector(s).getBoundingClientRect(); return [r.x + r.width/2, r.y + r.height/2];}", bid)
        x, y = bb
        await pg.evaluate("""([s, x, y]) => {const el = document.querySelector(s); const ev = (t, X, Y) => el.dispatchEvent(new PointerEvent(t, {bubbles: true, pointerId: 7, clientX: X, clientY: Y, pointerType: 'touch', isPrimary: true}));
          ev('pointerdown', x, y); setTimeout(() => ev('pointermove', x - 30, y - 50), 60); setTimeout(() => window.dispatchEvent(new PointerEvent('pointermove', {bubbles: true, pointerId: 7, clientX: x - 60, clientY: y - 90, pointerType: 'touch'})), 120);}""", [bid, x, y])
        await pg.wait_for_timeout(1500)
        vis = await pg.evaluate("() => Object.entries(window._vado.MIRA_H).filter(([n, m]) => m.visible).map(([n]) => n)")
        await pg.screenshot(path='/home/claude/pruebas/mira_%s_%s.png' % (HEROE, K))
        print('visibles', vis); print('errores', [e for e in err if 'ind' in e or 'webp' in e][:5])
        await b.close()
asyncio.run(main())
