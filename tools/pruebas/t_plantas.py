# Fotos de las plantas (vida, visión, salto) y del campamento del toro en la Batalla 2v2 de A-6: python3 t_plantas.py
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, has_touch=True, device_scale_factor=2)
        err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.modo','2v2');localStorage.setItem('auto.cal','media')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(90):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(5000)
        await pg.add_style_tag(content='#hud,#mandos,#mini,#miniMarco,.bv,#vital,#yo,#marc,#objetivo,#consejo,#tabla{visibility:hidden!important}')
        await pg.evaluate("() => {const V = window._vado; for (let i = 0; i < 30 * 95; i++) V.paso(1/30); for (const u of V.S.u) if (u.heroe) u.vida = 99999;}")
        sitios = await pg.evaluate("() => [...window._vado.S.plantas.map(q => [q.tipo, q.x, q.z]), ...window._vado.S.campos.filter(c => c.tipo === 'troll' || c.tipo === 'draco' || c.tipo === 'uruk').map(c => [c.tipo, c.x, c.z])]")
        vistos = set()
        for t, x, z in sitios:
            if t in vistos: continue
            vistos.add(t)
            await pg.evaluate("(a) => {const V = window._vado, h = V.S.u.find((u) => u.id === V.YO); h.x = a[0] + 1; h.z = a[1] - 3.5; if (V.MIO) {V.MIO.x = h.x; V.MIO.z = h.z;} for (const u of V.S.u) if (u.heroe && u.id !== V.YO) {u.x = 0; u.z = 0;}}", [x, z])
            await pg.wait_for_timeout(3500)
            await pg.screenshot(path='/home/claude/pruebas/pl_%s.png' % t, clip={'x': 262, 'y': 80, 'width': 320, 'height': 230})
        print('errores', err[:3], await pg.evaluate('() => window._vado.EXTRA && JSON.stringify(window._vado.EXTRA.pl)'))
        await b.close()
asyncio.run(main())
