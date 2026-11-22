import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 640, 'height': 360})
        await pg.add_init_script("localStorage.setItem('vado.nombre','Henar');localStorage.setItem('loc.auth',JSON.stringify({at:'x',rt:'x',exp:9e15}));localStorage.setItem('auto.heroe','enano');localStorage.setItem('auto.cal','baja');localStorage.setItem('auto.modo','2v2')")
        await pg.goto('http://localhost:8799/batalla/autopista.html'); await pg.wait_for_timeout(2500)
        await pg.click('#bBots'); await pg.wait_for_timeout(800)
        await pg.evaluate("setTimeout(() => document.getElementById('eOk').click(), 10)")
        for i in range(240):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("window._vado && window._vado.ESTADO") == 'juego': break
        await pg.wait_for_timeout(2000)
        r = await pg.evaluate("""() => {const V = window._vado, T = V.THREE, out = [];
          V.scene.traverse((im) => {if (!im.isInstancedMesh || !im.userData.ciudad) return; const c = im.userData.cull; const n = c ? c.xs.length : im.count; const bb = new T.Box3(); im.geometry.computeBoundingBox();
            for (let i = 0; i < n; i++) {const m = new T.Matrix4().fromArray(c ? c.todo : im.instanceMatrix.array, i * 16); const b2 = im.geometry.boundingBox.clone().applyMatrix4(m); if (Math.abs(b2.min.x) < 14 && b2.min.z > 2 && b2.max.z < 24) out.push([im.geometry.boundingBox.max.x - im.geometry.boundingBox.min.x, +b2.min.x.toFixed(1), +b2.min.z.toFixed(1), +b2.max.x.toFixed(1), +b2.max.z.toFixed(1), +b2.max.y.toFixed(1)]);}});
          return out;}""")
        for x in r: print(x)
        await b.close()
asyncio.run(main())
