# Foto de cerca de tu héroe junto al rival + alturas reales en pantalla: python3 t_par.py HEROE [RIVAL]
import asyncio, sys, base64, json
from playwright.async_api import async_playwright
H = sys.argv[1]; RV = sys.argv[2] if len(sys.argv) > 2 else 'elfo'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 700, 'height': 400})
        pg.on('pageerror', lambda e: print('ERROR', str(e)[:200]))
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','%s');localStorage.setItem('auto.cal','alta')" % H)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800); await pg.click('#eOk')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.evaluate("""() => {const V = window._vado; for (const h of V.S.u) if (h.k === 'h') {h.bot = false; h.x = h.id === V.YO ? -1 : 1; h.z = 0; h.rot = 0;}}""")
        await pg.wait_for_timeout(3000)
        r = await pg.evaluate("""() => {const V = window._vado, T = V.THREE || window.THREE, out = {}; for (const h of V.S.u) if (h.k === 'h') {const o = V.VIS.get(h.id); let mn = 1e9, mx = -1e9; o.raiz.updateMatrixWorld(true); o.raiz.traverse((m) => {if (m.isMesh || m.isSkinnedMesh) {let bb; if (m.isSkinnedMesh) {m.computeBoundingBox(); bb = m.boundingBox.clone().applyMatrix4(m.matrixWorld);} else {m.geometry.computeBoundingBox(); bb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);} mn = Math.min(mn, bb.min.y); mx = Math.max(mx, bb.max.y);}}); out[h.tipo + (h.id === V.YO ? '(yo)' : '')] = {alto: +(mx - mn).toFixed(2), escala: +o.raiz.scale.y.toFixed(2)};} return out;}""")
        print(json.dumps(r))
        d = await pg.evaluate("""() => {const V = window._vado, o = V.VIS.get(V.YO), p = o.raiz.position; const c = V.camera.clone(); c.position.set(p.x + 1, 2.6, p.z + 6.5); c.lookAt(p.x + 1, 1.3, p.z); V.renderer.setPixelRatio(1); V.renderer.render(V.scene, c); return V.renderer.domElement.toDataURL('image/png');}""")
        open('/home/claude/pruebas/par_%s.png' % H, 'wb').write(base64.b64decode(d.split(',')[1]))
        await b.close()
asyncio.run(main())
