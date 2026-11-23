# Huella de cada personaje (lo que ocupa su dibujo visto desde arriba, andando) contra su cuerpo en la simulación. python3 t_huella.py [modo]
import asyncio, sys, json
from playwright.async_api import async_playwright
MODO = sys.argv[1] if len(sys.argv) > 1 else '2v2'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 640, 'height': 300})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','elfo');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','%s')" % MODO)
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(3000)
        await pg.click('#bBots'); await pg.wait_for_timeout(1000); await pg.evaluate("setTimeout(()=>document.getElementById('eOk').click(),10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(3000)
        await pg.evaluate("() => {const V = window._vado; while (V.S.t < 400) V.paso(1/30);}")
        await pg.wait_for_timeout(3000)
        r = await pg.evaluate("""() => {const V = window._vado, T = V.THREE, out = {}, B = new T.Box3(), c = new T.Vector3();
          for (const u of V.S.u) {const o = V.VIS.get(u.id); if (!o || u.muerto || !o.raiz.visible) continue; const k = u.k + ':' + (u.tipo || '');
            if (out[k]) continue; o.raiz.updateMatrixWorld(true); B.makeEmpty(); o.raiz.traverse((q) => {if (q.isSkinnedMesh) {q.computeBoundingBox && q.computeBoundingBox(); const bb = q.boundingBox.clone().applyMatrix4(q.matrixWorld); B.union(bb);} else if (q.isMesh && q.visible) B.expandByObject(q);});
            const rad = u.rad || (u.k === 'h' ? 0.75 : 0.5);
            out[k] = {cuerpo: rad, ancho: +(B.max.x - B.min.x).toFixed(2), fondo: +(B.max.z - B.min.z).toFixed(2), alto: +(B.max.y - B.min.y).toFixed(2), centroDx: +((B.max.x + B.min.x) / 2 - u.x).toFixed(2), centroDz: +((B.max.z + B.min.z) / 2 - u.z).toFixed(2)};}
          return out;}""")
        for k, v in sorted(r.items()): print(k.ljust(14), json.dumps(v))
        await b.close()
asyncio.run(main())
