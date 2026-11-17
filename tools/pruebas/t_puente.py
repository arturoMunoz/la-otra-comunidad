import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','rohan');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.zoom','2')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        print(await pg.evaluate("Object.keys(window._vado).join(',')"))
        r = await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*110; i++) V.paso(1/30);
          const h = (V.S.heroes || V.S.h || []).find ? (V.S.heroes || []).find(q => q.id === V.YO) : null;
          return {t: V.S.t, keys: Object.keys(V.S).slice(0,40).join(','), rl: JSON.stringify(V.EXTRA && V.EXTRA.rl)};}""")
        print(r)
        q = await pg.evaluate("""() => {const V = window._vado; const o = V.RELIQ_V[0]; if (!o) return 'sin reliquias'; const h = V.S.u.find(u => u.id === V.YO);
          h.x = -9.5; h.z = 4; if (V.MIO) {V.MIO.x = h.x; V.MIO.z = h.z;} for (let i = 0; i < 20; i++) V.paso(1/30); return [o.r.x, o.r.z, o.sp.visible, V.S.reliq && JSON.stringify(V.S.reliq)];}""")
        print(q)
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/home/claude/pruebas/pz1.png'); await pg.wait_for_timeout(270); await pg.screenshot(path='/home/claude/pruebas/pz2.png')
        print(await pg.evaluate("""() => {const V = window._vado; return V.RELIQ_V.map(o => {const p = o.sp.position.clone().project(V.camera); return [o.sp.visible, o.sp.position.toArray().map(n=>+n.toFixed(1)), Math.round((p.x+1)/2*844), Math.round((1-p.y)/2*390), o.tx.image && o.tx.image.width];});}"""))
        print('ERR', errs[:5]); await b.close()
asyncio.run(main())
