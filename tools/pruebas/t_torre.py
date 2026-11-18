# Foto del disparo de una torre de A-6 en vuelo: python3 t_torre.py
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','elfo');localStorage.setItem('auto.cal','media');localStorage.setItem('auto.modo','1v1')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(90):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30*40; i++) V.paso(1/30); const h = V.S.u.find(e => e.id === V.YO); h.vida = 99999; h.max = 99999;
          const t = V.S.u.find(e => e.k === 't' && e.eq !== h.eq && e.vida > 0 && !e.base); h.x = t.x + 2; h.z = t.z + 9 * Math.sign(-t.z || 1); V.MIO.x = h.x; V.MIO.z = h.z; window._T = t; }""")
        await pg.add_style_tag(content='#mandos,#retratos,#barras{display:none!important}')
        n = 0
        for k in range(40):
            await pg.wait_for_timeout(250)
            info = await pg.evaluate("(() => {const p = window._vado.FXP.find(p => p.torre); if (!p) return null; const V = window._vado; const v = new V.THREE.Vector3(); p.sp.getWorldPosition(v); const ws = new V.THREE.Vector3(); p.sp.getWorldScale(ws); v.project(V.camera); return [p.sp ? 1 : 0, +((v.x+1)/2*844).toFixed(0), +((1-v.y)/2*390).toFixed(0), +ws.x.toFixed(2), p.y.toFixed(1)];})()")
            if info:
                print(info); await pg.screenshot(path=f'/home/claude/pruebas/torre_{n}.png', clip={'x': max(0, min(844-240, info[1]-120)), 'y': max(0, min(390-180, info[2]-90)), 'width': 240, 'height': 180}); n += 1
                if n >= 4: break
                continue
                await pg.screenshot(path=f'/home/claude/pruebas/torre_{n}.png'); n += 1
                if n >= 3: break
        print('fotos', n, errs[:5])
        await b.close()
asyncio.run(main())
