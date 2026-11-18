# ¿se anima de verdad al correr? python3 t_corre.py HEROE
import asyncio, sys, json
from playwright.async_api import async_playwright
H = sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 500, 'height': 300})
        pg.on('pageerror', lambda e: print('ERROR', str(e)[:200]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.rival','%s')" % (H, H))
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(4000)
        for i in range(4):
            r = await pg.evaluate("""() => {const V = window._vado, out = []; for (const h of V.S.u) if (h.k === 'h') {const o = V.VIS.get(h.id); let leg = null, nb = 0; o.raiz.traverse((m) => {if (m.isBone) {nb++; if (/upperleg.?l/i.test(m.name)) leg = m.name + ' ' + m.quaternion.x.toFixed(3) + ',' + m.quaternion.w.toFixed(3);}}); const acc = []; if (o.mixer) for (const a of o.mixer._actions) if (a.isRunning() && a.getEffectiveWeight() > 0.05) acc.push(a.getClip().name + ':' + a.getEffectiveWeight().toFixed(2)); out.push({id: h.id, vel: (o.vel||0).toFixed(2), nb, leg, acc});} return out;}""")
            print(json.dumps(r)); await pg.wait_for_timeout(300)
        await b.close()
asyncio.run(main())
