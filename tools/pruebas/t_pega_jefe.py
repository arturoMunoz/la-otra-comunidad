# ¿Se le puede pegar a Nasor y al lagarto? Batalla contra la máquina: tu héroe junto al jefe, golpe básico mantenido (y habilidades). python3 t_pega_jefe.py HEROE
import asyncio, sys
from playwright.async_api import async_playwright
H = sys.argv[1] if len(sys.argv) > 1 else 'enano'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','2v2')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(3000)
        await pg.click('#bBots'); await pg.wait_for_timeout(1000); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        await pg.evaluate("() => {const V = window._vado; while (V.S.t < 400) {V.paso(1/30); for (const u of V.S.u) if (u.k === 'h' && u.id !== V.YO) {u.x = 0; u.z = u.eq ? -60 : 60;}}}")
        for tipo in ('uruk', 'draco'):
            r = await pg.evaluate("""(tipo) => {const V = window._vado, S = V.S, yo = S.u.find(q => q.id === V.YO), j = S.u.find(q => q.k === 'j' && q.tipo === tipo); if (!j) return 'no hay ' + tipo;
              yo.nivel = 9; yo.vida = 99999; const dx = (j.x > 0 ? -1 : 1); yo.x = j.x + dx * 3.5; yo.z = j.z; window._j = j; window._v0 = j.vida; return [j.x, j.z, j.vida, j.rad];}""", tipo)
            print(tipo, r)
            await pg.evaluate("() => {const M = window._vado.MANDO; M.ataca = true; M.hasta = performance.now() + 99999;}")
            for k in range(12):
                await pg.wait_for_timeout(500)
                print('   ', await pg.evaluate("() => {const V = window._vado, yo = V.S.u.find(q => q.id === V.YO), j = window._j; return [V.S.t.toFixed(1), Math.round(j.vida), yo.x.toFixed(1), yo.z.toFixed(1), (yo.cd && yo.cd.a || 0).toFixed(2), yo.fijo, yo.modoAt, yo.paraT, JSON.stringify(yo.buf).slice(0,80), yo.aturde];}"))
            r2 = await pg.evaluate("() => {const V = window._vado, yo = V.S.u.find(q => q.id === V.YO), j = window._j; return {danio: Math.round(window._v0 - j.vida), yo: [yo.x.toFixed(1), yo.z.toFixed(1)], d: Math.hypot(yo.x - j.x, yo.z - j.z).toFixed(2), obj: yo.obj, atq: yo.ac};}")
            print('  tras 6 s de básico:', r2)
            await pg.screenshot(path='/home/claude/pruebas/pega_%s_%s.png' % (H, tipo))
            await pg.evaluate("() => document.body.classList.add('cine')"); await pg.wait_for_timeout(1500)
            await pg.screenshot(path='/home/claude/pruebas/pega_%s_%s_limpio.png' % (H, tipo), clip={'x': 220, 'y': 0, 'width': 420, 'height': 330})
            await pg.evaluate("() => document.body.classList.remove('cine')")
            print('   modelo:', await pg.evaluate("""() => {const V = window._vado, j = window._j, o = V.VIS.get(j.id); if (!o) return 'sin VIS'; const w = new V.THREE.Vector3(); o.raiz.getWorldPosition(w);
              let vis = 0, mal = 0, op = []; o.raiz.traverse((q) => {if (q.isMesh) {mal++; if (q.visible) vis++; const m = Array.isArray(q.material) ? q.material[0] : q.material; op.push((m.opacity ?? 1).toFixed(2) + (m.transparent ? 't' : ''));}});
              return {raizVis: o.raiz.visible, pos: [o.raiz.position.x.toFixed(1), o.raiz.position.y.toFixed(1), o.raiz.position.z.toFixed(1)], mundo: [w.x.toFixed(1), w.y.toFixed(1), w.z.toFixed(1)], esc: o.raiz.scale.x.toFixed(2), mwau: o.raiz.matrixWorldAutoUpdate, mallas: mal, visibles: vis, op: op.slice(0, 6), padre: o.raiz.parent && o.raiz.parent.type};}"""))
            await pg.evaluate("() => {const M = window._vado.MANDO; M.ataca = false; M.hasta = 0;}")
        print('errores', errs)
        await b.close()
asyncio.run(main())
