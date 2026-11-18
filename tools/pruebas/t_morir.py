# Fotos de un héroe enemigo y de un soldado al morir (0,4 / 1,4 / 2,8 / 3,6 s): python3 t_morir.py [autopista|index]
import asyncio, sys
from playwright.async_api import async_playwright
PAG = sys.argv[1] if len(sys.argv) > 1 else 'autopista'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        pre = 'auto' if PAG == 'autopista' else 'vado'
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('%s.cal','baja');localStorage.setItem('%s.modo','1v1')" % (pre, pre))
        await pg.goto('http://localhost:8799/batalla/%s.html' % PAG); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(4000); await pg.evaluate("() => {const g = document.getElementById('guia'); if (g) g.remove();}")
        await pg.evaluate("""() => {const V = window._vado; for (let i = 0; i < 30 * 40; i++) V.paso(1 / 30); const h = V.S.u.find(u => u.id === V.YO), r = V.S.u.find(u => u.k === 'h' && u.eq !== h.eq);
          h.x = 0; h.z = 6; h.vida = 1e5; if (V.MIO) {V.MIO.x = 0; V.MIO.z = 6;} r.x = 1.5; r.z = 6; r.vida = 3; r.bot = false; r.mx = r.mz = 0; h.tap = V.S.t + 1.5;
          const s = V.S.u.find(u => u.k === 's' && u.eq !== h.eq); if (s) {s.x = -1.2; s.z = 7.5; s.vida = 1;}}""")
        for i, ms in enumerate([400, 1000, 1400, 800]):
            await pg.wait_for_timeout(ms)
            await pg.screenshot(path='/home/claude/pruebas/morir_%d.png' % i, clip={'x': 250, 'y': 90, 'width': 340, 'height': 230})
            print(await pg.evaluate("() => {const V = window._vado, r = V.S.u.find(u => u.k === 'h' && u.id !== V.YO), o = V.VIS.get(r.id), v = V.VISTA.get(r.id); return {vis: o.raiz.visible, t: o.muertoT ? Math.round(performance.now() - o.muertoT) : 0, y: +o.raiz.position.y.toFixed(2), x: +o.raiz.position.x.toFixed(1), z: +o.raiz.position.z.toFixed(1), act: o.actual && o.actual.getClip().name, esc: v.escondido, m: v.muerto};}"))
        print('errores', err[:3], await pg.evaluate("() => {const V = window._vado, r = V.S.u.find(u => u.k === 'h' && u.id !== V.YO); return [r.muerto, r.vida];}"))
        await b.close()
asyncio.run(main())
